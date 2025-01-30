const bcrypt = require('bcrypt');
const User = require('../models/User');
const Course = require('../models/Course');

exports.renderDashboardPage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('enrolledCourses');
    const courses = await Course.find();
    res.render('dashboard', { title: 'Dashboard', user, courses });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Render the login page
exports.renderLoginPage = (req, res) => {
  res.render('login', { title: 'Login' });
};

// Render the registration page
exports.renderRegisterPage = (req, res) => {
  res.render('register', { title: 'Register' });
};

// Handle login form submission
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(401).send('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).send('Invalid email or password');
    }

    req.session.userId = user._id;

    // Redirect based on user role
    if (user.role === 'admin') {
      res.redirect('/admin');
    } else if (user.role === 'teacher') {
      res.redirect('/teacher');
    } else if (user.role === 'student') {
      res.redirect('/dashboard');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Handle registration form submission
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Render the dashboard page
// controllers/userController.js
exports.renderDashboardPage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('enrolledCourses');
    const courses = await Course.find();
    res.render('dashboard', { title: 'Dashboard', user, courses });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Render the profile page
// controllers/userController.js
exports.renderProfilePage = async (req, res) => {
  try {
      // Fetch the user data from the database (or session)
      const user = await User.findById(req.session.userId); // Replace with your logic to fetch the user

      if (!user) {
          return res.status(404).send('User not found');
      }

      // Render the profile.ejs template and pass the user object
      res.render('profile', { user });
  } catch (error) {
      console.error('Error rendering profile page:', error);
      res.status(500).send('Internal Server Error');
  }
};

// Render the settings page
exports.renderSettingsPage = (req, res) => {
  const user = req.user; // Assuming user is attached to the request object
  if (!user) {
    return res.status(401).send('User not authenticated');
  }
  res.render('settings', { user });
};

// Update user settings
exports.updateSettings = async (req, res) => {
  const { name, email, phone, links, skills } = req.body;
  const userId = req.session.userId;

  try {
    const user = await User.findByIdAndUpdate(userId, { name, email, phone, links, skills }, { new: true });
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get user settings
exports.getSettings = (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).send('User not authenticated');
  }
  res.render('settings', { user });
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    res.redirect('/login');
  });
};