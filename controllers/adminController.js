// controllers/adminController.js
const User = require('../models/User');
const Item = require('../models/Item');
const RentalRequest = require('../models/RentalRequest');
const { ADMIN_CREDENTIALS } = require('../config/adminConfig');

// Show admin login page
exports.getAdminLogin = (req, res) => {
    // Check if already logged in as admin
    if (req.session && req.session.isAdmin) {
        return res.redirect('/admin/dashboard');
    }
    
    res.render('admin-login', {
        title: 'Admin Login',
        error: req.query.error
    });
};

// Handle admin login form submission
exports.postAdminLogin = (req, res) => {
    const { adminId, adminPassword } = req.body;
    
    if (adminId === ADMIN_CREDENTIALS.id && adminPassword === ADMIN_CREDENTIALS.password) {
        // Set admin session
        req.session.isAdmin = true;
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/admin?error=Invalid credentials');
    }
};

// Function to get the main admin dashboard view
exports.getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalItems = await Item.countDocuments();
        const activeItems = await Item.countDocuments({ status: 'available' });
        
        res.render('admin-dashboard', {
            title: 'Admin Dashboard',
            totalUsers,
            totalItems,
            activeItems
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).send('Server Error');
    }
};

// Function for an admin to delete any item
exports.adminDeleteItem = async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.itemId);
        res.json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Admin delete error:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
};

// Admin logout
exports.adminLogout = (req, res) => {
    if (req.session) {
        req.session.isAdmin = false;
    }
    res.redirect('/admin');
};

// List users for admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).limit(100);
        res.render('admin-users', {
            title: 'Manage Users',
            users
        });
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).send('Server Error');
    }
};

// List items for admin
exports.getItems = async (req, res) => {
    try {
        const items = await Item.find().populate('owner', 'email').sort({ createdAt: -1 }).limit(100);
        res.render('admin-items', {
            title: 'Manage Items',
            items
        });
    } catch (error) {
        console.error('Admin items error:', error);
        res.status(500).send('Server Error');
    }
};

// List rentals for admin
exports.getRentals = async (req, res) => {
    try {
        const rentals = await RentalRequest.find()
            .populate('item')
            .populate({ path: 'item', populate: { path: 'owner', select: 'email' } })
            .populate('renter', 'email')
            .sort({ createdAt: -1 })
            .limit(100);

        res.render('admin-rentals', {
            title: 'Manage Rentals',
            rentals
        });
    } catch (error) {
        console.error('Admin rentals error:', error);
        res.status(500).send('Server Error');
    }
};
