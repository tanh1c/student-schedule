import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { schemas, validate } from '../../src/utils/validation.js';

describe('Validation Schemas', () => {
    describe('schemas.login', () => {
        it('should validate correct login data', () => {
            const data = {
                username: 'testuser',
                password: 'testpass123'
            };

            const result = schemas.login.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should reject missing username', () => {
            const data = {
                password: 'testpass123'
            };

            const result = schemas.login.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should reject missing password', () => {
            const data = {
                username: 'testuser'
            };

            const result = schemas.login.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should reject empty username', () => {
            const data = {
                username: '',
                password: 'testpass123'
            };

            const result = schemas.login.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should reject empty password', () => {
            const data = {
                username: 'testuser',
                password: ''
            };

            const result = schemas.login.safeParse(data);
            expect(result.success).toBe(false);
        });
    });

    describe('schemas.studentInfo', () => {
        it('should validate with valid semester format (5 digits)', () => {
            const data = {
                studentId: '2012345',
                semesterYear: '20252'
            };

            const result = schemas.studentInfo.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should validate with valid semester format (yyyy-yyyy)', () => {
            const data = {
                studentId: '2012345',
                semesterYear: '2023-2024'
            };

            const result = schemas.studentInfo.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should validate with optional fields', () => {
            const data = {};

            const result = schemas.studentInfo.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should reject invalid semester format', () => {
            const data = {
                studentId: '2012345',
                semesterYear: 'invalid'
            };

            const result = schemas.studentInfo.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should reject semester with only 3 digits', () => {
            const data = {
                semesterYear: '202'
            };

            const result = schemas.studentInfo.safeParse(data);
            expect(result.success).toBe(false);
        });
    });

    describe('schemas.dkmhProxy', () => {
        it('should validate correct DKMH URL with /dkmh/ path', () => {
            const data = {
                url: 'https://mybk.hcmut.edu.vn/dkmh/api/endpoint',
                method: 'GET'
            };

            const result = schemas.dkmhProxy.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should validate correct DKMH URL with /my/ path', () => {
            const data = {
                url: 'https://mybk.hcmut.edu.vn/my/profile',
                method: 'POST'
            };

            const result = schemas.dkmhProxy.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should reject URL with wrong hostname', () => {
            const data = {
                url: 'https://evil.com/dkmh/api/endpoint',
                method: 'GET'
            };

            const result = schemas.dkmhProxy.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should reject URL with non-whitelisted path', () => {
            const data = {
                url: 'https://mybk.hcmut.edu.vn/admin/users',
                method: 'GET'
            };

            const result = schemas.dkmhProxy.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should reject invalid URL format', () => {
            const data = {
                url: 'not-a-url',
                method: 'GET'
            };

            const result = schemas.dkmhProxy.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should validate with optional body and method', () => {
            const data = {
                url: 'https://mybk.hcmut.edu.vn/dkmh/api/endpoint'
            };

            const result = schemas.dkmhProxy.safeParse(data);
            expect(result.success).toBe(true);
        });
    });

    describe('schemas.periodDetails', () => {
        it('should accept string periodId', () => {
            const data = { periodId: '12345' };
            const result = schemas.periodDetails.safeParse(data);

            expect(result.success).toBe(true);
            expect(result.data.periodId).toBe('12345');
        });

        it('should transform number periodId to string', () => {
            const data = { periodId: 12345 };
            const result = schemas.periodDetails.safeParse(data);

            expect(result.success).toBe(true);
            expect(result.data.periodId).toBe('12345');
        });

        it('should reject missing periodId', () => {
            const data = {};
            const result = schemas.periodDetails.safeParse(data);

            expect(result.success).toBe(false);
        });
    });

    describe('schemas.register', () => {
        it('should validate correct registration data', () => {
            const data = {
                periodId: '12345',
                nlmhId: '67890',
                monHocId: '11111',
                forceMode: true
            };

            const result = schemas.register.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should transform number periodId to string', () => {
            const data = {
                periodId: 12345,
                nlmhId: 67890
            };

            const result = schemas.register.safeParse(data);
            expect(result.success).toBe(true);
            expect(result.data.periodId).toBe('12345');
        });

        it('should validate without optional fields', () => {
            const data = {
                periodId: '12345',
                nlmhId: '67890'
            };

            const result = schemas.register.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should reject missing required fields', () => {
            const data = {
                periodId: '12345'
            };

            const result = schemas.register.safeParse(data);
            expect(result.success).toBe(false);
        });
    });

    describe('schemas.searchCourses', () => {
        it('should validate correct search data', () => {
            const data = {
                periodId: '12345',
                query: 'MT1003'
            };

            const result = schemas.searchCourses.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should reject empty query', () => {
            const data = {
                periodId: '12345',
                query: ''
            };

            const result = schemas.searchCourses.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should validate with forceMode option', () => {
            const data = {
                periodId: '12345',
                query: 'MT1003',
                forceMode: true
            };

            const result = schemas.searchCourses.safeParse(data);
            expect(result.success).toBe(true);
        });
    });
});

describe('validate middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it('should call next() on valid body data', () => {
        req.body = {
            username: 'testuser',
            password: 'testpass'
        };

        const middleware = validate(schemas.login, 'body');
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 on invalid body data', () => {
        req.body = {
            username: 'testuser'
            // missing password
        };

        const middleware = validate(schemas.login, 'body');
        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: 'Validation Error',
                details: expect.any(Array)
            })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it('should validate query parameters when source is "query"', () => {
        req.query = {
            studentId: '2012345',
            semesterYear: '20252'
        };

        const middleware = validate(schemas.studentInfo, 'query');
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should return validation error details', () => {
        req.body = {
            username: '',
            password: ''
        };

        const middleware = validate(schemas.login, 'body');
        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: 'Validation Error',
                details: expect.arrayContaining([
                    expect.stringContaining('username'),
                    expect.stringContaining('password')
                ])
            })
        );
    });
});
