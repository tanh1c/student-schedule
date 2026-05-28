import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const jobs = new Map();
const templates = new Map();
const mockFetch = jest.fn();

jest.unstable_mockModule('../../src/services/registrationSchedulerStore.js', () => ({
    listDueJobs: jest.fn(async () => [...jobs.values()].filter((job) => job.status === 'scheduled')),
    saveRawJob: jest.fn(async (job) => {
        jobs.set(job.id, job);
        return job;
    })
}));

jest.unstable_mockModule('../../src/services/registrationTemplateStore.js', () => ({
    getTemplateByOwner: jest.fn(async (ownerKey, templateId) => templates.get(`${ownerKey}:${templateId}`) || null)
}));

jest.unstable_mockModule('../../src/services/registrationCookieCrypto.js', () => ({
    decryptCookie: jest.fn(() => 'JSESSIONID=abc')
}));

jest.unstable_mockModule('../../src/controllers/registrationTemplateController.js', () => ({
    runTemplateCourses: jest.fn()
}));

jest.unstable_mockModule('fetch-cookie', () => ({
    default: jest.fn(() => mockFetch)
}));

jest.unstable_mockModule('node-fetch', () => ({
    default: jest.fn()
}));

jest.unstable_mockModule('../../src/utils/logger.js', () => ({
    default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() }
}));

const store = await import('../../src/services/registrationSchedulerStore.js');
const templateStore = await import('../../src/services/registrationTemplateStore.js');
const cookieCrypto = await import('../../src/services/registrationCookieCrypto.js');
const templateController = await import('../../src/controllers/registrationTemplateController.js');
const scheduler = await import('../../src/services/registrationScheduler.js');

describe('registrationScheduler', () => {
    beforeEach(() => {
        jobs.clear();
        templates.clear();
        mockFetch.mockReset();
        store.listDueJobs.mockImplementation(async () => [...jobs.values()].filter((job) => job.status === 'scheduled'));
        store.saveRawJob.mockImplementation(async (job) => {
            jobs.set(job.id, job);
            return job;
        });
        templateStore.getTemplateByOwner.mockImplementation(async (ownerKey, templateId) => templates.get(`${ownerKey}:${templateId}`) || null);
        cookieCrypto.decryptCookie.mockReturnValue('JSESSIONID=abc');
        templateController.runTemplateCourses.mockReset();
    });

    it('should run a due job with decrypted cookie-backed stored data', async () => {
        jobs.set('job-1', {
            id: 'job-1',
            ownerKey: 'alice',
            templateId: 'template-1',
            periodId: '686',
            runAt: '2026-06-02T10:00:00.000Z',
            retryCount: 0,
            retryDelaySeconds: 10,
            status: 'scheduled',
            encryptedCookie: 'encrypted-cookie',
            attempts: []
        });
        templates.set('alice:template-1', { id: 'template-1', courses: [] });
        templateController.runTemplateCourses.mockResolvedValue({
            summary: { success: 1, draft: 0, failed: 0 },
            runLog: [{ status: 'success' }],
            registrationResult: { courses: [{ code: 'CO3005' }] }
        });

        const result = await scheduler.runDueScheduledJobs(new Date('2026-06-02T10:00:01.000Z'));

        expect(templateStore.getTemplateByOwner).toHaveBeenCalledWith('alice', 'template-1');
        expect(templateController.runTemplateCourses).toHaveBeenCalledWith(
            { id: 'template-1', courses: [] },
            expect.objectContaining({ baseHeaders: expect.objectContaining({ Cookie: 'JSESSIONID=abc' }) })
        );
        expect(store.saveRawJob).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'success', encryptedCookie: undefined }));
        expect(result).toEqual({ checked: 1, ran: 1 });
    });

    it('should retry failed jobs within the configured bound', async () => {
        jobs.set('job-1', {
            id: 'job-1',
            ownerKey: 'alice',
            templateId: 'template-1',
            periodId: '686',
            runAt: '2026-06-02T10:00:00.000Z',
            retryCount: 1,
            retryDelaySeconds: 10,
            status: 'scheduled',
            encryptedCookie: 'encrypted-cookie',
            attempts: []
        });
        templates.set('alice:template-1', { id: 'template-1', courses: [] });
        templateController.runTemplateCourses.mockResolvedValue({
            summary: { success: 0, draft: 0, failed: 1 },
            runLog: [{ status: 'error' }],
            registrationResult: null
        });

        await scheduler.runDueScheduledJobs(new Date('2026-06-02T10:00:01.000Z'));

        expect(templateController.runTemplateCourses).toHaveBeenCalledTimes(2);
        expect(store.saveRawJob).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'failed', encryptedCookie: undefined }));
    });
});
