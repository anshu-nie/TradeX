const request = require('supertest');
const app = require('../server');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const Stock = require('../models/Stock');
const User = require('../models/User');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('Virtual Trading API', () => {
  let token;
  let userId;
  let testStock;

  beforeEach(async () => {
    // Create authenticated user
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Trader Bob',
        email: 'traderbob@example.com',
        password: 'Password@123',
        confirmPassword: 'Password@123'
      });

    token = regRes.body.data.token;
    userId = regRes.body.data.user.id;

    // Create a test stock
    testStock = await Stock.create({
      symbol: 'TATASTEEL',
      companyName: 'Tata Steel Ltd.',
      sector: 'Metals',
      exchange: 'NSE',
      currentPrice: 150.0,
      previousClose: 148.0,
      marketCap: 185000,
      dataSource: 'SIMULATED_DEMO'
    });
  });

  it('GET /api/v1/stocks should return list of available stocks and sectors', async () => {
    const res = await request(app).get('/api/v1/stocks');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.sectors).toContain('Metals');
  });

  it('POST /api/v1/trading/buy should successfully execute BUY order and deduct balance', async () => {
    const quantity = 10;
    const res = await request(app)
      .post('/api/v1/trading/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({
        stockId: testStock._id.toString(),
        quantity
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.holding.quantity).toBe(10);
    expect(res.body.data.holding.averagePrice).toBe(150.0);

    // Verify balance was deducted
    const user = await User.findById(userId);
    expect(user.virtualBalance).toBeLessThan(1000000);

    // Verify transaction record was created
    const tx = await Transaction.findOne({ userId, stockId: testStock._id });
    expect(tx).toBeDefined();
    expect(tx.transactionType).toBe('BUY');
    expect(tx.quantity).toBe(10);
    expect(tx.status).toBe('COMPLETED');
  });

  it('POST /api/v1/trading/buy should reject buy order when balance is insufficient', async () => {
    // Set user balance to ₹100
    await User.findByIdAndUpdate(userId, { virtualBalance: 100 });

    const res = await request(app)
      .post('/api/v1/trading/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({
        stockId: testStock._id.toString(),
        quantity: 10 // Cost ~ 1500 + charges
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/insufficient virtual balance/i);
  });

  it('POST /api/v1/trading/buy should reject non-positive or non-integer quantities', async () => {
    const res = await request(app)
      .post('/api/v1/trading/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({
        stockId: testStock._id.toString(),
        quantity: -5
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/trading/sell should successfully execute SELL order and credit balance', async () => {
    // First buy 20 shares
    await request(app)
      .post('/api/v1/trading/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({
        stockId: testStock._id.toString(),
        quantity: 20
      });

    const userBeforeSell = await User.findById(userId);

    // Sell 10 shares
    const res = await request(app)
      .post('/api/v1/trading/sell')
      .set('Authorization', `Bearer ${token}`)
      .send({
        stockId: testStock._id.toString(),
        quantity: 10
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify holding updated to 10
    const holding = await Holding.findOne({ userId, stockId: testStock._id });
    expect(holding.quantity).toBe(10);

    // Verify balance was credited
    const userAfterSell = await User.findById(userId);
    expect(userAfterSell.virtualBalance).toBeGreaterThan(userBeforeSell.virtualBalance);

    // Verify sell transaction recorded
    const sellTx = await Transaction.findOne({
      userId,
      stockId: testStock._id,
      transactionType: 'SELL'
    });
    expect(sellTx).toBeDefined();
    expect(sellTx.quantity).toBe(10);
  });

  it('POST /api/v1/trading/sell should fail if user tries to sell more shares than owned', async () => {
    // Buy 5 shares
    await request(app)
      .post('/api/v1/trading/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({
        stockId: testStock._id.toString(),
        quantity: 5
      });

    // Try to sell 10 shares
    const res = await request(app)
      .post('/api/v1/trading/sell')
      .set('Authorization', `Bearer ${token}`)
      .send({
        stockId: testStock._id.toString(),
        quantity: 10
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/insufficient shares/i);
  });
});
