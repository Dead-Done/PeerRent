const User = require('../models/User');
const Review = require('../models/Review');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User registration
exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create and sign JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretjwtkey', // Use environment variable for secret
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// User login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Create and sign JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretjwtkey', // Use environment variable for secret
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
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