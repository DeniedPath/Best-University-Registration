// connectDB.js
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

// Connects to the database
const connectDB = async () => {
    try {
        // Use the MONGODB_URI from the .env file
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1); // Exit the process with failure
    }
};

module.exports = connectDB;