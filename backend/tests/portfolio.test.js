const request = require('supertest');
const app = require('../server');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const Stock = require('../models/Stock');
const User = require('../models/User');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('Portfolio & Watchlist API', () => {
  let token;
  let userId;
  let stock1;
  let stock2;

  beforeEach(async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Portfolio Tester',
        email: 'portfolio@example.com',
        password: 'Password@123',
        confirmPassword: 'Password@123'
      });

    token = regRes.body.data.token;
    userId = regRes.body.data.user.id;

    stock1 = await Stock.create({
      symbol: 'INFY',
      companyName: 'Infosys Ltd.',
      sector: 'Technology',
      exchange: 'NSE',
      currentPrice: 1800.0,
      previousClose: 1750.0,
      marketCap: 750000
    });

    stock2 = await Stock.create({
      symbol: 'HDFC',
      companyName: 'HDFC Bank',
      sector: 'Banking',
      exchange: 'NSE',
      currentPrice: 1600.0,
      previousClose: 1620.0,
      marketCap: 1200000
    });
  });

  it('GET /api/v1/portfolio should calculate accurate metrics after buying stocks', async () => {
    // Buy 10 shares of INFY @ 1800
    await request(app)
      .post('/api/v1/trading/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ stockId: stock1._id.toString(), quantity: 10 });

    const res = await request(app)
      .get('/api/v1/portfolio')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalHoldingsCount).toBe(1);
    expect(res.body.data.totalInvested).toBe(18000);
    expect(res.body.data.totalCurrentValue).toBe(18000);
    expect(res.body.data.holdings[0].symbol).toBe('INFY');
    expect(res.body.data.sectorAllocation.length).toBeGreaterThan(0);
  });

  it('Watchlist API: Add, duplicate prevention, and remove', async () => {
    // 1. Add stock1 to watchlist
    const addRes = await request(app)
      .post('/api/v1/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ stockId: stock1._id.toString() });

    expect(addRes.statusCode).toBe(200);
    expect(addRes.body.success).toBe(true);
    expect(addRes.body.data.length).toBe(1);

    // 2. Try adding stock1 again -> should prevent duplicate
    const dupRes = await request(app)
      .post('/api/v1/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ stockId: stock1._id.toString() });

    expect(dupRes.statusCode).toBe(400);
    expect(dupRes.body.success).toBe(false);

    // 3. Get watchlist
    const getRes = await request(app)
      .get('/api/v1/watchlist')
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.data[0].symbol).toBe('INFY');

    // 4. Remove stock1 from watchlist
    const delRes = await request(app)
      .delete(`/api/v1/watchlist/${stock1._id.toString()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.data.length).toBe(0);
  });

  it('GET /api/v1/transactions should return transaction log with filters', async () => {
    // Buy stock1
    await request(app)
      .post('/api/v1/trading/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ stockId: stock1._id.toString(), quantity: 5 });

    // Buy stock2
    await request(app)
      .post('/api/v1/trading/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ stockId: stock2._id.toString(), quantity: 10 });

    const res = await request(app)
      .get('/api/v1/transactions?type=BUY')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].stockId).toBeDefined();
  });
});
