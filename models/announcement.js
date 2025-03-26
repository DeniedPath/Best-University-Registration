const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnnouncementSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    default: null // null means it's a general announcement
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  expiryDate: {
    type: Date,
    default: null // null means no expiry
  },
  sendEmail: {
    type: Boolean,
    default: false
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
  }
});

// Virtual for checking if announcement is expired
AnnouncementSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Add indexes for better query performance
AnnouncementSchema.index({ course: 1 });
AnnouncementSchema.index({ createdBy: 1 });
AnnouncementSchema.index({ priority: 1 });
AnnouncementSchema.index({ createdAt: -1 }); // Descending for newest first

module.exports = mongoose.model('Announcement', AnnouncementSchema);
