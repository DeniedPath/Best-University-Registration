// scripts/seedCourses.js
//const mongoose = require('mongoose');
//const Course = require('../models/course'); // Adjust the path as needed
///require('dotenv').config(); // Load environment variables

// Connect to MongoDB
///const connectDB = async () => {
 /// try {
  // await mongoose.connect(process.env.MONGODB_URI, {
   //   useNewUrlParser: true,
   //   useUnifiedTopology: true,
   // });
  //  console.log('MongoDB Connected...');
 // } catch (err) {
  //  console.error('Database connection error:', err.message);
  //  process.exit(1); // Exit the process with failure
 // }
//};

// Dummy courses data
//const dummyCourses = [
//  {
 //   name: 'Introduction to Computer Science',
 //   description: 'Learn the basics of computer science and programming.',
 //   credits: 3,
 // },
 // {
   // name: 'Web Development Fundamentals',
  //  description: 'Master HTML, CSS, and JavaScript for building modern websites.',
  //  credits: 4,
 // },
  //{
  //  name: 'Data Structures and Algorithms',
  //  description: 'Understand essential data structures and algorithms for problem-solving.',
  //  credits: 4,
 // },
  //{
 //   name: 'Database Systems',
 //   description: 'Learn how to design and manage relational databases.',
 //   credits: 3,
//  },
//];

// Function to add dummy courses
//const addDummyCourses = async () => {
 // try {
   // console.log('Clearing existing courses...');
  //  await Course.deleteMany({}); // Clear existing courses
   // console.log('Inserting dummy courses...');
   // await Course.insertMany(dummyCourses);
  //  console.log('Dummy courses added successfully!');
 // } catch (error) {
 //   console.error('Error adding dummy courses:', error);
//  } finally {
 //   mongoose.connection.close(); // Close the database connection
 // }
//};

// Run the script
//(async () => {
 /// await connectDB(); // Connect to the database
 /// await addDummyCourses(); // Add dummy courses
//})();