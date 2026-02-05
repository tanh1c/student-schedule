import config from '../../config/default.js';

export const sessions = new Map();
export const activePeriodJars = new Map();

export const MAX_SESSIONS = config.session.maxSessions;

/**
 * Check if we can create new session
 */
export function canCreateSession() {
    if (sessions.size >= MAX_SESSIONS) {
        cleanupExpiredSessions();
        return sessions.size < MAX_SESSIONS;
    }
    return true;
}

/**
 * Cleanup expired sessions
 */
export function cleanupExpiredSessions() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [token, session] of sessions.entries()) {
        const lastActivity = session.lastActivity || session.createdAt || 0;
        if ((now - lastActivity) > config.session.timeoutMs) {
            sessions.delete(token);
            activePeriodJars.delete(token);
            cleanedCount++;
        }
    }

    // Cleanup orphaned jars (just in case)
    for (const [token] of activePeriodJars.entries()) {
        if (!sessions.has(token)) {
            activePeriodJars.delete(token);
        }
    }

    if (cleanedCount > 0) {
        console.log(`[CLEANUP] Removed ${cleanedCount} expired sessions. Active: ${sessions.size}`);
    }
}

// Start cleanup interval
setInterval(cleanupExpiredSessions, config.session.cleanupIntervalMs);
