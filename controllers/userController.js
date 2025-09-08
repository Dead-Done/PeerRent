const User = require('../models/User');
const Review = require('../models/Review');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendLoginCode } = require('../config/mailer'); // Import the email function

// 1. New Registration Function
exports.register = async (req, res) => {
  try {
    const { email, secretPin } = req.body;

    // Check if secretPin is exactly 4 digits
    if (!secretPin || secretPin.length !== 4 || !/^\d{4}$/.test(secretPin)) {
      return res.status(400).json({ message: 'Secret PIN must be exactly 4 digits' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the secretPin using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedSecret = await bcrypt.hash(secretPin, salt);

    // Create a new User with the email and the hashedSecret
    user = new User({
      email,
      hashedSecret
    });

    // Save the user
    await user.save();

    // Check if request is from form submission (redirect) or API call (JSON response)
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      res.redirect('/login');
    } else {
      res.status(201).json({ message: 'User registered successfully. Please login.' });
    }
  } catch (err) {
    console.error(err.message);
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      res.status(500).send('Server Error');
    } else {
      res.status(500).json({ message: 'Server Error' });
    }
  }
};

// 2. New Function to Request a Login Code
exports.requestLoginCode = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a random 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Set an expiration time (10 minutes from now)
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Save the unhashed code and expiration time to the user document
    user.otp = code;
    user.otpExpires = otpExpires;
    await user.save();

    // Send the code to the user's email
    await sendLoginCode(email, code);

    // Check if request is from form submission (redirect) or API call (JSON response)
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      res.render('verify-otp', { email: email });
    } else {
      res.json({ message: 'Login code sent to your email', email: email });
    }
  } catch (err) {
    console.error(err.message);
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      res.status(500).send('Server Error');
    } else {
      res.status(500).json({ message: 'Server Error' });
    }
  }
};

// 3. New Function to Verify the OTP and Log In
exports.loginWithOtp = async (req, res) => {
  try {
    const { email, fullOtp } = req.body;

    // Check if the fullOtp is exactly 8 digits
    if (!fullOtp || fullOtp.length !== 8 || !/^\d{8}$/.test(fullOtp)) {
      return res.status(400).json({ message: 'OTP must be exactly 8 digits' });
    }

    // Split the fullOtp into the first 4 digits (user's PIN) and the last 4 digits (email code)
    const userPin = fullOtp.substring(0, 4);
    const emailCode = fullOtp.substring(4, 8);

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user's OTP has expired or doesn't exist
    if (!user.otp || !user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired or is invalid' });
    }

    // Compare the email code part of the OTP with the 'otp' field in the database
    if (emailCode !== user.otp) {
      return res.status(400).json({ message: 'Invalid email code' });
    }

    // Use bcrypt.compare to check if the user's PIN part matches the 'hashedSecret' in the database
    const isPinValid = await bcrypt.compare(userPin, user.hashedSecret);
    if (!isPinValid) {
      return res.status(400).json({ message: 'Invalid secret PIN' });
    }

    // If all checks pass, generate a JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '1h' }
    );

    // Important: Clear the 'otp' and 'otpExpires' fields in the user document and save it.
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Check if request is from form submission (redirect) or API call (JSON response)
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      // Set the token in a secure, httpOnly cookie that expires in 1 hour.
      res.cookie('token', token, {
        httpOnly: true, // Prevents client-side JS from accessing the cookie
        secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
        maxAge: 3600000 // 1 hour in milliseconds
      });

      // Redirect the user to their listings page.
      res.redirect('/my-listings');
    } else {
      res.json({ token });
    }
  } catch (err) {
    console.error(err.message);
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      res.status(500).send('Server Error');
    } else {
      res.status(500).json({ message: 'Server Error' });
    }
  }
};

// Add this function to controllers/userController.js
exports.logout = (req, res) => {
  // Clear the 'token' cookie.
  res.clearCookie('token');
  // Redirect the user back to the home page.
  res.redirect('/');
};

// Get user profile with reviews
exports.getUserProfile = async (req, res) => {
  try {
    // 1. Find the user being viewed using the ID from req.params.userId, excluding password
    const profileUser = await User.findById(req.params.userId).select('-password');
    if (!profileUser) {
      return res.status(404).send('User not found');
    }

    // 2. Find all reviews where the 'reviewee' field matches the user's ID. Populate the 'reviewer' field to get their email
    const reviews = await Review.find({ reviewee: req.params.userId }).populate('reviewer', 'email');

    // 3. Calculate the average rating from all the found reviews. If there are no reviews, the average should be 0
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = (totalRating / reviews.length).toFixed(1);
    }

    // 4. Render the 'profile.ejs' view, passing in an object containing: the user being viewed, the array of reviews, and the calculated average rating
    res.render('profile', { 
      profileUser: profileUser, 
      reviews: reviews, 
      averageRating: averageRating 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};