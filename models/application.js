const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  zipCode: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  educationLevel: {
    type: String,
    enum: ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctoral Degree', 'Other'],
    required: true
  },
  previousSchool: {
    type: String,
    trim: true
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4.0
  },
  desiredProgram: {
    type: String,
    required: true,
    trim: true
  },
  personalStatement: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  accountCreated: {
    type: Boolean,
    default: false
  },
  tempPassword: {
    type: String
  },
  applicationDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
