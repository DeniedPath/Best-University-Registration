const express = require('express');
const session = require('express-session');
const connectDB = require('./config/database');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// Set view engine
app.set('view engine', 'ejs');

// Connect to MongoDB
connectDB();

// Routes
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');


app.use('/', userRoutes);
app.use('/courses', courseRoutes);


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});