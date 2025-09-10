const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { isAuthenticated } = require('../middleware/auth'); // Import the middleware
const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '';
    cb(null, unique + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true); else cb(new Error('Unsupported file type'), false);
};

const upload = multer({ storage, fileFilter, limits: { files: 10, fileSize: 5 * 1024 * 1024 } });

// These routes remain public:
// GET /api/items -> Get all items
router.get('/', itemController.getAllItems);

// GET /api/items/:id -> Get a single item
router.get('/:id', itemController.getItemById);

// These routes should now be protected:
// POST /api/items -> Create a new item
router.post('/', isAuthenticated, upload.array('photos', 10), itemController.createItem);

// PUT /api/items/:id -> Update an item
router.put('/:id', isAuthenticated, upload.array('photos', 10), itemController.updateItem);

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