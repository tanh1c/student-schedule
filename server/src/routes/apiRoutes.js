import express from 'express';
import * as authController from '../controllers/authController.js';
import * as studentController from '../controllers/studentController.js';
import * as dkmhController from '../controllers/dkmhController.js';
import { requireAuth, updateActivity } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/auth/login', authController.login);
router.post('/dkmh/login', authController.dkmhLogin);

// Protected Routes
router.use(updateActivity);

router.post('/auth/logout', requireAuth, authController.logout);

// Student (Original API set)
router.get('/student/info', requireAuth, studentController.getStudentInfo);
router.get('/student/schedule', requireAuth, studentController.getSchedule);
router.get('/student/exam-schedule', requireAuth, studentController.getExamSchedule);
router.post('/student/gpa/summary', requireAuth, studentController.getGpaSummary);
router.post('/student/gpa/detail', requireAuth, studentController.getGpaDetail);

// Schedule (Additional/Legacy Endpoints)
router.get('/schedule/get-schedule', requireAuth, studentController.getScheduleSimple);
router.get('/schedule/get-schedule-by-sem', requireAuth, studentController.getScheduleBySem);
router.get('/schedule/get-exam-schedule', requireAuth, studentController.getExamSchedule); // Re-use controller
router.get('/schedule/get-gpa', requireAuth, studentController.getGpa);
router.get('/schedule/get-transcript', requireAuth, studentController.getTranscript);
router.get('/schedule/get-transcript-summary', requireAuth, studentController.getTranscriptSummary);
router.get('/schedule/get-course-list', requireAuth, studentController.getCourseList);

// DKMH 
router.get('/dkmh/status', requireAuth, authController.dkmhStatus);
router.all('/dkmh/proxy', requireAuth, dkmhController.proxy);
router.get('/dkmh/registration-periods', requireAuth, dkmhController.getRegistrationPeriods);
router.post('/dkmh/period-details', requireAuth, dkmhController.getPeriodDetails);
router.post('/dkmh/search-courses', requireAuth, dkmhController.searchCourses);
router.post('/dkmh/class-groups', requireAuth, dkmhController.getClassGroups);
router.post('/dkmh/register', requireAuth, dkmhController.register);
router.post('/dkmh/cancel', requireAuth, dkmhController.cancel);
router.post('/dkmh/registration-result', requireAuth, dkmhController.getRegistrationResult);

export default router;
