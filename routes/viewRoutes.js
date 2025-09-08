// routes/viewRoutes.js
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth'); // Assuming rentalController is needed here too
const rentalController = require('../controllers/rentalController');

// --- STATIC PUBLIC ROUTES (must come before any routes with parameters) ---
router.get('/', (req, res) => {
  res.render('home');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/marketplace', itemController.getMarketplace);


// --- STATIC PROTECTED ROUTES (must come before any routes with parameters) ---
router.get('/items/new', isAuthenticated, (req, res) => {
  res.render('newItem');
});

router.get('/my-listings', isAuthenticated, itemController.getItemsByUser);

// Note: Ensure the controller functions getMyRentals and getManageRentals exist
router.get('/my-rentals', isAuthenticated, rentalController.getMyRentals);
router.get('/manage-rentals', isAuthenticated, rentalController.getManageRentals);

// Add review page route
router.get('/rentals/:rentalId/review', isAuthenticated, rentalController.getReviewPage);


// --- DYNAMIC ROUTES (with parameters, must come last) ---
router.get('/users/:userId/profile', userController.getUserProfile);

// Edit item page (dynamic route with parameter)
router.get('/items/edit/:id', isAuthenticated, itemController.getEditItem);


module.exports = router;
