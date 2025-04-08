const crypto = require('crypto');
const Message = require('../models/Message');
const User = require('../models/User');
const { encrypt, decrypt } = require('../services/encryption');
const fs = require('fs');
const path = require('path');
const logger = require('../services/logger');

const serverPrivateKey = fs.readFileSync(path.join(__dirname, '../keys/server_private.pem'), 'utf8');

// Hybrid decoding aid
function decryptHybrid(encryptedKeyBase64, encryptedDataBase64) {
    const aesKey = crypto.privateDecrypt(
        { key: serverPrivateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
        Buffer.from(encryptedKeyBase64, 'base64')
    );

    const iv = Buffer.from(encryptedDataBase64.iv, 'base64');
    const encryptedText = Buffer.from(encryptedDataBase64.data, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
}

function encryptHybrid(publicKey, dataObj) {
    const aesKey = crypto.randomBytes(32); // 256-bit key
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

// -------- Saving a message --------
exports.saveMessage = async (req, res) => {
    try {
        const { encryptedKey, encryptedData } = req.body;
        if (!encryptedKey || !encryptedData)
            return res.status(400).json({ error: 'Missing encrypted data or key' });

        let decryptedBody;
        try {
            decryptedBody = decryptHybrid(encryptedKey, encryptedData);
        } catch (e) {
            logger.error('Hybrid decryption failed:', e);
            return res.status(400).json({ error: 'Failed to decrypt request body' });
        }

        const message = decryptedBody.message;
        const encryptedMessage = encrypt(message);

        await Message.create({ user: req.user._id, encrypted: encryptedMessage });

        logger.info(`Message saved by ${req.user.email}`);

        const user = await User.findById(req.user._id);
        if (!user?.publicKey)
            return res.status(400).json({ error: 'User public key not found' });

        const responsePayload = { success: true };
        const encryptedResponse = encryptHybrid(user.publicKey, responsePayload);

        res.json(encryptedResponse);
    } catch (err) {
        logger.error('Saving message failed:', err);
        res.status(500).json({ error: 'Failed to save message' });
    }
};

// -------- Receiving messages --------
exports.getMessages = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user?.publicKey)
            return res.status(400).json({ error: 'Public key not found for user' });

        const messages = await Message.find().populate('user', 'email');
        const result = messages.map((m) => ({
            message: decrypt(m.encrypted),
            email: m.user.email
        }));

        const encryptedResponse = encryptHybrid(user.publicKey, result);
        res.json(encryptedResponse);
    } catch (err) {
        logger.error('Retrieving messages failed:', err);
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
};
