const passport = require('passport');

/**
 * Protect: requires a valid JWT Bearer token.
 * Attaches the decoded user to req.user.
 */
const protect = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err)   return next(err);
    if (!user) return res.status(401).json({ success: false, message: info?.message || 'Unauthorized' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated' });
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Authorize: restricts access to specific roles.
 * Usage: authorize('admin'), authorize('doctor', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };