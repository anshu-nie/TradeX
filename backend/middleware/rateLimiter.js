const rateLimit = require('express-rate-limit');

// General API rate limiter: 300 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiter for authentication routes: 20 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many login/registration attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Trading operations limiter: 60 trades per 5 minutes
const tradeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: 'Too many trading requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { apiLimiter, authLimiter, tradeLimiter };
