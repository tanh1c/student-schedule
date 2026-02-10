import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController.js';
import * as studentController from '../controllers/studentController.js';
import * as dkmhController from '../controllers/dkmhController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate, schemas } from '../utils/validation.js';

const router = express.Router();

// Rate limiter for login (brute force protection)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: { error: 'Quá nhiều lần thử. Vui lòng đợi 15 phút.' },
    skip: () => process.env.NODE_ENV !== 'production' // Skip in dev
});

// Rate limiter for refresh (prevent abuse)
const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // 20 refresh attempts per 15 min
    message: { error: 'Quá nhiều lần thử refresh. Vui lòng đợi.' },
    skip: () => process.env.NODE_ENV !== 'production'
});

// Public Routes
router.post('/auth/login', loginLimiter, validate(schemas.login), authController.login);
router.post('/auth/refresh', refreshLimiter, authController.refreshSession);
router.post('/dkmh/login', authController.dkmhLogin);

// Protected Routes
router.post('/auth/logout', authenticate, authController.logout);

// Student (Original API set)
router.get('/student/info', authenticate, studentController.getStudentInfo);
router.get('/student/schedule', authenticate, validate(schemas.studentInfo, 'query'), studentController.getSchedule);
router.get('/student/exam-schedule', authenticate, studentController.getExamSchedule);
router.post('/student/gpa/summary', authenticate, studentController.getGpaSummary);
router.post('/student/gpa/detail', authenticate, studentController.getGpaDetail);

// Schedule (Additional/Legacy Endpoints)
router.get('/schedule/get-schedule', authenticate, studentController.getScheduleSimple);
router.get('/schedule/get-schedule-by-sem', authenticate, studentController.getScheduleBySem);
router.get('/schedule/get-exam-schedule', authenticate, studentController.getExamSchedule);
router.get('/schedule/get-gpa', authenticate, studentController.getGpa);
router.get('/schedule/get-transcript', authenticate, studentController.getTranscript);
router.get('/schedule/get-transcript-summary', authenticate, studentController.getTranscriptSummary);
router.get('/schedule/get-course-list', authenticate, studentController.getCourseList);

// DKMH - All endpoints matching index.production.js
router.get('/dkmh/status', authenticate, authController.dkmhStatus);
router.get('/dkmh/check', authenticate, authController.dkmhCheck);
router.post('/dkmh/proxy', authenticate, dkmhController.proxy);
router.get('/dkmh/registration-periods', authenticate, dkmhController.getRegistrationPeriods);
router.post('/dkmh/period-details', authenticate, dkmhController.getPeriodDetails);
router.post('/dkmh/search-courses', authenticate, dkmhController.searchCourses);
router.post('/dkmh/class-groups', authenticate, dkmhController.getClassGroups);
router.post('/dkmh/register', authenticate, dkmhController.register);
router.post('/dkmh/registration-result', authenticate, dkmhController.getRegistrationResult);
router.post('/dkmh/cancel', authenticate, dkmhController.cancel);

// LMS (BK E-Learning) - Moodle integration
import * as lmsController from '../controllers/lmsController.js';
router.post('/lms/init', authenticate, lmsController.initLmsSession);
router.get('/lms/messages', authenticate, lmsController.getMessages);
router.get('/lms/messages/:conversationId', authenticate, lmsController.getConversationDetail);
router.get('/lms/unread', authenticate, lmsController.getUnreadCount);

export default router;
