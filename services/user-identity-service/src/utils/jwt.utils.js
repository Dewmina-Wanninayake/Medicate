const jwt = require('jsonwebtoken');

/**
 * Generate a short-lived access token (15 minutes).
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id, 
      role: user.role, 
      email: user.email,
      name: `${user.firstName} ${user.lastName}`
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      issuer:    process.env.JWT_ISSUER   || 'medicate-user-identity-service',
      audience:  process.env.JWT_AUDIENCE || 'medicate-platform'
    }
  );
};

/**
 * Generate a long-lived refresh token (7 days).
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

/**
 * Verify a refresh token and return its decoded payload.
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = { generateAccessToken, generateRefreshToken, verifyRefreshToken };