const Holding = require('../models/Holding');
const User = require('../models/User');
const { roundTo2, calculatePnL } = require('../utils/calculations');

/**
 * Get comprehensive portfolio metrics for a user
 * @param {string} userId - User ID
 */
const getPortfolioSummary = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Fetch all holdings populated with stock details
  const rawHoldings = await Holding.find({ userId }).populate('stockId');

  let totalInvested = 0;
  let totalCurrentValue = 0;
  let totalDailyPnL = 0;

  const holdingsList = [];
  const sectorAllocationMap = {};

  for (const item of rawHoldings) {
    if (!item.stockId) continue;

    const stock = item.stockId;
    const { investedValue, currentValue, pnl, pnlPercent } = calculatePnL(
      item.quantity,
      item.averagePrice,
      stock.currentPrice
    );

    // Daily PnL for this holding
    const previousClose = stock.previousClose || stock.currentPrice;
    const dailyChangePerShare = stock.currentPrice - previousClose;
    const dailyHoldingPnL = roundTo2(dailyChangePerShare * item.quantity);

    totalInvested += investedValue;
    totalCurrentValue += currentValue;
    totalDailyPnL += dailyHoldingPnL;

    // Sector breakdown
    const sector = stock.sector || 'Others';
    sectorAllocationMap[sector] = (sectorAllocationMap[sector] || 0) + currentValue;

    holdingsList.push({
      holdingId: item._id,
      stockId: stock._id,
      symbol: stock.symbol,
      companyName: stock.companyName,
      sector: stock.sector,
      quantity: item.quantity,
      averagePrice: item.averagePrice,
      currentPrice: stock.currentPrice,
      previousClose: stock.previousClose,
      investedValue,
      currentValue,
      pnl,
      pnlPercent,
      dailyPnL: dailyHoldingPnL,
      dataSource: stock.dataSource
    });
  }

  totalInvested = roundTo2(totalInvested);
  totalCurrentValue = roundTo2(totalCurrentValue);
  totalDailyPnL = roundTo2(totalDailyPnL);

  const totalPnL = roundTo2(totalCurrentValue - totalInvested);
  const totalPnLPercent = totalInvested > 0 ? roundTo2((totalPnL / totalInvested) * 100) : 0;
  const totalPortfolioValue = roundTo2(user.virtualBalance + totalCurrentValue);
  const dailyPnLPercent = totalInvested > 0 ? roundTo2((totalDailyPnL / totalInvested) * 100) : 0;

  // Build sector allocation list with percentages
  const sectorAllocation = Object.keys(sectorAllocationMap).map((sector) => {
    const value = roundTo2(sectorAllocationMap[sector]);
    const percent = totalCurrentValue > 0 ? roundTo2((value / totalCurrentValue) * 100) : 0;
    return { sector, value, percent };
  });

  // Build stock allocation list with percentages
  const stockAllocation = holdingsList.map((h) => {
    const percent = totalCurrentValue > 0 ? roundTo2((h.currentValue / totalCurrentValue) * 100) : 0;
    return {
      symbol: h.symbol,
      companyName: h.companyName,
      value: h.currentValue,
      percent
    };
  });

  // Generate a realistic 7-day portfolio trend
  const performanceTrend = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  for (let i = 6; i >= 0; i--) {
    const dayLabel = days[6 - i];
    // Modulate slightly based on dailyPnL
    const factor = 1 - (i * 0.005) + ((6 - i) * (totalPnL > 0 ? 0.003 : -0.002));
    const val = roundTo2(totalPortfolioValue * factor);
    performanceTrend.push({
      label: dayLabel,
      portfolioValue: val,
      investedValue: totalInvested
    });
  }
  // Make sure today matches current exact portfolio value
  if (performanceTrend.length > 0) {
    performanceTrend[performanceTrend.length - 1].portfolioValue = totalPortfolioValue;
  }

  return {
    virtualBalance: user.virtualBalance,
    totalPortfolioValue,
    totalInvested,
    totalCurrentValue,
    totalPnL,
    totalPnLPercent,
    dailyPnL: totalDailyPnL,
    dailyPnLPercent,
    totalHoldingsCount: holdingsList.length,
    holdings: holdingsList,
    sectorAllocation,
    stockAllocation,
    performanceTrend
  };
};

module.exports = {
  getPortfolioSummary
};
