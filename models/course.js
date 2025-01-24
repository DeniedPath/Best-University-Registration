const mongoose = require('mongoose');
// creates course schema
const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Course', courseSchema);