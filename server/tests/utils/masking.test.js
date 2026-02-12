import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { maskSensitive, maskCookie, maskUrl, maskStudentId } from '../../src/utils/masking.js';

describe('Masking Utilities', () => {
    describe('maskSensitive', () => {
        it('should mask short strings completely', () => {
            expect(maskSensitive('abc')).toBe('***');
            expect(maskSensitive('test')).toBe('***');
        });

        it('should show first 4 chars and ... for longer strings', () => {
            expect(maskSensitive('12345678901234')).toBe('1234...');
            expect(maskSensitive('abcdefghijklmnop')).toBe('abcd...');
        });

        it('should handle strings with exactly 5 characters', () => {
            expect(maskSensitive('12345')).toBe('1234...');
        });

        it('should handle empty string', () => {
            expect(maskSensitive('')).toBe('***');
        });

        it('should handle null and undefined', () => {
            expect(maskSensitive(null)).toBe('***');
            expect(maskSensitive(undefined)).toBe('***');
        });

        it('should allow custom showChars parameter', () => {
            expect(maskSensitive('123456789', 6)).toBe('123456...');
        });
    });

    describe('maskStudentId', () => {
        it('should mask student ID showing first 3 and last 2 digits', () => {
            expect(maskStudentId('2012345')).toBe('201***45');
            expect(maskStudentId('1234567890')).toBe('123***90');
        });

        it('should handle short student IDs', () => {
            expect(maskStudentId('12345')).toBe('***');
        });

        it('should handle empty or null input', () => {
            expect(maskStudentId('')).toBe('***');
            expect(maskStudentId(null)).toBe('***');
        });

        it('should convert number to string', () => {
            expect(maskStudentId(2012345)).toBe('201***45');
        });
    });

    describe('maskCookie', () => {
        it('should mask cookie values while keeping names', () => {
            const cookie = 'SESSION=abc123def456; token=xyz789';
            const masked = maskCookie(cookie);

            expect(masked).toBe('SESSION=***; token=***');
        });

        it('should handle single cookie', () => {
            const cookie = 'SESSION=verylongcookievalue12345';
            const masked = maskCookie(cookie);

            expect(masked).toBe('SESSION=***');
        });

        it('should handle empty cookie string', () => {
            expect(maskCookie('')).toBe('(empty)');
        });

        it('should handle null cookie', () => {
            expect(maskCookie(null)).toBe('(empty)');
        });
    });

    describe('maskUrl', () => {
        it('should mask masv parameter in URL', () => {
            const url = 'https://example.com/path?masv=2012345&other=value';
            const masked = maskUrl(url);

            expect(masked).toContain('masv=***');
            expect(masked).not.toContain('2012345');
        });

        it('should mask jsessionid in URL', () => {
            const url = 'https://example.com?jsessionid=abc123def456';
            const masked = maskUrl(url);

            expect(masked).toContain('jsessionid=***');
            expect(masked).not.toContain('abc123def456');
        });

        it('should mask SESSION cookie in URL', () => {
            const url = 'https://example.com?SESSION=secretvalue';
            const masked = maskUrl(url);

            expect(masked).toContain('SESSION=***');
            expect(masked).not.toContain('secretvalue');
        });

        it('should keep URL structure for non-sensitive params', () => {
            const url = 'https://example.com/api/endpoint?param=value';
            const masked = maskUrl(url);

            expect(masked).toBe(url);
        });

        it('should handle empty URL', () => {
            expect(maskUrl('')).toBe('');
        });
    });
});
