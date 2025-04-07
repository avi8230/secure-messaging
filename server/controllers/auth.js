const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../services/logger');

exports.register = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (await User.findOne({ email }))
            return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ email, password: hashedPassword });
        logger.info(`User registered: ${email}`);
        res.json({ success: true });
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
            secure: false, // שנה ל-true אם אתה משתמש ב-HTTPS
            sameSite: 'Lax',
            maxAge: 60 * 60 * 1000 // 1 שעה
        });
        res.json({ success: true });
    } catch (err) {
        logger.error('Login failed:', err);
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false, // אם אתה בפרודקשן עם HTTPS שים true
        sameSite: 'Lax'
    });
    res.json({ success: true, message: 'Logged out successfully' });
};
