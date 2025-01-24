const mongoose = require('mongoose');
// Connects to the database
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/university');
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
