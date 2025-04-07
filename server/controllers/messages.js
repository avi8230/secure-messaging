const Message = require('../models/Message');
const { encrypt, decrypt } = require('../services/encryption');
const logger = require('../services/logger');

exports.saveMessage = async (req, res) => {
    try {
        const encrypted = encrypt(req.body.message);
        await Message.create({ user: req.user._id, encrypted });
        logger.info(`Message saved by ${req.user.email}`);
        res.json({ success: true });
    } catch (err) {
        logger.error('Saving message failed:', err);
        res.status(500).json({ error: 'Failed to save message' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find().populate('user', 'email');

        const result = messages.map(m => ({
            encrypted: m.encrypted,
            // decrypted: decrypt(m.encrypted),
            email: m.user.email
        }));

        res.json(result);
    } catch (err) {
        logger.error('Retrieving messages failed:', err);
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
};
