const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  hashedSecret: { // This will store the user's 4-digit PIN, hashed with bcrypt.
    type: String,
    required: true
  },
  otp: { // This will temporarily store the 4-digit code sent via email.
    type: String,
    required: false
  },
  otpExpires: { // The expiration time for the OTP.
    type: Date,
    required: false
  },
  
  // ADD THIS NEW FIELD:
  role: {
    type: String,
    enum: ['user', 'admin'], // The role can only be one of these two values
    default: 'user'         // New users will always be 'user' by default
  }
}, { timestamps: true }); // timestamps adds createdAt and updatedAt fields

module.exports = mongoose.model('User', userSchema);