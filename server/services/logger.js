const { createLogger, transports, format } = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.combine(format.timestamp(), format.simple()),
    transports: [
        new transports.File({ filename: 'app.log' }),
        new transports.Console()
    ]
});

module.exports = logger;
