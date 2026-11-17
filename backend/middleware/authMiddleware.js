const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized: User no longer exists'
        });
      }

      return next();
    } catch (error) {
      console.error('[AuthMiddleware] Token error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Invalid or expired token'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No token provided'
    });
  }
};

module.exports = { protect };
