const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Redirect root URL to login page
router.get('/', (req, res) => {
  res.redirect('/login');
});

// Route to render the admin page
router.get('/admin', (req, res) => {
  res.render('Staff&Faculty/admin', { title: 'Admin Dashboard' });
});

// Route to render the teacher page
router.get('/teacher', (req, res) => {
  res.render('Staff&Faculty/teacher', { title: 'Teacher Dashboard' });
});

// Route to render the course page
router.get('/course', (req, res) => {
  res.render('course', { title: 'Course Enrollment' });
});

// Route to render the login page
router.get('/login', userController.renderLoginPage);

// Route to render the registration page
router.get('/register', userController.renderRegisterPage);

// Route to handle login form submission
router.post('/login', userController.login);

// Route to handle registration form submission
router.post('/register', userController.register);

// Route to render the dashboard page
router.get('/dashboard', userController.renderDashboardPage);

// Route to render the profile page
router.get('/profile', userController.renderProfilePage);

// Route to render the settings page
router.get('/settings', userController.renderSettingsPage);

module.exports = router;