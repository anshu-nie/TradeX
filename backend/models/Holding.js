const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative']
    },
    averagePrice: {
      type: Number,
      required: true,
      min: [0.01, 'Average price must be greater than zero']
    }
  },
  {
    timestamps: true
  }
);

// Compound index so a user only has one holding record per stock
holdingSchema.index({ userId: 1, stockId: 1 }, { unique: true });

module.exports = mongoose.model('Holding', holdingSchema);
