const mongoose = require('mongoose');

const userScheduleSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  unavailableTimes: [
    {
      date: { type: String },
      startTime: { type: String },
      endTime: { type: String },
    },
  ],
});

userScheduleSchema.pre('save', function(next) {
  console.log('Validating user schedule document:', this);
  next();
});

module.exports = mongoose.model('UserSchedule', userScheduleSchema);