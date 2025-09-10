const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();  // Add this line at the top

const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Session middleware (needed for admin login)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
// Cookie parser middleware
app.use(cookieParser());
// Method override for PUT/DELETE from forms
app.use(methodOverride('_method', { methods: ['POST', 'GET'] }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)  // Use environment variable here
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// In server.js, before the app.use routes
const { checkUser } = require('./middleware/auth');
app.use(checkUser); // This should come before your app.use() for the routers

const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const viewRoutes = require('./routes/viewRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use the item routes for any request starting with /api/items
app.use('/api/items', itemRoutes);

// Use the user routes for any request starting with /api/users
app.use('/api/users', userRoutes);

// Use the rental routes for any request starting with /rentals
app.use('/rentals', rentalRoutes);

// Add this to server.js
app.use('/admin', adminRoutes);

// Use the view routes for frontend pages
app.use('/', viewRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});