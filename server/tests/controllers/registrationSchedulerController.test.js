import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const jobs = new Map();

jest.unstable_mockModule('../../src/services/registrationSchedulerStore.js', () => ({
    listJobs: jest.fn(async () => [...jobs.values()].map(({ encryptedCookie: _cookie, ...job }) => job)),
    saveJob: jest.fn(async (_session, job) => {
        const saved = { id: job.id || 'job-1', ownerKey: 'alice', status: 'scheduled', attempts: [], ...job };
        jobs.set(saved.id, saved);
        return saved;
    }),
    cancelJob: jest.fn(async (_session, jobId) => {
        const job = jobs.get(jobId);
        if (!job) return null;
        const cancelled = { ...job, status: 'cancelled', encryptedCookie: undefined };
        jobs.set(jobId, cancelled);
        return cancelled;
    }),
    deleteJob: jest.fn(async (_session, jobId) => jobs.delete(jobId))
}));

jest.unstable_mockModule('../../src/services/registrationCookieCrypto.js', () => ({
    encryptCookie: jest.fn((cookie) => `encrypted:${cookie}`),
    decryptCookie: jest.fn((payload) => payload.replace('encrypted:', ''))
}));

jest.unstable_mockModule('../../src/services/registrationScheduler.js', () => ({
    runDueScheduledJobs: jest.fn(async () => ({ checked: 1, ran: 1 }))
}));

const store = await import('../../src/services/registrationSchedulerStore.js');
const crypto = await import('../../src/services/registrationCookieCrypto.js');
const scheduler = await import('../../src/services/registrationScheduler.js');
const controller = await import('../../src/controllers/registrationSchedulerController.js');

describe('registrationSchedulerController', () => {
    let req;
    let res;

    beforeEach(() => {
        jobs.clear();
        crypto.encryptCookie.mockImplementation((cookie) => `encrypted:${cookie}`);
        store.listJobs.mockImplementation(async () => [...jobs.values()].map(({ encryptedCookie: _cookie, ...job }) => job));
        store.saveJob.mockImplementation(async (_session, job) => {
            const saved = { id: job.id || 'job-1', ownerKey: 'alice', status: 'scheduled', attempts: [], ...job };
            jobs.set(saved.id, saved);
            return saved;
        });
        store.cancelJob.mockImplementation(async (_session, jobId) => {
            const job = jobs.get(jobId);
            if (!job) return null;
            const cancelled = { ...job, status: 'cancelled', encryptedCookie: undefined };
            jobs.set(jobId, cancelled);
            return cancelled;
        });
        store.deleteJob.mockImplementation(async (_session, jobId) => jobs.delete(jobId));
        scheduler.runDueScheduledJobs.mockResolvedValue({ checked: 1, ran: 1 });
        req = {
            session: { username: 'alice', dkmhCookie: 'JSESSIONID=abc' },
            body: {
                templateId: 'template-1',
                periodId: '686',
                periodCode: 'HK253_D2',
                runAt: '2026-06-02T10:00:00.000Z',
                retryCount: 3,
                retryDelaySeconds: 10
            },
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('should create a scheduled job with encrypted DKMH cookie and sanitized response', async () => {
        await controller.createScheduledJob(req, res);

        expect(crypto.encryptCookie).toHaveBeenCalledWith('JSESSIONID=abc');
        expect(store.saveJob).toHaveBeenCalledWith(req.session, expect.objectContaining({ encryptedCookie: 'encrypted:JSESSIONID=abc' }));
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: expect.not.objectContaining({ encryptedCookie: expect.any(String) })
        });
    });

    it('should reject job creation without a DKMH cookie', async () => {
        req.session = { username: 'alice' };

        await controller.createScheduledJob(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Cần đăng nhập DKMH trước khi lên lịch' });
    });

    it('should list sanitized jobs', async () => {
        jobs.set('job-1', { id: 'job-1', ownerKey: 'alice', encryptedCookie: 'secret', status: 'scheduled' });

        await controller.listScheduledJobs(req, res);

        expect(res.json).toHaveBeenCalledWith({ success: true, data: [expect.not.objectContaining({ encryptedCookie: expect.any(String) })] });
    });

    it('should cancel a scheduled job', async () => {
        jobs.set('job-1', { id: 'job-1', ownerKey: 'alice', encryptedCookie: 'secret', status: 'scheduled' });
        req.params = { jobId: 'job-1' };

        await controller.cancelScheduledJob(req, res);

        expect(res.json).toHaveBeenCalledWith({ success: true, data: expect.objectContaining({ status: 'cancelled' }) });
    });

    it('should delete a finished scheduled job', async () => {
        jobs.set('job-1', { id: 'job-1', ownerKey: 'alice', status: 'success' });
        req.params = { jobId: 'job-1' };

        await controller.deleteScheduledJob(req, res);

        expect(store.deleteJob).toHaveBeenCalledWith(req.session, 'job-1');
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should expose a run-due endpoint', async () => {
        await controller.runDueScheduledJobsEndpoint(req, res);

        expect(scheduler.runDueScheduledJobs).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ success: true, data: { checked: 1, ran: 1 } });
    });
});
