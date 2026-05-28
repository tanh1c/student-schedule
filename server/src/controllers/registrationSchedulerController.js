import { encryptCookie } from '../services/registrationCookieCrypto.js';
import { cancelJob, deleteJob, listJobs, saveJob } from '../services/registrationSchedulerStore.js';
import { runDueScheduledJobs } from '../services/registrationScheduler.js';

function getDkmhCookie(session) {
    return session?.dkmhCookie || session?.cookie;
}

function sanitizeJob(job) {
    const { encryptedCookie: _encryptedCookie, ...safeJob } = job;
    return safeJob;
}

export const listScheduledJobs = async (req, res) => {
    try {
        const jobs = await listJobs(req.session);
        res.json({ success: true, data: jobs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createScheduledJob = async (req, res) => {
    const cookie = getDkmhCookie(req.session);
    if (!cookie) return res.status(400).json({ error: 'Cần đăng nhập DKMH trước khi lên lịch' });

    try {
        const job = await saveJob(req.session, {
            templateId: req.body.templateId,
            periodId: req.body.periodId,
            periodCode: req.body.periodCode,
            runAt: req.body.runAt,
            retryCount: req.body.retryCount ?? 3,
            retryDelaySeconds: req.body.retryDelaySeconds ?? 10,
            status: 'scheduled',
            encryptedCookie: encryptCookie(cookie),
            attempts: []
        });
        res.json({ success: true, data: sanitizeJob(job) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const cancelScheduledJob = async (req, res) => {
    try {
        const job = await cancelJob(req.session, req.params.jobId);
        if (!job) return res.status(404).json({ error: 'Scheduled job not found' });
        res.json({ success: true, data: sanitizeJob(job) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteScheduledJob = async (req, res) => {
    try {
        const deleted = await deleteJob(req.session, req.params.jobId);
        if (!deleted) return res.status(404).json({ error: 'Scheduled job not found' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const runDueScheduledJobsEndpoint = async (_req, res) => {
    try {
        const result = await runDueScheduledJobs();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
