import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

// Mock config with dynamic getter for env
jest.unstable_mockModule('../../config/default.js', () => ({
    default: {
        get env() { return process.env.NODE_ENV || 'development'; },
        // Add other config properties if needed by code under test, but usually env is the main one for logic
    }
}));

jest.unstable_mockModule('../../src/utils/logger.js', () => ({
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        http: jest.fn()
    }
}));

const { requestIdMiddleware, globalErrorHandler } = await import('../../src/middlewares/errorMiddleware.js');
const AppError = (await import('../../src/utils/AppError.js')).default;

describe('Error Middleware', () => {
    describe('requestIdMiddleware', () => {
        let req, res, next;

        beforeEach(() => {
            req = { headers: {} };
            res = { setHeader: jest.fn() };
            next = jest.fn();
        });

        it('should generate a request ID if not provided', () => {
            requestIdMiddleware(req, res, next);

            expect(req.requestId).toBeDefined();
            expect(typeof req.requestId).toBe('string');
            expect(res.setHeader).toHaveBeenCalledWith('x-request-id', req.requestId);
            expect(next).toHaveBeenCalled();
        });

        it('should use existing request ID from headers', () => {
            const existingId = 'test-request-id-123';
            req.headers['x-request-id'] = existingId;

            requestIdMiddleware(req, res, next);

            expect(req.requestId).toBe(existingId);
            expect(res.setHeader).toHaveBeenCalledWith('x-request-id', existingId);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('globalErrorHandler', () => {
        let req, res, next;

        beforeEach(() => {
            req = { requestId: 'test-req-id-123' };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            next = jest.fn();
        });

        it('should handle AppError with default development settings', () => {
            const err = new AppError('Test error', 400);
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            globalErrorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'fail',
                    error: 'Test error',
                    code: 'ERROR',
                    requestId: 'test-req-id-123',
                    stack: expect.any(String)
                })
            );

            process.env.NODE_ENV = originalEnv;
        });

        it('should handle generic Error objects', () => {
            const err = new Error('Generic error');
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            globalErrorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'error',
                    error: 'Generic error',
                    requestId: 'test-req-id-123'
                })
            );

            process.env.NODE_ENV = originalEnv;
        });

        it('should hide error details in production for non-operational errors', () => {
            const err = new Error('Internal error');
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            globalErrorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            // In production, generic errors are sanitized
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                error: 'Something went wrong!', // Updated per code: 'error' key, not 'message'
                code: 'INTERNAL_SERVER_ERROR',
                requestId: 'test-req-id-123'
            });

            process.env.NODE_ENV = originalEnv;
        });

        it('should show operational errors in production', () => {
            const err = new AppError('Test error', 400);
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            globalErrorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'fail',
                error: 'Test error', // Updated per code: 'error' key
                code: 'ERROR',
                requestId: 'test-req-id-123'
            });

            process.env.NODE_ENV = originalEnv;
        });

        it('should use "unknown-id" when requestId is missing', () => {
            const err = new AppError('Test error', 400);
            req = {};
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            globalErrorHandler(err, req, res, next);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    requestId: 'unknown-id'
                })
            );

            process.env.NODE_ENV = originalEnv;
        });

        it('should include custom error code if provided', () => {
            const err = new AppError('Test error', 400);
            err.code = 'CUSTOM_CODE';
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            globalErrorHandler(err, req, res, next);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: 'CUSTOM_CODE'
                })
            );

            process.env.NODE_ENV = originalEnv;
        });
    });
});
