import express from 'express';
import * as authController from '../controllers/authController.js';
import * as studentController from '../controllers/studentController.js';
import * as dkmhController from '../controllers/dkmhController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate, schemas } from '../utils/validation.js';

const router = express.Router();

// Public Routes
router.post('/auth/login', validate(schemas.login), authController.login);
router.post('/dkmh/login', authController.dkmhLogin);

// Protected Routes
// router.use(updateActivity); // Removed as per diff, authenticate likely handles activity or it's no longer needed

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
router.get('/schedule/get-exam-schedule', authenticate, studentController.getExamSchedule); // Re-use controller
router.get('/schedule/get-gpa', authenticate, studentController.getGpa);
router.get('/schedule/get-transcript', authenticate, studentController.getTranscript);
router.get('/schedule/get-transcript-summary', authenticate, studentController.getTranscriptSummary);
router.get('/schedule/get-course-list', authenticate, studentController.getCourseList);

// DKMH 
router.post('/dkmh/registration-result', authenticate, dkmhController.getRegistrationResult);

export default router;
