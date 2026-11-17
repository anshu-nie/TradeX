const axios = require('axios');
const config = require('../config/env');
const Stock = require('../models/Stock');

/**
 * Generate synthetic historical data points for chart analysis based on base price
 * @param {number} basePrice - Current stock price
 * @param {string} timeframe - '1D' | '1W' | '1M' | '3M' | '1Y'
 */
const generateHistoricalData = (basePrice, timeframe = '1M') => {
  const points = [];
  let count = 30;
  let intervalLabel = 'Day';
  let volatility = 0.015; // 1.5% daily volatility
  const now = new Date();

  switch (timeframe.toUpperCase()) {
    case '1D':
      count = 24; // Hourly
      volatility = 0.005;
      for (let i = count; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        // Random walk around basePrice
        const randomFactor = 1 + (Math.sin(i / 3) * 0.008) + ((Math.random() - 0.5) * volatility);
        const price = Math.round(basePrice * randomFactor * 100) / 100;
        points.push({ timestamp: timeStr, date: time.toISOString(), price });
      }
      break;

    case '1W':
      count = 7;
      volatility = 0.02;
      for (let i = count; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = time.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const randomFactor = 1 + (Math.sin(i / 2) * 0.015) + ((Math.random() - 0.5) * volatility);
        const price = Math.round(basePrice * randomFactor * 100) / 100;
        points.push({ timestamp: dateStr, date: time.toISOString(), price });
      }
      break;

    case '1M':
      count = 30;
      volatility = 0.035;
      for (let i = count; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = time.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const randomFactor = 1 - (i * 0.002) + (Math.sin(i / 4) * 0.02) + ((Math.random() - 0.5) * volatility);
        const price = Math.round(basePrice * randomFactor * 100) / 100;
        points.push({ timestamp: dateStr, date: time.toISOString(), price });
      }
      break;

    case '3M':
      count = 45;
      volatility = 0.06;
      for (let i = count; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 2 * 24 * 60 * 60 * 1000);
        const dateStr = time.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const randomFactor = 1 - (i * 0.003) + (Math.cos(i / 5) * 0.04) + ((Math.random() - 0.5) * volatility);
        const price = Math.round(basePrice * randomFactor * 100) / 100;
        points.push({ timestamp: dateStr, date: time.toISOString(), price });
      }
      break;

    case '1Y':
    default:
      count = 52; // Weekly
      volatility = 0.12;
      for (let i = count; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const dateStr = time.toLocaleDateString([], { month: 'short', year: '2-digit' });
        const trend = (count - i) * 0.003;
        const randomFactor = (1 - 0.08) + trend + (Math.sin(i / 6) * 0.05) + ((Math.random() - 0.5) * volatility);
        const price = Math.round(basePrice * randomFactor * 100) / 100;
        points.push({ timestamp: dateStr, date: time.toISOString(), price });
      }
      break;
  }

  // Ensure last point matches current price exactly
  if (points.length > 0) {
    points[points.length - 1].price = basePrice;
  }

  return points;
};

/**
 * Fetch live or simulated market price for a given stock symbol
 */
const getQuote = async (symbol) => {
  // Check if external API key is configured
  if (config.MARKET_DATA_API_KEY) {
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${config.MARKET_DATA_API_KEY}`,
        { timeout: 3000 }
      );
      if (response.data && response.data.c) {
        return {
          symbol,
          currentPrice: Math.round(response.data.c * 100) / 100,
          previousClose: Math.round(response.data.pc * 100) / 100,
          dayHigh: Math.round(response.data.h * 100) / 100,
          dayLow: Math.round(response.data.l * 100) / 100,
          dataSource: 'LIVE_API'
        };
      }
    } catch (err) {
      console.warn(`[MarketDataService] Live API lookup failed for ${symbol}: ${err.message}. Using simulated data.`);
    }
  }

  // Simulated fallback: Read from MongoDB
  const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
  if (stock) {
    return {
      symbol: stock.symbol,
      currentPrice: stock.currentPrice,
      previousClose: stock.previousClose,
      dayHigh: stock.dayHigh,
      dayLow: stock.dayLow,
      marketCap: stock.marketCap,
      dataSource: stock.dataSource || 'SIMULATED_DEMO'
    };
  }

  return null;
};

/**
 * Get market overview summary indices
 */
const getMarketOverview = () => {
  return [
    {
      name: 'NIFTY 50',
      value: 24350.25,
      change: 145.8,
      changePercent: 0.6,
      status: 'UP'
    },
    {
      name: 'SENSEX',
      value: 80110.45,
      change: 412.3,
      changePercent: 0.52,
      status: 'UP'
    },
    {
      name: 'BANK NIFTY',
      value: 51220.1,
      change: -110.4,
      changePercent: -0.22,
      status: 'DOWN'
    },
    {
      name: 'NIFTY IT',
      value: 39820.75,
      change: 320.15,
      changePercent: 0.81,
      status: 'UP'
    }
  ];
};

module.exports = {
  generateHistoricalData,
  getQuote,
  getMarketOverview
};
