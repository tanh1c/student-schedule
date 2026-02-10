import { performCASLogin } from '../services/authService.js';
import { performDKMHLogin } from '../services/dkmhService.js';
import logger from '../utils/logger.js';
import config from '../../config/default.js';

// Get sessions from app locals (will be passed from routes)
// Note: In a cleaner architecture, session store should be a separate module or singleton.
// For now, we will assume sessions are passed via req.app.locals.sessions or similar, 
// BUT since we are refactoring incrementally, let's make a Session Manager service or singleton later.
// For now, let's keep it simple: We'll export a function to setup controllers with context, 
// OR we use a singleton for sessions.
// Let's create a memory store singleton for sessions first.

// Wait, I should create a session store module first.
import { MAX_SESSIONS, canCreateSession, saveSession, deleteSession, activePeriodJars, ssoJars, getSession, generateSecureToken, saveRefreshToken, getRefreshCredentials, deleteRefreshToken } from '../services/sessionStore.js';

export const login = async (req, res) => {
    const { username, password, rememberMe } = req.body;
    logger.info(`[API] Login request`);

    if (!await canCreateSession()) {
        logger.info(`[API] Max sessions reached, rejecting login`);
        return res.status(503).json({
            error: 'Server đang quá tải, vui lòng thử lại sau ít phút',
            code: 'MAX_SESSIONS_REACHED'
        });
    }

    const result = await performCASLogin(username, password);

    if (result.success) {
        // Create session token
        const sessionToken = generateSecureToken();
        const sessionData = {
            username,
            cookie: result.cookieString,
            jwtToken: result.jwtToken,
            user: result.user,
            createdAt: Date.now(),
            lastActivity: Date.now(),
            dkmhCookie: null,
            dkmhLoggedIn: false
        };

        await saveSession(sessionToken, sessionData);

        // Store SSO jar for cross-service authentication (LMS, etc.)
        if (result.jar) {
            ssoJars.set(sessionToken, result.jar);
            logger.info('[API] SSO jar stored for cross-service auth.');
        }

        logger.info(`[API] Login successful. Session saved to Redis.`);

        // Async DKMH Login
        logger.info('[API] Also logging into DKMH...');
        performDKMHLogin(username, password).then(async dkmhResult => {
            if (dkmhResult.success) {
                // Update session reference
                const session = await getSession(sessionToken);
                if (session) {
                    session.dkmhCookie = dkmhResult.cookieString;
                    session.dkmhLoggedIn = true;
                    // Store jar if needed for period selection
                    activePeriodJars.set(sessionToken, dkmhResult.jar);
                    await saveSession(sessionToken, session); // Save updated session
                    logger.info('[API] DKMH login successful! Session updated.');
                }
            } else {
                logger.info('[API] DKMH login failed:', dkmhResult.error);
            }
        }).catch(err => logger.error('[API] DKMH login error:', err));

        // Handle "Remember Me" - save encrypted credentials server-side
        let refreshToken = null;
        if (rememberMe) {
            refreshToken = generateSecureToken();
            await saveRefreshToken(refreshToken, username, password);
            logger.info('[API] Refresh token created for remember-me');
        }

        res.json({
            success: true,
            token: sessionToken,
            user: result.user,
            refreshToken: refreshToken,  // null if rememberMe is false
        });
    } else {
        res.status(401).json({ error: result.error });
    }
};

export const logout = async (req, res) => {
    const token = req.headers['authorization'];
    const { refreshToken } = req.body || {};

    if (token) {
        await deleteSession(token);
        logger.info(`[API] Session deleted`);
    }
    if (refreshToken) {
        await deleteRefreshToken(refreshToken);
        logger.info(`[API] Refresh token deleted`);
    }
    res.json({ success: true });
};

export const dkmhLogin = async (req, res) => {
    const loginUsername = req.body.username;
    const loginPassword = req.body.password;
    const currentSession = req.session; // From auth middleware

    // Reuse session credentials if not provided
    if (!loginUsername && currentSession) {
        // This flow requires us to store password? No we don't store password.
        // So user MUST provide credentials again if they want to force DKMH login
        return res.status(400).json({ error: 'Username/Password required for explicit DKMH login' });
    }

    // Checking if trying to login with different user?
    // For simplicity, just run the login.

    const result = await performDKMHLogin(loginUsername, loginPassword);

    if (result.success) {
        const dkmhSessionToken = Buffer.from(`dkmh:${loginUsername}:${Date.now()}`).toString('base64');

        await saveSession(dkmhSessionToken, {
            type: 'dkmh',
            username: loginUsername,
            cookie: result.cookieString,
            createdAt: Date.now(),
            lastActivity: Date.now()
        });

        res.json({
            success: true,
            dkmhToken: dkmhSessionToken,
            message: 'Đăng nhập DKMH thành công'
        });
    } else {
        res.status(401).json({ error: result.error });
    }
};

export const dkmhStatus = (req, res) => {
    const session = req.session;
    if (!session) return res.status(401).json({ authenticated: false, error: 'Not logged in' });

    res.json({
        authenticated: !!session.dkmhCookie,
        dkmhLoggedIn: session.dkmhLoggedIn || false,
        username: session.username
    });
};

// DKMH Session Check - Verify by making actual request to DKMH
export const dkmhCheck = async (req, res) => {
    const session = req.session;

    if (!session || session.type !== 'dkmh') {
        return res.status(401).json({
            authenticated: false,
            error: 'DKMH session not found'
        });
    }

    try {
        const nodeFetch = (await import('node-fetch')).default;
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
                await deleteSession(req.token);
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
};

// ═══════════════════════════════════════════════════════
// REFRESH SESSION - "Remember Me" re-authentication
// ═══════════════════════════════════════════════════════
export const refreshSession = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
    }

    // Step 1: Get encrypted credentials from Redis
    const credentials = await getRefreshCredentials(refreshToken);
    if (!credentials) {
        return res.status(401).json({
            error: 'Refresh token expired or invalid',
            code: 'REFRESH_TOKEN_EXPIRED'
        });
    }

    // Step 2: Check server capacity
    if (!await canCreateSession()) {
        return res.status(503).json({
            error: 'Server đang quá tải, vui lòng thử lại sau',
            code: 'MAX_SESSIONS_REACHED'
        });
    }

    // Step 3: Re-authenticate with MyBK using decrypted credentials
    logger.info('[REFRESH] Re-authenticating with MyBK...');
    const result = await performCASLogin(credentials.username, credentials.password);

    if (!result.success) {
        // Credentials may have changed, invalidate refresh token
        await deleteRefreshToken(refreshToken);
        return res.status(401).json({
            error: 'Đăng nhập lại thất bại. Mật khẩu có thể đã thay đổi.',
            code: 'REFRESH_AUTH_FAILED'
        });
    }

    // Step 4: Create new session
    const sessionToken = generateSecureToken();
    const sessionData = {
        username: credentials.username,
        cookie: result.cookieString,
        jwtToken: result.jwtToken,
        user: result.user,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        dkmhCookie: null,
        dkmhLoggedIn: false,
    };

    await saveSession(sessionToken, sessionData);

    if (result.jar) {
        ssoJars.set(sessionToken, result.jar);
    }

    // Step 5: Background DKMH login
    performDKMHLogin(credentials.username, credentials.password).then(async dkmhResult => {
        if (dkmhResult.success) {
            const session = await getSession(sessionToken);
            if (session) {
                session.dkmhCookie = dkmhResult.cookieString;
                session.dkmhLoggedIn = true;
                activePeriodJars.set(sessionToken, dkmhResult.jar);
                await saveSession(sessionToken, session);
            }
        }
    }).catch(err => logger.error('[REFRESH] DKMH login error:', err));

    logger.info('[REFRESH] Session refreshed successfully');

    // Step 6: Renew refresh token TTL (extend 7 more days)
    await saveRefreshToken(refreshToken, credentials.username, credentials.password);

    res.json({
        success: true,
        token: sessionToken,
        user: result.user,
    });
};
