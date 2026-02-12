import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/default.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';
import apiRoutes from './routes/apiRoutes.js';
import lecturerRoutes from './routes/lecturerRoutes.js';
import { activePeriodJars } from './services/sessionStore.js';
import { getContributors } from './services/githubService.js';
import { getCommandStats } from './services/redisService.js';
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

// Body size limit (prevent payload abuse)
app.use(express.json({ limit: '10kb' }));

// ════════════════════════════════════════════════
// GLOBAL RATE LIMITER — Protect against DDoS & spam
// Uses in-memory store (NO Redis commands consumed)
// ════════════════════════════════════════════════
app.use(rateLimit({
    windowMs: 60 * 1000,       // 1 minute window
    max: 200,                   // 200 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Quá nhiều request. Vui lòng đợi 1 phút.' },
    skip: () => !isProduction,
    validate: false              // Disable all validation (IPv6 check) for Docker/proxy
}));

// Per-session API rate limiter — prevent authenticated users from spamming
// This protects Upstash commands from being drained by a single user
const authenticatedLimiter = rateLimit({
    windowMs: 60 * 1000,       // 1 minute
    max: 60,                    // 60 API calls per minute per session token
    keyGenerator: (req) => {
        // Use session token as key (not IP) — limits PER USER
        return req.headers.authorization?.replace('Bearer ', '') || req.ip;
    },
    standardHeaders: true,
    legacyHeaders: false,
<<<<<<< HEAD
    validate: { ipv6SubnetOrKeyGenerator: false }, // Disable IPv6 warning for custom keyGenerator
=======
    validate: false, // Disable all validation for Docker/proxy
>>>>>>> origin/feature/server-refactor
    message: { error: 'Quá nhiều request. Vui lòng chậm lại.' },
    skip: () => !isProduction
});

// Apply per-session limiter to all /api routes (except health/stats)
app.use('/api/student', authenticatedLimiter);
app.use('/api/dkmh', authenticatedLimiter);
app.use('/api/lms', authenticatedLimiter);
app.use('/api/schedule', authenticatedLimiter);

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
        redis: getCommandStats(),
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
