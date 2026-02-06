import winston from 'winston';
import 'winston-daily-rotate-file';
import { maskSensitive, maskUrl, maskCookie } from './masking.js';

// Custom format to mask sensitive data in logs
const maskingFormat = winston.format((info) => {
    if (typeof info.message === 'string') {
        let msg = info.message;

        // Mask URLs
        if (msg.includes('http')) {
            msg = maskUrl(msg);
        }

        // Mask Cookies/Tokens (basic patterns)
        if (msg.includes('execution:')) {
            msg = msg.replace(/execution:\s*([^\s]+)/, (match, p1) => `execution: ${maskSensitive(p1)}`);
        }
        if (msg.includes('Cookie')) {
            msg = maskCookie(msg);
        }

        info.message = msg;
    }

    // Mask extra fields if they exist
    if (info.cookie) info.cookie = maskCookie(info.cookie);
    if (info.token) info.token = maskSensitive(info.token);
    if (info.password) info.password = '***';

    return info;
});

// Daily Rotate Transport - All logs
const dailyRotateTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,       // Compress old logs to .gz
    maxSize: '20m',            // Max 20MB per file
    maxFiles: '14d',           // Keep logs for 14 days, then auto-delete
    level: 'info'
});

// Daily Rotate Transport - Error logs only
const errorRotateTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',           // Keep error logs 30 days (more important)
    level: 'error'
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        maskingFormat(),
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'mybk-proxy' },
    transports: [
        dailyRotateTransport,
        errorRotateTransport
    ],
});

// Console logging for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            maskingFormat(),
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

// Log rotation events
dailyRotateTransport.on('rotate', (oldFilename, newFilename) => {
    logger.info(`[LOG] Rotated: ${oldFilename} -> ${newFilename}`);
});

export default logger;
