const { getPortfolioSummary } = require('../services/portfolioService');

// @desc    Get user's full portfolio summary and holdings
// @route   GET /api/v1/portfolio
// @access  Private
const getPortfolio = async (req, res, next) => {
  try {
    const summary = await getPortfolioSummary(req.user._id);
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPortfolio
};
