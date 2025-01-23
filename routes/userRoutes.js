const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.get('/', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

router.post('/login', async (req, res) => {
  // Implement login logic here
  res.redirect('/dashboard');
});

router.post('/register', async (req, res) => {
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
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard', { title: 'Dashboard' });
});

router.get('/checkout', (req, res) => {
  res.render('checkout', { title: 'Checkout' });
});

router.post('/checkout', (req, res) => {
  // Implement payment processing logic here
  res.redirect('/dashboard');
});

router.get('/logout', (req, res) => {
  // Implement logout logic here
  res.redirect('/login');
});

module.exports = router;
