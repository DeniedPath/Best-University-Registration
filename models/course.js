const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  credits: Number,
  // other fields...
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;