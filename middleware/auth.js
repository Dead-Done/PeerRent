// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.isAuthenticated = async (req, res, next) => {
  let token;

  // 1. Look for the token in the cookie first.
  if (req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. If no cookie, fall back to checking the Authorization header.
  //    This ensures our API can still be used by other applications.
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 3. If there is still no token after checking both places, send an error.
  if (!token) {
    return res.status(401).send('Not authorized, no token');
  }

  // 4. If a token was found, verify it and attach the user to the request.
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.user.id).select('-hashedSecret');
    
    // Check if user exists (token might be valid but user deleted)
    if (!req.user) {
      return res.status(401).send('Not authorized, user not found');
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).send('Not authorized, token failed');
  }
};

// Add this new function to middleware/auth.js
exports.checkUser = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        res.locals.user = null; // Token is invalid or expired
        next();
      } else {
        // Find the user but exclude the hashedSecret for security
        let user = await User.findById(decoded.user.id).select('-hashedSecret');
        res.locals.user = user; // Make user data available in all views
        next();
      }
    });
  } else {
    res.locals.user = null; // No token means no user
    next();
  }
};

// Add this new function to middleware/auth.js

// This middleware should run AFTER isAuthenticated
exports.isAdmin = (req, res, next) => {
  // Check if a user is attached to the request and if their role is 'admin'
  if (req.user && req.user.role === 'admin') {
    next(); // The user is an admin, proceed to the next function
  } else {
    // The user is not an admin, send a "Forbidden" error
    res.status(403).send('Access Forbidden: You do not have administrator privileges.');
  }
};
