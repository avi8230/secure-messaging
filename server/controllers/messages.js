const Message = require('../models/Message');
const User = require('../models/User');
const { encrypt, decrypt, encryptHybrid, decryptHybrid } = require('../services/encryption');
const logger = require('../services/logger');

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
