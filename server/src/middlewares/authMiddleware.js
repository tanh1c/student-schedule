import { sessions } from '../services/sessionStore.js';

export const requireAuth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Update activity
    session.lastActivity = Date.now();

    // Attach session to req for controllers
    req.session = session;
    req.token = token;
    next();
};

export const updateActivity = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (session) {
        session.lastActivity = Date.now();
    }
    next();
};
