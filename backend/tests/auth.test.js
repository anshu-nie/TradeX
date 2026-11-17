const request = require('supertest');
const app = require('../server');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
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

describe('Health Check API', () => {
  it('GET /api/v1/health should return 200 with healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database).toBeDefined();
  });
});

describe('Authentication API', () => {
  const testUser = {
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    password: 'Password@123',
    confirmPassword: 'Password@123'
  };

  it('POST /api/v1/auth/register should successfully register a new user with ₹10,00,000 balance', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.virtualBalance).toBe(1000000);

    // Verify user in database has hashed password
    const userInDb = await User.findOne({ email: testUser.email.toLowerCase() }).select('+password');
    expect(userInDb).toBeDefined();
    expect(userInDb.password).not.toBe(testUser.password);
  });

  it('POST /api/v1/auth/register should fail if email already exists', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('POST /api/v1/auth/register should fail if passwords do not match', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...testUser, confirmPassword: 'DifferentPassword' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login should log in existing user and return token', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.name).toBe(testUser.name);
  });

  it('POST /api/v1/auth/login should fail with invalid credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me should reject unauthorized requests without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me should return user data when authorized', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
    const token = regRes.body.data.token;

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email.toLowerCase());
  });
});
