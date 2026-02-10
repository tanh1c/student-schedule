import config from '../../config/default.js';
import { getClient } from './redisService.js';
import logger from '../utils/logger.js';

// Legacy in-memory map for Jars (Complex objects that are hard to serialize)
// We accept that these might be lost on restart, requiring user to re-select period.
export const activePeriodJars = new Map();

// SSO Cookie Jars - For cross-service SSO (LMS, etc.)
// Key: sessionToken, Value: CookieJar with TGC
export const ssoJars = new Map();

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
        ssoJars.delete(token); // Cleanup SSO jar
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

// ═══════════════════════════════════════════════════════
// REFRESH TOKEN - "Remember Me" with encrypted credentials
// ═══════════════════════════════════════════════════════
import crypto from 'crypto';

const REFRESH_PREFIX = 'REFRESH:';
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt credentials with AES-256-GCM
 * @param {string} plaintext - JSON string of credentials
 * @returns {string} - iv:authTag:ciphertext (hex encoded)
 */
function encryptCredentials(plaintext) {
    const keyHex = config.security.encryptionKey;
    const key = Buffer.from(keyHex, 'hex');
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt credentials with AES-256-GCM
 * @param {string} encryptedStr - iv:authTag:ciphertext (hex encoded)
 * @returns {string} - Decrypted plaintext
 */
function decryptCredentials(encryptedStr) {
    const keyHex = config.security.encryptionKey;
    const key = Buffer.from(keyHex, 'hex');
    const [ivHex, authTagHex, ciphertext] = encryptedStr.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

/**
 * Generate a cryptographically secure session token
 * @returns {string} - Random hex token (no embedded user info)
 */
export function generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Save refresh token with encrypted credentials
 * @param {string} refreshToken - Random token
 * @param {string} username
 * @param {string} password
 */
export async function saveRefreshToken(refreshToken, username, password) {
    const client = getClient();
    if (!client || !client.isOpen) return false;

    try {
        const encrypted = encryptCredentials(JSON.stringify({ username, password }));
        const key = REFRESH_PREFIX + refreshToken;
        await client.set(key, encrypted, {
            PX: config.session.refreshTokenTTLMs // 7 days
        });
        logger.info(`[REFRESH] Saved refresh token for user (encrypted)`);
        return true;
    } catch (e) {
        logger.error('[REFRESH] Save Error', e);
        return false;
    }
}

/**
 * Get credentials from refresh token
 * @param {string} refreshToken
 * @returns {{ username: string, password: string } | null}
 */
export async function getRefreshCredentials(refreshToken) {
    const client = getClient();
    if (!client || !client.isOpen) return null;

    try {
        const encrypted = await client.get(REFRESH_PREFIX + refreshToken);
        if (!encrypted) return null;

        const decrypted = decryptCredentials(encrypted);
        return JSON.parse(decrypted);
    } catch (e) {
        logger.error('[REFRESH] Get/Decrypt Error', e);
        return null;
    }
}

/**
 * Delete refresh token
 * @param {string} refreshToken
 */
export async function deleteRefreshToken(refreshToken) {
    const client = getClient();
    if (!client || !client.isOpen) return;

    try {
        await client.del(REFRESH_PREFIX + refreshToken);
        logger.info('[REFRESH] Deleted refresh token');
    } catch (e) {
        logger.error('[REFRESH] Delete Error', e);
    }
}
