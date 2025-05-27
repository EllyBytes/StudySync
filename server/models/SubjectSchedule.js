const mongoose = require('mongoose');

const subjectScheduleSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subject: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  schedule: [
    {
      date: { type: String, required: true },
      slots: [
        {
          startTime: { type: String, required: true },
          endTime: { type: String, required: true },
        },
      ],
    },
  ],
});

subjectScheduleSchema.index({ userId: 1, subject: 1 }, { unique: true });

subjectScheduleSchema.pre('save', function(next) {
  console.log('Validating subject schedule document:', this);
  next();
});

module.exports = mongoose.model('SubjectSchedule', subjectScheduleSchema);