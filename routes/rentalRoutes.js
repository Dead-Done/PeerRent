// routes/rentalRoutes.js
const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { isAuthenticated } = require('../middleware/auth'); // Import the middleware

// POST /rentals/:itemId -> Create a new rental request
router.post('/:itemId', isAuthenticated, rentalController.createRentalRequest);

// POST /rentals/:rentalId/status -> Update rental request status
router.post('/:rentalId/status', isAuthenticated, rentalController.updateRentalStatus);

// POST /rentals/:rentalId/review -> Submit a review for a rental
router.post('/:rentalId/review', isAuthenticated, rentalController.postReview);

module.exports = router;
