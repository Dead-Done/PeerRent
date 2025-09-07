// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.isAuthenticated = async (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Get the token from the header (by splitting the string and taking the second part)
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using the JWT_SECRET from your .env file
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user by the ID that's inside the decoded token.
      //    Attach the user object to the request, but exclude the password.
      req.user = await User.findById(decoded.user.id).select('-password');

      // 5. Check if user exists (token might be valid but user deleted)
      if (!req.user) {
        return res.status(401).send('Not authorized, user not found');
      }

      // 6. If the user is found, call next() to proceed to the next function in the chain.
      next();

    } catch (error) {
      // If the token is invalid or expired, send a 401 Unauthorized error.
      console.error('Auth middleware error:', error);
      return res.status(401).send('Not authorized, token failed');
    }
  } else {
    // If there's no token at all, send a 401 Unauthorized error.
    return res.status(401).send('Not authorized, no token');
  }
};
