const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  credits: { type: Number, required: true },
  department: { type: String, required: true },
  instructor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  capacity: { type: Number, default: 30 },
  enrolled: { type: Number, default: 0 },
  schedule: {
    days: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    startTime: String,
    endTime: String,
    location: String
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  price: { type: Number, default: 0 },
  syllabus: String,
  isActive: { type: Boolean, default: true },
  semester: { 
    type: String, 
    enum: ['Fall', 'Spring', 'Summer'], 
    required: true 
  },
  year: { 
    type: Number, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;