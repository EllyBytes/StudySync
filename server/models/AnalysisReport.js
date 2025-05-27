const mongoose = require('mongoose');

const analysisReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true }, // e.g., "2025-05"
  hoursStudied: [{ subject: String, hours: Number }], // Per subject hours for the month
  completionPercentage: [{ subject: String, percentage: Number }], // Per subject completion
  dailyHours: [{ date: String, hours: Number }], // Daily hours for the month (e.g., "2025-05-25")
  totalHoursStudied: { type: Number, default: 0 }, // Total hours across all months
  consistencyScore: { type: Number, default: 0 }, // Score from 0 to 100
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AnalysisReport', analysisReportSchema);