/**
 * ITEM MODEL
 * Database schema for rental items listed on the PeerRent platform
 * 
 * This model represents physical items that users can list for others to rent.
 * Each item belongs to a specific user (owner) and can have multiple images.
 * 
 * Key Features:
 * - Links items to user accounts via owner field
 * - Supports multiple image uploads per item
 * - Tracks pricing in daily rates
 * - Automatic timestamp tracking for when items are listed/updated
 */

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  // Item display name (e.g., "Professional Camera", "Camping Tent")
  name: { 
    type: String, 
    required: true,
    trim: true              // Remove extra whitespace
  },
  
  // Detailed description of the item's condition, features, and usage notes
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // Daily rental price in the platform's currency (USD)
  // Users can rent items on a per-day basis
  dailyPrice: { 
    type: Number, 
    required: true,
    min: 0                  // Price cannot be negative
  },
  
  // Array of image filenames stored in the uploads directory
  // Images are uploaded via multer middleware and stored locally
  // Each string represents a filename like "1757518673578-4231998.jpg"
  images: [{ 
    type: String 
  }],
  
  // Reference to the User who owns/listed this item
  // Uses MongoDB ObjectId to link to User model
  // Required because every item must have an owner
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',            // References the User model
    required: true          // Every item must have an owner
  }
}, { 
  timestamps: true          // Adds createdAt and updatedAt automatically
});

/**
 * IMPORTANT RELATIONSHIPS:
 * 
 * Item → User (owner):
 * - Each item belongs to exactly one user
 * - Used for "My Listings" functionality
 * - Used for ownership verification before edit/delete
 * 
 * Item ← RentalRequest:
 * - Items can have multiple rental requests
 * - Helps track item popularity and rental history
 * 
 * Item ← Review:
 * - Items can receive reviews from renters
 * - Builds reputation system for items and owners
 * 
 * File Storage:
 * - Images stored in /uploads directory
 * - Served statically via Express at /uploads route
 * - Frontend displays images using <img src="/uploads/filename.jpg">
 */

module.exports = mongoose.model('Item', itemSchema);