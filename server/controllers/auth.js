const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../services/logger');

const fs = require('fs');
const path = require('path');
const serverPublicKey = fs.readFileSync(path.join(__dirname, '../keys/server_public.pem'), 'utf8');

exports.register = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (await User.findOne({ email }))
            return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword });

        const token = jwt.sign({ _id: user._id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // TODO: Change to true if using real HTTPS
            sameSite: 'Lax',
            maxAge: 60 * 60 * 1000 // 1 Hour
        });

        logger.info(`User registered: ${email}`);
        res.json({ success: true, serverPublicKey });
    } catch (err) {
        logger.error('Registration failed:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ _id: user._id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        logger.info(`User logged in: ${email}`);
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // TODO: Change to true if using real HTTPS
            sameSite: 'Lax',
            maxAge: 60 * 60 * 1000 // 1 Hour
        });
        res.json({ success: true, serverPublicKey });
    } catch (err) {
        logger.error('Login failed:', err);
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false, // TODO: Change to true if using real HTTPS
        sameSite: 'Lax'
    });
    res.json({ success: true, message: 'Logged out successfully' });
};

exports.updateUserPublicKey = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { publicKey: req.body.publicKey });
        res.json({ success: true });
    } catch (err) {
        logger.error('Updating public key failed:', err);
        res.status(500).json({ error: 'Failed to update public key' });
    }
};
