const mongoose = require('mongoose');
const logger = require('./logger');

let isConnected = false;

const connectToMongo = async () => {
    if (isConnected) {
        logger.info('🔁 Already connected to MongoDB');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        logger.info('✅ Connected to MongoDB');
    } catch (err) {
        logger.error('❌ MongoDB connection error:', err);
        throw err;
    }
};

module.exports = connectToMongo;
