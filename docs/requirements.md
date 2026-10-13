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

## Sprint 2 Goal: Frontend Views & User Interaction

This sprint focuses on building the user interface (the "Views" in MVC) for the backend logic created in Sprint 1. By the end of this sprint, a user will be able to visually interact with the application to see, create, and manage their rental listings.

### Features:
- **Feature 4:** Develop the EJS view for the main marketplace page to display all available rental items.
- **Feature 5:** Develop the EJS forms for creating and editing item listings for a logged-in user.
- **Feature 6:** Create the "My Listings" page where a user can view and manage only the items they have posted.

Feature 4: Develop the EJS view for the main marketplace page.
This page will show every available item to any visitor.

Create the View File: In your views folder, create a file named marketplace.ejs. Add code to loop through an array of items and display their details.

HTML

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Marketplace - PeerRent</title>
</head>
<body>
    <h1>All Available Items</h1>
    <div>
        <% if (items.length > 0) { %>
            <% items.forEach(item => { %>
                <div>
                    <h2><%= item.name %></h2>
                    <p><%= item.description %></p>
                    <p><b>Price:</b> $<%= item.dailyPrice %>/day</p>
                </div>
                <hr>
            <% }) %>
        <% } else { %>
            <p>No items are currently available.</p>
        <% } %>
    </div>
</body>
</html>
Update the Controller: In controllers/itemController.js, ensure your getAllItems function fetches all items and renders this new EJS file, passing the item data to it.

JavaScript

// controllers/itemController.js
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find({ status: 'available' });
    res.render('marketplace', { items: items });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
Feature 5: Develop the EJS forms for creating and editing item listings.
This involves the form a user will use to add a new item.

Create the "New Item" View: In your views folder, create a file named newItem.ejs. This file will contain an HTML form.

HTML

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>List a New Item</title>
</head>
<body>
    <h1>List Your Item for Rent</h1>
    <form action="/api/items" method="POST">
        <input type="text" name="name" placeholder="Item Name" required>
        <textarea name="description" placeholder="Item Description" required></textarea>
        <input type="number" name="dailyPrice" placeholder="Price per day" required>
        <button type="submit">List My Item</button>
    </form>
</body>
</html>
Enable Form Data Parsing: In your main server.js file, add the following middleware to ensure your server can understand the data coming from the form.

JavaScript

// In server.js
app.use(express.urlencoded({ extended: true }));
Create a Route to Display the Form: You need a route that shows the newItem.ejs page to the user. You can create a new routes/viewRoutes.js file for this.

JavaScript

// routes/viewRoutes.js
const express = require('express');
const router = express.Router();

// This route will display the form to create a new item
router.get('/items/new', (req, res) => {
  res.render('newItem');
});

module.exports = router;
Remember to link this new route file in your server.js.

Feature 6: Create the "My Listings" page.
This is a private page where a user can see and manage only the items they have posted.

Create the View File: In the views folder, create myListings.ejs.

HTML

<!DOCTYPE html>
<html lang="en">
    <body>
    <h1>My Listings</h1>
    </body>
</html>
Create the Controller Function: In controllers/itemController.js, add a new function. This function will find all items where the owner ID matches the currently logged-in user's ID.

JavaScript

// controllers/itemController.js
exports.getItemsByUser = async (req, res) => {
  try {
    // This assumes your authentication process adds a `user` object to the request
    const items = await Item.find({ owner: req.user.id });
    res.render('myListings', { items: items });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
Create the Route: Add a new route that points to this controller function. You should protect this route with authentication middleware to ensure only logged-in users can access it.

JavaScript

// In your routes/viewRoutes.js or a similar file
// The `isAuthenticated` part is placeholder for your actual authentication middleware
router.get('/my-listings', isAuthenticated, itemController.getItemsByUser);