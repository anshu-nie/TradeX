const Stock = require('../models/Stock');
const {
  generateHistoricalData,
  getMarketOverview
} = require('../services/marketDataService');

// @desc    Get all stocks with search, filtering, and sorting
// @route   GET /api/v1/stocks
// @access  Public
const getAllStocks = async (req, res, next) => {
  try {
    const { search, sector, sortBy, sortOrder = 'desc', page = 1, limit = 50 } = req.query;

    const query = {};

    // Search by ticker symbol or company name
    if (search) {
      query.$or = [
        { symbol: { $regex: search.trim(), $options: 'i' } },
        { companyName: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Filter by sector
    if (sector && sector !== 'ALL') {
      query.sector = sector;
    }

    // Sorting
    let sortOptions = {};
    if (sortBy === 'price') {
      sortOptions.currentPrice = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'marketCap') {
      sortOptions.marketCap = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'name') {
      sortOptions.companyName = sortOrder === 'asc' ? 1 : -1;
    } else {
      // Default: sort by marketCap descending
      sortOptions.marketCap = -1;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const totalStocks = await Stock.countDocuments(query);
    const stocks = await Stock.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get list of distinct sectors for UI filters
    const sectors = await Stock.distinct('sector');

    res.status(200).json({
      success: true,
      count: stocks.length,
      total: totalStocks,
      page: pageNum,
      pages: Math.ceil(totalStocks / limitNum),
      sectors,
      data: stocks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single stock details with chart data
// @route   GET /api/v1/stocks/:id
// @access  Public
const getStockById = async (req, res, next) => {
  try {
    const { timeframe = '1M' } = req.query;
    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }

    // Generate timeframe chart points
    const chartData = generateHistoricalData(stock.currentPrice, timeframe);

    res.status(200).json({
      success: true,
      data: {
        ...stock.toObject(),
        chartData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top gainers and top losers
// @route   GET /api/v1/stocks/movers/top
// @access  Public
const getTopMovers = async (req, res, next) => {
  try {
    const allStocks = await Stock.find({});

    // Sort by changePercent
    const sorted = [...allStocks].sort((a, b) => b.changePercent - a.changePercent);

    const gainers = sorted.slice(0, 5);
    const losers = sorted.slice(-5).reverse();

    res.status(200).json({
      success: true,
      data: {
        gainers,
        losers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get market indices (NIFTY, SENSEX, etc.)
// @route   GET /api/v1/stocks/market/overview
// @access  Public
const getMarketOverviewData = async (req, res, next) => {
  try {
    const indices = getMarketOverview();
    res.status(200).json({
      success: true,
      data: indices
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStocks,
  getStockById,
  getTopMovers,
  getMarketOverviewData
};
