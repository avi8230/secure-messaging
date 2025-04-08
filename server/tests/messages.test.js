const request = require('supertest');
const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const app = require('../app');
const User = require('../models/User');
const Message = require('../models/Message');

// מפתחות לבדיקה
let clientKeyPair;
let token;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    // יצירת משתמש והתחברות
    const email = 'test_messages@example.com';
    const password = '12345678';

    await request(app).post('/api/auth/register').send({ email, password });

    const res = await request(app).post('/api/auth/login').send({ email, password });
    token = res.headers['set-cookie'][0].split(';')[0]; // cookie: token=...

    // יצירת מפתחות RSA בצד הלקוח
    clientKeyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    });

    // עדכון המפתח הציבורי של המשתמש
    await request(app)
        .post('/api/auth/update-public-key')
        .set('Cookie', token)
        .send({ publicKey: clientKeyPair.publicKey });
});

afterAll(async () => {
    await Message.deleteMany({});
    await User.deleteMany({ email: /test_/ });
    await mongoose.disconnect();
});

// פונקציות עזר להצפנה/פענוח היברידית
function encryptHybrid(publicKey, dataObj) {
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
    let encrypted = cipher.update(JSON.stringify(dataObj));
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const encryptedKey = crypto.publicEncrypt(
        { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
        aesKey
    );

    return {
        encryptedKey: encryptedKey.toString('base64'),
        encryptedData: {
            iv: iv.toString('base64'),
            data: encrypted.toString('base64')
        }
    };
}

function decryptHybrid(encryptedKeyBase64, encryptedDataBase64) {
    const aesKey = crypto.privateDecrypt(
        { key: clientKeyPair.privateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
        Buffer.from(encryptedKeyBase64, 'base64')
    );

    const iv = Buffer.from(encryptedDataBase64.iv, 'base64');
    const encryptedText = Buffer.from(encryptedDataBase64.data, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
}

describe('Messages', () => {
    test('Send encrypted message and get encrypted response', async () => {
        const messagePayload = encryptHybrid(
            fs.readFileSync(path.join(__dirname, '../keys/server_public.pem'), 'utf8'),
            { message: 'Hello world!' }
        );

        const res = await request(app)
            .post('/api/messages')
            .set('Cookie', token)
            .send(messagePayload);

        expect(res.statusCode).toBe(200);
        const decrypted = decryptHybrid(res.body.encryptedKey, res.body.encryptedData);
        expect(decrypted.success).toBe(true);
    });

    test('Get all messages and decrypt response', async () => {
        const res = await request(app)
            .get('/api/messages')
            .set('Cookie', token);

        expect(res.statusCode).toBe(200);
        const decrypted = decryptHybrid(res.body.encryptedKey, res.body.encryptedData);
        expect(Array.isArray(decrypted)).toBe(true);
        expect(decrypted[0].message).toBe('Hello world!');
        expect(decrypted[0].email).toBe('test_messages@example.com');
    });
});
