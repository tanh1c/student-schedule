import nodeFetch from 'node-fetch';
import { sessions, activePeriodJars } from '../services/sessionStore.js';
import * as parser from '../services/dkmhParser.js';
import config from '../../config/default.js';
import { maskCookie, maskUrl } from '../utils/masking.js';

// Proxy endpoint for DKMH requests
export const proxy = async (req, res) => {
    const session = req.session; // From authMiddleware
    const dkmhCookie = session.type === 'dkmh' ? session.cookie : session.dkmhCookie;

    if (!dkmhCookie) {
        return res.status(401).json({ error: 'DKMH session not found. Please login to DKMH first.' });
    }

    const { url, method = 'GET', body } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    console.log(`[DKMH Proxy] ${method} ${maskUrl(url)}`);

    try {
        const options = {
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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

        const response = await nodeFetch(url, options);
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            res.json(data);
        } else {
            const text = await response.text();
            res.send(text);
        }
    } catch (e) {
        console.error('[DKMH Proxy] Error:', e);
        res.status(500).json({ error: e.message });
    }
};

export const getRegistrationPeriods = async (req, res) => {
    const session = req.session;
    const dkmhCookie = session.dkmhCookie;

    if (!dkmhCookie) {
        return res.status(401).json({ error: 'DKMH session not found', dkmhLoggedIn: false });
    }

    console.log('[DKMH] Fetching registration periods...');
    try {
        const response = await nodeFetch(config.urls.dkmhInfo.formUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': dkmhCookie,
                'Referer': config.urls.dkmhInfo.homeUrl,
                'Accept': 'text/html,application/xhtml+xml'
            }
        });

        const html = await response.text();

        // Use parsing logic from index.js (embedded here for simplicity as it wasn't in parser utils)
        // Wait, I should have put this in parser utils but I missed some.
        // Let's implement quick regex here or move to parser later?
        // Let's implement here for now.
        const rowRegex = /<tr[^>]*onclick="ketQuaDangKyView\((\d+)[^"]*"[^>]*>\s*<td>(\d+)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([^<]+)<\/td>\s*<td>([^<]+)<\/td>/g;
        const periods = [];
        let match;
        while ((match = rowRegex.exec(html)) !== null) {
            const startTime = match[5].trim();
            const endTime = match[6].trim();
            const now = new Date();
            const start = parser.parseVietnameseDate(startTime);
            const end = parser.parseVietnameseDate(endTime);

            let status = 'upcoming';
            if (now >= start && now <= end) status = 'open';
            else if (now > end) status = 'closed';

            periods.push({
                id: parseInt(match[1]),
                stt: parseInt(match[2]),
                code: match[3].trim(),
                description: match[4].replace(/<[^>]+>/g, '').trim(),
                startTime, endTime,
                start: start?.toISOString(),
                end: end?.toISOString(),
                status,
                hasResult: match[4].toLowerCase().includes('kết quả')
            });
        }

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
        // Setup Jar (similar to index.js logic)
        const { CookieJar } = await import('tough-cookie');
        const fetchCookieModule = await import('fetch-cookie');
        const fetchCookie = fetchCookieModule.default;

        const jar = new CookieJar();
        const fetch = fetchCookie(nodeFetch, jar);

        const cookieParts = dkmhCookie.split('; ');
        for (const part of cookieParts) {
            try { await jar.setCookie(part, 'https://mybk.hcmut.edu.vn'); } catch { }
        }

        const baseHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
        const dotDKMatch = dotDKHtml.match(/getLichDangKyByDotDKId\s*\(\s*this\s*,\s*(\d+)\s*,\s*(\d+)/);
        const dotDKHocVienId = dotDKMatch ? dotDKMatch[1] : periodId;
        const dotDKId = dotDKMatch ? dotDKMatch[2] : periodId;

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
                courses: parser.parsePeriodDetailsHtml(ketQuaHtml).courses,
                schedule: parser.parseScheduleHtml(lichHtml),
                periodId, dotDKId
            }
        });

    } catch (e) {
        console.error(e);
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

        const response = await fetch('https://mybk.hcmut.edu.vn/dkmh/searchMonHocDangKy.action', {
            method: 'POST', body: `msmh=${encodeURIComponent(query)}`, headers: baseHeaders
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

export const register = async (req, res) => {
    const { periodId, nlmhId, monHocId, forceMode } = req.body;
    const jarKey = `${req.token}_${periodId}`;
    const storedData = activePeriodJars.get(jarKey);

    if (!storedData) return res.status(400).json({ error: 'Session expired' });
    const { fetch, baseHeaders } = storedData;

    try {
        // Prime
        if (monHocId && !forceMode) {
            await fetch('https://mybk.hcmut.edu.vn/dkmh/getThongTinNhomLopMonHoc.action', {
                method: 'POST', body: `monHocId=${monHocId}`, headers: baseHeaders
            });
        }

        // Register
        const response = await fetch('https://mybk.hcmut.edu.vn/dkmh/dangKy.action', {
            method: 'POST', body: `NLMHId=${nlmhId}`, headers: baseHeaders
        });
        let text = await response.text();

        // Handle BOM
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

        let result = {};
        try { result = JSON.parse(text); } catch { }

        if (result.code === 'SUCCESS' || forceMode) {
            // Refresh list
            if (!forceMode) {
                await fetch('https://mybk.hcmut.edu.vn/dkmh/getKetQuaDangKy.action', {
                    method: 'POST', body: '', headers: baseHeaders
                });
            }
            return res.json({ success: true, message: result.msg || 'Sent', forceMode });
        }

        res.json({ success: false, error: result.msg || 'Failed', code: result.code });

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
        const response = await storedData.fetch('https://mybk.hcmut.edu.vn/dkmh/xoaKetQuaDangKy.action', {
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
