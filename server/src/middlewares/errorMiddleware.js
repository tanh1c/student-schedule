import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import config from '../../config/default.js';

export const requestIdMiddleware = (req, res, next) => {
    req.requestId = req.headers['x-request-id'] || uuidv4();
    res.setHeader('x-request-id', req.requestId);
    next();
};

export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    const reqId = req.requestId || 'unknown-id';

    if (err.statusCode >= 500) {
        logger.error(`[${reqId}] Server Error:`, err);
    } else {
        logger.warn(`[${reqId}] Client Error (${err.statusCode}): ${err.message}`);
    }

    if (config.env === 'production') {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                error: err.message,
                code: err.code || 'ERROR',
                requestId: reqId
            });
        }
        return res.status(500).json({
            status: 'error',
            error: 'Something went wrong!',
            code: 'INTERNAL_SERVER_ERROR',
            requestId: reqId
        });
    }

    return res.status(err.statusCode).json({
        status: err.status,
        error: err.message,
        code: err.code || 'ERROR',
        requestId: reqId,
        stack: err.stack,
        originalError: err
    });
};
