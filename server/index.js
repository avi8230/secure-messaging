const cluster = require('cluster');
const os = require('os');
const fs = require('fs');
const https = require('https');
const logger = require('./services/logger');

const numCPUs = os.cpus().length;
const certFolder = './cert';
const keyPath = `${certFolder}/key.pem`;
const certPath = `${certFolder}/cert.pem`;

const PORT = process.env.PORT || 3001;

// Use the cluster module to create a worker for each CPU core
if (cluster.isMaster) {
    console.log(`🔧 Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });

} else {
    const app = require('./app');

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        const credentials = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath)
        };

        https.createServer(credentials, app).listen(PORT, () => {
            logger.info(`🚀 Worker ${process.pid} running at https://localhost:${PORT}`);
        });
    } else {
        logger.error('❌ SSL certificates not found. Please generate key.pem and cert.pem inside /cert');
        process.exit(1);
    }
}
