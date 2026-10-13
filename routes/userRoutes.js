const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authLimiter } = require('../middleware/rateLimit');

// POST /api/users/register - New registration with PIN
router.post('/register', authLimiter, userController.register);

// POST /api/users/login/request-code - Request login code via email
router.post('/login/request-code', authLimiter, userController.requestLoginCode);

// POST /api/users/login/verify-otp - Verify OTP and complete login
router.post('/login/verify-otp', authLimiter, userController.loginWithOtp);

// Add this route to routes/userRoutes.js
router.get('/logout', userController.logout);

module.exports = router;