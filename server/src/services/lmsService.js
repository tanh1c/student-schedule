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

/**
 * Fetch a single month's calendar data using Moodle AJAX Web Services API
 * Uses core_calendar_get_calendar_monthly_view for structured JSON response
 * 
 * @param {Object} lmsSession - LMS session data {lmsCookie, sesskey, userid}
 * @param {number} year - Year to fetch
 * @param {number} month - Month to fetch (1-12)
 * @returns {Promise<Object>} - Calendar month data with events
 */
async function getCalendarMonth(lmsSession, year, month) {
    const url = `${config.urls.lms.ajaxUrl}?sesskey=${lmsSession.sesskey}&info=core_calendar_get_calendar_monthly_view`;

    const payload = [{
        index: 0,
        methodname: 'core_calendar_get_calendar_monthly_view',
        args: {
            year: year,
            month: month,
            courseid: 1,        // 1 = all courses
            categoryid: 0,
            includenavigation: false,
            mini: false          // false = detailed view with all events
        }
    }];

    const response = await nodeFetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Cookie': lmsSession.lmsCookie,
            'User-Agent': config.userAgent,
            'Origin': config.urls.lms.baseUrl,
            'Referer': `${config.urls.lms.baseUrl}/my/`,
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`LMS calendar API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Response is an array; check for errors
    if (Array.isArray(data) && data[0]) {
        if (data[0].error) {
            const errMsg = data[0].exception?.message || 'Unknown calendar API error';
            // Check for session-expired errors
            if (errMsg.includes('expired') || errMsg.includes('login') || errMsg.includes('access')) {
                throw new Error('LMS session expired - calendar API access denied');
            }
            throw new Error(`LMS Calendar Error: ${errMsg}`);
        }
        return data[0].data || data[0];
    }

    return data;
}

/**
 * Parse events from a single month's calendar API response
 * 
 * @param {Object} monthData - Raw calendar month data from Moodle API
 * @param {number} year - Year context
 * @param {number} month - Month context (1-12)
 * @returns {Array} - Parsed events
 */
function parseMonthEvents(monthData, year, month) {
    const events = [];

    // The API returns weeks[] -> days[] -> events[]
    const weeks = monthData.weeks || [];
    for (const week of weeks) {
        const days = week.days || [];
        for (const day of days) {
            const dayNum = day.mday;
            const dayTimestamp = day.timestamp;

            // Skip days from different months (calendar shows adjacent month days)
            if (!dayNum || !dayTimestamp) continue;

            const dayEvents = day.events || [];
            for (const evt of dayEvents) {
                const component = evt.component || '';      // mod_quiz, mod_assign, etc.
                const eventType = evt.eventtype || '';      // open, close, due
                const eventId = evt.id ? String(evt.id) : '';
                const name = evt.name || '';
                const courseName = evt.course?.fullname || evt.course?.shortname || '';
                const courseId = evt.course?.id || null;
                const actUrl = evt.url || evt.action?.url || '';
                const timestart = evt.timestart || dayTimestamp;
                const timeduration = evt.timeduration || 0;

                // Build the date from timestart (more accurate than day-level)
                const eventDate = new Date(timestart * 1000);
                const dateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;

                events.push({
                    date: dateStr,
                    dayTimestamp: timestart,
                    eventId,
                    component,
                    eventType,
                    name,
                    title: name,
                    url: actUrl,
                    courseName,
                    courseId,
                    timeduration,
                    month: eventDate.getMonth() + 1,
                    year: eventDate.getFullYear()
                });
            }
        }
    }

    return events;
}

/**
 * Fetch calendar deadlines across multiple months using Moodle AJAX API
 * 
 * @param {Object} lmsSession - LMS session data {lmsCookie, sesskey, userid}
 * @param {number} [numMonths=3] - Number of months to fetch (current + future)
 * @returns {Promise<Object>} - Aggregated deadlines data across all months
 */
export async function getDeadlines(lmsSession, numMonths = 3) {
    // Clamp months to a reasonable range
    numMonths = Math.max(1, Math.min(numMonths, 6));

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // Build list of months to fetch
    const monthsToFetch = [];
    for (let i = 0; i < numMonths; i++) {
        let m = currentMonth + i;
        let y = currentYear;
        while (m > 12) { m -= 12; y++; }
        monthsToFetch.push({ year: y, month: m });
    }

    logger.info(`[LMS] Fetching calendar for ${numMonths} months: ${monthsToFetch.map(m => `${m.month}/${m.year}`).join(', ')}`);

    // Fetch all months in parallel
    const results = await Promise.all(
        monthsToFetch.map(({ year, month }) =>
            getCalendarMonth(lmsSession, year, month)
                .then(data => ({ success: true, data, year, month }))
                .catch(err => {
                    logger.warn(`[LMS] Failed to fetch calendar ${month}/${year}: ${err.message}`);
                    // Re-throw session expired errors
                    if (err.message.includes('expired') || err.message.includes('login')) {
                        throw err;
                    }
                    return { success: false, error: err.message, year, month };
                })
        )
    );

    // Aggregate events from all successful months, deduplicate by eventId
    const allEvents = [];
    const seenIds = new Set();
    const courseMap = {};
    const fetchedMonths = [];

    for (const result of results) {
        if (!result.success) continue;

        fetchedMonths.push({ year: result.year, month: result.month });
        const events = parseMonthEvents(result.data, result.year, result.month);

        for (const evt of events) {
            // Deduplicate events that appear in adjacent month views
            const dedupKey = evt.eventId || `${evt.name}-${evt.dayTimestamp}`;
            if (seenIds.has(dedupKey)) continue;
            seenIds.add(dedupKey);

            allEvents.push(evt);

            // Build course map from event data
            if (evt.courseId && evt.courseName) {
                courseMap[evt.courseId] = evt.courseName;
            }
        }
    }

    // Categorize events
    const deadlines = allEvents.filter(e =>
        e.eventType === 'close' || e.eventType === 'due'
    );

    const upcoming = allEvents.filter(e =>
        e.eventType === 'open'
    );

    // Sort by timestamp
    deadlines.sort((a, b) => (a.dayTimestamp || 0) - (b.dayTimestamp || 0));
    upcoming.sort((a, b) => (a.dayTimestamp || 0) - (b.dayTimestamp || 0));
    allEvents.sort((a, b) => (a.dayTimestamp || 0) - (b.dayTimestamp || 0));

    logger.info(`[LMS] Parsed ${allEvents.length} total events across ${fetchedMonths.length} months, ${deadlines.length} deadlines, ${upcoming.length} upcoming`);

    return {
        calendarMonth: currentMonth,
        calendarYear: currentYear,
        fetchedMonths,
        courses: courseMap,
        totalEvents: allEvents.length,
        deadlines,
        upcoming,
        allEvents
    };
}
