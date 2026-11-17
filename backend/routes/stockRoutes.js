const express = require('express');
const router = express.Router();
const {
  getAllStocks,
  getStockById,
  getTopMovers,
  getMarketOverviewData
} = require('../controllers/stockController');

router.get('/', getAllStocks);
router.get('/movers/top', getTopMovers);
router.get('/market/overview', getMarketOverviewData);
router.get('/:id', getStockById);

module.exports = router;
