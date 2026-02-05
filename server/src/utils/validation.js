import { z } from 'zod';
import logger from './logger.js';

// Schemas
export const schemas = {
    login: z.object({
        username: z.string().min(1, 'Username is required'),
        password: z.string().min(1, 'Password is required'),
    }),

    studentInfo: z.object({
        studentId: z.string().optional(), // Optional if fetched from session/default
        semesterYear: z.string().regex(/^\d{4}-\d{4}$/, 'Invalid semester format (e.g. 2023-2024)').optional(),
    }),

    searchLecturer: z.object({
        id: z.string().optional(),
        gv: z.string().optional(),
    }).refine(data => data.id || data.gv, {
        message: "Must provide either 'id' or 'gv'",
    }),

    // Check DKMH Proxy
    dkmhProxy: z.object({
        url: z.string().url('Invalid URL'),
        method: z.enum(['GET', 'POST']).optional(),
        body: z.string().optional(),
    })
};

// Middleware
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = source === 'query' ? req.query : req.body;
            req[source] = schema.parse(data); // Strip unknown keys? By default Zod passes them through unless .strict() is used.
            // Better to overwrite with parsed data to ensure type safety.
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
