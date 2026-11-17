const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Stock = require('./models/Stock');
const User = require('./models/User');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tradex';

const sampleStocks = [
  {
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Ltd.',
    sector: 'Energy',
    exchange: 'NSE',
    currentPrice: 2980.5,
    previousClose: 2945.0,
    dayHigh: 2998.0,
    dayLow: 2930.0,
    yearHigh: 3024.9,
    yearLow: 2220.3,
    marketCap: 2015000,
    volume: 6420000,
    peRatio: 28.4,
    description: 'Leading conglomerate active in refining, petrochemicals, telecommunications (Jio), and retail.',
    dataSource: 'SIMULATED_DEMO'
  },
  {
    symbol: 'TCS',
    companyName: 'Tata Consultancy Services Ltd.',
    sector: 'Technology',
    exchange: 'NSE',
    currentPrice: 4120.75,
    previousClose: 4090.2,
    dayHigh: 4145.0,
    dayLow: 4075.0,
    yearHigh: 4592.25,
    yearLow: 3313.0,
    marketCap: 1495000,
    volume: 2150000,
    peRatio: 31.8,
    description: 'Global IT services, consulting and enterprise business solutions organization.',
    dataSource: 'SIMULATED_DEMO'
  },
  {
    symbol: 'HDFCBANK',
    companyName: 'HDFC Bank Ltd.',
    sector: 'Banking',
    exchange: 'NSE',
    currentPrice: 1685.3,
    previousClose: 1698.0,
    dayHigh: 1705.0,
    dayLow: 1672.5,
    yearHigh: 1794.0,
    yearLow: 1363.55,
    marketCap: 1280000,
    volume: 14200000,
    peRatio: 19.2,
    description: 'India’s largest private sector bank by assets and market capitalization.',
    dataSource: 'SIMULATED_DEMO'
  },
  {
    symbol: 'INFY',
    companyName: 'Infosys Ltd.',
    sector: 'Technology',
    exchange: 'NSE',
    currentPrice: 1845.2,
    previousClose: 1812.5,
    dayHigh: 1860.0,
    dayLow: 1805.0,
    yearHigh: 1991.45,
    yearLow: 1358.35,
    marketCap: 765000,
    volume: 5800000,
    peRatio: 29.5,
    description: 'Global leader in next-generation digital services and enterprise consulting.',
    dataSource: 'SIMULATED_DEMO'
  },
  {
    symbol: 'ICICIBANK',
    companyName: 'ICICI Bank Ltd.',
    sector: 'Banking',
    exchange: 'NSE',
    currentPrice: 1245.6,
    previousClose: 1230.1,
    dayHigh: 1255.0,
    dayLow: 1228.0,
    yearHigh: 1312.0,
    yearLow: 915.0,
    marketCap: 875000,
    volume: 8900000,
    peRatio: 18.1,
    description: 'Major Indian multinational banking and financial services institution.',
    dataSource: 'SIMULATED_DEMO'
  },
  {
    symbol: 'TATAMOTORS',
    companyName: 'Tata Motors Ltd.',
    sector: 'Automotive',
    exchange: 'NSE',
    currentPrice: 998.4,
    previousClose: 980.0,
    dayHigh: 1012.0,
    dayLow: 975.0,
    yearHigh: 1179.0,
    yearLow: 650.0,
    marketCap: 367000,
    volume: 7500000,
    peRatio: 11.4,
    description: 'Pioneer automotive manufacturer and producer of commercial and passenger electric vehicles.',
    dataSource: 'SIMULATED_DEMO'
  },
  {
    symbol: 'BHARTIARTL',
    companyName: 'Bharti Airtel Ltd.',
    sector: 'Telecom',
    exchange: 'NSE',
    currentPrice: 1560.8,
    previousClose: 1545.0,
    dayHigh: 1575.0,
    dayLow: 1538.0,
    yearHigh: 1712.0,
    yearLow: 910.0,
    marketCap: 920000,
    volume: 4200000,
    peRatio: 52.3,
    description: 'Global communications provider with operations across 18 countries across Asia and Africa.',
    dataSource: 'SIMULATED_DEMO'
  },
  {
    symbol: 'ITC',
    companyName: 'ITC Ltd.',
    sector: 'FMCG',
    exchange: 'NSE',
    currentPrice: 485.6,
    previousClose: 492.0,
    dayHigh: 495.0,
    dayLow: 482.0,
    yearHigh: 528.5,
    yearLow: 399.3,
    marketCap: 605000,
    volume: 9100000,
    peRatio: 27.6,
    description: 'Diversified conglomerate with presence in FMCG, Hotels, Paperboards & Packaging, and Agri Business.',
    dataSource: 'SIMULATED_DEMO'
  },
  {
    symbol: 'SUNPHARMA',
    companyName: 'Sun Pharmaceutical Industries Ltd.',
    sector: 'Healthcare',
    exchange: 'NSE',
    currentPrice: 1780.25,
    previousClose: 1762.0,
    dayHigh: 1795.0,
    dayLow: 1750.0,
    yearHigh: 1960.0,
    yearLow: 1180.0,
    marketCap: 427000,
    volume: 1800000,
    peRatio: 38.2,
    description: 'Largest Indian specialty generic pharmaceutical company globally.',
    dataSource: 'SIMULATED_DEMO'
  },
  {
    symbol: 'LT',
    companyName: 'Larsen & Toubro Ltd.',
    sector: 'Infrastructure',
    exchange: 'NSE',
    currentPrice: 3620.0,
    previousClose: 3655.0,
    dayHigh: 3680.0,
    dayLow: 3590.0,
    yearHigh: 3948.6,
    yearLow: 2865.0,
    marketCap: 498000,
    volume: 1650000,
    peRatio: 34.1,
    description: 'Major technology, engineering, construction, manufacturing and financial services conglomerate.',
    dataSource: 'SIMULATED_DEMO'
  },
  {
    symbol: 'SBIN',
    companyName: 'State Bank of India',
    sector: 'Banking',
    exchange: 'NSE',
    currentPrice: 835.4,
    previousClose: 820.0,
    dayHigh: 845.0,
    dayLow: 818.0,
    yearHigh: 912.0,
    yearLow: 555.3,
    marketCap: 745000,
    volume: 11200000,
    peRatio: 10.8,
    description: 'Fortune 500 public sector banking and financial services statutory body.',
    dataSource: 'SIMULATED_DEMO'
  },
  {
    symbol: 'TITAN',
    companyName: 'Titan Company Ltd.',
    sector: 'Consumer Goods',
    exchange: 'NSE',
    currentPrice: 3420.5,
    previousClose: 3460.0,
    dayHigh: 3480.0,
    dayLow: 3400.0,
    yearHigh: 3886.95,
    yearLow: 2970.0,
    marketCap: 303000,
    volume: 1100000,
    peRatio: 84.5,
    description: 'India’s leading lifestyle company with leadership in jewelry, watches, eyewear, and fragrance.',
    dataSource: 'SIMULATED_DEMO'
  }
];

const seedDatabase = async () => {
  try {
    console.log(`[Seed] Connecting to MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected successfully.');

    // Upsert stocks
    for (const stock of sampleStocks) {
      await Stock.findOneAndUpdate(
        { symbol: stock.symbol },
        stock,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`[Seed] Successfully seeded ${sampleStocks.length} stocks.`);

    // Check if demo user exists
    const demoEmail = 'demo@tradex.com';
    let demoUser = await User.findOne({ email: demoEmail });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo Trader',
        email: demoEmail,
        password: 'Password@123',
        virtualBalance: 1000000
      });
      console.log('[Seed] Demo user created: demo@tradex.com / Password@123');
    } else {
      console.log('[Seed] Demo user already exists.');
    }

    await mongoose.connection.close();
    console.log('[Seed] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { sampleStocks, seedDatabase };
