const bcrypt = require('bcrypt');
const User = require('../models/user');

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
      return res.status(400).send('Invalid email or password.');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid email or password.');
    }
    res.redirect('/dashboard');
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


exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('Invalid email or password.');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid email or password.');
    }
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


// Render the dashboard page
exports.renderDashboardPage = (req, res) => {
  res.render('dashboard', { title: 'Dashboard' });
};

// Render the profile page
exports.renderProfilePage = (req, res) => {
  res.render('profile', { title: 'Profile' });
};

// Render the settings page
exports.renderSettingsPage = (req, res) => {
  res.render('settings', { title: 'Settings' });
};