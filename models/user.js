const mongoose = require('mongoose');
// Creates new user for all roles (students, administrators, teachers)
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'admin'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
