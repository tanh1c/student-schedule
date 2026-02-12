import nodeFetch from 'node-fetch';
import { performCASLogin } from '../services/authService.js';
import { performDKMHLogin } from '../services/dkmhService.js';
import { canCreateSession, saveSession, deleteSession, activePeriodJars, ssoJars, getSession, generateSecureToken } from '../services/sessionStore.js';
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
    const { username, password } = req.body;
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

        res.json({
            success: true,
            token: sessionToken,
            user: result.user,
        });
    } else {
        res.status(401).json({ error: result.error });
    }
};

export const logout = async (req, res) => {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    if (token) {
        await deleteSession(token);
        logger.info(`[API] Session deleted`);
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
        const dkmhSessionToken = generateSecureToken();

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
