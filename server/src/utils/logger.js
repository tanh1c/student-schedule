import winston from 'winston';
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

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        maskingFormat(),
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'mybk-proxy' },
    transports: [
        // Write all logs with importance level of `error` or less to `error.log`
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Write all logs with importance level of `info` or less to `combined.log`
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            maskingFormat(),
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

export default logger;
