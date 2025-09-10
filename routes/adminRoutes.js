// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminAuth');

// Admin login page (no auth required)
router.get('/', adminController.getAdminLogin);
router.post('/login', adminController.postAdminLogin);

// Protected admin routes (require admin session)
router.get('/dashboard', requireAdmin, adminController.getDashboard);
router.post('/items/:itemId/delete', requireAdmin, adminController.adminDeleteItem);
router.post('/logout', adminController.adminLogout);

// Management pages
router.get('/users', requireAdmin, adminController.getUsers);
router.get('/items', requireAdmin, adminController.getItems);
router.get('/rentals', requireAdmin, adminController.getRentals);

module.exports = router;
