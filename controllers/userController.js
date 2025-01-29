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
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('Invalid email or password.');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid email or password.');
    }

    // Store user ID and role in session for session management
    req.session.userId = user._id;
    req.session.role = user.role;

    // Redirect based on role
    if (user.role === 'admin') {
      res.redirect('/admin');
    } else if (user.role === 'faculty') {
      res.redirect('/teacher');
    } else {
      res.redirect('/dashboard');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};




// Handle registration form submission
exports.register = async (req, res) => {
  const { fullName, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email is already registered.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, password: hashedPassword, role });
    await newUser.save();
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
// controllers/userController.js
exports.updateSettings = async (req, res) => {
  const { fullName, email } = req.body;
  const userId = req.session.userId;

  try {
    const user = await User.findByIdAndUpdate(userId, { fullName, email }, { new: true });
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.getSettings = (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).send('User not authenticated');
  }
  res.render('settings', { user });
};