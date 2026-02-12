import nodeFetch from 'node-fetch';
import logger from '../utils/logger.js';
import config from '../../config/default.js';
import { swr } from '../services/redisService.js';
import { maskStudentId } from '../utils/masking.js';

// Default timeout for upstream API calls (prevent hanging)
const FETCH_TIMEOUT = 15000;

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
    logger.info('[API] Proxying get-student-info...');

    const fetchStudentInfo = async () => {
        const headers = createProxyHeaders(session);
        const response = await nodeFetch('https://mybk.hcmut.edu.vn/api/v1/student/get-student-info?null', {
            headers, signal: AbortSignal.timeout(FETCH_TIMEOUT)
        });
        const data = await response.json();
        if (data.code && data.code !== 200 && data.code !== '200') {
            throw new Error(`MyBK Error: ${data.msg || data.code}`);
        }
        return data;
    };

    try {
        const key = `INFO:${session.username}`;
        const data = await swr(key, fetchStudentInfo, 14400, 300);
        if (data.code === "200" || data.code === 200 || !data.code) {
            session.user = data.data || data;
        }
        res.json(data);
    } catch (e) {
        logger.error('[API] Error:', e);
        res.status(502).json({ error: 'Invalid response from upstream or MyBK API error' });
    }
};

export const getSchedule = async (req, res) => {
    const session = req.session;
    const { studentId, semesterYear } = req.query;
    logger.info(`[API] Proxying schedule for ${maskStudentId(studentId)}, sem ${semesterYear}...`);

    const fetchSchedule = async () => {
        const headers = createProxyHeaders(session);
        const url = `https://mybk.hcmut.edu.vn/api/v1/student/schedule?studentId=${studentId}&semesterYear=${semesterYear}&null`;
        const response = await nodeFetch(url, { headers, signal: AbortSignal.timeout(FETCH_TIMEOUT) });
        const data = await response.json();
        if (data.code && data.code !== 200 && data.code !== '200') {
            throw new Error(`MyBK Schedule Error: ${data.msg || data.code}`);
        }
        return data;
    };

    try {
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
    const { studentId, namhoc, hocky } = req.query;
    logger.info(`[API] Proxying exam schedule for ${maskStudentId(studentId)}...`);

    const fetchExamSchedule = async () => {
        const headers = createProxyHeaders(session);
        headers['Referer'] = 'https://mybk.hcmut.edu.vn/app/he-thong-quan-ly/sinh-vien/lich-thi';
        headers['Content-Type'] = 'application/json';
        const url = `https://mybk.hcmut.edu.vn/api/thoi-khoa-bieu/lich-thi-sinh-vien/v1?masv=${studentId}&namhoc=${namhoc}&hocky=${hocky}&null`;
        const response = await nodeFetch(url, { headers, signal: AbortSignal.timeout(FETCH_TIMEOUT) });
        return await response.json();
    };

    try {
        const key = `EXAM:${studentId}:${namhoc}:${hocky}`;
        const data = await swr(key, fetchExamSchedule, 14400, 900);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getGpaSummary = async (req, res) => {
    const session = req.session;
    const { studentId } = req.body;

    const fetchGpaSummary = async () => {
        const headers = createProxyHeaders(session);
        headers['Content-Type'] = 'application/json';
        headers['Referer'] = 'https://mybk.hcmut.edu.vn/app/sinh-vien/ket-qua-hoc-tap/chuong-trinh-dao-tao';
        const url = 'https://mybk.hcmut.edu.vn/api/share/ket-qua-hoc-tap/thong-tin-mo-ta-ctdt/v2?tuychon=VIEWONLINE';
        const response = await nodeFetch(url, {
            method: 'POST', headers, body: JSON.stringify(studentId),
            signal: AbortSignal.timeout(FETCH_TIMEOUT)
        });
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            throw new Error('Invalid JSON from MyBK GPA');
        }
    };

    try {
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
    const { studentId } = req.body;

    const fetchGpaDetail = async () => {
        const headers = createProxyHeaders(session);
        headers['Content-Type'] = 'application/json';
        const url = 'https://mybk.hcmut.edu.vn/api/share/ket-qua-hoc-tap/danh-sach-mon-hoc-ctdt/v2';
        const response = await nodeFetch(url, {
            method: 'POST', headers, body: JSON.stringify(studentId),
            signal: AbortSignal.timeout(FETCH_TIMEOUT)
        });
        return await response.json();
    };

    try {
        const key = `GPA_DETAIL:${studentId}`;
        const data = await swr(key, fetchGpaDetail, 14400, 900);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// Legacy aliases — delegate to existing handlers (with cache)
export const getScheduleSimple = getSchedule;

// getScheduleBySem delegates to getSchedule by mapping query params
export const getScheduleBySem = async (req, res) => {
    req.query.semesterYear = req.query.sem;
    return getSchedule(req, res);
};

// Legacy alias — delegates to getGpaSummary
export const getGpa = async (req, res) => {
    req.body.studentId = req.body.studentId || req.query.studentId;
    return getGpaSummary(req, res);
};

export const getTranscript = async (req, res) => {
    const session = req.session;
    const { studentId, sem } = req.query;

    const fetchTranscript = async () => {
        const headers = createProxyHeaders(session);
        headers['Content-Type'] = 'application/json';
        const url = `https://mybk.hcmut.edu.vn/api/share/ket-qua-hoc-tap/bang-diem-hoc-ky/v2?masv=${studentId}&maHocKy=${sem}&tuychon=VIEWONLINE`;
        const response = await nodeFetch(url, {
            method: 'POST', headers, body: '',
            signal: AbortSignal.timeout(FETCH_TIMEOUT)
        });
        return await response.json();
    };

    try {
        const key = `TRANSCRIPT:${studentId}:${sem}`;
        const data = await swr(key, fetchTranscript, 14400, 900);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getTranscriptSummary = async (req, res) => {
    const session = req.session;
    const { studentId } = req.query;

    const fetchTranscriptSummary = async () => {
        const headers = createProxyHeaders(session);
        headers['Content-Type'] = 'application/json';
        const url = 'https://mybk.hcmut.edu.vn/api/share/ket-qua-hoc-tap/diem-trung-binh-tich-luy/v2?tuychon=VIEWONLINE';
        const response = await nodeFetch(url, {
            method: 'POST', headers, body: JSON.stringify(studentId),
            signal: AbortSignal.timeout(FETCH_TIMEOUT)
        });
        return await response.json();
    };

    try {
        const key = `TRANSCRIPT_SUMMARY:${studentId}`;
        const data = await swr(key, fetchTranscriptSummary, 14400, 900);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getCourseList = async (req, res) => {
    const session = req.session;
    try {
        const headers = createProxyHeaders(session);
        headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        const response = await nodeFetch('https://mybk.hcmut.edu.vn/dkmh/getDanhSachNhomHocVaLichThi.action', {
            method: 'POST', headers,
            body: 'dotDKId=' + (req.query.dotDKId || ''),
            signal: AbortSignal.timeout(FETCH_TIMEOUT)
        });
        const text = await response.text();
        res.send(text);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
