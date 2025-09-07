const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { isAuthenticated } = require('../middleware/auth'); // Import the middleware

// These routes remain public:
// GET /api/items -> Get all items
router.get('/', itemController.getAllItems);

// GET /api/items/:id -> Get a single item
router.get('/:id', itemController.getItemById);

// These routes should now be protected:
// POST /api/items -> Create a new item
router.post('/', isAuthenticated, itemController.createItem);

// PUT /api/items/:id -> Update an item
router.put('/:id', isAuthenticated, itemController.updateItem);

// DELETE /api/items/:id -> Delete an item
router.delete('/:id', isAuthenticated, itemController.deleteItem);

// POST /api/items/:id with _method=DELETE -> Delete an item (fallback for forms)
router.post('/:id', isAuthenticated, (req, res, next) => {
  if (req.body._method === 'DELETE') {
    return itemController.deleteItem(req, res);
  }
  next();
});

module.exports = router;