const mongoose = require('mongoose');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const {
  roundTo2,
  calculateCharges,
  calculateWeightedAverage
} = require('../utils/calculations');

/**
 * Execute BUY order
 * @param {string} userId - ID of authenticated user
 * @param {string} stockId - ID of stock being purchased
 * @param {number} quantity - Positive integer share count
 */
const executeBuy = async (userId, stockId, quantity) => {
  // 1. Validate inputs
  const parsedQty = parseInt(quantity, 10);
  if (isNaN(parsedQty) || parsedQty <= 0) {
    throw new Error('Quantity must be a positive whole integer');
  }

  // 2. Fetch stock and current market price
  const stock = await Stock.findById(stockId);
  if (!stock) {
    throw new Error('Stock not found');
  }

  const executionPrice = stock.currentPrice;
  const orderValue = roundTo2(executionPrice * parsedQty);
  const charges = calculateCharges(orderValue);
  const totalDeduction = roundTo2(orderValue + charges);

  // 3. Atomically check and deduct virtual balance
  // Using findOneAndUpdate with condition virtualBalance >= totalDeduction ensures race-condition safety
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, virtualBalance: { $gte: totalDeduction } },
    { $inc: { virtualBalance: -totalDeduction } },
    { new: true }
  );

  if (!updatedUser) {
    // Check if user exists or if balance was insufficient
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new Error('User account not found');
    }
    throw new Error(
      `Insufficient virtual balance. Required: ₹${totalDeduction.toLocaleString('en-IN')}, Available: ₹${userExists.virtualBalance.toLocaleString('en-IN')}`
    );
  }

  try {
    // 4. Update or Create Holding
    let holding = await Holding.findOne({ userId, stockId });
    if (holding) {
      const newAveragePrice = calculateWeightedAverage(
        holding.quantity,
        holding.averagePrice,
        parsedQty,
        executionPrice
      );
      holding.quantity += parsedQty;
      holding.averagePrice = newAveragePrice;
      await holding.save();
    } else {
      holding = await Holding.create({
        userId,
        stockId,
        quantity: parsedQty,
        averagePrice: executionPrice
      });
    }

    // 5. Create Transaction Record
    const transaction = await Transaction.create({
      userId,
      stockId,
      transactionType: 'BUY',
      quantity: parsedQty,
      price: executionPrice,
      totalAmount: totalDeduction,
      charges,
      status: 'COMPLETED',
      notes: `Bought ${parsedQty} shares of ${stock.symbol} at ₹${executionPrice}`
    });

    return {
      success: true,
      transaction,
      holding,
      updatedBalance: updatedUser.virtualBalance,
      stock: {
        symbol: stock.symbol,
        companyName: stock.companyName,
        currentPrice: stock.currentPrice
      }
    };
  } catch (error) {
    // Rollback balance in case of holding/transaction failure
    await User.findByIdAndUpdate(userId, { $inc: { virtualBalance: totalDeduction } });
    throw error;
  }
};

/**
 * Execute SELL order
 * @param {string} userId - ID of authenticated user
 * @param {string} stockId - ID of stock being sold
 * @param {number} quantity - Positive integer share count
 */
const executeSell = async (userId, stockId, quantity) => {
  // 1. Validate inputs
  const parsedQty = parseInt(quantity, 10);
  if (isNaN(parsedQty) || parsedQty <= 0) {
    throw new Error('Quantity must be a positive whole integer');
  }

  // 2. Fetch stock and current market price
  const stock = await Stock.findById(stockId);
  if (!stock) {
    throw new Error('Stock not found');
  }

  // 3. Atomically check holdings and decrement quantity
  // Find holding and verify quantity >= parsedQty
  const holding = await Holding.findOne({ userId, stockId });
  if (!holding || holding.quantity < parsedQty) {
    const owned = holding ? holding.quantity : 0;
    throw new Error(
      `Insufficient shares to sell. You own ${owned} shares of ${stock.symbol}, but attempted to sell ${parsedQty}.`
    );
  }

  const executionPrice = stock.currentPrice;
  const grossProceeds = roundTo2(executionPrice * parsedQty);
  const charges = calculateCharges(grossProceeds);
  const netCredit = roundTo2(grossProceeds - charges);

  if (netCredit <= 0) {
    throw new Error('Transaction charges exceed the total proceeds of this sale');
  }

  // 4. Update Holding
  let remainingHolding = null;
  if (holding.quantity === parsedQty) {
    // Sold all shares -> remove holding
    await Holding.findByIdAndDelete(holding._id);
  } else {
    // Partial sell -> decrement quantity, keep averagePrice unchanged
    holding.quantity -= parsedQty;
    remainingHolding = await holding.save();
  }

  // 5. Credit user's virtual balance
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { virtualBalance: netCredit } },
    { new: true }
  );

  // 6. Record Transaction
  const transaction = await Transaction.create({
    userId,
    stockId,
    transactionType: 'SELL',
    quantity: parsedQty,
    price: executionPrice,
    totalAmount: netCredit,
    charges,
    status: 'COMPLETED',
    notes: `Sold ${parsedQty} shares of ${stock.symbol} at ₹${executionPrice}`
  });

  return {
    success: true,
    transaction,
    holding: remainingHolding,
    updatedBalance: updatedUser.virtualBalance,
    stock: {
      symbol: stock.symbol,
      companyName: stock.companyName,
      currentPrice: stock.currentPrice
    }
  };
};

module.exports = {
  executeBuy,
  executeSell
};
