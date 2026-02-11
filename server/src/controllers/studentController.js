import nodeFetch from 'node-fetch';
import logger from '../utils/logger.js';
import config from '../../config/default.js';
import { swr } from '../services/redisService.js';
import { maskStudentId } from '../utils/masking.js';

// Helper to create proxy headers
const createProxyHeaders = (session) => {
    const headers = {
        'User-Agent': config.userAgent,
        'Accept': 'application/json',
        'Referer': 'https://mybk.hcmut.edu.vn/app/',
        'Origin': 'https://mybk.hcmut.edu.vn',
        'Cookie': session.cookie
    };
    if (session.jwtToken) headers['Authorization'] = session.jwtToken;
    return headers;
};

export const getStudentInfo = async (req, res) => {
    const session = req.session;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    logger.info('[API] Proxying get-student-info...');

    const fetchStudentInfo = async () => {
        const headers = createProxyHeaders(session);
        const response = await nodeFetch('https://mybk.hcmut.edu.vn/api/v1/student/get-student-info?null', { headers });
        const data = await response.json();
        // Validation check inside fetcher
        if (data.code && data.code !== 200 && data.code !== '200') {
            throw new Error(`MyBK Error: ${data.msg || data.code}`);
        }
        return data;
    };

    try {
        // Cache Key: INFO:{username}
        // TTL: 4 hours
        // Fresh: 5 minutes (Don't revalidate if updated < 5 mins ago)
        const key = `INFO:${session.username}`;
        const data = await swr(key, fetchStudentInfo, 14400, 300);

        if (data.code === "200" || data.code === 200 || !data.code) {
            session.user = data.data || data; // Update user info in session
        }
        res.json(data);
    } catch (e) {
        logger.error('[API] Error:', e);
        // The instruction specifies 502 for upstream errors, which aligns with fetcher throwing
        res.status(502).json({ error: 'Invalid response from upstream or MyBK API error' });
    }
};

export const getSchedule = async (req, res) => {
    const session = req.session;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { studentId, semesterYear } = req.query;
    logger.info(`[API] Proxying schedule for ${maskStudentId(studentId)}, sem ${semesterYear}...`);

    const fetchSchedule = async () => {
        const headers = createProxyHeaders(session);
        // Corrected URL based on common MyBK API patterns for schedule
        const url = `https://mybk.hcmut.edu.vn/api/v1/student/schedule?studentId=${studentId}&semesterYear=${semesterYear}&null`;
        const response = await nodeFetch(url, { headers });
        const data = await response.json();
        // Add basic validation for MyBK API response if needed, similar to getStudentInfo
        if (data.code && data.code !== 200 && data.code !== '200') {
            throw new Error(`MyBK Schedule Error: ${data.msg || data.code}`);
        }
        return data;
    };

    try {
        // Cache Key: SCHEDULE:{studentId}:{semesterYear}
        // TTL: 4 hours
        // Fresh: 1 minute (Aggressive updates allowed, but limit spam)
        const key = `SCHEDULE:${studentId}:${semesterYear}`;
        const data = await swr(key, fetchSchedule, 14400, 60);

        res.json(data);
    } catch (e) {
        logger.error('[API] Schedule Error:', e);
        res.status(500).json({ error: e.message });
    }
};

export const getExamSchedule = async (req, res) => {
    const session = req.session;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { studentId, namhoc, hocky } = req.query;
    logger.info(`[API] Proxying exam schedule for ${maskStudentId(studentId)}...`);

    try {
        const headers = createProxyHeaders(session);
        headers['Referer'] = 'https://mybk.hcmut.edu.vn/app/he-thong-quan-ly/sinh-vien/lich-thi';
        headers['Content-Type'] = 'application/json';

        const url = `https://mybk.hcmut.edu.vn/api/thoi-khoa-bieu/lich-thi-sinh-vien/v1?masv=${studentId}&namhoc=${namhoc}&hocky=${hocky}&null`;
        const response = await nodeFetch(url, { headers });
        const data = await response.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getGpaSummary = async (req, res) => {
    const session = req.session;
    const { studentId } = req.body;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const fetchGpaSummary = async () => {
        const headers = createProxyHeaders(session);
        headers['Content-Type'] = 'application/json';
        headers['Referer'] = 'https://mybk.hcmut.edu.vn/app/sinh-vien/ket-qua-hoc-tap/chuong-trinh-dao-tao';

        const url = 'https://mybk.hcmut.edu.vn/api/share/ket-qua-hoc-tap/thong-tin-mo-ta-ctdt/v2?tuychon=VIEWONLINE';
        const response = await nodeFetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(studentId)
        });
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            throw new Error('Invalid JSON from MyBK GPA');
        }
    };

    try {
        // Cache Key: GPA:{studentId}
        // TTL: 4 hours
        // Fresh: 15 minutes (Heavy calculation, rarely changes)
        const key = `GPA:${studentId}`;
        const data = await swr(key, fetchGpaSummary, 14400, 900);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// ==========================================
// RECOVERED MISSING ENDPOINTS
// ==========================================

export const getGpaDetail = async (req, res) => {
    const session = req.session;
    const { studentId, hocKyId } = req.body;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const headers = createProxyHeaders(session);
        headers['Content-Type'] = 'application/json';
        const url = 'https://mybk.hcmut.edu.vn/api/share/ket-qua-hoc-tap/danh-sach-mon-hoc-ctdt/v2';

        const response = await nodeFetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(studentId)
        });
        const data = await response.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// Legacy alias — delegates to getSchedule
export const getScheduleSimple = getSchedule;

export const getScheduleBySem = async (req, res) => { // /api/schedule/get-schedule-by-sem
    const session = req.session;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
    const { studentId, sem } = req.query;
    // Map 'sem' to 'semesterYear'? Or just pass through
    try {
        const headers = createProxyHeaders(session);
        const url = `https://mybk.hcmut.edu.vn/api/v1/student/schedule?studentId=${studentId}&semesterYear=${sem}&null`;
        const response = await nodeFetch(url, { headers });
        const data = await response.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getGpa = async (req, res) => {
    const session = req.session;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { studentId } = req.query;
    if (req.method === 'POST') return getGpaSummary(req, res);

    try {
        const headers = createProxyHeaders(session);
        headers['Content-Type'] = 'application/json';
        const url = 'https://mybk.hcmut.edu.vn/api/share/ket-qua-hoc-tap/thong-tin-mo-ta-ctdt/v2?tuychon=VIEWONLINE';
        const response = await nodeFetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(studentId)
        });
        const data = await response.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getTranscript = async (req, res) => { // /api/schedule/get-transcript
    const session = req.session;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { studentId, sem } = req.query;

    const fetchTranscript = async () => {
        const headers = createProxyHeaders(session);
        headers['Content-Type'] = 'application/json';
        const url = `https://mybk.hcmut.edu.vn/api/share/ket-qua-hoc-tap/bang-diem-hoc-ky/v2?masv=${studentId}&maHocKy=${sem}&tuychon=VIEWONLINE`;
        const response = await nodeFetch(url, { method: 'POST', headers, body: '' });
        return await response.json();
    };

    try {
        // Cache Key: TRANSCRIPT:{studentId}:{sem}
        // TTL: 4 hours
        // Fresh: 15 minutes
        const key = `TRANSCRIPT:${studentId}:${sem}`;
        const data = await swr(key, fetchTranscript, 14400, 900);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getTranscriptSummary = async (req, res) => { // /api/schedule/get-transcript-summary
    const session = req.session;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { studentId } = req.query;
    try {
        const headers = createProxyHeaders(session);
        headers['Content-Type'] = 'application/json';
        const url = 'https://mybk.hcmut.edu.vn/api/share/ket-qua-hoc-tap/diem-trung-binh-tich-luy/v2?tuychon=VIEWONLINE';
        const response = await nodeFetch(url, { method: 'POST', headers, body: JSON.stringify(studentId) });
        const data = await response.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getCourseList = async (req, res) => {
    const session = req.session;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const headers = createProxyHeaders(session);
        headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        const response = await nodeFetch('https://mybk.hcmut.edu.vn/dkmh/getDanhSachNhomHocVaLichThi.action', {
            method: 'POST',
            headers,
            body: 'dotDKId=' + (req.query.dotDKId || '')
        });
        const text = await response.text();
        res.send(text);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
