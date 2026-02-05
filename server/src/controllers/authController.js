import { performCASLogin } from '../services/authService.js';
import { performDKMHLogin } from '../services/dkmhService.js';
import config from '../../config/default.js';

// Get sessions from app locals (will be passed from routes)
// Note: In a cleaner architecture, session store should be a separate module or singleton.
// For now, we will assume sessions are passed via req.app.locals.sessions or similar, 
// BUT since we are refactoring incrementally, let's make a Session Manager service or singleton later.
// For now, let's keep it simple: We'll export a function to setup controllers with context, 
// OR we use a singleton for sessions.
// Let's create a memory store singleton for sessions first.

// Wait, I should create a session store module first.
import { sessions, activePeriodJars, canCreateSession, MAX_SESSIONS } from '../services/sessionStore.js';

export const login = async (req, res) => {
    const { username, password } = req.body;
    console.log(`[API] Login request for ${username}`);

    if (!canCreateSession()) {
        console.log(`[API] Max sessions (${MAX_SESSIONS}) reached, rejecting login`);
        return res.status(503).json({
            error: 'Server đang quá tải, vui lòng thử lại sau ít phút',
            code: 'MAX_SESSIONS_REACHED'
        });
    }

    const result = await performCASLogin(username, password);

    if (result.success) {
        // Create session token
        const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');
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

        // Async DKMH Login
        console.log('[API] Also logging into DKMH...');
        performDKMHLogin(username, password).then(dkmhResult => {
            if (dkmhResult.success) {
                // Update session reference
                const session = sessions.get(sessionToken);
                if (session) {
                    session.dkmhCookie = dkmhResult.cookieString;
                    session.dkmhLoggedIn = true;
                    // Store jar if needed for period selection
                    activePeriodJars.set(sessionToken, dkmhResult.jar);
                    console.log('[API] DKMH login successful! Session updated.');
                }
            } else {
                console.log('[API] DKMH login failed:', dkmhResult.error);
            }
        }).catch(err => console.error('[API] DKMH login error:', err));

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
};

export const logout = (req, res) => {
    const token = req.token; // Extracted by auth middleware
    if (token) {
        sessions.delete(token);
        activePeriodJars.delete(token);
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

        // This seems to be a separate "dkmh-only" session type logic from original code?
        // Original code: app.post('/api/dkmh/login')
        /*
        if (result.success) {
            sessions.set(dkmhSessionToken, { type: 'dkmh', ... })
        }
        */

        sessions.set(dkmhSessionToken, {
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
