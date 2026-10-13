const Item = require('../models/Item');
const RentalRequest = require('../models/RentalRequest');
const { isFormRequest } = require('../utils/http');
const escapeRegex = require('../utils/escapeRegex');
const { removeUploads } = require('../utils/uploads');

// Create a new item
exports.createItem = async (req, res) => {
  try {
    // Now we can use the authenticated user's ID as the owner
    // Convert uploaded files to public URLs
    const uploaded = (req.files || []).map(f => `/uploads/${f.filename}`);
    const combinedImages = uploaded.slice(0, 10);

    const itemData = {
      name: req.body.name,
      description: req.body.description,
      dailyPrice: req.body.dailyPrice,
      images: combinedImages,
      owner: req.user.id // Use the authenticated user's ID
    };
    
    const newItem = new Item(itemData);
    await newItem.save();
    
    // Check if request is from form submission (redirect) or API call (JSON response)
    if (isFormRequest(req)) {
      res.redirect('/marketplace?success=listed');
    } else {
      res.status(201).json(newItem);
    }
  } catch (err) {
    if (isFormRequest(req)) {
      res.status(400).send('Error creating item: ' + err.message);
    } else {
      res.status(400).json({ message: err.message });
    }
  }
};

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all items for marketplace view
exports.getMarketplace = async (req, res) => {
  try {
    let query = {};
    const search = String(req.query.search || '').trim().slice(0, 100);
    if (search) {
      const rx = { $regex: escapeRegex(search), $options: 'i' };
      query = { $or: [{ name: rx }, { description: rx }] };
    }
    const items = await Item.find(query);
    res.render('marketplace', { items: items, success: req.query.success, search });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Get a single item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Item not found' });
    res.status(500).json({ message: err.message });
  }
};

// Update an item
exports.updateItem = async (req, res) => {
  try {
    // First, find the item to verify ownership
    const existingItem = await Item.findById(req.params.id);
    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the authenticated user owns this item
    if (existingItem.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const uploaded = (req.files || []).map(f => `/uploads/${f.filename}`);

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      dailyPrice: req.body.dailyPrice,
      images: uploaded.length ? uploaded.slice(0, 10) : existingItem.images
      // Note: owner should not be updatable
    };
    
    const item = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    // New photos replaced the old ones: remove the old files
    if (uploaded.length) {
      await removeUploads(existingItem.images);
    }
    
    // Check if request is from form submission (redirect) or API call (JSON response)
    if (isFormRequest(req)) {
      res.redirect('/my-listings');
    } else {
      res.json(item);
    }
  } catch (err) {
    if (isFormRequest(req)) {
      res.status(400).send('Error updating item: ' + err.message);
    } else {
      res.status(400).json({ message: err.message });
    }
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    // First, find the item to verify ownership
    const existingItem = await Item.findById(req.params.id);
    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the authenticated user owns this item
    if (existingItem.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    const activeRental = await RentalRequest.exists({ item: existingItem._id, status: 'accepted' });
    if (activeRental) {
      if (isFormRequest(req)) {
        return res.redirect('/my-listings?error=' + encodeURIComponent('This item has an active rental.'));
      }
      return res.status(400).json({ message: 'This item has an active rental.' });
    }

    await RentalRequest.updateMany({ item: existingItem._id, status: 'pending' }, { status: 'declined' });
    await Item.findByIdAndDelete(req.params.id);
    await removeUploads(existingItem.images);
    
    // Check if request is from form submission (redirect) or API call (JSON response)
    if (isFormRequest(req)) {
      res.redirect('/my-listings');
    } else {
      res.json({ message: 'Item deleted' });
    }
  } catch (err) {
    if (isFormRequest(req)) {
      res.status(500).send('Error deleting item: ' + err.message);
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};

// Get items by user (for My Listings page)
exports.getItemsByUser = async (req, res) => {
  try {
    // Now we can filter by the authenticated user's items
    const items = await Item.find({ owner: req.user.id });
    res.render('myListings', { items: items, success: req.query.success, error: req.query.error });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Get edit item page
exports.getEditItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).send('Item not found');
    }

    // Check if the authenticated user owns this item
    if (item.owner.toString() !== req.user.id) {
      return res.status(403).send('Not authorized to edit this item');
    }

    res.render('editItem', { item: item });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};