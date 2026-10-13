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

const crypto = require('crypto');
const User = require('../models/User');
const Review = require('../models/Review');
const bcrypt = require('bcryptjs');           // For hashing user PINs and OTPs securely
const jwt = require('jsonwebtoken');         // For creating authentication tokens
const { sendLoginCode } = require('../config/mailer'); // Email service for OTP delivery
const { isFormRequest } = require('../utils/http');

const MAX_OTP_ATTEMPTS = 5;
const GENERIC_LOGIN_ERROR = 'Invalid email, PIN or code.';
// Used so a lookup for an unknown email still costs one bcrypt comparison
const DUMMY_HASH = bcrypt.hashSync('0000', 10);

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

// Respond with an error: re-render the view for form posts, JSON for API calls
function fail(req, res, status, message, view, extra = {}) {
  if (isFormRequest(req) && view) {
    return res.status(status).render(view, { error: message, ...extra });
  }
  return res.status(status).json({ message });
}

/**
 * REGISTER USER - Step 1 of Hybrid OTP Authentication
 * Creates a new user account with email and 4-digit PIN
 * 
 * @param {Object} req.body.email - User's email address (unique identifier)
 * @param {String} req.body.secretPin - User's 4-digit PIN (first part of login key)
 */
exports.register = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { secretPin } = req.body;

    if (!email) {
      return fail(req, res, 400, 'Email is required', 'register');
    }

    // Validate PIN format: must be exactly 4 digits
    if (typeof secretPin !== 'string' || !/^\d{4}$/.test(secretPin)) {
      return fail(req, res, 400, 'Secret PIN must be exactly 4 digits', 'register');
    }

    // Check for existing user to prevent duplicate accounts
    let user = await User.findOne({ email });
    if (user) {
      return fail(req, res, 400, 'User already exists', 'register');
    }

    // Hash the PIN using bcrypt for security (never store plain text PINs)
    const salt = await bcrypt.genSalt(10);
    const hashedSecret = await bcrypt.hash(secretPin, salt);

    user = new User({
      email,
      hashedSecret
    });

    await user.save();

    if (isFormRequest(req)) {
      res.redirect('/login');
    } else {
      res.status(201).json({ message: 'User registered successfully. Please login.' });
    }
  } catch (err) {
    console.error('Registration error:', err.message);
    fail(req, res, 500, 'Server Error', 'register');
  }
};

/**
 * REQUEST LOGIN CODE - Step 2 of Hybrid OTP Authentication
 * Generates and emails a 4-digit code (second part of the 8-digit login key).
 * The code is stored hashed. Unknown emails get the same response as known
 * ones so the endpoint cannot be used to discover accounts.
 * 
 * @param {String} req.body.email - User's registered email address
 */
exports.requestLoginCode = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    const respondSent = () => {
      if (isFormRequest(req)) {
        return res.render('verify-otp', { email });
      }
      return res.json({ message: 'Login code sent to your email', email });
    };

    const user = email ? await User.findOne({ email }) : null;
    if (!user) {
      return respondSent();
    }

    // Generate a 4-digit OTP (1000-9999) with a cryptographic RNG
    const code = crypto.randomInt(1000, 10000).toString();

    user.otpHash = await bcrypt.hash(code, 10);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save();

    try {
      await sendLoginCode(email, code);
    } catch (mailErr) {
      return fail(req, res, 503, 'Could not send login code. Please try again later.', 'login');
    }

    return respondSent();
  } catch (err) {
    console.error('Login code request error:', err.message);
    fail(req, res, 500, 'Server Error', 'login');
  }
};

/**
 * LOGIN WITH OTP - Step 3 of Hybrid OTP Authentication
 * Verifies the 8-digit login key (PIN + OTP) and issues a JWT.
 * Every failure returns the same message and both comparisons always run,
 * so a caller cannot tell which half was wrong.
 * 
 * @param {String} req.body.email - User's email address
 * @param {String} req.body.fullOtp - 8-digit key (4-digit PIN + 4-digit OTP)
 */
exports.loginWithOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { fullOtp } = req.body;
    const failView = (status, message) => fail(req, res, status, message, 'verify-otp', { email });

    // Validate 8-digit format for login key
    if (typeof fullOtp !== 'string' || !/^\d{8}$/.test(fullOtp)) {
      return failView(400, 'Login key must be exactly 8 digits.');
    }

    // Split 8-digit key: first 4 = user's PIN, last 4 = email OTP
    const userPin = fullOtp.substring(0, 4);
    const emailCode = fullOtp.substring(4, 8);

    const user = email ? await User.findOne({ email }) : null;

    const otpActive = !!(user && user.otpHash && user.otpExpires && new Date() <= user.otpExpires);

    // Always run both comparisons before deciding
    const otpOk = await bcrypt.compare(emailCode, otpActive ? user.otpHash : DUMMY_HASH);
    const pinOk = await bcrypt.compare(userPin, user ? user.hashedSecret : DUMMY_HASH);

    if (!user || !otpActive || !otpOk || !pinOk) {
      if (otpActive) {
        const updated = await User.findOneAndUpdate(
          { _id: user._id, otpHash: { $ne: null } },
          { $inc: { otpAttempts: 1 } },
          { new: true }
        );
        if (updated && updated.otpAttempts >= MAX_OTP_ATTEMPTS) {
          updated.otpHash = undefined;
          updated.otpExpires = undefined;
          await updated.save();
          return failView(400, 'Too many attempts. Request a new code.');
        }
      }
      return failView(400, GENERIC_LOGIN_ERROR);
    }

    // Sign JWT token with 1-hour expiration
    const token = jwt.sign(
      { user: { id: user.id } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Clear temporary OTP data from user record
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    if (isFormRequest(req)) {
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000
      });

      res.redirect('/my-listings');
    } else {
      res.json({ token });
    }
  } catch (err) {
    console.error('Login verification error:', err.message);
    fail(req, res, 500, 'Server Error', 'verify-otp', { email: normalizeEmail(req.body.email) });
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