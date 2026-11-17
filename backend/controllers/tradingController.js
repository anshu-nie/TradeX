const { executeBuy, executeSell } = require('../services/tradingService');
const Stock = require('../models/Stock');
const User = require('../models/User');
const Holding = require('../models/Holding');
const { calculateCharges, roundTo2 } = require('../utils/calculations');

// @desc    Execute BUY order
// @route   POST /api/v1/trading/buy
// @access  Private
const buyStock = async (req, res, next) => {
  try {
    const { stockId, quantity } = req.body;

    if (!stockId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide stockId and quantity'
      });
    }

    const result = await executeBuy(req.user._id, stockId, quantity);

    res.status(200).json({
      success: true,
      message: `Successfully purchased ${quantity} share(s) of ${result.stock.symbol}!`,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Execute SELL order
// @route   POST /api/v1/trading/sell
// @access  Private
const sellStock = async (req, res, next) => {
  try {
    const { stockId, quantity } = req.body;

    if (!stockId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide stockId and quantity'
      });
    }

    const result = await executeSell(req.user._id, stockId, quantity);

    res.status(200).json({
      success: true,
      message: `Successfully sold ${quantity} share(s) of ${result.stock.symbol}!`,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Calculate live order quote & charges preview
// @route   POST /api/v1/trading/quote
// @access  Private
const calculateOrderQuote = async (req, res, next) => {
  try {
    const { stockId, quantity, type = 'BUY' } = req.body;

    const stock = await Stock.findById(stockId);
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    const user = await User.findById(req.user._id);
    const holding = await Holding.findOne({ userId: req.user._id, stockId });

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const price = stock.currentPrice;
    const orderValue = roundTo2(price * qty);
    const charges = calculateCharges(orderValue);

    let netAmount = 0;
    let affordable = true;

    if (type.toUpperCase() === 'BUY') {
      netAmount = roundTo2(orderValue + charges);
      affordable = user.virtualBalance >= netAmount;
    } else {
      netAmount = roundTo2(orderValue - charges);
      affordable = holding && holding.quantity >= qty;
    }

    // Max shares user can afford with current virtual balance
    const maxAffordableShares = Math.max(0, Math.floor(user.virtualBalance / (price * 1.002)));

    res.status(200).json({
      success: true,
      data: {
        stockId: stock._id,
        symbol: stock.symbol,
        companyName: stock.companyName,
        currentPrice: price,
        quantity: qty,
        orderValue,
        charges,
        netAmount,
        userBalance: user.virtualBalance,
        ownedShares: holding ? holding.quantity : 0,
        affordable,
        maxAffordableShares
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  buyStock,
  sellStock,
  calculateOrderQuote
};
