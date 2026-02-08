/**
 * LMS API Service
 * Handles LMS (BK E-Learning) messaging features
 */

import { getAuthToken } from './mybkApi';

const API_BASE = '/api';

// localStorage keys for persistent offline cache
const STORAGE_KEYS = {
    CONVERSATIONS: 'lms_cache_conversations',
    CONVERSATIONS_TIME: 'lms_cache_conversations_time',
    CONVERSATION_DETAILS: 'lms_cache_details',
};

// Cache configuration
const CACHE_CONFIG = {
    CONVERSATIONS_TTL: 5 * 60 * 1000,  // 5 minutes for fresh data
    DETAILS_TTL: 10 * 60 * 1000,       // 10 minutes for fresh data
    OFFLINE_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days for offline fallback
};

// In-memory cache (faster access, syncs with localStorage)
const memCache = {
    conversations: null,
    conversationsTime: 0,
    conversationDetails: new Map(),
};

/**
 * Load cache from localStorage
 */
function loadCacheFromStorage() {
    try {
        // Load conversations
        const convData = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
        const convTime = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS_TIME);
        if (convData && convTime) {
            memCache.conversations = JSON.parse(convData);
            memCache.conversationsTime = parseInt(convTime, 10);
        }

        // Load conversation details
        const detailsData = localStorage.getItem(STORAGE_KEYS.CONVERSATION_DETAILS);
        if (detailsData) {
            const details = JSON.parse(detailsData);
            memCache.conversationDetails = new Map(Object.entries(details));
        }

        console.log('[LMS] Loaded cache from localStorage');
    } catch (e) {
        console.error('[LMS] Error loading cache from localStorage:', e);
    }
}

/**
 * Save conversations to localStorage
 */
function saveConversationsToStorage(data) {
    try {
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(data));
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS_TIME, Date.now().toString());
    } catch (e) {
        console.error('[LMS] Error saving conversations to localStorage:', e);
    }
}

/**
 * Save conversation details to localStorage
 */
function saveDetailsToStorage() {
    try {
        const details = Object.fromEntries(memCache.conversationDetails);
        localStorage.setItem(STORAGE_KEYS.CONVERSATION_DETAILS, JSON.stringify(details));
    } catch (e) {
        console.error('[LMS] Error saving details to localStorage:', e);
    }
}

// Load cache on module init
loadCacheFromStorage();

/**
 * Check if cache entry is still valid (for fresh data)
 */
function isCacheValid(timestamp, ttl) {
    return timestamp && (Date.now() - timestamp) < ttl;
}

/**
 * Check if cache can be used for offline fallback (longer TTL)
 */
function isOfflineCacheValid(timestamp) {
    return timestamp && (Date.now() - timestamp) < CACHE_CONFIG.OFFLINE_TTL;
}

/**
 * Clear all LMS cache (call when user logs out)
 */
export function clearLmsCache() {
    memCache.conversations = null;
    memCache.conversationsTime = 0;
    memCache.conversationDetails.clear();

    // Also clear localStorage
    try {
        localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
        localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS_TIME);
        localStorage.removeItem(STORAGE_KEYS.CONVERSATION_DETAILS);
    } catch (e) {
        console.error('[LMS] Error clearing localStorage cache:', e);
    }
}

/**
 * Initialize LMS session via SSO
 * Must be called before other LMS functions
 */
export async function initLmsSession() {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Chưa đăng nhập' };

    try {
        const response = await fetch(`${API_BASE}/lms/init`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Không thể kết nối LMS',
                code: data.code
            };
        }

        return { success: true, userid: data.userid, cached: data.cached };
    } catch (error) {
        console.error('[LMS] Init error:', error);
        return { success: false, error: 'Không thể kết nối server' };
    }
}

/**
 * Get conversations (message inbox)
 * @param {Object} options - Query options
 * @param {boolean} options.forceRefresh - Force refresh from server
 */
export async function getMessages(options = {}) {
    const token = getAuthToken();

    const { type = 1, limit = 50, offset = 0, forceRefresh = false } = options;

    // Check memory cache first (only for default params)
    if (!forceRefresh && type === 1 && offset === 0 && memCache.conversations) {
        if (isCacheValid(memCache.conversationsTime, CACHE_CONFIG.CONVERSATIONS_TTL)) {
            console.log('[LMS] Using cached conversations');
            return { success: true, data: memCache.conversations, cached: true };
        }
    }

    // If no token, try to return offline data
    if (!token) {
        if (memCache.conversations && isOfflineCacheValid(memCache.conversationsTime)) {
            console.log('[LMS] No token, returning offline cache');
            return { success: true, data: memCache.conversations, cached: true, offline: true };
        }
        return { success: false, error: 'Chưa đăng nhập' };
    }

    try {
        const response = await fetch(
            `${API_BASE}/lms/messages?type=${type}&limit=${limit}&offset=${offset}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        const data = await response.json();

        if (!response.ok) {
            // Try offline cache on error
            if (memCache.conversations && isOfflineCacheValid(memCache.conversationsTime)) {
                console.log('[LMS] API error, returning offline cache');
                return { success: true, data: memCache.conversations, cached: true, offline: true };
            }
            return { success: false, error: data.error, code: data.code };
        }

        // Store in memory and localStorage (only default params)
        if (type === 1 && offset === 0) {
            memCache.conversations = data.data;
            memCache.conversationsTime = Date.now();
            saveConversationsToStorage(data.data);
        }

        return { success: true, data: data.data };
    } catch (error) {
        console.error('[LMS] Get messages error:', error);
        // Return offline cache if available
        if (memCache.conversations && isOfflineCacheValid(memCache.conversationsTime)) {
            console.log('[LMS] Network error, returning offline cache');
            return { success: true, data: memCache.conversations, cached: true, offline: true };
        }
        return { success: false, error: 'Không thể tải tin nhắn' };
    }
}

/**
 * Get messages for a specific conversation
 * @param {number} conversationId - Conversation ID
 * @param {Object} options - Query options  
 * @param {boolean} options.forceRefresh - Force refresh from server
 */
export async function getConversationMessages(conversationId, options = {}) {
    const token = getAuthToken();

    const { limit = 100, offset = 0, forceRefresh = false } = options;
    const cacheKey = `${conversationId}:${offset}`;

    // Check memory cache first
    if (!forceRefresh && memCache.conversationDetails.has(cacheKey)) {
        const cached = memCache.conversationDetails.get(cacheKey);
        if (isCacheValid(cached.time, CACHE_CONFIG.DETAILS_TTL)) {
            console.log('[LMS] Using cached conversation:', conversationId);
            return { success: true, data: cached.data, cached: true };
        }
    }

    // If no token, try to return offline data
    if (!token) {
        if (memCache.conversationDetails.has(cacheKey)) {
            const cached = memCache.conversationDetails.get(cacheKey);
            if (isOfflineCacheValid(cached.time)) {
                console.log('[LMS] No token, returning offline conversation cache');
                return { success: true, data: cached.data, cached: true, offline: true };
            }
        }
        return { success: false, error: 'Chưa đăng nhập' };
    }

    try {
        const response = await fetch(
            `${API_BASE}/lms/messages/${conversationId}?limit=${limit}&offset=${offset}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        const data = await response.json();

        if (!response.ok) {
            // Try offline cache on error
            if (memCache.conversationDetails.has(cacheKey)) {
                const cached = memCache.conversationDetails.get(cacheKey);
                if (isOfflineCacheValid(cached.time)) {
                    console.log('[LMS] API error, returning offline conversation cache');
                    return { success: true, data: cached.data, cached: true, offline: true };
                }
            }
            return { success: false, error: data.error };
        }

        // Store in memory cache and save to localStorage
        memCache.conversationDetails.set(cacheKey, {
            data: data.data,
            time: Date.now()
        });
        saveDetailsToStorage();

        return { success: true, data: data.data };
    } catch (error) {
        console.error('[LMS] Get conversation error:', error);
        // Return offline cache if available
        if (memCache.conversationDetails.has(cacheKey)) {
            const cached = memCache.conversationDetails.get(cacheKey);
            if (isOfflineCacheValid(cached.time)) {
                console.log('[LMS] Network error, returning offline conversation cache');
                return { success: true, data: cached.data, cached: true, offline: true };
            }
        }
        return { success: false, error: 'Không thể tải cuộc trò chuyện' };
    }
}

/**
 * Get unread message count
 */
export async function getUnreadCount() {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Chưa đăng nhập' };

    try {
        const response = await fetch(`${API_BASE}/lms/unread`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error };
        }

        return { success: true, data: data.data };
    } catch (error) {
        console.error('[LMS] Get unread error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Parse HTML message content to plain text
 */
export function parseMessageText(html) {
    if (!html) return '';
    // Simple HTML to text conversion
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
}

/**
 * Sanitize HTML message content
 * Removes inline color styles that may conflict with app theme
 * Removes layout styles that prevent text wrapping
 */
export function sanitizeMessageHtml(html) {
    if (!html) return '';

    return html
        // Remove color:#000000 and similar black colors that may not show on dark mode
        .replace(/color\s*:\s*#0{6}\s*;?/gi, '')
        .replace(/color\s*:\s*#000\s*;?/gi, '')
        .replace(/color\s*:\s*black\s*;?/gi, '')
        .replace(/color\s*:\s*rgb\s*\(\s*0\s*,\s*0\s*,\s*0\s*\)\s*;?/gi, '')
        // Remove color:#FFFFFF and similar white colors
        .replace(/color\s*:\s*#f{6}\s*;?/gi, '')
        .replace(/color\s*:\s*#fff\s*;?/gi, '')
        .replace(/color\s*:\s*white\s*;?/gi, '')
        .replace(/color\s*:\s*rgb\s*\(\s*255\s*,\s*255\s*,\s*255\s*\)\s*;?/gi, '')
        // Remove background colors that may conflict
        .replace(/background\s*:\s*#f{6}\s*;?/gi, '')
        .replace(/background\s*:\s*#0{6}\s*;?/gi, '')
        .replace(/background\s*:\s*white\s*;?/gi, '')
        .replace(/background\s*:\s*#FFFFFF\s*;?/gi, '')
        .replace(/background-color\s*:\s*#f{6}\s*;?/gi, '')
        .replace(/background-color\s*:\s*#0{6}\s*;?/gi, '')
        .replace(/background-color\s*:\s*white\s*;?/gi, '')
        // Remove near-white and near-black colors
        .replace(/color\s*:\s*#[fF]{3}[fF0-9]{0,3}\s*;?/gi, '')
        .replace(/color\s*:\s*#[0-3]{6}\s*;?/gi, '')
        // Remove text layout styles that prevent wrapping
        .replace(/white-space\s*:\s*[^;]+;?/gi, '')
        .replace(/word-wrap\s*:\s*[^;]+;?/gi, '')
        .replace(/word-break\s*:\s*[^;]+;?/gi, '')
        .replace(/overflow-wrap\s*:\s*[^;]+;?/gi, '')
        .replace(/text-overflow\s*:\s*[^;]+;?/gi, '')
        .replace(/overflow\s*:\s*hidden\s*;?/gi, '')
        // Remove fixed widths that may cause overflow
        .replace(/width\s*:\s*\d+px\s*;?/gi, '')
        .replace(/max-width\s*:\s*\d+px\s*;?/gi, '')
        .replace(/min-width\s*:\s*\d+px\s*;?/gi, '')
        // Clean up empty style attributes
        .replace(/style\s*=\s*["']\s*["']/gi, '')
        .replace(/style\s*=\s*["']\s*;+\s*["']/gi, '');
}

/**
 * Format timestamp to readable date
 */
export function formatMessageDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60 * 1000) return 'Vừa xong';

    // Less than 1 hour
    if (diff < 60 * 60 * 1000) {
        const mins = Math.floor(diff / (60 * 1000));
        return `${mins} phút trước`;
    }

    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours} giờ trước`;
    }

    // Less than 7 days
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days} ngày trước`;
    }

    // Format full date
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

export default {
    initLmsSession,
    getMessages,
    getConversationMessages,
    getUnreadCount,
    parseMessageText,
    sanitizeMessageHtml,
    formatMessageDate,
    clearLmsCache
};
