import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockFetch = jest.fn();

jest.unstable_mockModule('../../src/services/sessionStore.js', () => ({
    activePeriodJars: new Map()
}));

jest.unstable_mockModule('../../src/services/dkmhParser.js', () => ({
    parseSearchResultsHtml: jest.fn(() => []),
    parsePeriodDetailsHtml: jest.fn(() => ({ courses: [], totalCredits: 0, totalCourses: 0 }))
}));

jest.unstable_mockModule('../../src/utils/logger.js', () => ({
    default: {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn()
    }
}));

jest.unstable_mockModule('node-fetch', () => ({
    default: jest.fn()
}));

jest.unstable_mockModule('fetch-cookie', () => ({
    default: jest.fn()
}));

const { activePeriodJars } = await import('../../src/services/sessionStore.js');
const parser = await import('../../src/services/dkmhParser.js');
const dkmhController = await import('../../src/controllers/dkmhController.js');

describe('dkmhController', () => {
    let req;
    let res;

    beforeEach(() => {
        activePeriodJars.clear();
        mockFetch.mockReset();
        mockFetch.mockResolvedValue({ text: jest.fn().mockResolvedValue('') });
        parser.parseSearchResultsHtml.mockReturnValue([]);

        req = {
            token: 'token-123',
            body: { periodId: 'period-1', query: ' ' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        activePeriodJars.set('token-123_period-1', {
            fetch: mockFetch,
            baseHeaders: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
        });
    });

    describe('searchCourses', () => {
        it('should preserve a single-space query when searching all courses', async () => {
            await dkmhController.searchCourses(req, res);

            expect(mockFetch).toHaveBeenLastCalledWith(
                'https://mybk.hcmut.edu.vn/dkmh/searchMonHocDangKy.action',
                expect.objectContaining({
                    method: 'POST',
                    body: 'msmh=+'
                })
            );
            expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
        });
    });

    describe('register', () => {
        it('should return draft evidence for NOTICE registrations', async () => {
            const registrationResult = {
                courses: [{ code: 'CO3005', ketquaId: 'draft-1' }],
                totalCredits: 3,
                totalCourses: 1
            };
            req.body = {
                periodId: 'period-1',
                nlmhId: 'nlmh-1',
                monHocId: 'monhoc-1'
            };
            mockFetch
                .mockResolvedValueOnce({ text: jest.fn().mockResolvedValue('') })
                .mockResolvedValueOnce({ text: jest.fn().mockResolvedValue('{"code":"NOTICE","msg":"Bạn chưa đến hạn đăng ký"}') })
                .mockResolvedValueOnce({ text: jest.fn().mockResolvedValue('<html>draft result</html>') });
            parser.parsePeriodDetailsHtml.mockReturnValue(registrationResult);

            await dkmhController.register(req, res);

            expect(mockFetch).toHaveBeenNthCalledWith(
                1,
                'https://mybk.hcmut.edu.vn/dkmh/getThongTinNhomLopMonHoc.action',
                expect.objectContaining({ method: 'POST', body: 'monHocId=monhoc-1' })
            );
            expect(mockFetch).toHaveBeenNthCalledWith(
                2,
                'https://mybk.hcmut.edu.vn/dkmh/dangKy.action',
                expect.objectContaining({ method: 'POST', body: 'NLMHId=nlmh-1' })
            );
            expect(mockFetch).toHaveBeenNthCalledWith(
                3,
                'https://mybk.hcmut.edu.vn/dkmh/getKetQuaDangKy.action',
                expect.objectContaining({ method: 'POST', body: '' })
            );
            expect(parser.parsePeriodDetailsHtml).toHaveBeenCalledWith('<html>draft result</html>');
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                draft: true,
                message: 'Bạn chưa đến hạn đăng ký',
                code: 'NOTICE',
                forceMode: undefined,
                registrationResult
            });
        });

        it('should return refreshed registration evidence for force registrations', async () => {
            const registrationResult = {
                courses: [{ code: 'CO3005', ketquaId: 'ketqua-1' }],
                totalCredits: 3,
                totalCourses: 1
            };
            req.body = {
                periodId: 'period-1',
                nlmhId: 'nlmh-1',
                monHocId: 'monhoc-1',
                forceMode: true
            };
            mockFetch
                .mockResolvedValueOnce({ text: jest.fn().mockResolvedValue('{"code":"ERROR","msg":"Lớp đã đầy"}') })
                .mockResolvedValueOnce({ text: jest.fn().mockResolvedValue('<html>registration result</html>') });
            parser.parsePeriodDetailsHtml.mockReturnValue(registrationResult);

            await dkmhController.register(req, res);

            expect(mockFetch).toHaveBeenNthCalledWith(
                1,
                'https://mybk.hcmut.edu.vn/dkmh/dangKy.action',
                expect.objectContaining({
                    method: 'POST',
                    body: 'NLMHId=nlmh-1'
                })
            );
            expect(mockFetch).toHaveBeenNthCalledWith(
                2,
                'https://mybk.hcmut.edu.vn/dkmh/getKetQuaDangKy.action',
                expect.objectContaining({ method: 'POST', body: '' })
            );
            expect(parser.parsePeriodDetailsHtml).toHaveBeenCalledWith('<html>registration result</html>');
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Lớp đã đầy',
                code: 'ERROR',
                forceMode: true,
                registrationResult
            });
        });
    });
});
