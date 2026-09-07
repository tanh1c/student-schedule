import nodeFetch from 'node-fetch';
import fetchCookie from 'fetch-cookie';
import { CookieJar } from 'tough-cookie';
import { activePeriodJars } from '../services/sessionStore.js';
import * as parser from '../services/dkmhParser.js';
import { parseRegistrationBatchIds, parseRegistrationPeriods } from '../services/dkmhCrawler.js';
import config from '../../config/default.js';
import { maskUrl } from '../utils/masking.js';
import logger from '../utils/logger.js';

const FETCH_TIMEOUT = 15000;

// Proxy endpoint for DKMH requests
export const proxy = async (req, res) => {
    const session = req.session; // From authMiddleware
    const dkmhCookie = session.type === 'dkmh' ? session.cookie : session.dkmhCookie;

    if (!dkmhCookie) {
        return res.status(401).json({ error: 'DKMH session not found. Please login to DKMH first.' });
    }

    const { url, method = 'GET', body } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    logger.info(`[DKMH Proxy] ${method} ${maskUrl(url)}`);

    try {
        const options = {
            method: method,
            headers: {
                'User-Agent': config.userAgent,
                'Cookie': dkmhCookie,
                'Referer': config.urls.dkmhInfo.entryUrl,
                'Origin': 'https://mybk.hcmut.edu.vn',
                'Accept': 'application/json, text/html, */*'
            }
        };

        if (body && (method === 'POST' || method === 'PUT')) {
            options.body = typeof body === 'string' ? body : JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
        }

        const response = await nodeFetch(url, { ...options, signal: AbortSignal.timeout(FETCH_TIMEOUT) });
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            res.json(data);
        } else {
            const text = await response.text();
            res.send(text);
        }
    } catch (e) {
        logger.error('[DKMH Proxy] Error:', e);
        res.status(500).json({ error: e.message });
    }
};

export const getRegistrationPeriods = async (req, res) => {
    const session = req.session;
    const dkmhCookie = session.dkmhCookie;

    if (!dkmhCookie) {
        return res.status(401).json({ error: 'DKMH session not found', dkmhLoggedIn: false });
    }

    logger.info('[DKMH] Fetching registration periods...');
    try {
        const response = await nodeFetch(config.urls.dkmhInfo.formUrl, {
            headers: {
                'User-Agent': config.userAgent,
                'Cookie': dkmhCookie,
                'Referer': config.urls.dkmhInfo.homeUrl,
                'Accept': 'text/html,application/xhtml+xml'
            }
        });

        const html = await response.text();
        const periods = parseRegistrationPeriods(html);

        res.json({ success: true, data: periods.slice(0, 10) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getPeriodDetails = async (req, res) => {
    const session = req.session;
    const { periodId } = req.body;
    const dkmhCookie = session.dkmhCookie;

    if (!periodId) return res.status(400).json({ error: 'periodId required' });

    try {
        const jar = new CookieJar();
        const fetch = fetchCookie(nodeFetch, jar);

        const cookieParts = dkmhCookie.split('; ');
        for (const part of cookieParts) {
            try {
                await jar.setCookie(part, 'https://mybk.hcmut.edu.vn');
            } catch (_error) {
                // Ignore malformed cookie fragments from upstream responses.
            }
        }

        const baseHeaders = {
            'User-Agent': config.userAgent,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'https://mybk.hcmut.edu.vn',
            'Referer': config.urls.dkmhInfo.formUrl
        };

        // Step 1
        await fetch('https://mybk.hcmut.edu.vn/dkmh/ketQuaDangKyView.action', {
            method: 'POST', body: `hocKyId=${periodId}`, headers: baseHeaders
        });

        // Step 2 & 3: Get dotDKId logic
        const dotDKResponse = await fetch('https://mybk.hcmut.edu.vn/dkmh/getDanhSachDotDK.action', {
            method: 'POST', body: `hocKyId=${periodId}`, headers: baseHeaders
        });
        const dotDKHtml = await dotDKResponse.text();
        const { dotDKHocVienId, dotDKId } = parseRegistrationBatchIds(dotDKHtml);

        // Step 3
        const lichResponse = await fetch('https://mybk.hcmut.edu.vn/dkmh/getLichDangKy.action', {
            method: 'POST', body: `dotDKId=${dotDKId}&dotDKHocVienId=${dotDKHocVienId}`, headers: baseHeaders
        });
        const lichHtml = await lichResponse.text();

        // Step 4
        await fetch('https://mybk.hcmut.edu.vn/dkmh/getDanhSachMonHocDangKy.action', {
            method: 'POST', body: `dotDKId=${dotDKId}`, headers: baseHeaders
        });

        // Step 5
        const ketQuaResponse = await fetch('https://mybk.hcmut.edu.vn/dkmh/getKetQuaDangKy.action', {
            method: 'POST', body: '', headers: baseHeaders
        });
        const ketQuaHtml = await ketQuaResponse.text();

        // Store jar
        const jarKey = `${req.token}_${periodId}`;
        activePeriodJars.set(jarKey, { fetch, jar, baseHeaders, periodId, dotDKId, dotDKHocVienId });

        res.json({
            success: true,
            data: {
                courses: parser.parsePeriodDetailsHtml(ketQuaHtml),
                schedule: parser.parseScheduleHtml(lichHtml),
                periodId, dotDKId
            }
        });

    } catch (e) {
        logger.error(e);
        res.status(500).json({ error: e.message });
    }
};

export const searchCourses = async (req, res) => {
    const { periodId, query, forceMode } = req.body;
    const jarKey = `${req.token}_${periodId}`;
    const storedData = activePeriodJars.get(jarKey);

    if (!storedData) return res.status(400).json({ error: 'Load details first' });

    const { fetch, baseHeaders } = storedData;

    try {
        if (!forceMode) {
            await fetch('https://mybk.hcmut.edu.vn/dkmh/getKetQuaDangKy.action', {
                method: 'POST', body: '', headers: baseHeaders
            });
        }

        const searchParams = new URLSearchParams({ msmh: query });
        const response = await fetch('https://mybk.hcmut.edu.vn/dkmh/searchMonHocDangKy.action', {
            method: 'POST', body: searchParams.toString(), headers: baseHeaders
        });
        const html = await response.text();
        res.json({ success: true, data: parser.parseSearchResultsHtml(html) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getClassGroups = async (req, res) => {
    const { periodId, monHocId } = req.body;
    const jarKey = `${req.token}_${periodId}`;
    const storedData = activePeriodJars.get(jarKey);

    if (!storedData) return res.status(400).json({ error: 'Load details first' });

    try {
        const response = await storedData.fetch('https://mybk.hcmut.edu.vn/dkmh/getThongTinNhomLopMonHoc.action', {
            method: 'POST', body: `monHocId=${monHocId}`, headers: storedData.baseHeaders
        });
        const html = await response.text();
        res.json({ success: true, data: parser.parseClassGroupsHtml(html) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export async function submitRegistrationAttempt(storedData, { nlmhId, monHocId, forceMode }) {
    const { fetch, baseHeaders } = storedData;

    if (monHocId && !forceMode) {
        await fetch('https://mybk.hcmut.edu.vn/dkmh/getThongTinNhomLopMonHoc.action', {
            method: 'POST', body: `monHocId=${monHocId}`, headers: baseHeaders
        });
    }

    const response = await fetch('https://mybk.hcmut.edu.vn/dkmh/dangKy.action', {
        method: 'POST', body: `NLMHId=${nlmhId}`, headers: baseHeaders
    });
    let text = await response.text();

    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

    let result = {};
    try {
        result = JSON.parse(text);
    } catch (_error) {
        // Some upstream responses are plain text; fall back to a generic error payload.
    }

    const shouldRefresh = result.code === 'SUCCESS' || result.code === 'NOTICE' || forceMode;
    if (!shouldRefresh) {
        return {
            success: false,
            error: result.msg || 'Failed',
            message: result.msg || 'Failed',
            code: result.code
        };
    }

    const ketQuaResponse = await fetch('https://mybk.hcmut.edu.vn/dkmh/getKetQuaDangKy.action', {
        method: 'POST', body: '', headers: baseHeaders
    });
    const ketQuaHtml = await ketQuaResponse.text();
    const registrationResult = parser.parsePeriodDetailsHtml(ketQuaHtml);

    return {
        success: true,
        ...(result.code === 'NOTICE' ? { draft: true } : {}),
        message: result.msg || 'Sent',
        code: result.code,
        forceMode,
        registrationResult
    };
}

export const register = async (req, res) => {
    const { periodId, nlmhId, monHocId, forceMode } = req.body;
    const jarKey = `${req.token}_${periodId}`;
    const storedData = activePeriodJars.get(jarKey);

    if (!storedData) return res.status(400).json({ error: 'Session expired' });

    try {
        const result = await submitRegistrationAttempt(storedData, { nlmhId, monHocId, forceMode });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getRegistrationResult = async (req, res) => {
    const { periodId } = req.body;
    const jarKey = `${req.token}_${periodId}`;
    const storedData = activePeriodJars.get(jarKey);

    if (!storedData) return res.status(400).json({ error: 'Session expired' });

    try {
        const response = await storedData.fetch('https://mybk.hcmut.edu.vn/dkmh/getKetQuaDangKy.action', {
            method: 'POST', body: '', headers: storedData.baseHeaders
        });
        const html = await response.text();
        res.json({
            success: true,
            data: parser.parsePeriodDetailsHtml(html)
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const cancel = async (req, res) => {
    const { periodId, ketquaId, monHocMa } = req.body;
    const jarKey = `${req.token}_${periodId}`;
    const storedData = activePeriodJars.get(jarKey);

    if (!storedData) return res.status(400).json({ error: 'Session expired' });

    try {
        await storedData.fetch('https://mybk.hcmut.edu.vn/dkmh/xoaKetQuaDangKy.action', {
            method: 'POST', body: `ketquaId=${ketquaId}`, headers: storedData.baseHeaders
        });

        res.json({
            success: true,
            message: `Hủy đăng ký ${monHocMa || ''} thành công`,
            ketquaId
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
