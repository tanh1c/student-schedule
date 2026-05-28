import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockFetch = jest.fn();
const templates = new Map();

jest.unstable_mockModule('../../src/services/sessionStore', () => ({
    activePeriodJars: new Map()
}));

jest.unstable_mockModule('../../src/services/registrationTemplateStore', () => ({
    listTemplates: jest.fn(async () => [...templates.values()]),
    getTemplate: jest.fn(async (_session, templateId) => templates.get(templateId) || null),
    saveTemplate: jest.fn(async (_session, template) => {
        const saved = {
            id: template.id || 'template-1',
            ownerKey: 'alice',
            createdAt: template.createdAt || 1000,
            updatedAt: 2000,
            ...template
        };
        templates.set(saved.id, saved);
        return saved;
    }),
    deleteTemplate: jest.fn(async (_session, templateId) => templates.delete(templateId))
}));

jest.unstable_mockModule('../../src/services/dkmhParser', () => ({
    parsePeriodDetailsHtml: jest.fn(() => ({ courses: [], totalCredits: 0, totalCourses: 0 }))
}));

jest.unstable_mockModule('../../src/utils/logger', () => ({
    default: {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn()
    }
}));

const { activePeriodJars } = await import('../../src/services/sessionStore');
const parser = await import('../../src/services/dkmhParser');
const store = await import('../../src/services/registrationTemplateStore');
const controller = await import('../../src/controllers/registrationTemplateController');

describe('registrationTemplateController', () => {
    let req;
    let res;

    beforeEach(() => {
        templates.clear();
        activePeriodJars.clear();
        mockFetch.mockReset();
        store.listTemplates.mockImplementation(async () => [...templates.values()]);
        store.getTemplate.mockImplementation(async (_session, templateId) => templates.get(templateId) || null);
        store.saveTemplate.mockImplementation(async (_session, template) => {
            const saved = {
                id: template.id || 'template-1',
                ownerKey: 'alice',
                createdAt: template.createdAt || 1000,
                updatedAt: 2000,
                ...template
            };
            templates.set(saved.id, saved);
            return saved;
        });
        store.deleteTemplate.mockImplementation(async (_session, templateId) => templates.delete(templateId));
        parser.parsePeriodDetailsHtml.mockReturnValue({ courses: [], totalCredits: 0, totalCourses: 0 });

        req = {
            token: 'token-123',
            session: { username: 'alice' },
            params: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('should list templates for the authenticated user', async () => {
        templates.set('template-1', { id: 'template-1', name: 'D2', courses: [] });

        await controller.listTemplates(req, res);

        expect(store.listTemplates).toHaveBeenCalledWith(req.session);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 'template-1', name: 'D2', courses: [] }] });
    });

    it('should save a template for the authenticated user', async () => {
        req.body = { periodId: '686', name: 'D2', courses: [] };

        await controller.upsertTemplate(req, res);

        expect(store.saveTemplate).toHaveBeenCalledWith(req.session, req.body);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: expect.objectContaining({ id: 'template-1', name: 'D2' })
        });
    });

    it('should delete a template for the authenticated user', async () => {
        templates.set('template-1', { id: 'template-1', name: 'D2', courses: [] });
        req.params = { templateId: 'template-1' };

        await controller.deleteTemplate(req, res);

        expect(store.deleteTemplate).toHaveBeenCalledWith(req.session, 'template-1');
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should run template priorities, fallback after ERROR, and stop after evidence success', async () => {
        templates.set('template-1', {
            id: 'template-1',
            periodId: '686',
            courses: [{
                code: 'CO3005',
                monHocId: '14425',
                priority: [
                    { nlmhId: 'bad-id', groupCode: 'DT01' },
                    { nlmhId: 'good-id', groupCode: 'DTQ1' }
                ]
            }]
        });
        req.params = { templateId: 'template-1' };
        req.body = { periodId: '686' };
        activePeriodJars.set('token-123_686', {
            fetch: mockFetch,
            baseHeaders: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
        });
        mockFetch
            .mockResolvedValueOnce({ text: jest.fn().mockResolvedValue('') })
            .mockResolvedValueOnce({ text: jest.fn().mockResolvedValue('{"code":"ERROR","msg":"Quá sĩ số"}') })
            .mockResolvedValueOnce({ text: jest.fn().mockResolvedValue('') })
            .mockResolvedValueOnce({ text: jest.fn().mockResolvedValue('{"code":"SUCCESS","msg":"Đăng ký thành công"}') })
            .mockResolvedValueOnce({ text: jest.fn().mockResolvedValue('<html>after success</html>') });
        parser.parsePeriodDetailsHtml.mockReturnValue({
            courses: [{ code: 'CO3005', group: 'DTQ1', ketquaId: 'kq-1' }],
            totalCredits: 3,
            totalCourses: 1
        });

        await controller.runTemplate(req, res);

        expect(mockFetch).toHaveBeenNthCalledWith(2, 'https://mybk.hcmut.edu.vn/dkmh/dangKy.action', expect.objectContaining({ body: 'NLMHId=bad-id' }));
        expect(mockFetch).toHaveBeenNthCalledWith(4, 'https://mybk.hcmut.edu.vn/dkmh/dangKy.action', expect.objectContaining({ body: 'NLMHId=good-id' }));
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            summary: { success: 1, draft: 0, failed: 0 },
            runLog: [
                expect.objectContaining({ status: 'error', nlmhId: 'bad-id', message: 'Quá sĩ số' }),
                expect.objectContaining({ status: 'success', nlmhId: 'good-id', message: 'Đăng ký thành công' })
            ],
            registrationResult: { courses: [{ code: 'CO3005', group: 'DTQ1', ketquaId: 'kq-1' }], totalCredits: 3, totalCourses: 1 }
        });
    });

    it('should mark NOTICE attempts as draft', async () => {
        templates.set('template-1', {
            id: 'template-1',
            periodId: '685',
            courses: [{ code: 'CO3005', priority: [{ nlmhId: 'draft-id', groupCode: 'D1' }] }]
        });
        req.params = { templateId: 'template-1' };
        req.body = { periodId: '685' };
        activePeriodJars.set('token-123_685', {
            fetch: mockFetch,
            baseHeaders: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
        });
        mockFetch
            .mockResolvedValueOnce({ text: jest.fn().mockResolvedValue('{"code":"NOTICE","msg":"Bạn chưa đến hạn đăng ký"}') })
            .mockResolvedValueOnce({ text: jest.fn().mockResolvedValue('<html>draft</html>') });
        parser.parsePeriodDetailsHtml.mockReturnValue({ courses: [{ code: 'CO3005', ketquaId: 'draft-1' }], totalCredits: 3, totalCourses: 1 });

        await controller.runTemplate(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            summary: { success: 0, draft: 1, failed: 0 },
            runLog: [expect.objectContaining({ status: 'draft', draft: true, nlmhId: 'draft-id' })],
            registrationResult: { courses: [{ code: 'CO3005', ketquaId: 'draft-1' }], totalCredits: 3, totalCourses: 1 }
        });
    });
});
