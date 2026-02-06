import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import config from '../config/default.js';
import helmet from 'helmet';
import logger from './utils/logger.js';
import apiRoutes from './routes/apiRoutes.js';
import lecturerRoutes from './routes/lecturerRoutes.js';
import { activePeriodJars } from './services/sessionStore.js';
import { requestIdMiddleware, globalErrorHandler } from './middlewares/errorMiddleware.js';

const app = express();

app.use(helmet());
app.use(requestIdMiddleware);

app.use((req, res, next) => {
    logger.info(`[${req.requestId}] ${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

app.use(cors({
    origin: config.server.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id']
}));
app.use(express.json());

app.use('/api', apiRoutes);
app.use('/api/lecturer', lecturerRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', requestId: req.requestId }));

app.get('/api/stats', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        activeJars: activePeriodJars.size,
        requestId: req.requestId
    });
});

app.use(globalErrorHandler);

export default app;
