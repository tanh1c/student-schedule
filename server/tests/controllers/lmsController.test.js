import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/services/redisService.js', () => ({
    swr: jest.fn()
}));

jest.unstable_mockModule('../../src/services/sessionStore.js', () => ({
    getSession: jest.fn(),
    saveSession: jest.fn(),
    ssoJars: new Map()
}));

jest.unstable_mockModule('../../src/services/lmsService.js', () => ({
    performLMSLogin: jest.fn(),
    getConversations: jest.fn(),
    getDeadlines: jest.fn()
}));

jest.unstable_mockModule('../../src/utils/logger.js', () => ({
    default: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }
}));

const lmsController = await import('../../src/controllers/lmsController.js');
const sessionStore = await import('../../src/services/sessionStore.js');
const lmsService = await import('../../src/services/lmsService.js');

describe('lmsController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            token: 'session-token',
            session: {
                username: 'testuser',
                dkmhCookie: null,
                dkmhLoggedIn: false
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        sessionStore.ssoJars.clear();
        jest.clearAllMocks();
    });

    describe('initLmsSession', () => {
        it('preserves DKMH fields saved by a concurrent background login', async () => {
            const ssoJar = {};
            sessionStore.ssoJars.set(req.token, ssoJar);
            sessionStore.getSession.mockResolvedValue({
                username: 'testuser',
                dkmhCookie: 'JSESSIONID=dkmh-session',
                dkmhLoggedIn: true,
                lastActivity: 123
            });
            lmsService.performLMSLogin.mockResolvedValue({
                success: true,
                lmsCookie: 'MoodleSession=lms-session',
                sesskey: 'sess-key',
                userid: 75147
            });

            await lmsController.initLmsSession(req, res);

            expect(sessionStore.saveSession).toHaveBeenCalledWith(req.token, expect.objectContaining({
                username: 'testuser',
                dkmhCookie: 'JSESSIONID=dkmh-session',
                dkmhLoggedIn: true,
                lms: {
                    lmsCookie: 'MoodleSession=lms-session',
                    sesskey: 'sess-key',
                    userid: 75147
                }
            }));
        });
    });
});
