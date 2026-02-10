import config from '../../config/default.js';
import { getClient, trackCommand } from './redisService.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

// Legacy in-memory map for Jars (Complex objects that are hard to serialize)
// We accept that these might be lost on restart, requiring user to re-select period.
export const activePeriodJars = new Map();

// SSO Cookie Jars - For cross-service SSO (LMS, etc.)
// Key: sessionToken, Value: CookieJar with TGC
export const ssoJars = new Map();

export const MAX_SESSIONS = config.session.maxSessions;

// Redis Key Prefix
const SESSION_PREFIX = 'SESSION:';
const ALGORITHM = 'aes-256-gcm';

// ═══════════════════════════════════
// AES-256-GCM Encryption Helpers
// ═══════════════════════════════════

/**
 * Encrypt plaintext with AES-256-GCM
 * @param {string} plaintext - Data to encrypt
 * @returns {string} - iv:authTag:ciphertext (hex encoded)
 */
function encrypt(plaintext) {
    const key = Buffer.from(config.security.encryptionKey, 'hex');
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt AES-256-GCM encrypted string
 * @param {string} encryptedStr - iv:authTag:ciphertext (hex encoded)
 * @returns {string} - Decrypted plaintext
 */
function decrypt(encryptedStr) {
    const key = Buffer.from(config.security.encryptionKey, 'hex');
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
 * Get session by token (Async)
 * @param {string} token 
 */
export async function getSession(token) {
    const client = getClient();
    if (!client || !client.isOpen) return null;

    try {
        trackCommand();
        const raw = await client.get(SESSION_PREFIX + token);
        if (!raw) return null;

        const decrypted = decrypt(raw);
        const session = JSON.parse(decrypted);
        return session;
    } catch (e) {
        logger.error('[SESSION] Get/Decrypt Error', e);
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

        const encrypted = encrypt(JSON.stringify(data));
        trackCommand();
        await client.set(key, encrypted, {
            PX: config.session.timeoutMs // Set TTL in milliseconds
        });
        return true;
    } catch (e) {
        logger.error('[SESSION] Save/Encrypt Error', e);
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
        trackCommand();
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

/**
 * Generate a cryptographically secure session token
 * @returns {string} - Random hex token (no embedded user info)
 */
export function generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
}
