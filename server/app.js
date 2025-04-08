require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('./services/logger');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'https://localhost:3000',
    credentials: true
}));

mongoose.connect(process.env.MONGO_URI)
    .then(() => logger.info('Connected to MongoDB'))
    .catch((err) => logger.error('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));

module.exports = app;
