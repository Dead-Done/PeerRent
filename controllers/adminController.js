// controllers/adminController.js
const User = require('../models/User');
const Item = require('../models/Item');

// Function to get the main admin dashboard view
exports.getDashboard = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const itemCount = await Item.countDocuments();
    // You can add more stats here later
    res.render('admin-dashboard', { userCount, itemCount });
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

// Function for an admin to delete any item
exports.adminDeleteItem = async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.itemId);
    res.redirect('/admin/items'); // Redirect back to the item management page
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

// Add more admin functions here later, like managing all users
