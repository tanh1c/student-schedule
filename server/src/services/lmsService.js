import fetchCookie from 'fetch-cookie';
import nodeFetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import config from '../../config/default.js';
import logger from '../utils/logger.js';
import { maskCookie, maskSensitive } from '../utils/masking.js';

/**
 * LMS (Moodle) Service
 * Handles authentication and API calls to BK E-Learning (lms.hcmut.edu.vn)
 */

/**
 * Perform LMS login using existing CAS SSO session
 * The user must already be logged in via CAS (MyBK login)
 * 
 * @param {CookieJar} existingJar - Cookie jar with existing CAS TGC cookie
 * @returns {Promise<{success: boolean, lmsCookie?: string, sesskey?: string, userid?: string, error?: string}>}
 */
export async function performLMSLogin(existingJar) {
    // Create fetch instance with the existing cookie jar (contains TGC from MyBK login)
    const fetch = fetchCookie(nodeFetch, existingJar);

    try {
        logger.info('[LMS] Step 1: Navigating to LMS with CAS SSO...');

        // Navigate to LMS login page - CAS will auto-authenticate via TGC cookie
        const lmsLoginUrl = `${config.urls.loginPage}?service=${encodeURIComponent(config.urls.lms.serviceUrl)}`;

        const response = await fetch(lmsLoginUrl, {
            redirect: 'follow',
            headers: {
                'User-Agent': config.userAgent
            }
        });

        const finalUrl = response.url;
        logger.info('[LMS] Final URL after SSO:', finalUrl);

        // Check if we're still on login page (SSO failed)
        if (finalUrl.includes('sso.hcmut.edu.vn/cas/login')) {
            logger.warn('[LMS] SSO redirect failed - user not authenticated');
            return { success: false, error: 'SSO session expired. Please login again.' };
        }

        // Parse HTML to extract sesskey and userid
        const html = await response.text();

        // Extract sesskey from HTML
        // Pattern: "sesskey":"YJlfrokKBP" or name="sesskey" value="xxx"
        const sesskeyMatch = html.match(/"sesskey"\s*:\s*"([^"]+)"/) ||
            html.match(/name="sesskey"\s+value="([^"]+)"/);

        // Extract userid from HTML
        // Pattern: "userid":"75147" or data-userid="xxx"
        const useridMatch = html.match(/"userid"\s*:\s*"?(\d+)"?/) ||
            html.match(/data-userid="(\d+)"/);

        if (!sesskeyMatch) {
            logger.error('[LMS] Could not find sesskey in HTML');
            // Save HTML for debugging (only first 2000 chars)
            logger.debug('[LMS] HTML snippet:', html.substring(0, 2000));
            return { success: false, error: 'Could not extract LMS sesskey' };
        }

        const sesskey = sesskeyMatch[1];
        const userid = useridMatch ? useridMatch[1] : null;

        logger.info('[LMS] Found sesskey:', maskSensitive(sesskey));
        logger.info('[LMS] Found userid:', userid);

        // Get MoodleSession cookie
        const cookies = await existingJar.getCookies(config.urls.lms.baseUrl);
        const moodleCookie = cookies.find(c => c.key === 'MoodleSession');

        if (!moodleCookie) {
            logger.error('[LMS] MoodleSession cookie not found');
            logger.debug('[LMS] Available cookies:', cookies.map(c => c.key).join(', '));
            return { success: false, error: 'MoodleSession cookie not set' };
        }

        const lmsCookieString = cookies.map(c => c.cookieString()).join('; ');
        logger.info('[LMS] Got LMS cookies:', maskCookie(lmsCookieString));

        return {
            success: true,
            lmsCookie: lmsCookieString,
            sesskey: sesskey,
            userid: userid
        };

    } catch (error) {
        logger.error('[LMS] Login error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetch conversations (messages) from LMS
 * 
 * @param {Object} lmsSession - LMS session data {lmsCookie, sesskey, userid}
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Conversations data
 */
export async function getConversations(lmsSession, options = {}) {
    const {
        type = 1,           // 1 = private messages
        limitnum = 51,
        limitfrom = 0,
        favourites = false,
        mergeself = true
    } = options;

    if (!lmsSession.userid) {
        throw new Error('LMS userid not available');
    }

    const url = `${config.urls.lms.ajaxUrl}?sesskey=${lmsSession.sesskey}&info=core_message_get_conversations`;

    const payload = [{
        index: 0,
        methodname: 'core_message_get_conversations',
        args: {
            userid: parseInt(lmsSession.userid),
            type: type,
            limitnum: limitnum,
            limitfrom: limitfrom,
            favourites: favourites,
            mergeself: mergeself
        }
    }];

    logger.info(`[LMS] Fetching conversations for user ${lmsSession.userid}...`);

    const response = await nodeFetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Cookie': lmsSession.lmsCookie,
            'User-Agent': config.userAgent,
            'Origin': config.urls.lms.baseUrl,
            'Referer': `${config.urls.lms.baseUrl}/message/`,
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`LMS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Response is an array, we need the first element
    if (Array.isArray(data) && data[0]) {
        if (data[0].error) {
            throw new Error(`LMS Error: ${data[0].exception?.message || 'Unknown error'}`);
        }
        return data[0].data;
    }

    return data;
}

/**
 * Get detailed messages for a specific conversation
 * 
 * @param {Object} lmsSession - LMS session data
 * @param {number} conversationId - Conversation ID
 * @param {Object} options - Query options
 */
export async function getConversationMessages(lmsSession, conversationId, options = {}) {
    const {
        limitnum = 101,      // Match LMS default
        limitfrom = 0,
        newest = true
    } = options;

    if (!lmsSession.userid) {
        throw new Error('LMS userid not available');
    }

    const url = `${config.urls.lms.ajaxUrl}?sesskey=${lmsSession.sesskey}&info=core_message_get_conversation_messages`;

    const payload = [{
        index: 0,
        methodname: 'core_message_get_conversation_messages',
        args: {
            currentuserid: parseInt(lmsSession.userid),  // Required by LMS API!
            convid: parseInt(conversationId),
            newest: newest,
            limitnum: limitnum,
            limitfrom: limitfrom
        }
    }];

    logger.info(`[LMS] Fetching messages for conversation ${conversationId}...`);

    const response = await nodeFetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cookie': lmsSession.lmsCookie,
            'User-Agent': config.userAgent,
            'Origin': config.urls.lms.baseUrl,
            'Referer': `${config.urls.lms.baseUrl}/message/`,
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`LMS API error: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data[0]) {
        if (data[0].error) {
            throw new Error(`LMS Error: ${data[0].exception?.message || 'Unknown error'}`);
        }
        return data[0].data;
    }

    return data;
}

/**
 * Get unread message count
 * 
 * @param {Object} lmsSession - LMS session data
 */
export async function getUnreadCount(lmsSession) {
    const url = `${config.urls.lms.ajaxUrl}?sesskey=${lmsSession.sesskey}&info=core_message_get_unread_conversation_counts`;

    const payload = [{
        index: 0,
        methodname: 'core_message_get_unread_conversation_counts',
        args: {
            userid: lmsSession.userid
        }
    }];

    const response = await nodeFetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cookie': lmsSession.lmsCookie,
            'User-Agent': config.userAgent,
            'Origin': config.urls.lms.baseUrl,
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`LMS API error: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data[0]) {
        return data[0].data;
    }

    return data;
}
