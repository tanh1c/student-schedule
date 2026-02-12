import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

jest.unstable_mockModule('../../src/services/authService.js', () => ({
    performCASLogin: jest.fn(),
    createCookieFetch: jest.fn()
}));

jest.unstable_mockModule('../../src/services/dkmhService.js', () => ({
    performDKMHLogin: jest.fn()
}));

jest.unstable_mockModule('../../src/services/sessionStore.js', () => ({
    canCreateSession: jest.fn(),
    generateSecureToken: jest.fn(),
    saveSession: jest.fn(),
    deleteSession: jest.fn(),
    getSession: jest.fn(),
    activePeriodJars: new Map(),
    ssoJars: new Map()
}));

jest.unstable_mockModule('node-fetch', () => ({
    default: jest.fn()
}));

jest.unstable_mockModule('../../src/utils/logger.js', () => ({
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
    }
}));

const authController = await import('../../src/controllers/authController.js');
const authService = await import('../../src/services/authService.js');
const dkmhService = await import('../../src/services/dkmhService.js');
const sessionStore = await import('../../src/services/sessionStore.js');

describe('authController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            headers: {},
            session: null,
            token: null
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return 503 if max sessions reached', async () => {
            req.body = { username: 'testuser', password: 'testpass' };
            sessionStore.canCreateSession.mockResolvedValue(false);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(503);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: 'MAX_SESSIONS_REACHED'
                })
            );
        });

        it('should login successfully with valid credentials', async () => {
            req.body = { username: 'testuser', password: 'testpass' };
            const mockToken = 'secure-token-123';

            sessionStore.canCreateSession.mockResolvedValue(true);
            sessionStore.generateSecureToken.mockReturnValue(mockToken);
            sessionStore.saveSession.mockResolvedValue(true);
            authService.performCASLogin.mockResolvedValue({
                success: true,
                cookieString: 'session=abc123',
                jwtToken: 'jwt-token',
                user: { username: 'testuser', name: 'Test User' },
                jar: {}
            });
            dkmhService.performDKMHLogin.mockResolvedValue({
                success: true,
                cookieString: 'dkmh=xyz789',
                jar: {}
            });

            await authController.login(req, res);

            expect(authService.performCASLogin).toHaveBeenCalledWith('testuser', 'testpass');
            expect(sessionStore.saveSession).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                token: mockToken,
                user: expect.any(Object)
            });
        });

        it('should return 401 with invalid credentials', async () => {
            req.body = { username: 'testuser', password: 'wrongpass' };

            sessionStore.canCreateSession.mockResolvedValue(true);
            authService.performCASLogin.mockResolvedValue({
                success: false,
                error: 'Invalid credentials'
            });

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        });
    });

    describe('logout', () => {
        it('should delete session on logout', async () => {
            const token = 'test-token-123';
            req.headers['authorization'] = `Bearer ${token}`;
            sessionStore.deleteSession.mockResolvedValue(true);

            await authController.logout(req, res);

            expect(sessionStore.deleteSession).toHaveBeenCalledWith(token);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        it('should return success even without token', async () => {
            await authController.logout(req, res);

            expect(res.json).toHaveBeenCalledWith({ success: true });
        });
    });

    describe('dkmhLogin', () => {
        it('should return 400 if username or password is missing', async () => {
            req.body = { username: 'testuser' };

            await authController.dkmhLogin(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.stringContaining('required')
                })
            );
        });

        it('should login successfully to DKMH', async () => {
            req.body = { username: 'testuser', password: 'testpass' };
            const mockToken = 'dkmh-token-123';

            sessionStore.generateSecureToken.mockReturnValue(mockToken);
            sessionStore.saveSession.mockResolvedValue(true);
            dkmhService.performDKMHLogin.mockResolvedValue({
                success: true,
                cookieString: 'dkmh=xyz789'
            });

            await authController.dkmhLogin(req, res);

            expect(dkmhService.performDKMHLogin).toHaveBeenCalledWith('testuser', 'testpass');
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                dkmhToken: mockToken,
                message: expect.any(String)
            });
        });

        it('should return 401 on failed DKMH login', async () => {
            req.body = { username: 'testuser', password: 'wrongpass' };

            dkmhService.performDKMHLogin.mockResolvedValue({
                success: false,
                error: 'Invalid credentials'
            });

            await authController.dkmhLogin(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        });
    });

    describe('dkmhStatus', () => {
        it('should return 401 if no session', () => {
            req.session = null;

            authController.dkmhStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return authentication status', () => {
            req.session = {
                username: 'testuser',
                dkmhCookie: 'dkmh=xyz789',
                dkmhLoggedIn: true
            };

            authController.dkmhStatus(req, res);

            expect(res.json).toHaveBeenCalledWith({
                authenticated: true,
                dkmhLoggedIn: true,
                username: 'testuser'
            });
        });

        it('should return false for authenticated if no dkmhCookie', () => {
            req.session = {
                username: 'testuser',
                dkmhCookie: null,
                dkmhLoggedIn: false
            };

            authController.dkmhStatus(req, res);

            expect(res.json).toHaveBeenCalledWith({
                authenticated: false,
                dkmhLoggedIn: false,
                username: 'testuser'
            });
        });
    });

    describe('dkmhCheck', () => {
        it('should return 401 if no DKMH session', async () => {
            req.session = null;

            await authController.dkmhCheck(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    authenticated: false
                })
            );
        });

        it('should return 401 if session type is not dkmh', async () => {
            req.session = { type: 'cas', username: 'testuser' };

            await authController.dkmhCheck(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });
    });
});
