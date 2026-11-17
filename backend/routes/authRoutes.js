const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const validateRequest = require('../middleware/validateRequest');

// Registration validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validateRequest
];

// Login validation rules
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

router.post('/register', authLimiter, registerValidation, registerUser);
router.post('/login', authLimiter, loginValidation, loginUser);
router.get('/me', protect, getMe);

module.exports = router;
