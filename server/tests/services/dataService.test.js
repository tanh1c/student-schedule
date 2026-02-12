import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

jest.unstable_mockModule('fs', () => ({
    default: {
        existsSync: jest.fn(),
        readFileSync: jest.fn()
    },
    existsSync: jest.fn(),
    readFileSync: jest.fn()
}));

jest.unstable_mockModule('../../src/utils/logger.js', () => ({
    default: {
        error: jest.fn(),
        info: jest.fn()
    }
}));

const {
    getSubjectData,
    getLecturerData,
    smartVietnameseMatch,
    searchLecturerInfo
} = await import('../../src/services/dataService.js');

describe('dataService', () => {
    describe('getSubjectData', () => {
        it('should return subject data array', () => {
            const data = getSubjectData();
            expect(Array.isArray(data)).toBe(true);
        });
    });

    describe('getLecturerData', () => {
        it('should return lecturer data array', () => {
            const data = getLecturerData();
            expect(Array.isArray(data)).toBe(true);
        });
    });

    describe('smartVietnameseMatch', () => {
        it('should match exact text with accents removed', () => {
            expect(smartVietnameseMatch('Toán cao cấp 1', 'toan cao')).toBe(true);
            expect(smartVietnameseMatch('Vật lý 1', 'vat ly')).toBe(true);
        });

        it('should match with different accent combinations', () => {
            expect(smartVietnameseMatch('Toán cao cấp 1', 'toan cao cap')).toBe(true);
            expect(smartVietnameseMatch('Vật lý 1', 'vat ly')).toBe(true);
        });

        it('should match acronyms', () => {
            expect(smartVietnameseMatch('Toán cao cấp 1', 'tcc')).toBe(true);
            expect(smartVietnameseMatch('Giải tích 1', 'gt1')).toBe(true);
        });

        it('should match partial words', () => {
            expect(smartVietnameseMatch('Toán cao cấp', 'cao c')).toBe(true);
            expect(smartVietnameseMatch('Vật lý đại cương', 'vat dai')).toBe(true);
        });

        it('should match all query words against text words', () => {
            expect(smartVietnameseMatch('Giải tích đại cương', 'dai tich')).toBe(true);
            expect(smartVietnameseMatch('Khoa học vật liệu', 'hoa hoc vat lieu')).toBe(true);
        });

        it.skip('should match with phonetic variations', () => {
            expect(smartVietnameseMatch('Phương pháp tính', 'fuong phap tinh')).toBe(true);
        });

        it('should return false for non-matching text', () => {
            expect(smartVietnameseMatch('Vật lý 1', 'hóa học')).toBe(false);
            expect(smartVietnameseMatch('Vật lý 1', 'abc123')).toBe(false);
        });

        it('should return false for empty query or text', () => {
            expect(smartVietnameseMatch('test', '')).toBe(false);
            expect(smartVietnameseMatch('', 'test')).toBe(false);
            expect(smartVietnameseMatch(null, 'test')).toBe(false);
            expect(smartVietnameseMatch('test', null)).toBe(false);
        });
    });

    describe('searchLecturerInfo', () => {
        it('should return default info for unknown lecturer', () => {
            const result = searchLecturerInfo('Unknown Lecturer');
            expect(result).toEqual({
                name: 'Unknown Lecturer',
                phone: '',
                email: ''
            });
        });

        it('should handle empty name', () => {
            const result = searchLecturerInfo('');
            expect(result).toHaveProperty('name', '');
            expect(result).toHaveProperty('phone', '');
            expect(result).toHaveProperty('email', '');
        });
    });
});
