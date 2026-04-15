const jwt = require('jsonwebtoken');

// Verify JWT token — add to any protected route
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check token exists in header (format: "Bearer <token>")
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided. Please login first.' });
    }

    const token = authHeader.split(' ')[1];
    const JWT_ISSUER  = process.env.JWT_ISSUER  || 'medicate-user-identity-service';
    const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'medicate-platform';

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    });

    req.user = decoded;
    if (!req.user.userId && req.user.id) req.user.userId = req.user.id;
    next();

  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
  }
};

// Check user role — use after protect to restrict access
// e.g. authorize('doctor') or authorize('patient', 'doctor')
const authorize = (...roles) => {
  return (req, res, next) => {

    // Reject if user's role is not in the allowed list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Access denied. Only ${roles.join(' or ')} can do this.` });
    }

    next();
  };
};

module.exports = { protect, authorize };