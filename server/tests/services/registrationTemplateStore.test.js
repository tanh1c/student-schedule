import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const redisData = new Map();
const mockClient = {
    isOpen: true,
    get: jest.fn(async (key) => redisData.get(key) || null),
    set: jest.fn(async (key, value) => {
        redisData.set(key, value);
    })
};

const redisMock = {
    getClient: jest.fn(() => mockClient),
    trackCommand: jest.fn()
};

jest.unstable_mockModule('../../src/services/redisService.js', () => redisMock);
jest.unstable_mockModule('../../src/services/redisService', () => redisMock);

const store = await import('../../src/services/registrationTemplateStore.js');

describe('registrationTemplateStore', () => {
    beforeEach(() => {
        redisData.clear();
        mockClient.get.mockImplementation(async (key) => redisData.get(key) || null);
        mockClient.set.mockImplementation(async (key, value) => {
            redisData.set(key, value);
        });
        store.setTemplateStoreClient(mockClient);
    });

    it('should save and list templates scoped by owner', async () => {
        const aliceSession = { username: 'alice' };
        const bobSession = { username: 'bob' };

        const saved = await store.saveTemplate(aliceSession, {
            periodId: '686',
            periodCode: 'HK253_D2',
            name: 'D2 template',
            courses: [{ code: 'CO3005', priority: [{ nlmhId: '1644594' }] }]
        });

        expect(saved.id).toEqual(expect.any(String));
        expect(saved.ownerKey).toBe('alice');
        expect(await store.listTemplates(aliceSession)).toEqual([saved]);
        expect(await store.listTemplates(bobSession)).toEqual([]);
    });

    it('should update an existing template without duplicating it', async () => {
        const session = { username: 'alice' };
        const saved = await store.saveTemplate(session, {
            periodId: '686',
            name: 'Initial',
            courses: []
        });

        const updated = await store.saveTemplate(session, {
            ...saved,
            name: 'Updated',
            courses: [{ code: 'CO3005', priority: [] }]
        });

        const templates = await store.listTemplates(session);
        expect(templates).toHaveLength(1);
        expect(updated.id).toBe(saved.id);
        expect(templates[0].name).toBe('Updated');
        expect(templates[0].courses).toEqual([{ code: 'CO3005', priority: [] }]);
    });

    it('should delete a template for the current owner only', async () => {
        const aliceSession = { username: 'alice' };
        const bobSession = { username: 'bob' };
        const aliceTemplate = await store.saveTemplate(aliceSession, { periodId: '686', name: 'Alice', courses: [] });
        const bobTemplate = await store.saveTemplate(bobSession, { periodId: '686', name: 'Bob', courses: [] });

        const deleted = await store.deleteTemplate(aliceSession, aliceTemplate.id);

        expect(deleted).toBe(true);
        expect(await store.listTemplates(aliceSession)).toEqual([]);
        expect(await store.listTemplates(bobSession)).toEqual([bobTemplate]);
    });
});
