const express = require('express');
const app = express();
const connectDB = require('./config/database');
const expressLayouts = require('express-ejs-layouts');
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


// Set view engine
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', './layouts/main');

// Routes
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/course');

app.use('/', userRoutes);
app.use('/courses', courseRoutes);

// Connect to MongoDB
connectDB();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
