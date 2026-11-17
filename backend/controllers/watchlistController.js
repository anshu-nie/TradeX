const Watchlist = require('../models/Watchlist');
const Stock = require('../models/Stock');

// @desc    Get user's watchlist with populated stock quotes
// @route   GET /api/v1/watchlist
// @access  Private
const getWatchlist = async (req, res, next) => {
  try {
    let watchlist = await Watchlist.findOne({ userId: req.user._id }).populate('stockIds');

    if (!watchlist) {
      watchlist = await Watchlist.create({
        userId: req.user._id,
        stockIds: []
      });
    }

    res.status(200).json({
      success: true,
      count: watchlist.stockIds.length,
      data: watchlist.stockIds
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a stock to user's watchlist
// @route   POST /api/v1/watchlist
// @access  Private
const addToWatchlist = async (req, res, next) => {
  try {
    const { stockId } = req.body;

    if (!stockId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid stockId'
      });
    }

    const stock = await Stock.findById(stockId);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }

    let watchlist = await Watchlist.findOne({ userId: req.user._id });
    if (!watchlist) {
      watchlist = await Watchlist.create({
        userId: req.user._id,
        stockIds: [stockId]
      });
    } else {
      // Check for duplicates
      const isAlreadyAdded = watchlist.stockIds.some(
        (id) => id.toString() === stockId.toString()
      );

      if (isAlreadyAdded) {
        return res.status(400).json({
          success: false,
          message: `${stock.symbol} is already in your watchlist`
        });
      }

      watchlist.stockIds.push(stockId);
      await watchlist.save();
    }

    const populatedWatchlist = await Watchlist.findById(watchlist._id).populate('stockIds');

    res.status(200).json({
      success: true,
      message: `Added ${stock.symbol} to your watchlist`,
      data: populatedWatchlist.stockIds
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a stock from user's watchlist
// @route   DELETE /api/v1/watchlist/:stockId
// @access  Private
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { stockId } = req.params;

    const watchlist = await Watchlist.findOne({ userId: req.user._id });
    if (!watchlist) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist not found'
      });
    }

    watchlist.stockIds = watchlist.stockIds.filter(
      (id) => id.toString() !== stockId.toString()
    );

    await watchlist.save();
    const populated = await Watchlist.findById(watchlist._id).populate('stockIds');

    res.status(200).json({
      success: true,
      message: 'Stock removed from watchlist',
      data: populated.stockIds
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
};
