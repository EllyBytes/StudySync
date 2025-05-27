const express = require('express');
const AnalysisReport = require('../models/AnalysisReport');
const auth = require('../middleware/auth');

const router = express.Router();

// Save or update analysis report
router.post('/', auth, async (req, res) => {
  try {
    const { month, hoursStudied, completionPercentage, dailyHours } = req.body;
    let report = await AnalysisReport.findOne({ userId: req.user.userId, month });

    if (report) {
      // Update existing report
      hoursStudied.forEach(newEntry => {
        const existingEntry = report.hoursStudied.find(item => item.subject === newEntry.subject);
        if (existingEntry) {
          existingEntry.hours += newEntry.hours;
        } else {
          report.hoursStudied.push(newEntry);
        }
      });
      completionPercentage.forEach(newEntry => {
        const existingEntry = report.completionPercentage.find(item => item.subject === newEntry.subject);
        if (existingEntry) {
          existingEntry.percentage = newEntry.percentage;
        } else {
          report.completionPercentage.push(newEntry);
        }
      });
      dailyHours.forEach(newEntry => {
        const existingEntry = report.dailyHours.find(item => item.date === newEntry.date);
        if (existingEntry) {
          existingEntry.hours += newEntry.hours;
        } else {
          report.dailyHours.push(newEntry);
        }
      });

      // Update total hours studied
      const totalNewHours = hoursStudied.reduce((sum, entry) => sum + entry.hours, 0);
      report.totalHoursStudied += totalNewHours;

      // Enhanced consistency score: Weight by hours studied per day
      const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
      const dailyTotals = {};
      report.dailyHours.forEach(({ date, hours }) => {
        dailyTotals[date] = (dailyTotals[date] || 0) + hours;
      });
      const weightedScore = Object.values(dailyTotals).reduce((score, hours) => {
        // Give a base point for studying, plus additional points for hours
        const base = 1; // 1 point for studying on a day
        const hoursBonus = Math.min(hours * 10, 10); // Up to 10 bonus points for hours (1h = 10 points)
        return score + base + hoursBonus;
      }, 0);
      const maxScore = daysInMonth * (1 + 10); // Max score per day: 1 base + 10 bonus
      report.consistencyScore = ((weightedScore / maxScore) * 100).toFixed(2);
      await report.save();
    } else {
      // Fetch all reports to calculate total hours
      const allReports = await AnalysisReport.find({ userId: req.user.userId });
      const totalHoursSoFar = allReports.reduce((sum, r) => sum + (r.totalHoursStudied || 0), 0);
      const totalNewHours = hoursStudied.reduce((sum, entry) => sum + entry.hours, 0);

      // Enhanced consistency score
      const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
      const dailyTotals = {};
      dailyHours.forEach(({ date, hours }) => {
        dailyTotals[date] = (dailyTotals[date] || 0) + hours;
      });
      const weightedScore = Object.values(dailyTotals).reduce((score, hours) => {
        const base = 1;
        const hoursBonus = Math.min(hours * 10, 10);
        return score + base + hoursBonus;
      }, 0);
      const maxScore = daysInMonth * (1 + 10);
      const consistencyScore = ((weightedScore / maxScore) * 100).toFixed(2);

      // Create new report
      report = new AnalysisReport({
        userId: req.user.userId,
        month,
        hoursStudied,
        completionPercentage,
        dailyHours,
        totalHoursStudied: totalHoursSoFar + totalNewHours,
        consistencyScore,
      });
      await report.save();
    }
    res.status(201).json(report);
  } catch (error) {
    console.error('Error saving report:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Get analysis reports
router.get('/', auth, async (req, res) => {
  try {
    const reports = await AnalysisReport.find({ userId: req.user.userId }).sort({ month: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;