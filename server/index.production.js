import express from 'express';
import cors from 'cors';
import nodeFetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import fetchCookie from 'fetch-cookie';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// ========================
// SECURITY MIDDLEWARE
// ========================

// Trust proxy for Render/Heroku (behind load balancer)
if (isProduction) {
    app.set('trust proxy', 1);
}

// Helmet for secure HTTP headers
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: isProduction ? true : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
    credentials: true
}));

// Rate limiting for login (brute force protection)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Quá nhiều lần thử. Vui lòng đợi 15 phút.' },
    skip: () => !isProduction
});

// General rate limiting
app.use(rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    skip: () => !isProduction
}));

app.use(express.json({ limit: '10kb' }));

// ========================
// STATIC FILES (Production)
// ========================
if (isProduction) {
    const distPath = path.join(__dirname, '..', 'dist');
    console.log(`[Static] Serving frontend from: ${distPath}`);
    app.use(express.static(distPath));
}

// Store sessions in memory
const sessions = new Map();

// Store active period cookie jars per session (for DKMH search to work)
const activePeriodJars = new Map();

// ═══════════════════════════════════════════════════════
// SESSION MANAGEMENT & OPTIMIZATION (Production)
// ═══════════════════════════════════════════════════════

// Configuration - 15 phút timeout để tăng throughput
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;  // 15 phút không hoạt động = tự động logout
const CLEANUP_INTERVAL_MS = 3 * 60 * 1000;  // Chạy cleanup mỗi 3 phút
const MAX_SESSIONS = 40;                     // Tính dựa trên: (512MB - 70MB base - 50MB buffer) / 8MB ≈ 40

/**
 * Cleanup expired sessions to free up memory
 */
function cleanupExpiredSessions() {
    const now = Date.now();
    let cleanedCount = 0;
    let cleanedJars = 0;

    // Cleanup main sessions
    for (const [token, session] of sessions.entries()) {
        const lastActivity = session.lastActivity || session.createdAt || 0;
        const age = now - lastActivity;

        if (age > SESSION_TIMEOUT_MS) {
            sessions.delete(token);
            cleanedCount++;

            if (activePeriodJars.has(token)) {
                activePeriodJars.delete(token);
                cleanedJars++;
            }
        }
    }

    // Cleanup orphaned period jars
    for (const [token] of activePeriodJars.entries()) {
        if (!sessions.has(token)) {
            activePeriodJars.delete(token);
            cleanedJars++;
        }
    }

    if (cleanedCount > 0 || cleanedJars > 0) {
        console.log(`[CLEANUP] Removed ${cleanedCount} expired sessions, ${cleanedJars} period jars. Active: ${sessions.size}`);
    }

    // Log memory usage
    const mem = process.memoryUsage();
    console.log(`[MEMORY] Heap: ${(mem.heapUsed / 1024 / 1024).toFixed(1)}MB | RSS: ${(mem.rss / 1024 / 1024).toFixed(1)}MB | Sessions: ${sessions.size}/${MAX_SESSIONS}`);
}

// Start automatic cleanup
setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL_MS);
console.log(`[INIT] Session cleanup every ${CLEANUP_INTERVAL_MS / 60000}min (timeout: ${SESSION_TIMEOUT_MS / 60000}min, max: ${MAX_SESSIONS})`);

/**
 * Middleware to update session activity timestamp
 */
function updateSessionActivity(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);
    if (session) {
        session.lastActivity = Date.now();
    }
    next();
}
app.use(updateSessionActivity);

/**
 * Check if we can create new session
 */
function canCreateSession() {
    if (sessions.size >= MAX_SESSIONS) {
        cleanupExpiredSessions();
        return sessions.size < MAX_SESSIONS;
    }
    return true;
}


/**
 * Creates a cookie-aware fetch instance
 */
function createCookieFetch() {
    const jar = new CookieJar();
    const fetch = fetchCookie(nodeFetch, jar);
    return { fetch, jar };
}

/**
 * Perform CAS login and get the session
 */
async function performCASLogin(username, password) {
    const { fetch, jar } = createCookieFetch();
    const serviceUrl = 'https://mybk.hcmut.edu.vn/app/login/cas';

    try {
        if (!isProduction) console.log('[CAS] Step 1: Getting login form...');
        // Step 1: Get the login form to extract execution flow and lt
        const loginPageUrl = `https://sso.hcmut.edu.vn/cas/login?service=${encodeURIComponent(serviceUrl)}`;
        const formResponse = await fetch(loginPageUrl);
        const html = await formResponse.text();

        const executionMatch = html.match(/name="execution"\s+value="([^"]+)"/);
        const ltMatch = html.match(/name="lt"\s+value="([^"]+)"/);

        if (!executionMatch || !ltMatch) {
            console.error('[CAS] Failed to parse login form');
            return { success: false, error: 'Không thể tải form đăng nhập SSO' };
        }

        const execution = executionMatch[1];
        const lt = ltMatch[1];
        if (!isProduction) console.log('[CAS] Got login form tokens');

        // Step 2: Submit login form
        if (!isProduction) console.log('[CAS] Step 2: Submitting credentials...');
        const loginParams = new URLSearchParams({
            username: username,
            password: password,
            execution: execution,
            _eventId: 'submit',
            lt: lt,
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
        if (!isProduction) console.log('[CAS] Login redirect complete');

        if (finalUrl.includes('sso.hcmut.edu.vn/cas/login')) {
            return { success: false, error: 'Sai thông tin đăng nhập' };
        }

        // Search for tokens in HTML
        const pageHtml = await loginResponse.text();

        // DEBUG: Only save HTML in development (NEVER in production)
        if (!isProduction) {
            try {
                const fsModule = await import('fs');
                fsModule.writeFileSync('debug_app.html', pageHtml);
                console.log('[DEBUG] Saved login HTML to server/debug_app.html');
            } catch (e) { /* ignore */ }
        }

        let jwtToken = null;

        // Search for hidden input token (Correct pattern for MyBK)
        const hiddenTokenMatch = pageHtml.match(/id="hid_Token"\s+value="([^"]+)"/);

        // Also keep other patterns just in case
        const localStoreMatch = pageHtml.match(/localStorage\.setItem\(['"]token['"]\s*,\s*['"]([^'"]+)['"]/);
        const windowMatch = pageHtml.match(/window\.token\s*=\s*['"]([^'"]+)['"]/);

        if (hiddenTokenMatch) {
            jwtToken = `Bearer ${hiddenTokenMatch[1]}`;
            console.log('[AUTH] Found token via hid_Token input! 🎉');
        } else if (localStoreMatch) {
            jwtToken = `Bearer ${localStoreMatch[1]}`;
            console.log('[AUTH] Found token via localStorage pattern');
        } else if (windowMatch) {
            jwtToken = `Bearer ${windowMatch[1]}`;
            console.log('[AUTH] Found token via window pattern');
        } else {
            // Fallback to searching for raw JWT string if nothing specific found
            const jwtMatch = pageHtml.match(/eyJ[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/);
            if (jwtMatch) {
                console.log('[AUTH] Found raw JWT pattern, trying it...');
                jwtToken = `Bearer ${jwtMatch[0]}`;
            } else {
                console.log('[AUTH] Could not find token in HTML.');
            }
        }

        // Get cookie explicitly from the APP PATH
        const cookies = await jar.getCookies('https://mybk.hcmut.edu.vn/app');
        const cookieString = cookies.map(c => c.cookieString()).join('; ');
        console.log('[CAS] Cookies from /app path:', cookieString);

        if (!cookieString.includes('SESSION')) {
            console.log('[WARN] SESSION cookie missing! Trying root path...');
            const rootCookies = await jar.getCookies('https://mybk.hcmut.edu.vn/');
            console.log('[CAS] Root cookies:', rootCookies.map(c => c.cookieString()).join('; '));
        }

        // Step 4: Verify by fetching student info
        console.log('[AUTH] Verifying with get-student-info...');
        const apiHeaders = {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://mybk.hcmut.edu.vn/app/',
            'Origin': 'https://mybk.hcmut.edu.vn',
            'Cookie': cookieString
        };
        if (jwtToken) {
            apiHeaders['Authorization'] = jwtToken;
        }

        const infoResponse = await nodeFetch('https://mybk.hcmut.edu.vn/api/v1/student/get-student-info?null', {
            headers: apiHeaders
        });

        let userData = null;
        if (infoResponse.ok) {
            const responseText = await infoResponse.text();
            try {
                const data = JSON.parse(responseText);
                if (data.code === "200" || data.code === 200 || !data.code) {
                    userData = data.data || data;
                    console.log('[AUTH] Student info fetched successfully!');
                } else {
                    console.log(`[AUTH] Login OK but info denied: ${data.code} - ${data.msg}`);
                }
            } catch (e) { console.log('[AUTH] Response not JSON', e); }

            const authHeader = infoResponse.headers.get('authorization');
            if (authHeader) {
                jwtToken = authHeader;
                console.log('[AUTH] Found token in API response header');
            }
        } else {
            console.log('[AUTH] Failed to fetch student info:', infoResponse.status);
        }

        return {
            success: true,
            cookieString: cookieString,
            user: userData,
            jwtToken: jwtToken
        };

    } catch (error) {
        console.error('[CAS] Error:', error);
        return { success: false, error: error.message };
    }
}

app.post('/api/auth/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Username và password là bắt buộc' });
    }

    // Check if we can create new session (max sessions limit)
    if (!canCreateSession()) {
        console.log(`[API] Max sessions (${MAX_SESSIONS}) reached, rejecting login`);
        return res.status(503).json({
            error: 'Server đang quá tải, vui lòng thử lại sau ít phút',
            code: 'MAX_SESSIONS_REACHED'
        });
    }

    // Sanitize username for logging (don't log full username)
    const maskedUsername = username.substring(0, 3) + '***';
    if (!isProduction) console.log(`[API] Login request for ${maskedUsername}`);

    const result = await performCASLogin(username, password);

    if (result.success) {
        // Generate cryptographically secure token
        const sessionToken = crypto.randomBytes(32).toString('hex');

        const sessionData = {
            username,
            cookie: result.cookieString,
            jwtToken: result.jwtToken,
            user: result.user,
            createdAt: Date.now(),
            lastActivity: Date.now(),  // Track activity for cleanup
            dkmhCookie: null,
            dkmhLoggedIn: false
        };

        // Login to DKMH with password, then DELETE password immediately
        if (!isProduction) console.log('[API] Also logging into DKMH...');
        performDKMHLogin(username, password).then(dkmhResult => {
            if (dkmhResult.success) {
                sessionData.dkmhCookie = dkmhResult.cookieString;
                sessionData.dkmhLoggedIn = true;
                if (!isProduction) console.log('[API] DKMH login successful!');
            }
            // Password is NOT stored - DKMH login is done, we only keep the cookie
        }).catch(err => {
            console.error('[API] DKMH login error');
        });

        sessions.set(sessionToken, sessionData);
        console.log(`[API] Login successful. Active sessions: ${sessions.size}/${MAX_SESSIONS}`);

        res.json({
            success: true,
            token: sessionToken,
            user: result.user
        });
    } else {
        res.status(401).json({ error: result.error });
    }
});

app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    sessions.delete(token);
    res.json({ success: true });
});

// Check DKMH status for existing MyBK session
app.get('/api/dkmh/status', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) {
        return res.status(401).json({ authenticated: false, error: 'Not logged in' });
    }

    res.json({
        authenticated: !!session.dkmhCookie,
        dkmhLoggedIn: session.dkmhLoggedIn || false,
        username: session.username
    });
});

app.get('/api/student/info', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    console.log('[API] Proxying get-student-info...');

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://mybk.hcmut.edu.vn/app/',
            'Origin': 'https://mybk.hcmut.edu.vn',
            'Cookie': session.cookie
        };
        if (session.jwtToken) headers['Authorization'] = session.jwtToken;

        const response = await nodeFetch('https://mybk.hcmut.edu.vn/api/v1/student/get-student-info?null', { headers });
        const responseText = await response.text();

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            return res.status(502).json({ error: 'Invalid response from upstream' });
        }

        if (data.code === "200" || data.code === 200 || !data.code) {
            session.user = data.data || data;
        }

        res.json(data);
    } catch (e) {
        console.error('[API] Error details:', e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/student/schedule', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { studentId, semesterYear } = req.query;
    console.log(`[API] Proxying schedule for ${studentId}, sem ${semesterYear}...`);

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://mybk.hcmut.edu.vn/app/',
            'Origin': 'https://mybk.hcmut.edu.vn',
            'Cookie': session.cookie
        };
        if (session.jwtToken) headers['Authorization'] = session.jwtToken;

        const url = `https://mybk.hcmut.edu.vn/api/v1/student/schedule?studentId=${studentId}&semesterYear=${semesterYear}&null`;
        const response = await nodeFetch(url, { headers });
        const data = await response.json();
        res.json(data);
    } catch (e) {
        console.error('[API] Schedule Error:', e);
        res.status(500).json({ error: e.message });
    }
});

// New Endpoint: Get Exam Schedule
app.get('/api/student/exam-schedule', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { studentId, namhoc, hocky } = req.query;
    console.log(`[API] Proxying exam schedule for ${studentId}, namhoc=${namhoc}, hocky=${hocky}...`);

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://mybk.hcmut.edu.vn/app/he-thong-quan-ly/sinh-vien/lich-thi',
            'Origin': 'https://mybk.hcmut.edu.vn',
            'Cookie': session.cookie,
            'Content-Type': 'application/json'
        };
        if (session.jwtToken) headers['Authorization'] = session.jwtToken;

        const url = `https://mybk.hcmut.edu.vn/api/thoi-khoa-bieu/lich-thi-sinh-vien/v1?masv=${studentId}&namhoc=${namhoc}&hocky=${hocky}&null`;
        console.log('[API] Exam schedule URL:', url);

        const response = await nodeFetch(url, { headers });
        const data = await response.json();

        console.log(`[API] Exam schedule response: ${data.code}, exams count: ${data.data?.data?.length || 0}`);
        res.json(data);
    } catch (e) {
        console.error('[API] Exam Schedule Error:', e);
        res.status(500).json({ error: e.message });
    }
});

// New Endpoint: Get Transcript Summary (GPA, Credits, Info)
app.post('/api/student/gpa/summary', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);
    const { studentId } = req.body;

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    console.log(`[API] Proxying GPA Summary for ${studentId}...`);

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://mybk.hcmut.edu.vn/app/sinh-vien/ket-qua-hoc-tap/chuong-trinh-dao-tao',
            'Origin': 'https://mybk.hcmut.edu.vn',
            'Cookie': session.cookie,
            'Content-Type': 'application/json'
        };
        if (session.jwtToken) headers['Authorization'] = session.jwtToken;

        const url = 'https://mybk.hcmut.edu.vn/api/share/ket-qua-hoc-tap/thong-tin-mo-ta-ctdt/v2?tuychon=VIEWONLINE';

        const response = await nodeFetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(studentId)
        });

        const responseText = await response.text();
        console.log(`[DEBUG] GPA Summary Response: ${response.status}`);
        // console.log(`[DEBUG] GPA Summary Body: ${responseText.substring(0, 300)}`);

        try {
            const data = JSON.parse(responseText);
            res.json(data);
        } catch (e) {
            console.error('[API] Failed to parse JSON:', responseText.substring(0, 100));
            res.status(502).send(responseText);
        }
    } catch (e) {
        console.error('[API] GPA Summary Error:', e);
        res.status(500).json({ error: e.message });
    }
});

// New Endpoint: Get Detailed Transcript (List of subjects)
app.post('/api/student/gpa/detail', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);
    const { studentId } = req.body;

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    console.log(`[API] Proxying GPA Detail for ${studentId}...`);

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://mybk.hcmut.edu.vn/app/sinh-vien/ket-qua-hoc-tap/chuong-trinh-dao-tao',
            'Origin': 'https://mybk.hcmut.edu.vn',
            'Cookie': session.cookie,
            'Content-Type': 'application/json'
        };
        if (session.jwtToken) headers['Authorization'] = session.jwtToken;

        const url = 'https://mybk.hcmut.edu.vn/api/share/ket-qua-hoc-tap/danh-sach-mon-hoc-ctdt/v2';

        const response = await nodeFetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(studentId)
        });

        const responseText = await response.text();
        console.log(`[DEBUG] GPA Detail Response: ${response.status}`);
        // console.log(`[DEBUG] GPA Detail Body: ${responseText.substring(0, 300)}`);

        try {
            const data = JSON.parse(responseText);
            res.json(data);
        } catch (e) {
            console.error('[API] Failed to parse JSON:', responseText.substring(0, 100));
            res.status(502).send(responseText);
        }
    } catch (e) {
        console.error('[API] GPA Detail Error:', e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Server stats for performance monitoring
app.get('/api/stats', (req, res) => {
    const memoryUsage = process.memoryUsage();
    const sessionCount = sessions.size;

    const baseMemory = 50 * 1024 * 1024;
    const memoryPerSession = sessionCount > 0
        ? Math.round((memoryUsage.rss - baseMemory) / sessionCount)
        : 0;

    res.json({
        memory: {
            heapUsed: memoryUsage.heapUsed,
            heapTotal: memoryUsage.heapTotal,
            rss: memoryUsage.rss,
            external: memoryUsage.external,
            heapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
            rssMB: (memoryUsage.rss / 1024 / 1024).toFixed(2),
            memoryPerSessionMB: (memoryPerSession / 1024 / 1024).toFixed(2)
        },
        sessions: {
            active: sessionCount,
            max: MAX_SESSIONS,
            available: MAX_SESSIONS - sessionCount,
            periodJars: activePeriodJars.size
        },
        config: {
            sessionTimeoutMinutes: SESSION_TIMEOUT_MS / 60000,
            cleanupIntervalMinutes: CLEANUP_INTERVAL_MS / 60000,
            maxSessions: MAX_SESSIONS
        },
        uptime: process.uptime(),
        uptimeHuman: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
        timestamp: Date.now()
    });
});

// ===============================================
// DKMH (Đăng ký môn học) SSO Login
// ===============================================

/**
 * Perform SSO login for DKMH system
 * Service URL: https://mybk.hcmut.edu.vn/my/homeSSO.action
 * Target: https://mybk.hcmut.edu.vn/dkmh/dangKyMonHocForm.action
 */
async function performDKMHLogin(username, password) {
    const { fetch, jar } = createCookieFetch();
    const serviceUrl = 'https://mybk.hcmut.edu.vn/my/homeSSO.action';

    try {
        console.log('[DKMH] Step 1: Getting SSO login form...');
        const loginPageUrl = `https://sso.hcmut.edu.vn/cas/login?service=${encodeURIComponent(serviceUrl)}`;
        const formResponse = await fetch(loginPageUrl);
        const html = await formResponse.text();

        const executionMatch = html.match(/name="execution"\s+value="([^"]+)"/);
        const ltMatch = html.match(/name="lt"\s+value="([^"]+)"/);

        if (!executionMatch || !ltMatch) {
            console.log('[DKMH] Failed to parse login form');
            return { success: false, error: 'Không thể tải form đăng nhập SSO' };
        }

        const execution = executionMatch[1];
        const lt = ltMatch[1];
        console.log('[DKMH] Got SSO tokens');

        // Step 2: Submit credentials
        console.log('[DKMH] Step 2: Submitting credentials...');
        const loginParams = new URLSearchParams({
            username: username,
            password: password,
            execution: execution,
            _eventId: 'submit',
            lt: lt,
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
        console.log('[DKMH] Final URL after SSO login:', finalUrl);

        if (finalUrl.includes('sso.hcmut.edu.vn/cas/login')) {
            return { success: false, error: 'Sai thông tin đăng nhập' };
        }

        // Verify we reached homeSSO
        if (!finalUrl.includes('homeSSO.action')) {
            console.log('[DKMH] Did not reach homeSSO, final URL:', finalUrl);
        }

        // Step 3: Access DKMH - it may redirect to home.action first
        console.log('[DKMH] Step 3: Accessing DKMH system...');

        // First, access the main DKMH entry point
        const dkmhEntryUrl = 'https://mybk.hcmut.edu.vn/dkmh/';
        const entryResponse = await fetch(dkmhEntryUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': 'https://mybk.hcmut.edu.vn/my/homeSSO.action'
            },
            redirect: 'follow'
        });

        console.log('[DKMH] Entry URL response:', entryResponse.url);

        // Now access home.action to establish session
        const homeUrl = 'https://mybk.hcmut.edu.vn/dkmh/home.action';
        const homeResponse = await fetch(homeUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': entryResponse.url
            },
            redirect: 'follow'
        });

        console.log('[DKMH] Home URL response:', homeResponse.url);

        // Finally access the registration form
        const dkmhUrl = 'https://mybk.hcmut.edu.vn/dkmh/dangKyMonHocForm.action';
        const dkmhResponse = await fetch(dkmhUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': homeResponse.url
            },
            redirect: 'follow'
        });

        const dkmhFinalUrl = dkmhResponse.url;
        console.log('[DKMH] DKMH Final URL:', dkmhFinalUrl);

        // Check if we successfully reached DKMH or got redirected to login
        if (dkmhFinalUrl.includes('sso.hcmut.edu.vn') || dkmhFinalUrl.includes('cas/login')) {
            console.log('[DKMH] Redirected to login, session may be invalid');
            return { success: false, error: 'Không thể truy cập trang DKMH' };
        }

        const dkmhHtml = await dkmhResponse.text();

        // Save for debugging (development only – tránh ghi HTML chứa cookie trên production)
        if (!isProduction) {
            try {
                const fs = await import('fs');
                fs.writeFileSync('debug_dkmh.html', dkmhHtml);
                console.log('[DEBUG] Saved DKMH HTML to server/debug_dkmh.html');
            } catch (e) {
                console.error('[DEBUG] Failed to write debug_dkmh.html:', e.message);
            }
        }

        // Get all cookies
        const ssoCookies = await jar.getCookies('https://sso.hcmut.edu.vn');
        const mybkCookies = await jar.getCookies('https://mybk.hcmut.edu.vn');
        const dkmhCookies = await jar.getCookies('https://mybk.hcmut.edu.vn/dkmh');

        console.log('[DKMH] SSO Cookies:', ssoCookies.map(c => c.key).join(', '));
        console.log('[DKMH] MyBK Cookies:', mybkCookies.map(c => c.key).join(', '));
        console.log('[DKMH] DKMH Cookies:', dkmhCookies.map(c => c.key).join(', '));

        const allCookiesMap = new Map();
        [...ssoCookies, ...mybkCookies, ...dkmhCookies].forEach(c => {
            allCookiesMap.set(c.key, c.cookieString());
        });
        const cookieString = Array.from(allCookiesMap.values()).join('; ');

        console.log('[DKMH] All cookie keys:', Array.from(allCookiesMap.keys()).join(', '));
        console.log('[DKMH] Full cookie string length:', cookieString.length);

        // Check if page contains expected content
        const isLoggedIn = dkmhHtml.includes('Đăng ký môn học') ||
            dkmhHtml.includes('dangKyMonHoc') ||
            dkmhHtml.includes('logout') ||
            dkmhHtml.includes('Đăng xuất') ||
            dkmhHtml.includes('dkmh') ||
            dkmhHtml.length > 1000; // If page is substantial, likely logged in

        if (!isLoggedIn) {
            console.log('[DKMH] Page content may not indicate successful login (length:', dkmhHtml.length, ')');
        } else {
            console.log('[DKMH] Page content looks good (length:', dkmhHtml.length, ')');
        }

        return {
            success: true,
            cookieString: cookieString,
            jar: jar,
            dkmhUrl: dkmhFinalUrl
        };

    } catch (error) {
        console.error('[DKMH] Error:', error);
        return { success: false, error: error.message };
    }
}

// DKMH Login endpoint - uses same credentials as MyBK
app.post('/api/dkmh/login', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    // Option 1: Reuse existing session credentials
    // Option 2: Use credentials from request body
    const { username, password } = req.body;

    let loginUsername, loginPassword;

    if (username && password) {
        loginUsername = username;
        loginPassword = password;
    } else if (session && session.username) {
        // We don't store password, so we can't auto-login
        // User must provide credentials
        return res.status(400).json({
            error: 'Vui lòng cung cấp username và password cho DKMH',
            message: 'DKMH requires separate login credentials'
        });
    } else {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    console.log(`[API] DKMH Login request for ${loginUsername}`);

    const result = await performDKMHLogin(loginUsername, loginPassword);

    if (result.success) {
        // Store DKMH session info
        const dkmhSessionToken = Buffer.from(`dkmh:${loginUsername}:${Date.now()}`).toString('base64');

        sessions.set(dkmhSessionToken, {
            type: 'dkmh',
            username: loginUsername,
            cookie: result.cookieString,
            dkmhUrl: result.dkmhUrl,
            createdAt: Date.now()
        });

        // Also update existing MyBK session if available
        if (session) {
            session.dkmhCookie = result.cookieString;
            session.dkmhToken = dkmhSessionToken;
        }

        res.json({
            success: true,
            dkmhToken: dkmhSessionToken,
            message: 'Đăng nhập DKMH thành công'
        });
    } else {
        res.status(401).json({ error: result.error });
    }
});

// DKMH Session Check
app.get('/api/dkmh/check', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session || session.type !== 'dkmh') {
        return res.status(401).json({
            authenticated: false,
            error: 'DKMH session not found'
        });
    }

    // Optionally verify by making a request to DKMH
    try {
        const testUrl = 'https://mybk.hcmut.edu.vn/dkmh/dangKyMonHocForm.action';
        const response = await nodeFetch(testUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': session.cookie,
                'Referer': 'https://mybk.hcmut.edu.vn/my/homeSSO.action'
            },
            redirect: 'manual'
        });

        // If redirected to login, session is invalid
        if (response.status === 302 || response.status === 301) {
            const location = response.headers.get('location');
            if (location && (location.includes('login') || location.includes('sso'))) {
                sessions.delete(token);
                return res.json({ authenticated: false, error: 'Session expired' });
            }
        }

        res.json({
            authenticated: true,
            username: session.username,
            createdAt: session.createdAt
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Proxy endpoint for DKMH requests
app.all('/api/dkmh/proxy', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const dkmhCookie = session.type === 'dkmh' ? session.cookie : session.dkmhCookie;

    if (!dkmhCookie) {
        return res.status(401).json({ error: 'DKMH session not found. Please login to DKMH first.' });
    }

    const { url, method = 'GET', body } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`[DKMH Proxy] ${method} ${url}`);

    try {
        const options = {
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': dkmhCookie,
                'Referer': 'https://mybk.hcmut.edu.vn/dkmh/',
                'Origin': 'https://mybk.hcmut.edu.vn',
                'Accept': 'application/json, text/html, */*'
            }
        };

        if (body && (method === 'POST' || method === 'PUT')) {
            options.body = typeof body === 'string' ? body : JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
        }

        const response = await nodeFetch(url, options);
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            res.json(data);
        } else {
            const text = await response.text();
            res.send(text);
        }
    } catch (e) {
        console.error('[DKMH Proxy] Error:', e);
        res.status(500).json({ error: e.message });
    }
});

// Get list of registration periods (parsed from DKMH page)
app.get('/api/dkmh/registration-periods', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const dkmhCookie = session.dkmhCookie;

    if (!dkmhCookie) {
        return res.status(401).json({
            error: 'DKMH session not found. Please wait for DKMH login to complete.',
            dkmhLoggedIn: false
        });
    }

    console.log('[DKMH] Fetching registration periods...');

    try {
        // Fetch the DKMH page
        const response = await nodeFetch('https://mybk.hcmut.edu.vn/dkmh/dangKyMonHocForm.action', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': dkmhCookie,
                'Referer': 'https://mybk.hcmut.edu.vn/dkmh/home.action',
                'Accept': 'text/html,application/xhtml+xml'
            }
        });

        const html = await response.text();

        // Parse registration periods from HTML
        const periods = [];

        // Match pattern: onclick="ketQuaDangKyView(ID, ...);" followed by table cells
        const rowRegex = /<tr[^>]*onclick="ketQuaDangKyView\((\d+)[^"]*"[^>]*>\s*<td>(\d+)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([^<]+)<\/td>\s*<td>([^<]+)<\/td>/g;

        let match;
        while ((match = rowRegex.exec(html)) !== null) {
            const id = parseInt(match[1]);
            const stt = parseInt(match[2]);
            const code = match[3].trim();
            // Clean HTML tags from description
            const description = match[4].replace(/<[^>]+>/g, '').trim();
            const startTime = match[5].trim();
            const endTime = match[6].trim();

            // Determine status based on current time
            const now = new Date();
            const start = parseVietnameseDate(startTime);
            const end = parseVietnameseDate(endTime);

            let status = 'upcoming'; // sắp mở
            if (now >= start && now <= end) {
                status = 'open'; // đang mở
            } else if (now > end) {
                status = 'closed'; // đã đóng
            }

            // Check if it's a result period
            const hasResult = description.toLowerCase().includes('kết quả');

            periods.push({
                id,
                stt,
                code,
                description,
                startTime,
                endTime,
                start: start?.toISOString(),
                end: end?.toISOString(),
                status,
                hasResult
            });
        }

        // Limit to 10 periods
        const limitedPeriods = periods.slice(0, 10);

        console.log(`[DKMH] Parsed ${periods.length} periods, returning ${limitedPeriods.length}`);

        res.json({
            success: true,
            data: limitedPeriods,
            total: limitedPeriods.length,
            allTotal: periods.length
        });

    } catch (e) {
        console.error('[DKMH] Error parsing registration periods:', e);
        res.status(500).json({ error: e.message });
    }
});

// Get registration period details (courses registered, schedule)
app.post('/api/dkmh/period-details', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);
    const { periodId } = req.body;

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const dkmhCookie = session.dkmhCookie;
    if (!dkmhCookie) {
        return res.status(401).json({ error: 'DKMH session not found' });
    }

    if (!periodId) {
        return res.status(400).json({ error: 'periodId is required' });
    }

    console.log(`[DKMH] Fetching period details for ID: ${periodId}`);

    try {
        // Create a new cookie jar for this sequence of requests
        const { CookieJar } = await import('tough-cookie');
        const fetchCookieModule = await import('fetch-cookie');
        const fetchCookie = fetchCookieModule.default;

        const jar = new CookieJar();
        const fetch = fetchCookie(nodeFetch, jar);

        // Initialize jar with existing cookies
        const cookieParts = dkmhCookie.split('; ');
        for (const part of cookieParts) {
            try {
                await jar.setCookie(part, 'https://mybk.hcmut.edu.vn');
            } catch (e) { }
        }

        const baseHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': 'https://mybk.hcmut.edu.vn',
            'Referer': 'https://mybk.hcmut.edu.vn/dkmh/dangKyMonHocForm.action',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin'
        };

        // Step 1: ketQuaDangKyView.action - This returns the actual course HTML!
        // IMPORTANT: Parameter is "hocKyId" not "dotDKId"
        console.log('[DKMH] Step 1: ketQuaDangKyView.action with hocKyId=' + periodId);
        const ketQuaResponse = await fetch('https://mybk.hcmut.edu.vn/dkmh/ketQuaDangKyView.action', {
            method: 'POST',
            headers: baseHeaders,
            body: `hocKyId=${periodId}`
        });
        const ketQuaHtml = await ketQuaResponse.text();
        console.log('[DKMH] ketQuaDangKyView response length:', ketQuaHtml.length);

        // Step 2: getDanhSachDotDK.action - Get actual dotDKId
        console.log('[DKMH] Step 2: getDanhSachDotDK.action with hocKyId=' + periodId);
        const dotDKResponse = await fetch('https://mybk.hcmut.edu.vn/dkmh/getDanhSachDotDK.action', {
            method: 'POST',
            headers: baseHeaders,
            body: `hocKyId=${periodId}`
        });
        const dotDKHtml = await dotDKResponse.text();
        console.log('[DKMH] getDanhSachDotDK response length:', dotDKHtml.length);
        console.log('[DKMH] getDanhSachDotDK response preview:', dotDKHtml.substring(0, 200));

        // Parse actual dotDKId from response
        // Pattern: onclick="getLichDangKyByDotDKId(this, 749, 749, false, ' ');"
        const dotDKMatch = dotDKHtml.match(/getLichDangKyByDotDKId\s*\(\s*this\s*,\s*(\d+)\s*,\s*(\d+)/);
        const dotDKHocVienId = dotDKMatch ? dotDKMatch[1] : periodId;
        const dotDKId = dotDKMatch ? dotDKMatch[2] : periodId;
        console.log(`[DKMH] Parsed dotDKHocVienId=${dotDKHocVienId}, dotDKId=${dotDKId}`);

        // Step 3: getLichDangKy.action with correct dotDKId
        console.log('[DKMH] Step 3: getLichDangKy.action with dotDKId=' + dotDKId);
        const lichResponse = await fetch('https://mybk.hcmut.edu.vn/dkmh/getLichDangKy.action', {
            method: 'POST',
            headers: baseHeaders,
            body: `dotDKId=${dotDKId}&dotDKHocVienId=${dotDKHocVienId}`
        });
        const lichHtml = await lichResponse.text();

        // Step 4: getDanhSachMonHocDangKy.action with dotDKId
        console.log('[DKMH] Step 4: getDanhSachMonHocDangKy.action with dotDKId=' + dotDKId);
        await fetch('https://mybk.hcmut.edu.vn/dkmh/getDanhSachMonHocDangKy.action', {
            method: 'POST',
            headers: baseHeaders,
            body: `dotDKId=${dotDKId}`
        });

        // Step 5: getKetQuaDangKy.action to get registration results with ketquaId
        // This is needed for delete functionality - it returns the ketquaId for each course
        console.log('[DKMH] Step 5: getKetQuaDangKy.action');
        const ketQuaDangKyResponse = await fetch('https://mybk.hcmut.edu.vn/dkmh/getKetQuaDangKy.action', {
            method: 'POST',
            headers: baseHeaders,
            body: ''
        });
        const ketQuaDangKyHtml = await ketQuaDangKyResponse.text();
        console.log('[DKMH] getKetQuaDangKy response length:', ketQuaDangKyHtml.length);

        // Parse courses from getKetQuaDangKy HTML (contains ketquaId for delete)
        const courses = parsePeriodDetailsHtml(ketQuaDangKyHtml);
        const schedule = parseScheduleHtml(lichHtml);

        // IMPORTANT: Store jar and fetch for this session+period for later search operations
        // Also store dotDKId for search
        const jarKey = `${token}_${periodId}`;
        activePeriodJars.set(jarKey, { fetch, jar, baseHeaders, periodId, dotDKId, dotDKHocVienId });
        console.log(`[DKMH] Stored jar for key: ${jarKey} with dotDKId=${dotDKId}`);

        res.json({
            success: true,
            data: {
                courses,
                schedule,
                periodId,
                dotDKId,
                rawHtml: ketQuaHtml.substring(0, 500) + '...'
            }
        });

    } catch (e) {
        console.error('[DKMH] Error fetching period details:', e);
        res.status(500).json({ error: e.message });
    }
});

// Search courses for registration
app.post('/api/dkmh/search-courses', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);
    const { periodId, query } = req.body;

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!periodId || !query) {
        return res.status(400).json({ error: 'periodId and query are required' });
    }

    console.log(`[DKMH] Searching courses for period ${periodId}, query: ${query}`);

    // Try to use stored jar from period details
    const jarKey = `${token}_${periodId}`;
    const storedData = activePeriodJars.get(jarKey);

    if (!storedData) {
        console.log('[DKMH] No stored jar found, need to load period details first');
        return res.status(400).json({
            error: 'Vui lòng tải lại trang chi tiết đợt đăng ký trước khi tìm kiếm'
        });
    }

    const { fetch, baseHeaders } = storedData;
    console.log('[DKMH] Using stored jar for search');

    // Check for force mode (skip session state setup to bypass validation)
    const forceMode = req.body.forceMode === true;
    if (forceMode) {
        console.log('[DKMH] 🔓 FORCE MODE: Skipping getKetQuaDangKy.action (easter egg activated!)');
    }

    try {
        // Call getKetQuaDangKy.action to set session state (skip in force mode)
        if (!forceMode) {
            console.log('[DKMH] Calling getKetQuaDangKy.action to set session state');
            await fetch('https://mybk.hcmut.edu.vn/dkmh/getKetQuaDangKy.action', {
                method: 'POST',
                headers: baseHeaders,
                body: ''
            });
        }

        // Now call search
        console.log('[DKMH] Calling searchMonHocDangKy with msmh=' + query);
        const response = await fetch('https://mybk.hcmut.edu.vn/dkmh/searchMonHocDangKy.action', {
            method: 'POST',
            headers: baseHeaders,
            body: `msmh=${encodeURIComponent(query)}`
        });

        const html = await response.text();
        console.log('[DKMH] Search response length:', html.length);
        console.log('[DKMH] Search response preview:', html.substring(0, 300));

        // Save for debugging
        import('fs').then(fs => {
            fs.writeFileSync('debug_search_results.html', html);
            console.log('[DKMH] Saved search response to server/debug_search_results.html');
        });

        // Parse search results
        const courses = parseSearchResultsHtml(html);

        res.json({
            success: true,
            data: courses,
            query
        });

    } catch (e) {
        console.error('[DKMH] Error searching courses:', e);
        res.status(500).json({ error: e.message });
    }
});

// Get class groups for a course
app.post('/api/dkmh/class-groups', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);
    const { periodId, monHocId } = req.body;

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!periodId || !monHocId) {
        return res.status(400).json({ error: 'periodId and monHocId are required' });
    }

    console.log(`[DKMH] Getting class groups for monHocId=${monHocId}`);

    // Get stored jar
    const jarKey = `${token}_${periodId}`;
    const storedData = activePeriodJars.get(jarKey);

    if (!storedData) {
        return res.status(400).json({
            error: 'Vui lòng tải lại trang chi tiết đợt đăng ký'
        });
    }

    const { fetch, baseHeaders } = storedData;

    try {
        const response = await fetch('https://mybk.hcmut.edu.vn/dkmh/getThongTinNhomLopMonHoc.action', {
            method: 'POST',
            headers: baseHeaders,
            body: `monHocId=${monHocId}`
        });

        const html = await response.text();
        console.log('[DKMH] Class groups response length:', html.length);

        // Parse class groups
        const classGroups = parseClassGroupsHtml(html);

        res.json({
            success: true,
            data: classGroups,
            monHocId
        });

    } catch (e) {
        console.error('[DKMH] Error getting class groups:', e);
        res.status(500).json({ error: e.message });
    }
});

// Parse class groups from getThongTinNhomLopMonHoc HTML
function parseClassGroupsHtml(html) {
    const groups = [];
    console.log('[DKMH] Parsing class groups, total length: ' + html.length);

    // Split by <hr /> tags which separate each class group section
    // Use a regex that handles various HR formats and context
    const sections = html.split(/<hr\s*\/?>/i);
    console.log(`[DKMH] Found ${sections.length} potential sections`);

    for (const section of sections) {
        // Find header row with group info: <tr style="border-bottom:2px #ccc  solid;">
        const headerMatch = section.match(/<tr[^>]*style="border-bottom:2px #ccc\s+solid;"[^>]*>([\s\S]*?)<\/tr>/i);
        if (!headerMatch) continue;

        // Parse header cells
        const tdRegex = /<td class='item_list'[^>]*>([\s\S]*?)<\/td>/gi;
        const tdValues = [];
        let tdMatch;
        while ((tdMatch = tdRegex.exec(headerMatch[1])) !== null) {
            tdValues.push(tdMatch[1].trim());
        }

        // Valid group header must have at least 9 columns
        if (tdValues.length < 9) continue;

        const groupCode = tdValues[0];
        const slotsMatch = tdValues[1].match(/(\d+)\/(\d+)/);
        if (!slotsMatch) continue;

        const registered = parseInt(slotsMatch[1]);
        const capacity = parseInt(slotsMatch[2]);
        const actionHtml = tdValues[8];
        const buttonMatch = actionHtml.match(/dangKyNhomLopMonHoc\s*\(\s*this\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);

        // Find schedule table in section - look for <table...class='table'>
        const schedules = [];
        const tableMatch = section.match(/<table[^>]*class=['"]table['"][^>]*>([\s\S]*?)<\/table>/i);

        if (tableMatch) {
            const tableContent = tableMatch[1];
            // Find all <tr>...</tr> inside the table
            const allRows = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];

            for (const row of allRows) {
                // Skip header row (has <th> or style with border)
                if (row.includes('<th') || row.includes('border-bottom:2px')) continue;

                // Extract td values
                const schTdRegex = /<td class='item_list'[^>]*>([\s\S]*?)<\/td>/gi;
                const schValues = [];
                let schMatch;
                while ((schMatch = schTdRegex.exec(row)) !== null) {
                    schValues.push(schMatch[1].trim());
                }

                // Check if this is a schedule row
                // Must have at least 6 columns: Day, Time, Room, Campus, BTTN, Weeks
                if (schValues.length >= 6) {
                    const day = schValues[0];
                    const timeRaw = schValues[1];
                    const room = schValues[2];

                    // Validate: Time column usually has digits or '-'
                    // Or Day column is not empty (length > 2 to avoid garbage)
                    if ((day.trim().length > 0) || (timeRaw.match(/\d/))) {
                        const tietNumbers = timeRaw.match(/\d+/g) || [];
                        const tietDisplay = tietNumbers.length > 0 ? tietNumbers.join(', ') : '-';

                        schedules.push({
                            day: day.replace(/<[^>]*>/g, '').trim(), // Cleanup HTML tags if any
                            timeSlots: tietDisplay,
                            room: room.trim(),
                            campus: schValues[3].trim(),
                            bttn: schValues[4].trim(),
                            weeks: schValues[5].replace(/<[^>]*>/g, '').trim()
                        });
                    }
                }
            }
        }

        groups.push({
            groupCode: groupCode,
            registered: registered,
            capacity: capacity,
            language: tdValues[2] || 'V',
            ltGroup: tdValues[3] || '',
            lecturer: tdValues[4] || '',
            btGroup: tdValues[5] || '',
            btLecturer: tdValues[6] || '',
            maxLT: parseInt(tdValues[7]) || 0,
            canRegister: !!buttonMatch,
            nlmhId: buttonMatch ? buttonMatch[1] : null,
            monHocId: buttonMatch ? buttonMatch[2] : null,
            isFull: registered >= capacity,
            schedules: schedules
        });
    }

    console.log(`[DKMH] Parsed ${groups.length} class groups`);
    if (groups.length > 0) {
        console.log(`[DKMH] Sample schedule for first group: ${JSON.stringify(groups[0].schedules)}`);
    }
    return groups;
}

// Parse course search results from HTML
function parseSearchResultsHtml(html) {
    const courses = [];

    // Match pattern: <tr id='monHoc14425' onclick='getThongTinNhomLopMonHoc(this, 14425)'>
    // Then: <td class="item_list">1</td>...<td class='item_list'>CO3005</td><td class='item_list'>Ng/lý ngôn ngữ lập trình</td><td class='item_list'>4.0</td>
    const rowRegex = /<tr\s+id='monHoc(\d+)'[^>]*onclick='getThongTinNhomLopMonHoc\([^,]+,\s*(\d+)\)'[^>]*>[\s\S]*?<td class="item_list">(\d+)\s*<\/td>[\s\S]*?<td class='item_list'\s*>([A-Z0-9]+)\s*<\/td>\s*<td class='item_list'\s*>([^<]+)<\/td>\s*<td class='item_list'\s*>([\d.]+)<\/td>/g;

    let match;
    while ((match = rowRegex.exec(html)) !== null) {
        courses.push({
            monHocId: match[1],
            nhomLopId: match[2],
            stt: parseInt(match[3]),
            code: match[4].trim(),
            name: match[5].trim(),
            credits: parseFloat(match[6])
        });
    }

    console.log(`[DKMH] Parsed ${courses.length} courses from search results`);
    return courses;
}

// Parse course details from ketQuaDangKyView HTML
function parsePeriodDetailsHtml(html) {
    const courses = [];

    // Save HTML for debugging (async, but we don't wait)
    import('fs').then(fs => {
        fs.writeFileSync('debug_period_details.html', html);
        console.log('[DKMH] Saved period details HTML to server/debug_period_details.html');
    });

    // Match each panel (course) block - handle newlines with [\s\S]
    // This regex matches BOTH locked and unlocked courses:
    // Structure: <div class='col-md-1'>1</div>...<div class='col-md-8'>...(CODE - Name)...</div>...<div class='col-md-1'>credits</div>
    const panelRegex = /<div class='col-md-1'>(\d+)<\/div>[\s\S]*?<div class='col-md-8'>([\s\S]*?)<\/div>[\s\S]*?<div class='col-md-1'>[\s\S]*?([\d.]+)[\s\S]*?<\/div>/g;

    let match;
    let count = 0;
    while ((match = panelRegex.exec(html)) !== null) {
        const stt = parseInt(match[1]);
        const col8Content = match[2];
        const credits = parseFloat(match[3]);

        // Extract course code and name from col-md-8 content
        // Pattern: "CO3005 - Course Name" or "<a href=...>CO3005 - Course Name</a>"
        const courseMatch = col8Content.match(/([A-Z]{2}\d{4})\s*-\s*([^<]+)/);
        if (!courseMatch) continue;

        const code = courseMatch[1].trim();
        const name = courseMatch[2].trim();

        // Extract ketquaId if available (from hieuChinhKetQuaDangKyForm or xoaKetQuaDangKy)
        const ketquaMatch = col8Content.match(/hieuChinhKetQuaDangKyForm\((\d+)\)|xoaKetQuaDangKy\((\d+)/);
        const ketquaId = ketquaMatch ? (ketquaMatch[1] || ketquaMatch[2]) : null;

        count++;

        // Try to find schedule info for this course
        const scheduleInfo = extractCourseSchedule(html, code);

        // Check if locked by looking for fa-lock after the course section
        const courseIdx = html.indexOf(code);
        const nextPanelIdx = html.indexOf('<div class="panel panel-default">', courseIdx + 1);
        const courseSection = nextPanelIdx > 0
            ? html.substring(courseIdx, nextPanelIdx)
            : html.substring(courseIdx, courseIdx + 2000);
        const isLocked = courseSection.includes('fa-lock');

        // Can delete if not locked and has ketquaId
        const canDelete = !isLocked && !!ketquaId;

        courses.push({
            stt,
            code,
            name,
            credits,
            isLocked,
            ketquaId,
            canDelete,
            ...scheduleInfo
        });
    }

    console.log(`[DKMH] Parsed ${count} courses from HTML`);

    // Extract total credits and count from HTML
    const totalCreditsMatch = html.match(/Tổng số tín chỉ đăng ký:\s*([\d.]+)/);
    const totalCoursesMatch = html.match(/Tổng số môn đăng ký:\s*(\d+)/);

    return {
        courses,
        totalCredits: totalCreditsMatch ? parseFloat(totalCreditsMatch[1]) : 0,
        totalCourses: totalCoursesMatch ? parseInt(totalCoursesMatch[1]) : courses.length
    };
}

// Extract detailed class and schedule info for a specific course
function extractCourseSchedule(html, courseCode) {
    // Find the section for this course
    const codeIdx = html.indexOf(courseCode);
    if (codeIdx === -1) return {};

    // Get section from code to next panel
    const nextPanelIdx = html.indexOf('<div class="panel panel-default">', codeIdx + 1);
    const courseSection = nextPanelIdx > 0
        ? html.substring(codeIdx, nextPanelIdx)
        : html.substring(codeIdx, codeIdx + 4000);

    // Extract class info from the main row: Nhóm lớp, DK/Sĩ số, Ngôn ngữ, Nhóm LT, Giảng viên, Nhóm BT, GV BT/TN, Sĩ số
    // Pattern: <tr style="border-bottom:2px..."> followed by 8 <td class='item_list'> cells
    const classRowMatch = courseSection.match(/<tr style="border-bottom:2px[^"]*">([\s\S]*?)<\/tr>/);

    let classInfo = {
        groupCode: '',     // CC01
        registered: '',    // 52/60
        language: '',      // V or E
        groupLT: '',       // CC01
        lecturer: '',      // Giảng viên
        groupBT: '',       // Nhóm BT
        lecturerBT: '',    // Giảng viên BT/TN
        capacity: ''       // Sĩ số LT (60)
    };

    if (classRowMatch) {
        const cells = [];
        const cellRegex = /<td class='item_list'[^>]*>([\s\S]*?)<\/td>/g;
        let cellMatch;
        while ((cellMatch = cellRegex.exec(classRowMatch[1])) !== null) {
            cells.push(cellMatch[1].trim());
        }

        if (cells.length >= 8) {
            classInfo.groupCode = cells[0].trim();
            classInfo.registered = cells[1].trim();
            classInfo.language = cells[2].trim();
            classInfo.groupLT = cells[3].trim();
            classInfo.lecturer = cells[4].trim() || 'Chưa phân công';
            classInfo.groupBT = cells[5].trim();
            classInfo.lecturerBT = cells[6].trim();
            classInfo.capacity = cells[7].trim();
        }
    }

    // Extract schedule rows: Thứ, Tiết, Phòng, CS, BT/TN, Tuần học
    const schedules = [];
    const scheduleTableMatch = courseSection.match(/<table width="100%" class='table'>([\s\S]*?)<\/table>/);

    if (scheduleTableMatch) {
        const scheduleRowRegex = /<tr>[\s\S]*?<td class='item_list'[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td class='item_list'[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td class='item_list'[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td class='item_list'[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td class='item_list'[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td class='item_list'[^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/g;
        let scheduleMatch;

        while ((scheduleMatch = scheduleRowRegex.exec(scheduleTableMatch[1])) !== null) {
            const day = scheduleMatch[1].trim();
            const timeSlots = scheduleMatch[2].replace(/\s+/g, ' ').trim();
            const room = scheduleMatch[3].trim();
            const campus = scheduleMatch[4].trim();
            const bttn = scheduleMatch[5].trim();
            const weeks = scheduleMatch[6].trim();

            if (day && day !== 'Thứ') { // Skip header
                schedules.push({
                    day,
                    timeSlots,
                    room,
                    campus,
                    bttn,
                    weeks
                });
            }
        }
    }

    // Old format compatibility
    const firstSchedule = schedules[0] || {};

    return {
        group: classInfo.groupCode,
        slots: classInfo.registered,
        capacity: classInfo.capacity,
        language: classInfo.language,
        groupLT: classInfo.groupLT,
        lecturer: classInfo.lecturer,
        groupBT: classInfo.groupBT,
        lecturerBT: classInfo.lecturerBT,
        day: firstSchedule.day || '',
        room: firstSchedule.room || '',
        campus: firstSchedule.campus || '',
        timeSlots: firstSchedule.timeSlots || '',
        weeks: firstSchedule.weeks || '',
        schedules // Full schedule array
    };
}

// Parse schedule from getLichDangKy HTML
function parseScheduleHtml(html) {
    const fromMatch = html.match(/(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/);
    const toMatch = html.match(/(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})[\s\S]*?<\/td>\s*<\/tr>/);
    const inScheduleMatch = html.match(/id="hdTrongHanDK"\s+value="(\w+)"/);

    // Find both date times
    const dates = html.match(/(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/g) || [];

    return {
        from: dates[0] || '',
        to: dates[1] || '',
        isOpen: inScheduleMatch ? inScheduleMatch[1] === 'true' : false
    };
}

// Helper to parse Vietnamese date format (DD/MM/YYYY HH:mm)
function parseVietnameseDate(dateStr) {
    if (!dateStr) return null;
    try {
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hour, minute] = timePart ? timePart.split(':').map(Number) : [0, 0];
        return new Date(year, month - 1, day, hour, minute);
    } catch (e) {
        return null;
    }
}

// Register for a class group
app.post('/api/dkmh/register', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);
    const { periodId, nlmhId, monHocId, forceMode } = req.body;

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!periodId || !nlmhId) {
        return res.status(400).json({ error: 'periodId and nlmhId are required' });
    }

    if (forceMode) {
        console.log(`[DKMH] 🔓 FORCE MODE: Registering for class NLMHId=${nlmhId} (bypassing validation)`);
    } else {
        console.log(`[DKMH] Registering for class NLMHId=${nlmhId}, monHocId=${monHocId}`);
    }

    // Get stored jar
    const jarKey = `${token}_${periodId}`;
    const storedData = activePeriodJars.get(jarKey);

    if (!storedData) {
        return res.status(400).json({
            error: 'Session expired, vui lòng tải lại trang chi tiết đợt đăng ký'
        });
    }

    const { fetch, jar, baseHeaders } = storedData;

    try {
        // Get current cookies from jar for debugging
        const cookies = await jar.getCookies('https://mybk.hcmut.edu.vn');
        const cookieString = cookies.map(c => `${c.key}=${c.value}`).join('; ');
        console.log('[DKMH] Full cookies:', cookieString);

        // In Force Mode: Skip priming to replicate original bug behavior
        // This causes server to return empty error messages but still process registration
        if (monHocId && !forceMode) {
            console.log('[DKMH] Priming session with getThongTinNhomLopMonHoc for monHocId:', monHocId);
            const primeResponse = await fetch('https://mybk.hcmut.edu.vn/dkmh/getThongTinNhomLopMonHoc.action', {
                method: 'POST',
                headers: baseHeaders,
                body: `monHocId=${monHocId}`
            });
            console.log('[DKMH] Prime response status:', primeResponse.status);
        } else if (forceMode) {
            console.log('[DKMH] 🔓 Skipping priming call (Force Mode)');
        }

        // Prepare request details
        const requestBody = `NLMHId=${nlmhId}`;

        // Call dangKy.action
        const response = await fetch('https://mybk.hcmut.edu.vn/dkmh/dangKy.action', {
            method: 'POST',
            headers: baseHeaders,
            body: requestBody
        });

        console.log('[DKMH] Register response status:', response.status);
        console.log('[DKMH] Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

        // Get response text
        let text = await response.text();
        console.log('[DKMH] Register raw response:', text);

        // Strip UTF-8 BOM if present (server sometimes adds it)
        if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1);
            console.log('[DKMH] Stripped BOM from response');
        }

        // Parse JSON response from dangKy.action
        let rawResult = null;
        try {
            rawResult = JSON.parse(text);
            console.log('[DKMH] Parsed JSON result:', rawResult);
        } catch (e) {
            console.log('[DKMH] Response is not valid JSON:', e.message);
        }

        // If the response says SUCCESS, trust it
        if (rawResult && rawResult.code === 'SUCCESS') {
            console.log(`[DKMH] Registration confirmed SUCCESS: ${rawResult.msg}`);

            // Also call getKetQuaDangKy to refresh the list
            await fetch('https://mybk.hcmut.edu.vn/dkmh/getKetQuaDangKy.action', {
                method: 'POST',
                headers: baseHeaders,
                body: ''
            });

            return res.json({
                success: true,
                message: rawResult.msg || 'Đã gửi đăng ký',
                nlmhId,
                monHocId
            });
        }

        // Handle ERROR response
        if (rawResult && rawResult.code === 'ERROR') {
            // If message has content and NOT in Force Mode, it's a real error
            if (rawResult.msg && rawResult.msg.trim() !== '' && !forceMode) {
                console.log(`[DKMH] Registration failed with message: ${rawResult.msg}`);
                return res.json({
                    success: false,
                    error: rawResult.msg,
                    code: rawResult.code,
                    nlmhId,
                    monHocId
                });
            }

            // In Force Mode OR empty message: treat as potential success!
            // The "bug" that allows bypassing validation
            if (forceMode) {
                console.log('[DKMH] 🔓 Force Mode: Treating ERROR as SUCCESS (bypass validation)');
            } else {
                console.log('[DKMH] ERROR with empty message - treating as SUCCESS based on testing');
            }

            // Call getKetQuaDangKy to refresh the list
            // SKIP this in Force Mode to keep session in "unvalidated" state for multiple registrations
            if (!forceMode) {
                await fetch('https://mybk.hcmut.edu.vn/dkmh/getKetQuaDangKy.action', {
                    method: 'POST',
                    headers: baseHeaders,
                    body: ''
                });
            } else {
                console.log('[DKMH] 🔓 Skipping getKetQuaDangKy (keeping session for multi-bypass)');
            }

            return res.json({
                success: true,
                message: forceMode
                    ? '🔓 Force ĐK thành công! Đã bypass validation.'
                    : 'Đã gửi đăng ký (vui lòng kiểm tra lại)',
                nlmhId,
                monHocId,
                forceMode: forceMode || false,
                note: forceMode
                    ? 'Đăng ký bypass validation - có thể trùng lịch hoặc trùng môn'
                    : 'Server trả về phản hồi không rõ ràng, nhưng đăng ký có thể đã thành công'
            });
        }

        // If response is not parseable or unknown format
        console.log('[DKMH] Unknown response format');
        res.json({
            success: false,
            error: 'Phản hồi từ server không hợp lệ',
            rawResponse: text.substring(0, 200),
            nlmhId,
            monHocId
        });

    } catch (e) {
        console.error('[DKMH] Error registering:', e);
        res.status(500).json({ error: e.message });
    }
});

// Get registration result (updated list after registration)
app.post('/api/dkmh/registration-result', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);
    const { periodId } = req.body;

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!periodId) {
        return res.status(400).json({ error: 'periodId is required' });
    }

    console.log(`[DKMH] Getting registration result for periodId=${periodId}`);

    // Get stored jar
    const jarKey = `${token}_${periodId}`;
    const storedData = activePeriodJars.get(jarKey);

    if (!storedData) {
        return res.status(400).json({
            error: 'Session expired, vui lòng tải lại trang chi tiết đợt đăng ký'
        });
    }

    const { fetch, baseHeaders } = storedData;

    try {
        // Call getKetQuaDangKy.action
        const response = await fetch('https://mybk.hcmut.edu.vn/dkmh/getKetQuaDangKy.action', {
            method: 'POST',
            headers: baseHeaders,
            body: ''  // No body required
        });

        const html = await response.text();
        console.log('[DKMH] Registration result response length:', html.length);

        // Parse the HTML to extract registered courses
        const result = parsePeriodDetailsHtml(html);

        res.json({
            success: true,
            data: result
        });

    } catch (e) {
        console.error('[DKMH] Error getting registration result:', e);
        res.status(500).json({ error: e.message });
    }
});

// Cancel registration for a course
app.post('/api/dkmh/cancel', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);
    const { periodId, ketquaId, monHocMa } = req.body;

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!periodId || !ketquaId) {
        return res.status(400).json({ error: 'periodId and ketquaId are required' });
    }

    console.log(`[DKMH] Canceling registration ketquaId=${ketquaId}, monHocMa=${monHocMa}`);

    // Get stored jar
    const jarKey = `${token}_${periodId}`;
    const storedData = activePeriodJars.get(jarKey);

    if (!storedData) {
        return res.status(400).json({
            error: 'Session expired, vui lòng tải lại trang chi tiết đợt đăng ký'
        });
    }

    const { fetch, baseHeaders } = storedData;

    try {
        // Call xoaKetQuaDangKy.action
        const response = await fetch('https://mybk.hcmut.edu.vn/dkmh/xoaKetQuaDangKy.action', {
            method: 'POST',
            headers: baseHeaders,
            body: `ketquaId=${ketquaId}`
        });

        const text = await response.text();
        console.log('[DKMH] Cancel registration response:', text.substring(0, 300));

        // Typically returns empty or success
        res.json({
            success: true,
            message: `Đã hủy đăng ký ${monHocMa || ''}`.trim(),
            ketquaId
        });

    } catch (e) {
        console.error('[DKMH] Error canceling registration:', e);
        res.status(500).json({ error: e.message });
    }
});

// ===============================================
// Lecturer Schedule API (from hcmut_lecturer_schedule)
// ===============================================

// Load lecturer schedule data
let subjectData = [];
let lecturerData = [];

try {
    const subjectPath = path.join(__dirname, 'data_subject.json');
    const lecturerPath = path.join(__dirname, 'data_lecturer.json');

    if (fs.existsSync(subjectPath)) {
        subjectData = JSON.parse(fs.readFileSync(subjectPath, 'utf8'));
        console.log(`[LECTURER] Loaded ${subjectData.length} subjects`);
    }

    if (fs.existsSync(lecturerPath)) {
        lecturerData = JSON.parse(fs.readFileSync(lecturerPath, 'utf8'));
        console.log(`[LECTURER] Loaded ${lecturerData.length} lecturers`);
    }
} catch (e) {
    console.error('[LECTURER] Error loading data files:', e.message);
}

// Helper: Remove Vietnamese accents for search
function removeVietnameseAccents(str) {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

/**
 * Smart Vietnamese search - hỗ trợ:
 * 1. Tìm không dấu (VD: "nguyen" match "Nguyễn")
 * 2. Tìm một phần tên (VD: "trung" match "Mai Đức Trung")
 * 3. Tìm viết tắt (VD: "mdt" match "Mai Đức Trung")
 * 4. Tìm phonetic (VD: "zuyen" match "Duyên")
 */
function smartVietnameseMatch(text, query) {
    if (!text || !query) return false;

    const textNorm = removeVietnameseAccents(text);
    const queryNorm = removeVietnameseAccents(query.trim());

    if (!queryNorm) return false;

    // 1. Direct substring match (không dấu)
    if (textNorm.includes(queryNorm)) return true;

    // 2. Match từ đầu mỗi từ (acronym search)
    // VD: "MDT" hoặc "mdt" match "Mai Đức Trung"
    const words = textNorm.split(/\s+/);
    const acronym = words.map(w => w[0] || '').join('');
    if (acronym.includes(queryNorm)) return true;

    // 3. Match từng từ riêng lẻ
    // VD: "trung" match "Mai Đức Trung"
    const queryWords = queryNorm.split(/\s+/);
    const allWordsMatch = queryWords.every(qw =>
        words.some(w => w.startsWith(qw))
    );
    if (allWordsMatch && queryWords.length > 0) return true;

    // 4. Phonetic matching cho tiếng Việt
    const phoneticMappings = [
        ['z', 'd'], ['gi', 'd'], ['r', 'z'],
        ['k', 'c'], ['q', 'k'],
        ['f', 'ph'], ['ph', 'f'],
        ['kh', 'h'],
    ];

    let phoneticQuery = queryNorm;
    for (const [from, to] of phoneticMappings) {
        phoneticQuery = phoneticQuery.replace(new RegExp(from, 'g'), to);
    }

    if (phoneticQuery !== queryNorm && textNorm.includes(phoneticQuery)) {
        return true;
    }

    return false;
}

// Helper: Search lecturer info
function searchLecturerInfo(name) {
    const nameNorm = removeVietnameseAccents(name);
    for (const lecturer of lecturerData) {
        if (removeVietnameseAccents(lecturer.name) === nameNorm) {
            return lecturer;
        }
    }
    return { name, phone: '', email: '' };
}

// API: Search by subject ID or lecturer name
app.get('/api/lecturer/search', (req, res) => {
    const { id, gv } = req.query;
    console.log(`[LECTURER] Search: id=${id}, gv=${gv}`);

    let results = [];

    if (id) {
        // Search by subject code
        const idLower = id.toLowerCase();
        for (const subject of subjectData) {
            if (subject.maMonHoc.toLowerCase() === idLower) {
                // Add lecturer info to each schedule
                const enrichedSubject = { ...subject };
                enrichedSubject.lichHoc = subject.lichHoc.map(lh => {
                    const lecturerInfo = searchLecturerInfo(lh.giangVien);
                    const lecturerInfoBT = searchLecturerInfo(lh.giangVienBT);
                    return {
                        ...lh,
                        email: lecturerInfo.email || '',
                        phone: lecturerInfo.phone || '',
                        emailBT: lecturerInfoBT.email || '',
                        phoneBT: lecturerInfoBT.phone || ''
                    };
                });
                results.push(enrichedSubject);
                break;
            }
        }
    }

    if (gv) {
        // Search by lecturer name với smart Vietnamese matching
        const sourceData = results.length > 0 ? results : subjectData;

        const lecturerResults = [];
        for (const subject of sourceData) {
            const matchingSchedules = [];
            for (const lh of subject.lichHoc) {
                // Sử dụng smartVietnameseMatch thay vì exact match
                const matchLT = smartVietnameseMatch(lh.giangVien, gv);
                const matchBT = smartVietnameseMatch(lh.giangVienBT, gv);

                if (matchLT || matchBT) {
                    const lecturerInfo = searchLecturerInfo(lh.giangVien);
                    const lecturerInfoBT = searchLecturerInfo(lh.giangVienBT);
                    matchingSchedules.push({
                        ...lh,
                        email: lecturerInfo.email || '',
                        phone: lecturerInfo.phone || '',
                        emailBT: lecturerInfoBT.email || '',
                        phoneBT: lecturerInfoBT.phone || ''
                    });
                }
            }

            if (matchingSchedules.length > 0) {
                lecturerResults.push({
                    ...subject,
                    lichHoc: matchingSchedules
                });
            }
        }
        results = lecturerResults;
    }

    res.json(results);
});

// API: Browse classes by day and time slot
// VD: /api/lecturer/browse-schedule?day=2&tiet=6,7,8&campus=1

/**
 * Detect campus from room name
 * CS1: A1-A5, B1-B12, C1-C6
 * CS2: H1-H6
 */
function detectCampusFromRoom(room) {
    if (!room) return '';
    const roomUpper = room.toUpperCase().trim();
    // CS1: Toa A, B, C
    if (/^[ABC]\d+/.test(roomUpper)) return '1';
    // CS2: Toa H
    if (/^H\d+/.test(roomUpper)) return '2';
    return '';
}

app.get('/api/lecturer/browse-schedule', (req, res) => {
    const { day, tiet, campus, strict } = req.query;
    console.log(`[LECTURER] Browse schedule: day=${day}, tiet=${tiet}, campus=${campus}, strict=${strict}`);

    if (!day) {
        return res.status(400).json({ error: 'Vui lòng chọn ngày trong tuần' });
    }

    const dayNum = parseInt(day);
    const tietList = tiet ? tiet.split(',').map(t => parseInt(t.trim())) : null;
    const campusFilter = campus ? campus.trim() : null;
    const strictMode = strict === 'true';

    const results = [];

    for (const subject of subjectData) {
        for (const lh of subject.lichHoc) {
            if (!lh.classInfo || lh.classInfo.length === 0) continue;

            // Filter classInfo by day, tiet, and campus
            const matchingClasses = lh.classInfo.filter(ci => {
                // Check day match
                if (ci.dayOfWeek !== dayNum) return false;

                // Check tiet match (if specified)
                if (tietList && tietList.length > 0) {
                    if (strictMode) {
                        // Strict mode: TẤT CẢ các tiết của lớp phải nằm trong range đã chọn
                        const allTietInRange = ci.tietHoc.every(t => tietList.includes(t));
                        if (!allTietInRange) return false;
                    } else {
                        // Normal mode: Chỉ cần có BẤT KỲ tiết nào overlap
                        const hasOverlap = ci.tietHoc.some(t => tietList.includes(t));
                        if (!hasOverlap) return false;
                    }
                }

                // Check campus match based on room name
                if (campusFilter) {
                    const roomCampus = detectCampusFromRoom(ci.phong);
                    if (roomCampus !== campusFilter) return false;
                }

                return true;
            });

            if (matchingClasses.length > 0) {
                // Get lecturer info
                const lecturerInfo = searchLecturerInfo(lh.giangVien);

                results.push({
                    maMonHoc: subject.maMonHoc,
                    tenMonHoc: subject.tenMonHoc,
                    group: lh.group,
                    giangVien: lh.giangVien || 'Chưa phân công',
                    email: lecturerInfo.email || '',
                    phone: lecturerInfo.phone || '',
                    siso: lh.siso,
                    ngonNgu: lh.ngonNgu,
                    classInfo: matchingClasses
                });
            }
        }
    }

    // Sort by tiết học
    results.sort((a, b) => {
        const tietA = a.classInfo[0]?.tietHoc[0] || 0;
        const tietB = b.classInfo[0]?.tietHoc[0] || 0;
        return tietA - tietB;
    });

    console.log(`[LECTURER] Found ${results.length} classes for day=${day}`);
    res.json(results);
});

// API: Get all lecturers
app.get('/api/lecturer/list', (req, res) => {
    console.log('[LECTURER] Get all lecturers');
    res.json(lecturerData);
});

// API: Get lecturer info by name
app.get('/api/lecturer/info', (req, res) => {
    const { gv } = req.query;
    if (gv) {
        console.log(`[LECTURER] Get info for: ${gv}`);
        res.json(searchLecturerInfo(gv));
    } else {
        res.json(lecturerData);
    }
});

// API: Get all subjects (for autocomplete)
app.get('/api/lecturer/subjects', (req, res) => {
    console.log('[LECTURER] Get all subjects');
    const subjects = subjectData.map(s => ({
        id: s.maMonHoc,
        name: s.tenMonHoc
    }));
    res.json(subjects);
});

// ========================
// SPA FALLBACK (Production)
// ========================
if (isProduction) {
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
            res.sendFile(indexPath);
        } else {
            res.status(404).json({ error: 'API endpoint not found' });
        }
    });
}

// ========================
// START SERVER
// ========================
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║   🚀 MyBK Schedule Server                    ║
║   Mode: ${isProduction ? 'PRODUCTION ' : 'DEVELOPMENT'}                       ║
║   Port: ${PORT}                                  ║
╚══════════════════════════════════════════════╝
    `);
});
