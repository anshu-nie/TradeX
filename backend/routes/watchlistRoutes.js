const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

router.use(protect);

router.get('/', getWatchlist);
router.post(
  '/',
  [body('stockId').isMongoId().withMessage('Valid stockId is required'), validateRequest],
  addToWatchlist
);
router.delete('/:stockId', removeFromWatchlist);

module.exports = router;
