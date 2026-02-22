import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import AppError from '../../src/utils/AppError.js';

describe('AppError', () => {
    describe('constructor', () => {
        it('should create an error with default status code 500', () => {
            const error = new AppError('Test error');

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(AppError);
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(500);
            expect(error.status).toBe('error');
            expect(error.isOperational).toBe(true);
        });

        it('should create an error with custom status code', () => {
            const error = new AppError('Not found', 404);

            expect(error.message).toBe('Not found');
            expect(error.statusCode).toBe(404);
            expect(error.status).toBe('fail');
            expect(error.isOperational).toBe(true);
        });

        it('should set status to "fail" for 4xx errors', () => {
            const error400 = new AppError('Bad request', 400);
            const error401 = new AppError('Unauthorized', 401);
            const error404 = new AppError('Not found', 404);

            expect(error400.status).toBe('fail');
            expect(error401.status).toBe('fail');
            expect(error404.status).toBe('fail');
        });

        it('should set status to "error" for 5xx errors', () => {
            const error500 = new AppError('Internal error', 500);
            const error502 = new AppError('Bad gateway', 502);
            const error503 = new AppError('Service unavailable', 503);

            expect(error500.status).toBe('error');
            expect(error502.status).toBe('error');
            expect(error503.status).toBe('error');
        });

        it('should capture stack trace', () => {
            const error = new AppError('Test error', 400);

            expect(error.stack).toBeDefined();
            expect(error.stack).toContain('AppError');
        });
    });
});
