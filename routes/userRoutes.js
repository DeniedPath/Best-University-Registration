const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const attachUser = require('../middleware/auth'); // Ensure this path is correct

router.use(attachUser);

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};

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
router.get('/login', userController.renderLoginPage);

// Route to render the registration page
router.get('/register', userController.renderRegisterPage);

// Route to handle login form submission
router.post('/login', userController.login);

// Route to handle registration form submission
router.post('/register', userController.register);

// Route to render the dashboard page
router.get('/dashboard', isAuthenticated, userController.renderDashboardPage);

// Route to render the profile page
router.get('/profile', userController.renderProfilePage);

// Route to render the settings page
router.get('/settings', userController.getSettings);

// Route to handle settings form submission
router.post('/settings', isAuthenticated, userController.updateSettings);

module.exports = router;