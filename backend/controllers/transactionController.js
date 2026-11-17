const Transaction = require('../models/Transaction');

// @desc    Get user's transactions with filtering, search, and pagination
// @route   GET /api/v1/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      search,
      startDate,
      endDate,
      sort = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const query = { userId: req.user._id };

    // Filter by transaction type (BUY or SELL)
    if (type && type !== 'ALL') {
      query.transactionType = type.toUpperCase();
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = sort === 'asc' ? 1 : -1;

    // Fetch and populate stock details
    let transactionsQuery = Transaction.find(query)
      .populate('stockId', 'symbol companyName sector currentPrice')
      .sort({ createdAt: sortOrder });

    const total = await Transaction.countDocuments(query);
    const rawTransactions = await transactionsQuery.skip(skip).limit(limitNum);

    // Apply text search on symbol/companyName if requested
    let transactions = rawTransactions;
    if (search) {
      const s = search.toLowerCase();
      transactions = transactions.filter((t) => {
        const sym = t.stockId ? t.stockId.symbol.toLowerCase() : '';
        const comp = t.stockId ? t.stockId.companyName.toLowerCase() : '';
        return sym.includes(s) || comp.includes(s);
      });
    }

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction details
// @route   GET /api/v1/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('stockId');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById
};
