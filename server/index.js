require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const mongoose = require('mongoose');
const logger = require('./services/logger');
const cookieParser = require('cookie-parser');
const cors = require('cors');

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

// Create HTTPS server
const certFolder = './cert';
const keyPath = `${certFolder}/key.pem`;
const certPath = `${certFolder}/cert.pem`;

const PORT = process.env.PORT || 3001;

// Checking for certificate files
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const credentials = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    };

    https.createServer(credentials, app).listen(PORT, () => {
        logger.info(`🚀 HTTPS server running on https://localhost:${PORT}`);
    });
} else {
    logger.error('❌ SSL certificates not found. Please generate key.pem and cert.pem inside /cert');
    process.exit(1);
}
