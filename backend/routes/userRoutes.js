const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  changePassword,
  resetBalance
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const passwordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  validateRequest
];

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', passwordValidation, changePassword);
router.post('/reset-balance', resetBalance);

module.exports = router;
