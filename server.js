const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
require('dotenv').config();  // Add this line at the top

const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
// Method override for PUT/DELETE from forms
app.use(methodOverride('_method', { methods: ['POST', 'GET'] }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)  // Use environment variable here
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));



const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const viewRoutes = require('./routes/viewRoutes');
const rentalRoutes = require('./routes/rentalRoutes');

// Use the item routes for any request starting with /api/items
app.use('/api/items', itemRoutes);

// Use the user routes for any request starting with /api/users
app.use('/api/users', userRoutes);

// Use the rental routes for any request starting with /rentals
app.use('/rentals', rentalRoutes);

// Use the view routes for frontend pages
app.use('/', viewRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});