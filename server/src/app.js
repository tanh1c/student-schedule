import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/default.js';
import helmet from 'helmet';
import logger from './utils/logger.js';
import apiRoutes from './routes/apiRoutes.js';
import lecturerRoutes from './routes/lecturerRoutes.js';
import { activePeriodJars } from './services/sessionStore.js';
import { getContributors } from './services/githubService.js';
import { requestIdMiddleware, globalErrorHandler } from './middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';

const app = express();

// Trust proxy for Render (behind load balancer)
if (isProduction) {
    app.set('trust proxy', 1);
}

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(requestIdMiddleware);

app.use((req, res, next) => {
    logger.info(`[${req.requestId}] ${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

app.use(cors({
    origin: isProduction ? true : config.server.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id']
}));
app.use(express.json());

// API Routes
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

// GitHub Contributors API with Redis caching
app.get('/api/github/contributors', async (req, res) => {
    try {
        const data = await getContributors();
        res.json(data);
    } catch (error) {
        logger.error('[API] Failed to get contributors:', error);
        res.status(500).json({ error: 'Failed to fetch contributors' });
    }
});

// ========================
// STATIC FILES (Production)
// ========================
if (isProduction) {
    const distPath = path.join(__dirname, '..', '..', 'dist');
    logger.info(`[Static] Serving frontend from: ${distPath}`);

    // Serve static files from dist
    app.use(express.static(distPath));

    // SPA fallback - serve index.html for all non-API routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

app.use(globalErrorHandler);

export default app;
