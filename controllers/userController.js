/**
 * USER CONTROLLER
 * Handles all user-related operations including the Hybrid OTP Authentication System
 * 
 * This controller implements PeerRent's unique authentication approach:
 * - Users register with email + 4-digit PIN
 * - Users login by requesting email code + entering PIN+code = 8-digit key
 * - JWT tokens are stored in secure httpOnly cookies
 * - Supports both API calls and form submissions
 * 
 * Authentication Flow:
 * 1. register() - Create account with email + 4-digit PIN
 * 2. requestLoginCode() - Send 4-digit code to user's email
 * 3. loginWithOtp() - Verify PIN+code, issue JWT token
 * 4. logout() - Clear authentication cookie
 * 
 * Additional Features:
 * - User profile viewing with review system
 * - Average rating calculation for users
 */

const User = require('../models/User');
const Review = require('../models/Review');
const bcrypt = require('bcryptjs');           // For hashing user PINs securely
const jwt = require('jsonwebtoken');         // For creating authentication tokens
const { sendLoginCode } = require('../config/mailer'); // Email service for OTP delivery

/**
 * REGISTER USER - Step 1 of Hybrid OTP Authentication
 * Creates a new user account with email and 4-digit PIN
 * 
 * Process:
 * 1. Validates PIN is exactly 4 digits
 * 2. Checks if email already exists
 * 3. Hashes PIN with bcrypt for security
 * 4. Saves user to database
 * 5. Redirects to login page
 * 
 * @param {Object} req.body.email - User's email address (unique identifier)
 * @param {String} req.body.secretPin - User's 4-digit PIN (first part of login key)
 */
exports.register = async (req, res) => {
  try {
    const { email, secretPin } = req.body;

    // Validate PIN format: must be exactly 4 digits
    if (!secretPin || secretPin.length !== 4 || !/^\d{4}$/.test(secretPin)) {
      return res.status(400).json({ message: 'Secret PIN must be exactly 4 digits' });
    }

    // Check for existing user to prevent duplicate accounts
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the PIN using bcrypt for security (never store plain text PINs)
    const salt = await bcrypt.genSalt(10);
    const hashedSecret = await bcrypt.hash(secretPin, salt);

    // Create new user with email and hashed PIN
    user = new User({
      email,
      hashedSecret
    });

    await user.save();

    // Handle different request types (form submission vs API call)
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      res.redirect('/login');  // Form submission → redirect to login page
    } else {
      res.status(201).json({ message: 'User registered successfully. Please login.' }); // API call → JSON response
    }
  } catch (err) {
    console.error('Registration error:', err.message);
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      res.status(500).send('Server Error');
    } else {
      res.status(500).json({ message: 'Server Error' });
    }
  }
};

/**
 * REQUEST LOGIN CODE - Step 2 of Hybrid OTP Authentication
 * Generates and emails 4-digit code to user (second part of 8-digit login key)
 * 
 * Process:
 * 1. Finds user by email
 * 2. Generates random 4-digit OTP
 * 3. Sets 10-minute expiration time
 * 4. Saves OTP to user record (temporary)
 * 5. Sends OTP via email
 * 6. Shows OTP verification page
 * 
 * @param {String} req.body.email - User's registered email address
 */
exports.requestLoginCode = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email address
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate random 4-digit OTP (1000-9999)
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Set OTP expiration to 10 minutes from now for security
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Temporarily store OTP and expiration in user record
    user.otp = code;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP to user's email using mailer service
    await sendLoginCode(email, code);

    // Handle different request types
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      res.render('verify-otp', { email: email });  // Form → show OTP entry page
    } else {
      res.json({ message: 'Login code sent to your email', email: email }); // API → JSON response
    }
  } catch (err) {
    console.error('Login code request error:', err.message);
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      res.status(500).send('Server Error');
    } else {
      res.status(500).json({ message: 'Server Error' });
    }
  }
};

/**
 * LOGIN WITH OTP - Step 3 of Hybrid OTP Authentication
 * Verifies 8-digit login key (PIN + OTP) and issues JWT token
 * 
 * Process:
 * 1. Validates 8-digit format
 * 2. Splits into PIN (first 4) and OTP (last 4)
 * 3. Verifies OTP hasn't expired
 * 4. Compares OTP with stored value
 * 5. Verifies PIN using bcrypt
 * 6. Issues JWT token in secure cookie
 * 7. Clears temporary OTP data
 * 8. Redirects to user dashboard
 * 
 * @param {String} req.body.email - User's email address
 * @param {String} req.body.fullOtp - 8-digit key (4-digit PIN + 4-digit OTP)
 */
exports.loginWithOtp = async (req, res) => {
  try {
    const { email, fullOtp } = req.body;

    // Validate 8-digit format for login key
    if (!fullOtp || fullOtp.length !== 8 || !/^\d{8}$/.test(fullOtp)) {
      return res.status(400).json({ message: 'OTP must be exactly 8 digits' });
    }

    // Split 8-digit key: first 4 = user's PIN, last 4 = email OTP
    const userPin = fullOtp.substring(0, 4);
    const emailCode = fullOtp.substring(4, 8);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check OTP validity and expiration
    if (!user.otp || !user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired or is invalid' });
    }

    // Verify email code matches stored OTP
    if (emailCode !== user.otp) {
      return res.status(400).json({ message: 'Invalid email code' });
    }

    // Verify PIN using bcrypt comparison with hashed PIN
    const isPinValid = await bcrypt.compare(userPin, user.hashedSecret);
    if (!isPinValid) {
      return res.status(400).json({ message: 'Invalid secret PIN' });
    }

    // Create JWT token payload with user ID
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign JWT token with secret and 1-hour expiration
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '1h' }
    );

    // Clear temporary OTP data from user record for security
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Handle different request types
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      // Set JWT token in secure, httpOnly cookie (prevents XSS attacks)
      res.cookie('token', token, {
        httpOnly: true,                                    // Prevents client-side JavaScript access
        secure: process.env.NODE_ENV === 'production',    // HTTPS only in production
        maxAge: 3600000                                    // 1 hour expiration
      });

      res.redirect('/my-listings');  // Form → redirect to user dashboard
    } else {
      res.json({ token });  // API → return token in response
    }
  } catch (err) {
    console.error('Login verification error:', err.message);
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      res.status(500).send('Server Error');
    } else {
      res.status(500).json({ message: 'Server Error' });
    }
  }
};

/**
 * LOGOUT USER
 * Clears authentication cookie to log user out
 * Simple but secure logout by removing JWT token
 */
exports.logout = (req, res) => {
  res.clearCookie('token');  // Remove JWT token cookie
  res.redirect('/');         // Redirect to home page
};

/**
 * GET USER PROFILE
 * Displays user profile page with reviews and average rating
 * 
 * Features:
 * - Shows user information (excluding sensitive data)
 * - Displays all reviews received by the user
 * - Calculates and shows average rating
 * - Used for building trust and reputation system
 * 
 * @param {String} req.params.userId - ID of user whose profile to display
 */
exports.getUserProfile = async (req, res) => {
  try {
    // Find user by ID, excluding sensitive fields like password
    const profileUser = await User.findById(req.params.userId).select('-hashedSecret');
    if (!profileUser) {
      return res.status(404).send('User not found');
    }

    // Find all reviews where this user is the reviewee (person being reviewed)
    // Populate reviewer information to show who wrote each review
    const reviews = await Review.find({ reviewee: req.params.userId }).populate('reviewer', 'email');

    // Calculate average rating from all reviews
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = (totalRating / reviews.length).toFixed(1);  // Round to 1 decimal place
    }

    // Render profile page with user data, reviews, and average rating
    res.render('profile', { 
      profileUser: profileUser, 
      reviews: reviews, 
      averageRating: averageRating 
    });
  } catch (err) {
    console.error('Profile viewing error:', err.message);
    res.status(500).send('Server Error');
  }
};