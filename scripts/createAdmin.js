/**
 * Script to create an admin user
 * Run with: node scripts/createAdmin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
require('dotenv').config();

// Admin user details - you can modify these
const adminUser = {
  name: 'Admin User',
  email: 'admin@bestuniversity.edu',
  password: 'Admin123!',
  role: 'admin'
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university-registration', {
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists with this email.');
      process.exit(0);
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    
    // Create the admin user
    const newAdmin = new User({
      name: adminUser.name,
      email: adminUser.email,
      password: hashedPassword,
      role: adminUser.role
    });
    
    // Save to database
    await newAdmin.save();
    
    console.log('Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Password:', adminUser.password);
    console.log('Role:', adminUser.role);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});
