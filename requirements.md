Sprint 1 Goal: Backend Foundation & Core APIs
This sprint covers the three features we outlined. Let's break down the tasks for each.

Feature 1: Implement the backend MVC project structure using Node.js/Express.
This is about creating the skeleton of your application.

Initialize Your Project:

Create a new folder for your project (e.g., peer-rent).

Open a terminal in that folder and run npm init -y to create a package.json file.

Install Express: npm install express

Create the Folder Structure:

Inside your project folder, create the following subfolders. This is the MVC architecture.

controllers: This is where your application logic will live (e.g., functions to handle creating a user or getting an item).

models: This is for your database schemas (e.g., the structure of a User or Item).

routes: This folder will contain files that define the API endpoints (URLs) and link them to the controller functions.

views: This folder will hold your EJS files later, but create it now for completeness.

Create the Main Server File:

In the root of your project, create a file named server.js (or app.js).

Add the following basic code to it to create a simple Express server:

JavaScript

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to PeerRent API!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
You can test this by running node server.js in your terminal and visiting http://localhost:3000 in your browser.

Feature 2: Create the User database model with temporary email and password authentication.
Now, let's define what a "user" is in your application and connect to your database.

Install Mongoose:

Run npm install mongoose in your terminal.

Set up Database Connection:

In server.js, add the code to connect to your MongoDB database. You can get a free database connection string from MongoDB Atlas.

JavaScript

const mongoose = require('mongoose');

// Add this after your other require statements
mongoose.connect('YOUR_MONGODB_CONNECTION_STRING')
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));
Create the User Model:

Inside the models folder, create a file named User.js.

Define the schema for a user. For now, it will include a standard password.

JavaScript

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true }); // timestamps adds createdAt and updatedAt fields

module.exports = mongoose.model('User', userSchema);
Feature 3: Implement full CRUD (Create, Read, Update, Delete) API endpoints for item listings.
This is the biggest task of the sprint. You'll create the model, routes, and controllers for managing items.

Create the Item Model:

In the models folder, create a file named Item.js.

Define the schema for an item:

JavaScript

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  dailyPrice: { type: Number, required: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This links an item to a user
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
Create the Item Controller:

In the controllers folder, create a file named itemController.js.

Add functions to handle the logic for each CRUD operation. This is a simplified example:

JavaScript

const Item = require('../models/Item');

// Create a new item
exports.createItem = async (req, res) => {
  // Logic to create an item will go here
};

// Get all items
exports.getAllItems = async (req, res) => {
  // Logic to get all items
};

// Get a single item by ID
exports.getItemById = async (req, res) => {
  // Logic to get one item
};

// Update an item
exports.updateItem = async (req, res) => {
  // Logic to update an item
};

// Delete an item
exports.deleteItem = async (req, res) => {
  // Logic to delete an item
};
Create the Item Routes:

In the routes folder, create a file named itemRoutes.js.

Define the URLs for your item API and connect them to the controller functions.

JavaScript

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
Connect Routes in server.js:

Finally, tell your main server file to use these routes.

JavaScript

// In server.js, add these lines
const itemRoutes = require('./routes/itemRoutes');

// Use the item routes for any request starting with /api/items
app.use('/api/items', itemRoutes);