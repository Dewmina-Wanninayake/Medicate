const jwt = require('jsonwebtoken');

const PUBLIC_ROUTES = [
  { path: '/api/auth/register', method: 'POST' },
  { path: '/api/auth/login', method: 'POST' },
  { path: '/api/doctors/public', method: 'GET' },
];

function isPublicRoute(req) {
  return PUBLIC_ROUTES.some(
    (r) =>
      req.path.startsWith(r.path) &&
      (r.method === req.method || r.method === '*')
  );
}

function authMiddleware(req, res, next) {
  if (isPublicRoute(req)) return next();

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Forward user info to downstream services via headers
    req.headers['x-user-id'] = decoded.id;
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-user-email'] = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
