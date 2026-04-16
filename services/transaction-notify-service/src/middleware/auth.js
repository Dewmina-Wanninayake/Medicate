/**
 * middleware/auth.js
 * JWT-based authentication & role-based access control (RBAC)
 *
 * Roles supported: patient | doctor | admin
 *
 * Usage:
 *   router.get('/admin-only', authenticate, authorize('admin'), handler)
 *   router.get('/doctors',    authenticate, authorize('doctor', 'admin'), handler)
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET  = process.env.JWT_SECRET  || 'your-super-secret-jwt-key-please-change-in-production';
const JWT_ISSUER  = process.env.JWT_ISSUER  || 'medicate-user-identity-service';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'medicate-platform';

const VALID_ROLES = ['patient', 'doctor', 'admin'];

/**
 * authenticate — verifies the Bearer JWT in the Authorization header.
 * Populates req.user = { userId, email, role, iat, exp }
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(`[Auth Debug] Incoming Header exact: '${authHeader}'`);
    process.stdout.write(`[Auth Debug] Incoming Header: ${authHeader ? 'Present' : 'Missing'}\n`);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn(`[Auth Debug] Denied: Invalid header format`);
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Provide a Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer:   JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ['HS256'],
    });

    // Validate role is one of the platform roles
    if (!VALID_ROLES.includes(decoded.role)) {
      console.warn(`[Auth Debug] Denied: Invalid role ${decoded.role}`);
      return res.status(403).json({
        success: false,
        error: 'Invalid role in token.',
      });
    }

    // Compatibility fix: user-identity-service uses 'id' in JWT, 
    // but some controllers here expect 'userId'.
    if (decoded.id && !decoded.userId) {
      decoded.userId = decoded.id;
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error(`[Auth Debug] Error: ${err.name} - ${err.message}`);
    // Log the actual error object
    console.error(err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired.', detail: err.message });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token.', detail: err.message });
    }
    next(err);
  }
};

/**
 * authorize(...roles) — role guard middleware factory.
 * Must be used AFTER authenticate.
 *
 * @param  {...string} roles  Allowed role strings
 * @returns Express middleware
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
    });
  }

  next();
};

/**
 * generateToken — utility to sign a JWT (called by user-identity-service or tests)
 * Exported here so other internal services can also generate tokens for service-to-service auth.
 *
 * @param {object} payload  { userId, email, role }
 * @param {string} expiresIn  e.g. '1d', '7d'
 */
const generateToken = (payload, expiresIn = '1d') => {
  if (!VALID_ROLES.includes(payload.role)) {
    throw new Error(`Invalid role: ${payload.role}. Must be one of ${VALID_ROLES.join(', ')}`);
  }

  return jwt.sign(payload, JWT_SECRET, {
    issuer:    JWT_ISSUER,
    audience:  JWT_AUDIENCE,
    algorithm: 'HS256',
    expiresIn,
  });
};

/**
 * generateRefreshToken — signs a long-lived refresh token (contains only userId)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
    issuer:    JWT_ISSUER,
    audience:  JWT_AUDIENCE,
    algorithm: 'HS256',
    expiresIn: '30d',
  });
};

/**
 * verifyRefreshToken — validates a refresh token and returns the userId
 */
const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET, {
    issuer:   JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });

  if (decoded.type !== 'refresh') {
    throw new Error('Not a refresh token');
  }

  return decoded;
};

module.exports = {
  authenticate,
  authorize,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
};
