import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

jest.unstable_mockModule('../../src/services/sessionStore.js', () => ({
    getSession: jest.fn(),
    canCreateSession: jest.fn(),
    saveSession: jest.fn()
}));

jest.unstable_mockModule('../../src/utils/logger.js', () => ({
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
    }
}));

const sessionStore = await import('../../src/services/sessionStore.js');
const { authenticate } = await import('../../src/middlewares/authMiddleware.js');

describe('authMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('authenticate', () => {
        it('should return 401 if no token is provided', async () => {
            await authenticate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if token is empty', async () => {
            req.headers['authorization'] = 'Bearer ';

            await authenticate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should extract token from Bearer authorization header', async () => {
            const token = 'valid-token-123';
            const mockSession = { username: 'testuser', studentId: '2012345' };

            req.headers['authorization'] = `Bearer ${token}`;
            sessionStore.getSession.mockResolvedValue(mockSession);

            await authenticate(req, res, next);

            expect(sessionStore.getSession).toHaveBeenCalledWith(token);
            expect(req.session).toEqual(mockSession);
            expect(req.token).toBe(token);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 401 if session is not found', async () => {
            const token = 'invalid-token';

            req.headers['authorization'] = `Bearer ${token}`;
            sessionStore.getSession.mockResolvedValue(null);

            await authenticate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 500 on session store error', async () => {
            const token = 'some-token';

            req.headers['authorization'] = `Bearer ${token}`;
            sessionStore.getSession.mockRejectedValue(new Error('Redis connection failed'));

            await authenticate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should attach both session and token to request', async () => {
            const token = 'valid-token-xyz';
            const mockSession = {
                username: 'student1',
                studentId: '2098765',
                cookies: {}
            };

            req.headers['authorization'] = `Bearer ${token}`;
            sessionStore.getSession.mockResolvedValue(mockSession);

            await authenticate(req, res, next);

            expect(req.session).toEqual(mockSession);
            expect(req.token).toBe(token);
            expect(next).toHaveBeenCalled();
        });
    });
});
