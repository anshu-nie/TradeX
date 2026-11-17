const config = require('../config/env');

/**
 * Round a number safely to 2 decimal places
 */
const roundTo2 = (num) => {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
};

/**
 * Calculate trading transaction charges (brokerage + regulatory stamp duty)
 * @param {number} totalValue - Quantity * Price
 * @returns {number} charges rounded to 2 decimals
 */
const calculateCharges = (totalValue) => {
  const brokerage = totalValue * config.TRANSACTION_FEE_PERCENT;
  const stampDuty = totalValue * config.STAMP_DUTY_PERCENT;
  const minimumCharge = 5.0; // Minimum ₹5 charge per execution
  const totalCharges = Math.max(brokerage + stampDuty, minimumCharge);
  return roundTo2(totalCharges);
};

/**
 * Calculate weighted average price when accumulating more shares
 * @param {number} currentQty - Current quantity held
 * @param {number} currentAvg - Current average buy price
 * @param {number} newQty - Additional quantity bought
 * @param {number} newPrice - Price per share of new purchase
 * @returns {number} new weighted average price
 */
const calculateWeightedAverage = (currentQty, currentAvg, newQty, newPrice) => {
  const totalShares = currentQty + newQty;
  if (totalShares <= 0) return 0;
  const totalCost = (currentQty * currentAvg) + (newQty * newPrice);
  return roundTo2(totalCost / totalShares);
};

/**
 * Calculate unrealized profit or loss and percentage
 * @param {number} quantity - Quantity held
 * @param {number} averagePrice - Average buy price
 * @param {number} currentPrice - Current market price
 */
const calculatePnL = (quantity, averagePrice, currentPrice) => {
  const invested = roundTo2(quantity * averagePrice);
  const current = roundTo2(quantity * currentPrice);
  const pnl = roundTo2(current - invested);
  const pnlPercent = invested > 0 ? roundTo2((pnl / invested) * 100) : 0;

  return {
    investedValue: invested,
    currentValue: current,
    pnl,
    pnlPercent
  };
};

module.exports = {
  roundTo2,
  calculateCharges,
  calculateWeightedAverage,
  calculatePnL
};
