const Item = require('../models/Item');

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
    const ct = req.headers['content-type'] || '';
    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      res.redirect('/marketplace?success=listed');
    } else {
      res.status(201).json(newItem);
    }
  } catch (err) {
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
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
    // Check if a search query exists in the URL (req.query.search)
    if (req.query.search && req.query.search.trim() !== '') {
      // If it exists, add a 'name' property to the 'query' object.
      // The value should be a case-insensitive regular expression that matches the search term.
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    // Use the 'query' object in your Item.find() call.
    const items = await Item.find(query);
    res.render('marketplace', { items: items, success: req.query.success });
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
    
    const item = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    // Check if request is from form submission (redirect) or API call (JSON response)
    const ct = req.headers['content-type'] || '';
    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      res.redirect('/my-listings');
    } else {
      res.json(item);
    }
  } catch (err) {
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
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

    const item = await Item.findByIdAndDelete(req.params.id);
    
    // Check if request is from form submission (redirect) or API call (JSON response)
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      res.redirect('/my-listings');
    } else {
      res.json({ message: 'Item deleted' });
    }
  } catch (err) {
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
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
    res.render('myListings', { items: items, success: req.query.success });
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