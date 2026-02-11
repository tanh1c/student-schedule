import nodeFetch from 'node-fetch';
import { performCASLogin } from '../services/authService.js';
import { performDKMHLogin } from '../services/dkmhService.js';
import { canCreateSession, saveSession, deleteSession, activePeriodJars, ssoJars, getSession, generateSecureToken, saveRefreshToken, getRefreshCredentials, deleteRefreshToken } from '../services/sessionStore.js';
import logger from '../utils/logger.js';
import config from '../../config/default.js';

/**
 * Background DKMH login — fire & forget after main login/refresh
 */
async function backgroundDkmhLogin(username, password, sessionToken) {
    try {
        const dkmhResult = await performDKMHLogin(username, password);
        if (dkmhResult.success) {
            const session = await getSession(sessionToken);
            if (session) {
                session.dkmhCookie = dkmhResult.cookieString;
                session.dkmhLoggedIn = true;
                activePeriodJars.set(sessionToken, dkmhResult.jar);
                await saveSession(sessionToken, session);
                logger.info('[API] DKMH background login successful.');
            }
        } else {
            logger.info('[API] DKMH background login failed:', dkmhResult.error);
        }
    } catch (err) {
        logger.error('[API] DKMH background login error:', err);
    }
}

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

        // Background DKMH login (fire & forget)
        backgroundDkmhLogin(username, password, sessionToken);

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

    if (!loginUsername || !loginPassword) {
        return res.status(400).json({ error: 'Username/Password required for DKMH login' });
    }

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
        const testUrl = config.urls.dkmhInfo.formUrl;
        const response = await nodeFetch(testUrl, {
            headers: {
                'User-Agent': config.userAgent,
                'Cookie': session.cookie,
                'Referer': config.urls.dkmhInfo.serviceUrl
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

    // Background DKMH login (fire & forget)
    backgroundDkmhLogin(credentials.username, credentials.password, sessionToken);

    logger.info('[REFRESH] Session refreshed successfully');

    // Step 6: Renew refresh token TTL (extend 7 more days)
    await saveRefreshToken(refreshToken, credentials.username, credentials.password);

    res.json({
        success: true,
        token: sessionToken,
        user: result.user,
    });
};
