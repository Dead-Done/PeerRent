const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// Home page
router.get('/', (req, res) => {
  res.render('home');
});

// Marketplace page
router.get('/marketplace', itemController.getMarketplace);

// New item form page
router.get('/items/new', (req, res) => {
  res.render('newItem');
});

// My listings page
router.get('/my-listings', itemController.getItemsByUser);

// Edit item page
router.get('/items/edit/:id', itemController.getEditItem);

module.exports = router;
