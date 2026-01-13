import express from 'express';
import cors from 'cors';
import nodeFetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import fetchCookie from 'fetch-cookie';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-in-production';

// ========================
// SECURITY MIDDLEWARE
// ========================

// Helmet for secure HTTP headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable for SPA
    crossOriginEmbedderPolicy: false
}));

// CORS - In production fullstack mode, same origin so less strict
app.use(cors({
    origin: isProduction
        ? true  // Same origin in fullstack mode
        : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting for login endpoints (brute force protection)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { error: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => !isProduction // Skip in development
});

// General rate limiting
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: { error: 'Quá nhiều request. Vui lòng chờ một chút.' },
    skip: (req) => !isProduction
});

app.use(generalLimiter);
app.use(express.json({ limit: '10kb' })); // Limit body size

// ========================
// STATIC FILES (Production)
// ========================
// Serve React frontend from /dist folder
if (isProduction) {
    const distPath = path.join(__dirname, '..', 'dist');
    console.log(`[Static] Serving frontend from: ${distPath}`);
    app.use(express.static(distPath));
}

// ========================
// SESSION MANAGEMENT
// ========================

// In production, consider using Redis instead of Map
const sessions = new Map();

// Session cleanup - remove expired sessions every 30 minutes
const SESSION_EXPIRY = 60 * 60 * 1000; // 1 hour
setInterval(() => {
    const now = Date.now();
    for (const [token, session] of sessions.entries()) {
        if (now - session.createdAt > SESSION_EXPIRY) {
            sessions.delete(token);
            console.log(`[Session] Cleaned up expired session for ${session.username}`);
        }
    }
}, 30 * 60 * 1000);

// ========================
// UTILITY FUNCTIONS
// ========================

function createCookieFetch() {
    const jar = new CookieJar();
    const fetch = fetchCookie(nodeFetch, jar);
    return { fetch, jar };
}

// Secure session token generation
function generateSessionToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}

// Sanitize user input
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, 100); // Limit length
}

// ========================
// AUTHENTICATION
// ========================

async function performCASLogin(username, password) {
    const { fetch, jar } = createCookieFetch();
    const serviceUrl = 'https://mybk.hcmut.edu.vn/app/login/cas';

    try {
        // Step 1: Get login form
        const loginPageUrl = `https://sso.hcmut.edu.vn/cas/login?service=${encodeURIComponent(serviceUrl)}`;
        const formResponse = await fetch(loginPageUrl);
        const html = await formResponse.text();

        const executionMatch = html.match(/name="execution"\s+value="([^"]+)"/);
        const ltMatch = html.match(/name="lt"\s+value="([^"]+)"/);

        if (!executionMatch || !ltMatch) {
            return { success: false, error: 'Không thể tải form đăng nhập SSO' };
        }

        // Step 2: Submit login
        const loginParams = new URLSearchParams({
            username,
            password,
            execution: executionMatch[1],
            _eventId: 'submit',
            lt: ltMatch[1],
            submit: 'Login'
        });

        const loginResponse = await fetch(loginPageUrl, {
            method: 'POST',
            body: loginParams,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            redirect: 'follow'
        });

        const finalUrl = loginResponse.url;

        if (finalUrl.includes('sso.hcmut.edu.vn/cas/login')) {
            return { success: false, error: 'Sai thông tin đăng nhập' };
        }

        // Extract token
        const pageHtml = await loginResponse.text();
        let jwtToken = null;

        const hiddenTokenMatch = pageHtml.match(/id="hid_Token"\s+value="([^"]+)"/);
        if (hiddenTokenMatch) {
            jwtToken = `Bearer ${hiddenTokenMatch[1]}`;
        }

        // Get cookies
        const cookies = await jar.getCookies('https://mybk.hcmut.edu.vn/app');
        const cookieString = cookies.map(c => c.cookieString()).join('; ');

        // Verify by fetching student info
        const apiHeaders = {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0',
            'Cookie': cookieString
        };
        if (jwtToken) apiHeaders['Authorization'] = jwtToken;

        const infoResponse = await nodeFetch('https://mybk.hcmut.edu.vn/api/v1/student/get-student-info?null', {
            headers: apiHeaders
        });

        let userData = null;
        if (infoResponse.ok) {
            const data = await infoResponse.json();
            if (data.code === "200" || data.code === 200 || !data.code) {
                userData = data.data || data;
            }
        }

        return {
            success: true,
            cookieString,
            user: userData,
            jwtToken
        };

    } catch (error) {
        console.error('[CAS] Error:', error.message);
        return { success: false, error: 'Lỗi kết nối đến hệ thống SSO' };
    }
}

// ========================
// API ROUTES
// ========================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Login endpoint with rate limiting
app.post('/api/auth/login', loginLimiter, async (req, res) => {
    const username = sanitizeInput(req.body.username);
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ error: 'Thiếu thông tin đăng nhập' });
    }

    // Log attempt (without password!)
    console.log(`[API] Login attempt for ${username}`);

    const result = await performCASLogin(username, password);

    if (result.success) {
        const sessionToken = generateSessionToken();

        // SECURITY: Do NOT store password in session
        const sessionData = {
            username,
            cookie: result.cookieString,
            jwtToken: result.jwtToken,
            user: result.user,
            createdAt: Date.now()
        };

        sessions.set(sessionToken, sessionData);

        // Log success (no sensitive data)
        console.log(`[API] Login successful for ${username}`);

        res.json({
            success: true,
            token: sessionToken,
            user: result.user
        });
    } else {
        // Log failure
        console.log(`[API] Login failed for ${username}: ${result.error}`);
        res.status(401).json({ error: result.error });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        const session = sessions.get(token);
        if (session) {
            console.log(`[API] Logout for ${session.username}`);
        }
        sessions.delete(token);
    }
    res.json({ success: true });
});

// Auth middleware
function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check session expiry
    if (Date.now() - session.createdAt > SESSION_EXPIRY) {
        sessions.delete(token);
        return res.status(401).json({ error: 'Session expired' });
    }

    req.session = session;
    next();
}

// Protected routes
app.get('/api/student/info', requireAuth, async (req, res) => {
    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
            'Cookie': req.session.cookie
        };
        if (req.session.jwtToken) headers['Authorization'] = req.session.jwtToken;

        const response = await nodeFetch('https://mybk.hcmut.edu.vn/api/v1/student/get-student-info?null', { headers });
        const data = await response.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: 'Lỗi kết nối' });
    }
});

app.get('/api/student/schedule', requireAuth, async (req, res) => {
    const { studentId, semesterYear } = req.query;

    if (!studentId || !semesterYear) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
            'Cookie': req.session.cookie
        };
        if (req.session.jwtToken) headers['Authorization'] = req.session.jwtToken;

        const url = `https://mybk.hcmut.edu.vn/api/v1/student/schedule?studentId=${studentId}&semesterYear=${semesterYear}&null`;
        const response = await nodeFetch(url, { headers });
        const data = await response.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: 'Lỗi kết nối' });
    }
});

app.get('/api/student/exam-schedule', requireAuth, async (req, res) => {
    const { studentId, namhoc, hocky } = req.query;

    if (!studentId || !namhoc || !hocky) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
            'Cookie': req.session.cookie
        };
        if (req.session.jwtToken) headers['Authorization'] = req.session.jwtToken;

        const url = `https://mybk.hcmut.edu.vn/api/thoi-khoa-bieu/lich-thi-sinh-vien/v1?masv=${studentId}&namhoc=${namhoc}&hocky=${hocky}&null`;
        const response = await nodeFetch(url, { headers });
        const data = await response.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: 'Lỗi kết nối' });
    }
});

// ========================
// ERROR HANDLING & SPA FALLBACK
// ========================

// For non-API routes in production, serve index.html (SPA routing)
if (isProduction) {
    app.get('*', (req, res) => {
        // Only serve index.html for non-API routes
        if (!req.path.startsWith('/api')) {
            const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
            res.sendFile(indexPath);
        } else {
            res.status(404).json({ error: 'API endpoint not found' });
        }
    });
} else {
    // Development: 404 for all unmatched routes
    app.use((req, res) => {
        res.status(404).json({ error: 'Not found' });
    });
}

// Global error handler
app.use((err, req, res, next) => {
    console.error('[Error]', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

// ========================
// START SERVER
// ========================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   Student Schedule API Server              ║
║   Mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}                      ║
║   Port: ${PORT}                                ║
║   Origin: ${ALLOWED_ORIGIN.substring(0, 30)}...
╚════════════════════════════════════════════╝
    `);

    if (!isProduction) {
        console.log('[WARN] Running in development mode. Do not use in production!');
    }
});

export default app;
