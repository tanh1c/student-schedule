import { z } from 'zod';
import logger from './logger.js';

// Allowed path prefixes for DKMH proxy (SSRF protection)
const ALLOWED_DKMH_PATHS = ['/dkmh/', '/my/'];

// Schemas
export const schemas = {
    login: z.object({
        username: z.string().min(1, 'Username is required'),
        password: z.string().min(1, 'Password is required'),
    }),

    dkmhLogin: z.object({
        username: z.string().min(1, 'Username is required'),
        password: z.string().min(1, 'Password is required'),
    }),

    studentInfo: z.object({
        studentId: z.string().optional(),
        semesterYear: z.string().regex(/^(\d{5}|\d{4}-\d{4})$/, 'Invalid semester format (e.g. 20252 or 2023-2024)').optional(),
    }),

    examSchedule: z.object({
        studentId: z.string().min(1, 'studentId required'),
        namhoc: z.string().min(1, 'namhoc required'),
        hocky: z.string().min(1, 'hocky required'),
    }),

    searchLecturer: z.object({
        id: z.string().optional(),
        gv: z.string().optional(),
    }).refine(data => data.id || data.gv, {
        message: "Must provide either 'id' or 'gv'",
    }),

    // DKMH Proxy — hostname + path whitelist to prevent SSRF
    dkmhProxy: z.object({
        url: z.string().url('Invalid URL').refine(
            (url) => {
                try {
                    const parsed = new URL(url);
                    if (parsed.hostname !== 'mybk.hcmut.edu.vn') return false;
                    // Path whitelist — only allow /dkmh/* and /my/* paths
                    return ALLOWED_DKMH_PATHS.some(prefix => parsed.pathname.startsWith(prefix));
                } catch { return false; }
            },
            { message: 'Only mybk.hcmut.edu.vn/dkmh/* URLs are allowed' }
        ),
        method: z.enum(['GET', 'POST']).optional(),
        body: z.any().optional(),
    }),

    periodDetails: z.object({
        periodId: z.union([z.string(), z.number()]).transform(v => String(v)),
    }),

    register: z.object({
        periodId: z.union([z.string(), z.number()]).transform(v => String(v)),
        nlmhId: z.union([z.string(), z.number()]),
        monHocId: z.union([z.string(), z.number()]).optional(),
        forceMode: z.boolean().optional(),
    }),

    cancel: z.object({
        periodId: z.union([z.string(), z.number()]).transform(v => String(v)),
        ketquaId: z.union([z.string(), z.number()]),
        monHocMa: z.string().optional(),
    }),

    searchCourses: z.object({
        periodId: z.union([z.string(), z.number()]).transform(v => String(v)),
        query: z.string().min(1, 'Search query required'),
        forceMode: z.boolean().optional(),
    }),

    classGroups: z.object({
        periodId: z.union([z.string(), z.number()]).transform(v => String(v)),
        monHocId: z.union([z.string(), z.number()]),
    }),
};

// Middleware
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = source === 'query' ? req.query : req.body;
            const parsed = schema.parse(data);
            if (source === 'query') req.query = parsed;
            else req.body = parsed;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                logger.info('[VALIDATION] Failed:', error.issues);
                return res.status(400).json({
                    error: 'Validation Error',
                    details: error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
                });
            }
            next(error);
        }
    };
};
