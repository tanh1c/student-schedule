import express from 'express';
import * as lecturerController from '../controllers/lecturerController.js';

const router = express.Router();

router.get('/search', lecturerController.searchLecturer);
router.get('/browse-schedule', lecturerController.browseSchedule);
router.get('/list', lecturerController.listLecturers);
router.get('/info', lecturerController.getLecturerInfo);
router.get('/subjects', lecturerController.listSubjects);

export default router;
