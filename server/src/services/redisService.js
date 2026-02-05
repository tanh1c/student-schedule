import { createClient } from 'redis';
import logger from '../utils/logger.js';
import config from '../../config/default.js';

let client;
let isConnected = false;

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
    if (!isConnected) {
        return await fetchFn();
    }

    try {
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

            if (ageSeconds < freshSeconds) {
                // HIT - FRESH: Return immediately, NO background fetch
                logger.info(`[REDIS] HIT-FRESH: ${key} (Age: ${ageSeconds.toFixed(1)}s)`);
                return { ...data, _cache: 'HIT-FRESH' };
            } else {
                // HIT - STALE: Return immediately, TRIGGER background fetch
                logger.info(`[REDIS] HIT-STALE: ${key} (Age: ${ageSeconds.toFixed(1)}s) -> Revalidating`);

                // Fire & Forget
                fetchAndCache(key, fetchFn, ttlSeconds).catch(err =>
                    logger.error(`[REDIS] Background Update Failed: ${key}`, err)
                );

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
    // Wrap with timestamp
    const cacheObject = {
        timestamp: Date.now(),
        data: data
    };

    try {
        await client.set(key, JSON.stringify(cacheObject), { EX: ttlSeconds });
        // logger.info(`[REDIS] Saved: ${key}`);
    } catch (e) {
        logger.error(`[REDIS] Save Failed: ${key}`, e);
    }

    return { ...data, _cache: 'MISS' };
}

export const getClient = () => client;
