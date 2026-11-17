const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Stock ticker symbol is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    sector: {
      type: String,
      required: [true, 'Sector is required'],
      trim: true,
      index: true
    },
    exchange: {
      type: String,
      default: 'NSE',
      uppercase: true,
      trim: true
    },
    currentPrice: {
      type: Number,
      required: [true, 'Current price is required'],
      min: [0.01, 'Price must be greater than zero']
    },
    previousClose: {
      type: Number,
      required: [true, 'Previous close price is required'],
      min: [0.01, 'Price must be greater than zero']
    },
    dayHigh: {
      type: Number,
      default: function () {
        return this.currentPrice * 1.02;
      }
    },
    dayLow: {
      type: Number,
      default: function () {
        return this.currentPrice * 0.98;
      }
    },
    yearHigh: {
      type: Number,
      default: function () {
        return this.currentPrice * 1.25;
      }
    },
    yearLow: {
      type: Number,
      default: function () {
        return this.currentPrice * 0.75;
      }
    },
    marketCap: {
      type: Number, // in Crores or absolute value
      default: 0
    },
    volume: {
      type: Number,
      default: 100000
    },
    peRatio: {
      type: Number,
      default: 20.5
    },
    description: {
      type: String,
      default: ''
    },
    dataSource: {
      type: String,
      enum: ['SIMULATED_DEMO', 'LIVE_API'],
      default: 'SIMULATED_DEMO'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for price change amount
stockSchema.virtual('change').get(function () {
  if (this.currentPrice !== undefined && this.previousClose !== undefined) {
    return parseFloat((this.currentPrice - this.previousClose).toFixed(2));
  }
  return 0;
});

// Virtual for percentage price change
stockSchema.virtual('changePercent').get(function () {
  if (this.previousClose && this.previousClose > 0) {
    return parseFloat((((this.currentPrice - this.previousClose) / this.previousClose) * 100).toFixed(2));
  }
  return 0;
});

module.exports = mongoose.model('Stock', stockSchema);
