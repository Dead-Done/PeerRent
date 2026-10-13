// controllers/adminController.js
const User = require('../models/User');
const Item = require('../models/Item');
const RentalRequest = require('../models/RentalRequest');
const crypto = require('crypto');
const { removeUploads } = require('../utils/uploads');

// Timing-safe string comparison: hash both sides so lengths always match
const safeEqual = (a, b) => {
    const ha = crypto.createHash('sha256').update(String(a || '')).digest();
    const hb = crypto.createHash('sha256').update(String(b || '')).digest();
    return crypto.timingSafeEqual(ha, hb);
};

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

    const idOk = safeEqual(adminId, process.env.ADMIN_ID);
    const passOk = safeEqual(adminPassword, process.env.ADMIN_PASSWORD);

    if (idOk && passOk) {
        // New session id on privilege change
        req.session.regenerate((err) => {
            if (err) {
                console.error('Admin session error:', err);
                return res.redirect('/admin?error=Login failed');
            }
            req.session.isAdmin = true;
            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error('Admin session save error:', saveErr);
                    return res.redirect('/admin?error=Login failed');
                }
                res.redirect('/admin/dashboard');
            });
        });
    } else {
        res.redirect('/admin?error=Invalid credentials');
    }
};

// Function to get the main admin dashboard view
exports.getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalItems = await Item.countDocuments();
        const activeRentals = await RentalRequest.countDocuments({ status: 'accepted' });
        const pendingRentals = await RentalRequest.countDocuments({ status: 'pending' });
        
        res.render('admin-dashboard', {
            title: 'Admin Dashboard',
            totalUsers,
            totalItems,
            activeRentals,
            pendingRentals
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).send('Server Error');
    }
};

// Function for an admin to delete any item
exports.adminDeleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.itemId);
        if (!item) {
            return res.redirect('/admin/items?error=' + encodeURIComponent('Item not found.'));
        }

        const activeRental = await RentalRequest.exists({ item: item._id, status: 'accepted' });
        if (activeRental) {
            return res.redirect('/admin/items?error=' + encodeURIComponent('This item has an active rental.'));
        }

        await RentalRequest.updateMany({ item: item._id, status: 'pending' }, { status: 'declined' });
        await Item.findByIdAndDelete(item._id);
        await removeUploads(item.images);
        res.redirect('/admin/items?deleted=1');
    } catch (error) {
        console.error('Admin delete error:', error);
        res.redirect('/admin/items?error=' + encodeURIComponent('Failed to delete item.'));
    }
};

// Admin logout
exports.adminLogout = (req, res) => {
    if (!req.session) return res.redirect('/admin');
    req.session.destroy(() => res.redirect('/admin'));
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
            items,
            deleted: req.query.deleted,
            error: req.query.error
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
