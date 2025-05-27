const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.name || !this.name.trim()) {
    return next(new Error('Name is required.'));
  }
  if (!this.email || !this.email.trim()) {
    return next(new Error('Email is required.'));
  }
  if (!this.password) {
    return next(new Error('Password is required.'));
  }
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);