import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const redisData = new Map();
const mockClient = {
    isOpen: true,
    get: jest.fn(),
    set: jest.fn()
};

jest.unstable_mockModule('../../src/services/redisService.js', () => ({
    getClient: jest.fn(() => mockClient),
    trackCommand: jest.fn()
}));

const store = await import('../../src/services/registrationSchedulerStore.js');

describe('registrationSchedulerStore', () => {
    beforeEach(() => {
        redisData.clear();
        mockClient.get.mockImplementation(async (key) => redisData.get(key) || null);
        mockClient.set.mockImplementation(async (key, value) => {
            redisData.set(key, value);
        });
        store.setSchedulerStoreClient(mockClient);
    });

    it('should save and list sanitized jobs for the current owner', async () => {
        const aliceSession = { username: 'alice' };
        const bobSession = { username: 'bob' };

        const saved = await store.saveJob(aliceSession, {
            templateId: 'template-1',
            periodId: '686',
            runAt: '2026-06-02T10:00:00.000Z',
            encryptedCookie: 'secret-cookie'
        });

        expect(saved.id).toEqual(expect.any(String));
        expect(saved.ownerKey).toBe('alice');
        expect(await store.listJobs(aliceSession)).toEqual([expect.not.objectContaining({ encryptedCookie: expect.any(String) })]);
        expect(await store.listJobs(bobSession)).toEqual([]);
    });

    it('should list due scheduled jobs with encrypted cookies for the scheduler', async () => {
        await store.saveJob({ username: 'alice' }, {
            templateId: 'template-1',
            periodId: '686',
            runAt: '2026-06-02T10:00:00.000Z',
            status: 'scheduled',
            encryptedCookie: 'secret-cookie'
        });
        await store.saveJob({ username: 'bob' }, {
            templateId: 'template-2',
            periodId: '686',
            runAt: '2026-06-02T10:05:00.000Z',
            status: 'scheduled',
            encryptedCookie: 'future-cookie'
        });

        const dueJobs = await store.listDueJobs(new Date('2026-06-02T10:00:01.000Z'));

        expect(dueJobs).toHaveLength(1);
        expect(dueJobs[0]).toEqual(expect.objectContaining({ ownerKey: 'alice', encryptedCookie: 'secret-cookie' }));
    });

    it('should cancel a job for the current owner', async () => {
        const session = { username: 'alice' };
        const saved = await store.saveJob(session, {
            templateId: 'template-1',
            periodId: '686',
            runAt: '2026-06-02T10:00:00.000Z',
            encryptedCookie: 'secret-cookie'
        });

        const cancelled = await store.cancelJob(session, saved.id);
        const jobs = await store.listJobs(session);

        expect(cancelled.status).toBe('cancelled');
        expect(jobs[0].status).toBe('cancelled');
        expect(jobs[0]).not.toHaveProperty('encryptedCookie');
    });

    it('should delete a job for the current owner', async () => {
        const aliceJob = await store.saveJob({ username: 'alice' }, {
            templateId: 'template-1',
            periodId: '686',
            runAt: '2026-06-02T10:00:00.000Z',
            encryptedCookie: 'secret-cookie'
        });
        await store.saveJob({ username: 'bob' }, {
            templateId: 'template-2',
            periodId: '686',
            runAt: '2026-06-02T10:00:00.000Z',
            encryptedCookie: 'other-cookie'
        });

        const deleted = await store.deleteJob({ username: 'alice' }, aliceJob.id);

        expect(deleted).toBe(true);
        expect(await store.listJobs({ username: 'alice' })).toEqual([]);
        expect(await store.listJobs({ username: 'bob' })).toHaveLength(1);
    });
});
