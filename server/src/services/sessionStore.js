import config from '../../config/default.js';
import { getClient } from './redisService.js';
import logger from '../utils/logger.js';

// Legacy in-memory map for Jars (Complex objects that are hard to serialize)
// We accept that these might be lost on restart, requiring user to re-select period.
export const activePeriodJars = new Map();

export const MAX_SESSIONS = config.session.maxSessions;

// Redis Key Prefix
const SESSION_PREFIX = 'SESSION:';

/**
 * Get session by token (Async)
 * @param {string} token 
 */
export async function getSession(token) {
    const client = getClient();
    if (!client || !client.isOpen) return null;

    try {
        const raw = await client.get(SESSION_PREFIX + token);
        if (!raw) return null;

        const session = JSON.parse(raw);
        // Refresh TTL on access (sliding expiration)
        // await client.expire(SESSION_PREFIX + token, config.session.timeoutMs / 1000);
        return session;
    } catch (e) {
        logger.error('[SESSION] Get Error', e);
        return null;
    }
}

/**
 * Save/Update session (Async)
 * @param {string} token 
 * @param {object} data 
 */
export async function saveSession(token, data) {
    const client = getClient();
    if (!client || !client.isOpen) return false;

    try {
        const key = SESSION_PREFIX + token;
        data.lastActivity = Date.now();

        await client.set(key, JSON.stringify(data), {
            PX: config.session.timeoutMs // Set TTL in milliseconds
        });
        return true;
    } catch (e) {
        logger.error('[SESSION] Save Error', e);
        return false;
    }
}

/**
 * Delete session (Async)
 * @param {string} token 
 */
export async function deleteSession(token) {
    const client = getClient();
    if (!client || !client.isOpen) return;

    try {
        await client.del(SESSION_PREFIX + token);
        activePeriodJars.delete(token); // Cleanup associated jar
    } catch (e) {
        logger.error('[SESSION] Delete Error', e);
    }
}

/**
 * Check if we can create new session
 * With Redis, we typically don't limit hard count as strictly unless necessary.
 * For now, we assume Redis can handle it.
 */
export async function canCreateSession() {
    // Optional: Check DBSIZE if strict limit needed
    return true;
}

// Cleanup interval is handled by Redis TTL automatically!
// No need for setInterval loop.
