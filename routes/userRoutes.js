const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users/register - New registration with PIN
router.post('/register', userController.register);

// POST /api/users/login/request-code - Request login code via email
router.post('/login/request-code', userController.requestLoginCode);

// POST /api/users/login/verify-otp - Verify OTP and complete login
router.post('/login/verify-otp', userController.loginWithOtp);

// Add this route to routes/userRoutes.js
router.get('/logout', userController.logout);

module.exports = router;