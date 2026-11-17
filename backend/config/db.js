const mongoose = require('mongoose');
const config = require('./env');

let isConnected = false;

const connectDB = async (uriOverride = null) => {
  const uri = uriOverride || config.MONGO_URI;

  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    isConnected = false;
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
    // In dev or test mode, do not crash immediately so health checks or memory server can function
    return null;
  }
};

const getDBStatus = () => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return {
    state: stateMap[mongoose.connection.readyState] || 'unknown',
    isConnected: mongoose.connection.readyState === 1
  };
};

module.exports = { connectDB, getDBStatus };
