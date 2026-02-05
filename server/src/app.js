import express from 'express';
import cors from 'cors';
import config from '../config/default.js';
import helmet from 'helmet';
import logger from './utils/logger.js';
import apiRoutes from './routes/apiRoutes.js';
import lecturerRoutes from './routes/lecturerRoutes.js';
import { activePeriodJars } from './services/sessionStore.js';

const app = express();

// Security Hardening
app.use(helmet());

// Logging Middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

app.use(cors({
    origin: config.server.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Main API Routes
app.use('/api', apiRoutes);

// Lecturer Routes (prefixed with /api/lecturer)
app.use('/api/lecturer', lecturerRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Stats (simplified for brevity)
app.get('/api/stats', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        // sessions: sessions.size, // Removed as we moved to Redis
        activeJars: activePeriodJars.size
    });
});

export default app;
