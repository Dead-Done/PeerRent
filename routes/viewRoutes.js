const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const userController = require('../controllers/userController');
const rentalController = require('../controllers/rentalController');
const { isAuthenticated } = require('../middleware/auth'); // Import the middleware

// Public routes:
// Home page
router.get('/', (req, res) => {
  res.render('home');
});

// Marketplace page
router.get('/marketplace', itemController.getMarketplace);

// User profile page
router.get('/users/:userId/profile', userController.getUserProfile);

// Protected routes:
// New item form page
router.get('/items/new', isAuthenticated, (req, res) => {
  res.render('newItem');
});

// My listings page
router.get('/my-listings', isAuthenticated, itemController.getItemsByUser);

// Edit item page
router.get('/items/edit/:id', isAuthenticated, itemController.getEditItem);

// My rentals page (items user has requested to rent)
router.get('/my-rentals', isAuthenticated, rentalController.getMyRentals);

// Manage rentals page (requests for user's items)
router.get('/manage-rentals', isAuthenticated, rentalController.getManageRentals);

module.exports = router;
