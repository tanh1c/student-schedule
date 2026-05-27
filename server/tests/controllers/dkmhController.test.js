import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockFetch = jest.fn();

jest.unstable_mockModule('../../src/services/sessionStore.js', () => ({
    activePeriodJars: new Map()
}));

jest.unstable_mockModule('../../src/services/dkmhParser.js', () => ({
    parseSearchResultsHtml: jest.fn(() => [])
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
});
