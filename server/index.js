const fs = require('fs');
const https = require('https');
const app = require('./app');
const logger = require('./services/logger');

const certFolder = './cert';
const keyPath = `${certFolder}/key.pem`;
const certPath = `${certFolder}/cert.pem`;

const PORT = process.env.PORT || 3001;

// Run HTTPS server only if not in tests
if (process.env.NODE_ENV !== 'test') {
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
}
