const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  buyStock,
  sellStock,
  calculateOrderQuote
} = require('../controllers/tradingController');
const { protect } = require('../middleware/authMiddleware');
const { tradeLimiter } = require('../middleware/rateLimiter');
const validateRequest = require('../middleware/validateRequest');

const orderValidation = [
  body('stockId').isMongoId().withMessage('Valid stockId is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than 0'),
  validateRequest
];

router.use(protect);

router.post('/buy', tradeLimiter, orderValidation, buyStock);
router.post('/sell', tradeLimiter, orderValidation, sellStock);
router.post('/quote', calculateOrderQuote);

module.exports = router;
