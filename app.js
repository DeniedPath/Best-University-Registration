const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const connectDB = require('./config/database');
const { attachUser } = require('./middleware/auth');
const app = express();
const port = process.env.PORT || 3000;

// Load environment variables
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false, 
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 20 * 60 * 1000, 
    httpOnly: true
  },
}));

// Flash messages middleware
app.use(flash());

// Make flash messages available to all templates
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.info_msg = req.flash('info');
  next();
});

// Attach user to request if logged in
app.use(attachUser);

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
connectDB();

// Routes
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const shopRoutes = require('./routes/shopRoutes');

// Apply routes
app.use('/', userRoutes);
app.use('/courses', courseRoutes);
app.use('/payments', paymentRoutes);
app.use('/shop', shopRoutes);

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).render('common/error', { 
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    user: req.user
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('common/error', { 
    title: 'Server Error',
    message: 'Something went wrong on our end.',
    user: req.user
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});