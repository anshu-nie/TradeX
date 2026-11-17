const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const { connectDB, getDBStatus } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const stockRoutes = require('./routes/stockRoutes');
const tradingRoutes = require('./routes/tradingRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const newsRoutes = require('./routes/newsRoutes');

const app = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: '*', // For development and Docker environments; customizable via CLIENT_URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Request body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging
if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint as required by section 5
app.get('/api/v1/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      connected: dbStatus.isConnected,
      state: dbStatus.state
    },
    version: '1.0.0'
  });
});

// Mount modular API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/stocks', stockRoutes);
app.use('/api/v1/trading', tradingRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/v1/watchlist', watchlistRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/news', newsRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Only listen when executed directly (not when required by Jest / Supertest)
if (require.main === module) {
  connectDB().then(() => {
    app.listen(config.PORT, () => {
      console.log(`[TradeX Backend] Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
      console.log(`[TradeX Backend] Health check: http://localhost:${config.PORT}/api/v1/health`);
    });
  });
}

module.exports = app;
