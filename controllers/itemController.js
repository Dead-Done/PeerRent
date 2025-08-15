const Item = require('../models/Item');

// Create a new item
exports.createItem = async (req, res) => {
  try {
    // For now, we'll create items without an owner since we haven't implemented frontend auth
    const itemData = {
      name: req.body.name,
      description: req.body.description,
      dailyPrice: req.body.dailyPrice
      // owner will be undefined, which is fine since we made it optional
    };
    
    const newItem = new Item(itemData);
    await newItem.save();
    
    // Check if request is from form submission (redirect) or API call (JSON response)
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      res.redirect('/my-listings');
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
    const items = await Item.find();
    res.render('marketplace', { items: items });
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
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      dailyPrice: req.body.dailyPrice
    };
    
    const item = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    // Check if request is from form submission (redirect) or API call (JSON response)
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
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
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
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
    // For now, we'll get all items since authentication isn't fully implemented
    // In a real app, you'd use: const items = await Item.find({ owner: req.user.id });
    const items = await Item.find();
    res.render('myListings', { items: items });
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
    res.render('editItem', { item: item });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};