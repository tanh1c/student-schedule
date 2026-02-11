import { createClient } from 'redis';
import logger from '../utils/logger.js';
import config from '../../config/default.js';

let client;
let isConnected = false;

// ═══════════════════════════════════════════════════════
// REDIS COMMAND BUDGET TRACKER — Protect Upstash quota
// ═══════════════════════════════════════════════════════
const DAILY_LIMIT = parseInt(process.env.UPSTASH_DAILY_COMMAND_LIMIT || '10000', 10);
const BUDGET_THRESHOLD = 0.8; // Circuit breaker at 80%

let commandCount = 0;
let budgetDate = new Date().toDateString();
let circuitOpen = false; // true = Redis disabled to save commands

export function trackCommand() {
    const today = new Date().toDateString();
    if (today !== budgetDate) {
        // New day — reset counter
        logger.info(`[REDIS-BUDGET] Daily reset. Yesterday: ${commandCount}/${DAILY_LIMIT} commands used.`);
        commandCount = 0;
        budgetDate = today;
        circuitOpen = false;
    }
    commandCount++;

    if (!circuitOpen && commandCount >= DAILY_LIMIT * BUDGET_THRESHOLD) {
        circuitOpen = true;
        logger.warn(`[REDIS-BUDGET] ⚠️ Circuit OPEN! ${commandCount}/${DAILY_LIMIT} commands used (${(BUDGET_THRESHOLD * 100).toFixed(0)}% threshold). Redis disabled for non-critical operations.`);
    }
}

/**
 * Check if Redis budget allows operations
 * Critical operations (session auth) always allowed
 * Cache operations (SWR) blocked when circuit is open
 */
export function isBudgetExhausted() {
    return circuitOpen;
}

export function getCommandStats() {
    return {
        commandsUsed: commandCount,
        dailyLimit: DAILY_LIMIT,
        percentUsed: ((commandCount / DAILY_LIMIT) * 100).toFixed(1),
        circuitOpen,
        budgetDate
    };
}

// Initialize Redis Client
export const initRedis = async () => {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';

    client = createClient({ url });

    client.on('error', (err) => {
        logger.error('[REDIS] Client Error', err);
        isConnected = false;
    });

    client.on('connect', () => {
        logger.info('[REDIS] Connected to Redis');
        isConnected = true;
    });

    try {
        await client.connect();
    } catch (e) {
        logger.error('[REDIS] Failed to connect initially', e);
    }
};

/**
 * Backend SWR Pattern with Freshness Window checks
 * @param {string} key Cache key
 * @param {Function} fetchFn Async function to fetch fresh data
 * @param {number} ttlSeconds Max age in Redis (e.g., 4 hours)
 * @param {number} freshSeconds Duration where data is considered "fresh" and needs NO revalidation (e.g., 60s)
 * @returns {Promise<any>} Data
 */
export const swr = async (key, fetchFn, ttlSeconds = 14400, freshSeconds = 60) => {
    // Circuit breaker: skip Redis entirely when budget is low
    if (!isConnected || circuitOpen) {
        if (circuitOpen) {
            logger.info(`[REDIS] Budget circuit open — bypassing cache for ${key}`);
        }
        return await fetchFn();
    }

    try {
        trackCommand();
        const cachedRaw = await client.get(key);

        if (cachedRaw) {
            let cached;
            try {
                cached = JSON.parse(cachedRaw);
            } catch (e) {
                // Formatting change/error, treat as miss
                return await fetchAndCache(key, fetchFn, ttlSeconds);
            }

            // Check if wrapping format is used { timestamp, data }
            const now = Date.now();
            const data = cached.data || cached; // Fallback for old simple format
            const timestamp = cached.timestamp || 0;
            const ageSeconds = (now - timestamp) / 1000;

            if (ageSeconds < freshSeconds && !data._fallback) {
                // HIT - FRESH: Return immediately, NO background fetch
                logger.info(`[REDIS] HIT-FRESH: ${key} (Age: ${ageSeconds.toFixed(1)}s)`);
                return { ...data, _cache: 'HIT-FRESH' };
            } else {
                // HIT - STALE: Return immediately, TRIGGER background fetch (only if budget allows)
                logger.info(`[REDIS] HIT-STALE: ${key} (Age: ${ageSeconds.toFixed(1)}s) -> Revalidating`);

                if (!circuitOpen) {
                    // Fire & Forget — but purge stale key if revalidation fails
                    fetchAndCache(key, fetchFn, ttlSeconds).catch(async (err) => {
                        logger.error(`[REDIS] Background Update Failed: ${key}`, err);
                        // Purge stale data so next request does a blocking fresh fetch
                        try {
                            trackCommand();
                            await client.del(key);
                            logger.info(`[REDIS] Purged stale key after failed revalidation: ${key}`);
                        } catch (delErr) { /* ignore */ }
                    });
                }

                return { ...data, _cache: 'HIT-STALE' };
            }
        } else {
            // MISS: Blocking Fetch
            logger.info(`[REDIS] HIT-MISS: ${key}`);
            return await fetchAndCache(key, fetchFn, ttlSeconds);
        }

    } catch (e) {
        logger.error(`[REDIS] SWR Error for ${key}`, e);
        return await fetchFn();
    }
};

// Helper to standardise the saving format
async function fetchAndCache(key, fetchFn, ttlSeconds) {
    const data = await fetchFn();

    // DON'T CACHE ERROR RESPONSES
    const isError = (
        data.status === 404 ||
        data.status === 500 ||
        data.error ||
        (data.code && data.code !== 200 && data.code !== '200')
    );

    if (isError) {
        logger.warn(`[REDIS] NOT CACHING ERROR: ${key}`, { status: data.status, error: data.error });
        try {
            trackCommand();
            await client.del(key);
        } catch (e) {
            logger.error(`[REDIS] Failed to delete stale key: ${key}`, e);
        }
        return { ...data, _cache: 'ERROR-NO-CACHE' };
    }

    // Skip save if budget is exhausted
    if (circuitOpen) {
        return { ...data, _cache: 'BUDGET-SKIP' };
    }

    // Wrap with timestamp
    const cacheObject = {
        timestamp: Date.now(),
        data: data
    };

    try {
        trackCommand();
        await client.set(key, JSON.stringify(cacheObject), { EX: ttlSeconds });
    } catch (e) {
        logger.error(`[REDIS] Save Failed: ${key}`, e);
    }

    return { ...data, _cache: 'MISS' };
}

export const getClient = () => client;
