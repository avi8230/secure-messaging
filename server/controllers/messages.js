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
        const messages = await Message.find({ user: req.user._id });
        const decrypted = messages.map(m => ({ message: decrypt(m.encrypted) }));
        res.json(decrypted);
    } catch (err) {
        logger.error('Retrieving messages failed:', err);
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
};
