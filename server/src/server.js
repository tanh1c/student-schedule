import 'dotenv/config';
import app from './app.js';
import config from '../config/default.js';
import logger from './utils/logger.js';
import { initRedis } from './services/redisService.js';
// Import logger

const PORT = config.server.port;

app.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
    logger.info('──────────────────────────────────────────');
    logger.info(`► CORS Origin: ${config.server.corsOrigin}`);
    logger.info(`► Max Sessions: ${config.session.maxSessions}`);
    logger.info('──────────────────────────────────────────');

    // Connect to Redis
    initRedis();
});
