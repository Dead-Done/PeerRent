// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// All routes in this file are protected and require admin privileges
router.use(isAuthenticated, isAdmin);

// GET /admin -> The main dashboard page
router.get('/', adminController.getDashboard);

// POST /admin/items/:itemId/delete -> Admin action to delete an item
router.post('/items/:itemId/delete', adminController.adminDeleteItem);

module.exports = router;
