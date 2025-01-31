const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const isAuthenticated = require('../middleware/auth');
const Course = require('../models/Course'); // Import the Course model
const User = require('../models/User'); // Import the User model

// Redirect root URL to login page
router.get('/', (req, res) => {
  res.redirect('/Frontpage');
});

// Route to render the admin page
router.get('/admin', isAuthenticated, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Access denied');
  }
  try {
    const students = await User.find({ role: 'student' });
    res.render('Staff&Faculty/admin', { title: 'Admin Dashboard', students });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Route to render the teacher page
router.get('/teacher', (req, res) => {
  res.render('Staff&Faculty/teacher', { title: 'Teacher Dashboard' });
});

// Route to render the faculty page
router.get('/faculty', isAuthenticated, (req, res) => {
  if (req.user.role !== 'faculty') {
    return res.status(403).send('Access denied');
  }
  res.render('Staff&Faculty/faculty', { title: 'Faculty Dashboard' });
});

// Route to render the course page
router.get('/course', isAuthenticated, async (req, res) => {
  try {
    const courses = await Course.find(); // Fetch courses from the database
    const user = await User.findById(req.session.userId).populate('enrolledCourses'); // Fetch user from the database and populate enrolledCourses
    res.render('course', { title: 'Course Enrollment', courses, user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Route to render the login page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Route to render the registration page
router.get('/register', userController.renderRegisterPage);

// Route to handle login form submission
router.post('/login', userController.login);

// Route to handle registration form submission
router.post('/register', userController.register);

// Route to render the dashboard page
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const courses = await Course.find(); // Fetch courses from the database
    res.render('dashboard', { title: 'Dashboard', user, courses });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Route to render the profile page
router.get('/profile', isAuthenticated, userController.renderProfilePage);

// Route to render the settings page
router.get('/settings', isAuthenticated, userController.getSettings);

// Route to handle settings form submission
router.post('/settings', isAuthenticated, userController.updateSettings);

// Logout route
router.get('/logout', isAuthenticated, userController.logout);

module.exports = router;