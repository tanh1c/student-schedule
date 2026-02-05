import express from 'express';
import cors from 'cors';
import config from '../config/default.js';
import apiRoutes from './routes/apiRoutes.js';
import lecturerRoutes from './routes/lecturerRoutes.js';
import { MAX_SESSIONS, sessions, activePeriodJars } from './services/sessionStore.js';

const app = express();

app.use(cors({
    origin: config.server.corsOrigin,
    credentials: true
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
        sessions: sessions.size,
        jars: activePeriodJars.size,
        uptime: process.uptime()
    });
});

export default app;
