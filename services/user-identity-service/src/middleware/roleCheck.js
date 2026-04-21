// Services trust x-user-* headers forwarded by API Gateway (which validates JWT)
function requireRole(...roles) {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];
    if (!userId || !userRole) {
      return res.status(401).json({ error: 'Unauthorized: missing user context' });
    }
    if (roles.length && !roles.includes(userRole)) {
      return res.status(403).json({ error: `Forbidden: requires role(s) ${roles.join(', ')}` });
    }
    req.userId = userId;
    req.userRole = userRole;
    next();
  };
}

module.exports = { requireRole };
