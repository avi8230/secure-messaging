require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const logger = require('./services/logger');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI)
    .then(() => logger.info('Connected to MongoDB'))
    .catch((err) => logger.error('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
