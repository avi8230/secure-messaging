const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
    await User.deleteMany({ email: /test_/ });
    await mongoose.disconnect();
});

describe('Auth', () => {
    test('Register user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test_auth@example.com', password: '12345678' });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('Login user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test_auth@example.com', password: '12345678' });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
