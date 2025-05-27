
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  hours: { type: Number, required: true, default: 0 },
  hoursStudied: { type: Number, default: 0 },
  deadline: { type: Date },
});

module.exports = mongoose.model('Subject', subjectSchema);