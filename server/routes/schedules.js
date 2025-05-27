const express = require('express');
const UserSchedule = require('../models/Schedule');
const SubjectSchedule = require('../models/SubjectSchedule');
const auth = require('../middleware/auth');

const router = express.Router();

// Save or update schedule for a specific subject
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received POST request to /api/schedules');
    const { subject, startDate, endDate, schedule, unavailableTimes } = req.body;
    console.log('Saving schedule for user:', req.user.userId, 'Subject:', subject);
    console.log('Schedule data:', { subject, startDate, endDate, schedule, unavailableTimes });

    // Validate required fields
    if (!subject || !startDate || !endDate) {
      console.log('Validation failed: Missing subject, startDate, or endDate');
      return res.status(400).json({ error: 'subject, startDate, and endDate are required' });
    }

    if (!Array.isArray(schedule)) {
      console.log('Validation failed: schedule must be an array');
      return res.status(400).json({ error: 'schedule must be an array' });
    }

    if (!Array.isArray(unavailableTimes)) {
      console.log('Validation failed: unavailableTimes must be an array');
      return res.status(400).json({ error: 'unavailableTimes must be an array' });
    }

    // Save or update the subject's schedule
    let subjectSchedule = await SubjectSchedule.findOne({ userId: req.user.userId, subject });

    if (subjectSchedule) {
      console.log('Existing subject schedule found, updating...');
      subjectSchedule.startDate = startDate;
      subjectSchedule.endDate = endDate;
      subjectSchedule.schedule = schedule;
      await subjectSchedule.save();
      console.log('Updated subject schedule in DB:', subjectSchedule);
    } else {
      console.log('No existing subject schedule, creating new...');
      subjectSchedule = new SubjectSchedule({
        userId: req.user.userId,
        subject,
        startDate,
        endDate,
        schedule,
      });
      await subjectSchedule.save();
      console.log('Created new subject schedule in DB:', subjectSchedule);
    }

    // Save or update unavailableTimes in UserSchedule
    let userSchedule = await UserSchedule.findOne({ userId: req.user.userId });

    if (userSchedule) {
      console.log('Existing user schedule found, updating unavailableTimes...');
      userSchedule.unavailableTimes = unavailableTimes;
      await userSchedule.save();
      console.log('Updated user schedule in DB:', userSchedule);
    } else {
      console.log('No existing user schedule, creating new...');
      userSchedule = new UserSchedule({
        userId: req.user.userId,
        unavailableTimes,
      });
      await userSchedule.save();
      console.log('Created new user schedule in DB:', userSchedule);
    }

    res.status(200).json({ subjectSchedule, userSchedule });
  } catch (error) {
    console.error('Error saving schedule:', error.message);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: 'Validation failed', details: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Get all schedules for a user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Received GET request to /api/schedules for user:', req.user.userId);
    const subjectSchedules = await SubjectSchedule.find({ userId: req.user.userId });
    const userSchedule = await UserSchedule.findOne({ userId: req.user.userId });
    console.log('Fetched schedules for user:', req.user.userId, { subjectSchedules, userSchedule });
    res.json({
      subjectSchedules: subjectSchedules || [],
      unavailableTimes: userSchedule ? userSchedule.unavailableTimes : [],
    });
  } catch (error) {
    console.error('Error fetching schedules:', error.message);
    res.status(500).json({ error: 'Internal server error while fetching schedules' });
  }
});

module.exports = router;