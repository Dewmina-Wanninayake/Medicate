const jwt = require('jsonwebtoken');

// Verify JWT token — add to any protected route
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check token exists in header (format: "Bearer <token>")
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided. Please login first.' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    // Verify token using shared secret — throws if invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // Attach user info { userId, role, name } to request
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