const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'medicate-secret-key-2024-secure';

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.warn('[Auth] No token provided in header');
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[Auth] Token verified for user:', decoded.id || decoded.userId);
    
    req.user = {
      userId: decoded.id || decoded.userId,
      role:   decoded.role,
      email:  decoded.email
    };

    next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err.message);
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};
