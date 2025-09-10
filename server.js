/**
 * PEERRENT - PEER-TO-PEER RENTAL PLATFORM
 * Main Server Configuration File
 * 
 * This is the entry point of the PeerRent application - a platform where users can
 * rent items from each other. The app includes user authentication, item management,
 * rental system, reviews, and admin controls.
 * 
 * Key Features:
 * - Hybrid OTP Authentication (PIN + Email)
 * - Item Listing & Management
 * - Rental Request System
 * - User Reviews & Ratings
 * - Admin Control Panel
 * - Image Upload & Management
 */

// Import required Node.js modules and packages
const express = require('express');           // Web framework for Node.js
const mongoose = require('mongoose');         // MongoDB object modeling library
const methodOverride = require('method-override'); // Override HTTP methods in forms
const cookieParser = require('cookie-parser'); // Parse cookies from requests
const session = require('express-session');   // Session management for admin login
const path = require('path');                 // Node.js path utilities
const fs = require('fs');                     // File system operations
require('dotenv').config();                   // Load environment variables from .env file

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;        // Server port (from env or default 3000)

/**
 * VIEW ENGINE CONFIGURATION
 * Sets up EJS (Embedded JavaScript) as the templating engine
 * This allows us to create dynamic HTML pages with server-side data
 */
app.set('view engine', 'ejs');
app.set('views', './views');

/**
 * SESSION MIDDLEWARE CONFIGURATION
 * Required for admin authentication system
 * Stores admin login sessions securely in memory
 */
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,                         // Don't save session if not modified
    saveUninitialized: false,              // Don't create session until something stored
    cookie: { 
        secure: false,                     // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000       // Session expires after 24 hours
    }
}));

/**
 * MIDDLEWARE SETUP
 * These middleware functions process requests before they reach route handlers
 */
app.use(express.json());                   // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form data from requests
app.use(cookieParser());                   // Parse cookies (used for JWT authentication)
app.use(methodOverride('_method', { methods: ['POST', 'GET'] })); // Enable PUT/DELETE in forms

/**
 * STATIC FILE SERVING CONFIGURATION
 * Serves uploaded images and design assets to the browser
 */
// Ensure uploads directory exists for user-uploaded item images
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve design assets (CSS, images, etc.) from imagesrc directory
const assetsDir = path.join(__dirname, 'imagesrc');
if (fs.existsSync(assetsDir)) {
  app.use('/assets', express.static(assetsDir));
}

/**
 * DATABASE CONNECTION
 * Connects to MongoDB using the connection string from environment variables
 */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('MongoDB connection error:', err));

/**
 * GLOBAL AUTHENTICATION MIDDLEWARE
 * Checks for user authentication on all routes and makes user data available in views
 * This runs before all route handlers to populate res.locals.user
 */
const { checkUser } = require('./middleware/auth');
app.use(checkUser);

/**
 * ROUTE MODULES IMPORT
 * Import all route handlers that define the application's endpoints
 */
const itemRoutes = require('./routes/itemRoutes');       // Item CRUD operations
const userRoutes = require('./routes/userRoutes');       // User authentication & profile
const viewRoutes = require('./routes/viewRoutes');       // Frontend page rendering
const rentalRoutes = require('./routes/rentalRoutes');   // Rental request system
const adminRoutes = require('./routes/adminRoutes');     // Admin control panel

/**
 * ROUTE MOUNTING
 * Mount route modules to specific URL prefixes
 * Order matters: specific routes before general ones
 */
app.use('/api/items', itemRoutes);    // Item API endpoints (CRUD operations)
app.use('/api/users', userRoutes);    // User API endpoints (auth, profile)
app.use('/rentals', rentalRoutes);    // Rental system endpoints
app.use('/admin', adminRoutes);       // Admin panel (protected routes)
app.use('/', viewRoutes);             // Frontend pages (must be last - catch-all)

/**
 * START SERVER
 * Begin listening for incoming requests on the specified port
 */
app.listen(PORT, () => {
  console.log(`🚀 PeerRent Server is running on port ${PORT}`);
  console.log(`📱 Access the app at: http://localhost:${PORT}`);
  console.log(`🔐 Admin panel at: http://localhost:${PORT}/admin`);
});