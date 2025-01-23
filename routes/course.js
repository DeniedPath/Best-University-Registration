const express = require('express');
const router = express.Router();

// Get all courses
router.get('/', (req, res) => {
  res.render('course', { title: 'Available Courses' });
});

// Enroll in a course
router.post('/enroll', (req, res) => {
  // Implement course enrollment logic here
  res.redirect('/dashboard');
});

module.exports = router;
