const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Route to list all courses
router.get('/dashboard', courseController.listCourses);

// Route to handle course enrollment
router.get('/enroll/:id', courseController.enrollCourse);

module.exports = router;