/**
 * USER MODEL
 * Database schema for user accounts in the PeerRent platform
 * 
 * This model supports the Hybrid OTP Authentication System:
 * - Users set a 4-digit PIN (stored as hashedSecret)
 * - System generates 4-digit email code (stored as otp)
 * - Users combine both to create 8-digit login key
 * 
 * Authentication Flow:
 * 1. User registers with email + 4-digit PIN
 * 2. User requests login code → system sends 4-digit OTP via email
 * 3. User enters PIN + OTP = 8-digit key to login
 * 4. System verifies and issues JWT token stored in cookies
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // User's email address - serves as unique identifier
  email: {
    type: String,
    required: true,
    unique: true,        // No duplicate emails allowed
    trim: true          // Remove whitespace
  },
  
  // User's 4-digit PIN, hashed with bcrypt for security
  // This is part 1 of the 8-digit login key
  hashedSecret: {
    type: String,
    required: true
  },
  
  // 4-digit One-Time Password sent via email during login
  // This is part 2 of the 8-digit login key
  // Temporarily stored and expires after a set time
  otp: {
    type: String,
    required: false     // Only present during active login attempts
  },
  
  // Expiration timestamp for the OTP
  // OTP becomes invalid after this time for security
  otpExpires: {
    type: Date,
    required: false     // Only present when OTP is active
  },
  
  // User role for access control (currently unused in favor of session-based admin)
  // Originally designed for role-based admin system
  role: {
    type: String,
    enum: ['user', 'admin'],  // Only these values allowed
    default: 'user'           // All new registrations default to 'user'
  }
}, { 
  timestamps: true    // Automatically adds createdAt and updatedAt fields
});

/**
 * IMPORTANT NOTES:
 * 
 * Security Features:
 * - PIN is hashed with bcrypt (never stored in plain text)
 * - OTP expires after short time window
 * - Email serves as username (no separate username needed)
 * 
 * Authentication Integration:
 * - Works with JWT tokens for session management
 * - Integrates with cookie-based authentication
 * - Supports password-less login system
 * 
 * Admin System:
 * - Role field exists but current admin system uses session-based auth
 * - Admin credentials stored separately in config/adminConfig.js
 */

module.exports = mongoose.model('User', userSchema);