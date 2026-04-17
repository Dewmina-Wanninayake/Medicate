const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    const JWT_SECRET  = process.env.JWT_SECRET  || 'your-super-secret-jwt-key-please-change-in-production';
    const JWT_ISSUER  = process.env.JWT_ISSUER  || 'medicate-user-identity-service';
    const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'medicate-platform';

    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer:   JWT_ISSUER,
      audience: JWT_AUDIENCE
    });

    req.user = decoded;
    if (!req.user.userId && req.user.id) req.user.userId = req.user.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    next();
  };
};

module.exports = { protect, authorize };
