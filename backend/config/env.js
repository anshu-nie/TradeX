const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tradex',
  JWT_SECRET: process.env.JWT_SECRET || 'tradex_super_secret_jwt_key_2026_fintech_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MARKET_DATA_API_KEY: process.env.MARKET_DATA_API_KEY || '',
  NEWS_API_KEY: process.env.NEWS_API_KEY || '',
  INITIAL_VIRTUAL_BALANCE: 1000000, // ₹10,00,000 as specified
  TRANSACTION_FEE_PERCENT: 0.001, // 0.1% brokerage/exchange fee
  STAMP_DUTY_PERCENT: 0.00015 // 0.015% regulatory charge
};

module.exports = config;
