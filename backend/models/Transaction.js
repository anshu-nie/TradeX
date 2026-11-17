const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: true,
      index: true
    },
    transactionType: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0.01, 'Price must be greater than zero']
    },
    totalAmount: {
      type: Number,
      required: true
    },
    charges: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'FAILED'],
      default: 'COMPLETED'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
