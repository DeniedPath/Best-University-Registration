const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the submission schema (nested in assignment)
const SubmissionSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  files: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  comments: {
    type: String,
    trim: true
  },
  grade: {
    type: Number,
    min: 0,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  isLate: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned', 'resubmitted'],
    default: 'submitted'
  }
});

// Define the assignment schema
const AssignmentSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 0
  },
  assignmentType: {
    type: String,
    enum: ['homework', 'quiz', 'exam', 'project', 'paper', 'presentation', 'other'],
    default: 'homework'
  },
  instructions: {
    type: String,
    trim: true
  },
  allowLateSubmissions: {
    type: Boolean,
    default: false
  },
  lateSubmissionPenalty: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  visibleToStudents: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: null
  },
  submissions: [SubmissionSchema]
});

// Virtual for checking if assignment is past due
AssignmentSchema.virtual('isPastDue').get(function() {
  return new Date() > this.dueDate;
});

// Virtual for calculating average grade
AssignmentSchema.virtual('averageGrade').get(function() {
  if (!this.submissions || this.submissions.length === 0) {
    return null;
  }
  
  const gradedSubmissions = this.submissions.filter(sub => sub.grade !== null);
  if (gradedSubmissions.length === 0) {
    return null;
  }
  
  const sum = gradedSubmissions.reduce((total, sub) => total + sub.grade, 0);
  return sum / gradedSubmissions.length;
});

// Add indexes for better query performance
AssignmentSchema.index({ course: 1 });
AssignmentSchema.index({ dueDate: 1 });
AssignmentSchema.index({ createdBy: 1 });
AssignmentSchema.index({ 'submissions.student': 1 });

module.exports = mongoose.model('Assignment', AssignmentSchema);
