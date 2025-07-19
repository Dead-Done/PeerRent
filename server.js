const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();  // Add this line at the top

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)  // Use environment variable here
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Welcome to PeerRent API!');
});

const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');

// Use the item routes for any request starting with /api/items
app.use('/api/items', itemRoutes);

// Use the user routes for any request starting with /api/users
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});