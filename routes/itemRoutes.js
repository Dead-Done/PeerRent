const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// POST /api/items -> Create a new item
router.post('/', itemController.createItem);

// GET /api/items -> Get all items
router.get('/', itemController.getAllItems);

// GET /api/items/:id -> Get a single item
router.get('/:id', itemController.getItemById);

// PUT /api/items/:id -> Update an item
router.put('/:id', itemController.updateItem);

// DELETE /api/items/:id -> Delete an item
router.delete('/:id', itemController.deleteItem);

module.exports = router;