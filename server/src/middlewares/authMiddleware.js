import { getSession } from '../services/sessionStore.js';
import logger from '../utils/logger.js';

export const authenticate = async (req, res, next) => {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const session = await getSession(token);

        if (!session) {
            logger.info(`[AUTH] Invalid or expired token: ${token}`);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.session = session;
        next();
    } catch (e) {
        logger.error('[AUTH] Middleware Error', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateActivity = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (session) {
        session.lastActivity = Date.now();
    }
    next();
};
