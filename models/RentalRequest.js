/**
 * RENTAL REQUEST MODEL
 * Database schema for rental transactions between users on the PeerRent platform
 * 
 * This model manages the rental workflow from initial request to completion.
 * It creates a three-way relationship between the item, renter, and owner.
 * 
 * Rental Workflow:
 * 1. User sees item in marketplace → clicks "Request Rental"
 * 2. System creates RentalRequest with status 'pending'
 * 3. Owner reviews request → accepts/declines
 * 4. If accepted, rental proceeds → marked 'completed' when finished
 * 
 * Key Features:
 * - Links renters, owners, and items in a single transaction
 * - Tracks rental status throughout lifecycle
 * - Enables rental history and management features
 */

const mongoose = require('mongoose');

const rentalRequestSchema = new mongoose.Schema({
  // Reference to the item being requested for rental
  // Links to Item model to get item details (name, price, images)
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  
  // Reference to the user who wants to rent the item
  // The person making the rental request
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Reference to the user who owns the item
  // The person who will approve/decline the rental request
  // Denormalized from item.owner for faster queries
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Current status of the rental request
  // Manages the rental lifecycle and permissions
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed'],
    default: 'pending'
  }
}, { 
  timestamps: true    // Tracks when requests are created and updated
});

/**
 * STATUS MEANINGS:
 * 
 * 'pending':   Initial state when renter requests item
 *              - Shows in owner's "Manage Rentals" page
 *              - Owner can accept or decline
 * 
 * 'accepted':  Owner approved the rental request
 *              - Rental is confirmed and active
 *              - Item should be considered unavailable
 * 
 * 'declined':  Owner rejected the rental request
 *              - Request is closed, no further action
 *              - Renter can see declined status
 * 
 * 'completed': Rental finished successfully
 *              - Item returned to owner
 *              - Enables review system for both parties
 * 
 * IMPORTANT RELATIONSHIPS:
 * 
 * RentalRequest → Item:
 * - Gets item details for display in rental management
 * - Used to show what's being rented
 * 
 * RentalRequest → User (renter):
 * - Shows who is requesting the rental
 * - Used for contact information and renter history
 * 
 * RentalRequest → User (owner):
 * - Shows who needs to approve the request
 * - Used for owner notifications and management
 * 
 * BUSINESS LOGIC:
 * - Prevents users from renting their own items (handled in controller)
 * - Enables rental history tracking for both renters and owners
 * - Supports future payment integration and scheduling features
 */

module.exports = mongoose.model('RentalRequest', rentalRequestSchema);
