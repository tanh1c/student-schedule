import logger from '../utils/logger.js';
import { swr } from '../services/redisService.js';
import { ssoJars, saveSession } from '../services/sessionStore.js';
import * as lmsService from '../services/lmsService.js';

/**
 * LMS Controller
 * Handles LMS (BK E-Learning) related endpoints
 */

/**
 * Initialize LMS session (authenticate with LMS using existing SSO)
 * POST /api/lms/init
 */
export const initLmsSession = async (req, res) => {
    const session = req.session;
    const token = req.token;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    // Check if already have valid LMS session
    if (session.lms && session.lms.sesskey) {
        logger.info('[LMS] Using existing LMS session');
        return res.json({
            success: true,
            userid: session.lms.userid,
            cached: true
        });
    }

    // Get SSO jar from memory store (not Redis as jars can't be serialized)
    const jar = ssoJars.get(token);
    if (!jar) {
        logger.warn('[LMS] No SSO jar found - user may need to re-login');
        return res.status(400).json({
            error: 'SSO session not available. Please re-login to enable LMS features.',
            code: 'SSO_JAR_MISSING'
        });
    }

    try {
        logger.info('[LMS] Initializing LMS session via SSO...');
        const result = await lmsService.performLMSLogin(jar);

        if (!result.success) {
            return res.status(401).json({ error: result.error });
        }

        // Store LMS session data
        session.lms = {
            lmsCookie: result.lmsCookie,
            sesskey: result.sesskey,
            userid: result.userid
        };

        // Save updated session with LMS data to Redis
        await saveSession(token, session);

        logger.info('[LMS] LMS session initialized successfully');
        res.json({
            success: true,
            userid: result.userid
        });

    } catch (error) {
        logger.error('[LMS] Init error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get conversations (message inbox)
 * GET /api/lms/messages
 */
export const getMessages = async (req, res) => {
    const session = req.session;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    // Check LMS session
    if (!session.lms || !session.lms.sesskey) {
        return res.status(400).json({
            error: 'LMS session not initialized. Call /api/lms/init first.'
        });
    }

    const { type = 1, limit = 50, offset = 0 } = req.query;

    const fetchMessages = async () => {
        return await lmsService.getConversations(session.lms, {
            type: parseInt(type),
            limitnum: parseInt(limit),
            limitfrom: parseInt(offset)
        });
    };

    try {
        // Cache Key: LMS_MSG:{username}:{type}:{offset}
        // TTL: 30 minutes
        // Fresh: 2 minutes
        const key = `LMS_MSG:${session.username}:${type}:${offset}`;
        const data = await swr(key, fetchMessages, 1800, 120);

        res.json({ success: true, data });
    } catch (error) {
        logger.error('[LMS] Get messages error:', error);

        // If sesskey expired, clear LMS session
        if (error.message.includes('sesskey') || error.message.includes('expired')) {
            session.lms = null;
            return res.status(401).json({
                error: 'LMS session expired. Please re-initialize.',
                code: 'LMS_SESSION_EXPIRED'
            });
        }

        res.status(500).json({ error: error.message });
    }
};

/**
 * Get messages for a specific conversation
 * GET /api/lms/messages/:conversationId
 */
export const getConversationDetail = async (req, res) => {
    const session = req.session;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    if (!session.lms || !session.lms.sesskey) {
        return res.status(400).json({
            error: 'LMS session not initialized'
        });
    }

    const { conversationId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const fetchConversation = async () => {
        return await lmsService.getConversationMessages(
            session.lms,
            parseInt(conversationId),
            {
                limitnum: parseInt(limit),
                limitfrom: parseInt(offset)
            }
        );
    };

    try {
        // Cache Key: LMS_CONV:{username}:{convId}:{offset}
        // TTL: 10 minutes, Fresh: 2 minutes
        const key = `LMS_CONV:${session.username}:${conversationId}:${offset}`;
        const data = await swr(key, fetchConversation, 600, 120);

        res.json({ success: true, data });
    } catch (error) {
        logger.error('[LMS] Get conversation error:', error);

        // If sesskey expired, clear LMS session
        if (error.message.includes('sesskey') || error.message.includes('expired')) {
            session.lms = null;
            return res.status(401).json({
                error: 'LMS session expired. Please re-initialize.',
                code: 'LMS_SESSION_EXPIRED'
            });
        }

        res.status(500).json({ error: error.message });
    }
};

/**
 * Get unread message count
 * GET /api/lms/unread
 */
export const getUnreadCount = async (req, res) => {
    const session = req.session;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    if (!session.lms || !session.lms.sesskey) {
        return res.status(400).json({
            error: 'LMS session not initialized'
        });
    }

    const fetchUnread = async () => {
        return await lmsService.getUnreadCount(session.lms);
    };

    try {
        // Cache briefly - 1 minute
        const key = `LMS_UNREAD:${session.username}`;
        const data = await swr(key, fetchUnread, 60, 30);

        res.json({ success: true, data });
    } catch (error) {
        logger.error('[LMS] Get unread error:', error);
        res.status(500).json({ error: error.message });
    }
};
