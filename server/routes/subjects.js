const express = require('express');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all subjects
router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user.userId });
    console.log('Fetched subjects for user:', req.user.userId, subjects);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Add a subject
router.post('/', auth, async (req, res) => {
  try {
    const { name, hours, deadline, hoursStudied } = req.body;
    const subject = new Subject({
      userId: req.user.userId,
      name,
      hours: Number(hours) || 0,
      hoursStudied: Number(hoursStudied) || 0,
      deadline,
    });
    await subject.save();
    console.log('Added subject:', subject);
    res.status(201).json(subject);
  } catch (error) {
    console.error('Error adding subject:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Update a subject
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, hours, hoursStudied, deadline } = req.body;
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    if (name) subject.name = name;
    if (hours) subject.hours = hours;
    if (hoursStudied !== undefined) subject.hoursStudied = hoursStudied;
    if (deadline !== undefined) subject.deadline = deadline || undefined;
    await subject.save();
    res.json(subject);
  } catch (error) {
    console.error('Error updating subject:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Delete a subject
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log(`Deleting subject with ID: ${req.params.id}, for user: ${req.user.userId}`);
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!subject) {
      console.log(`Subject not found for ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Subject not found' });
    }
    await Subject.deleteOne({ _id: req.params.id });
    console.log(`Subject deleted successfully: ${req.params.id}`);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;