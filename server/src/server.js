import 'dotenv/config';
import app from './app.js';
import config from '../config/default.js';
import logger from './utils/logger.js';
import { initRedis, getClient } from './services/redisService.js';

const PORT = config.server.port;

// Initialize Redis before starting HTTP server
await initRedis();

const server = app.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
    logger.info('──────────────────────────────────────────');
    logger.info(`► CORS Origin: ${config.server.corsOrigin}`);
    logger.info(`► Max Sessions: ${config.session.maxSessions}`);
    logger.info('──────────────────────────────────────────');
});

// ════════════════════════════════════════════════
// GRACEFUL SHUTDOWN — Handle Docker SIGTERM/SIGINT
// ════════════════════════════════════════════════
async function gracefulShutdown(signal) {
    logger.info(`[SHUTDOWN] Received ${signal}. Closing server...`);

    // Safety net: force exit after 10s if cleanup hangs
    const forceExitTimer = setTimeout(() => {
        logger.warn('[SHUTDOWN] Forced exit after timeout.');
        process.exit(1);
    }, 10000);
    forceExitTimer.unref(); // Don't keep process alive just for this timer

    // 1. Close Redis connection
    try {
        const redisClient = getClient();
        if (redisClient?.isOpen) {
            await redisClient.quit();
            logger.info('[SHUTDOWN] Redis connection closed.');
        }
    } catch (e) {
        logger.error('[SHUTDOWN] Redis close error:', e);
    }

    // 2. Stop accepting new connections, then exit
    server.close(() => {
        logger.info('[SHUTDOWN] HTTP server closed. Exiting.');
        process.exit(0);
    });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
