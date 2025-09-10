/**
 * REVIEW MODEL
 * Database schema for user-to-user reviews after completed rentals
 * 
 * This model implements a bidirectional review system where both renters and
 * owners can review each other after a completed rental transaction.
 * 
 * Review System Flow:
 * 1. Rental request reaches 'completed' status
 * 2. Both renter and owner can leave reviews for each other
 * 3. Reviews include star rating (1-5) and written feedback
 * 4. Reviews build user reputation and trust in the platform
 * 
 * Key Features:
 * - Bidirectional reviews (renter ↔ owner)
 * - Star ratings with written comments
 * - Links reviews to specific rental transactions
 * - Builds user reputation system
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Reference to the rental transaction this review is about
  // Links review to specific rental for context and verification
  rental: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RentalRequest', 
    required: true 
  },
  
  // Reference to the user writing the review
  // The person giving the feedback (either renter or owner)
  reviewer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Reference to the user being reviewed
  // The person receiving the feedback (either owner or renter)
  reviewee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Star rating from 1 (worst) to 5 (best)
  // Used for calculating user average ratings
  rating: { 
    type: Number, 
    min: 1, 
    max: 5, 
    required: true 
  },
  
  // Written feedback about the rental experience
  // Provides detailed context beyond the star rating
  comment: { 
    type: String, 
    required: true,
    trim: true
  }
  object:{
    type:ObjectId
    requ
  }
}, { 
  timestamps: true    // Tracks when reviews are created and updated
});

/**
 * REVIEW SYSTEM EXPLAINED:
 * 
 * Bidirectional Reviews:
 * - When rental completes, BOTH parties can review each other
 * - Renter reviews owner: "Great item, clean condition, responsive owner"
 * - Owner reviews renter: "Careful with item, returned on time, good communication"
 * 
 * Example Review Pairs for one rental:
 * Review 1: reviewer=renter, reviewee=owner, rating=5, comment="Excellent camera!"
 * Review 2: reviewer=owner, reviewee=renter, rating=4, comment="Returned item safely"
 * 
 * IMPORTANT RELATIONSHIPS:
 * 
 * Review → RentalRequest:
 * - Ensures reviews are tied to actual completed transactions
 * - Prevents fake reviews not based on real rentals
 * - Provides context about what item/service was reviewed
 * 
 * Review → User (reviewer):
 * - Shows who wrote the review
 * - Used for review authenticity and user reputation
 * 
 * Review → User (reviewee):
 * - Shows who is being reviewed
 * - Used to calculate user average ratings and reputation
 * 
 * BUSINESS LOGIC:
 * - Only available after rental status = 'completed'
 * - Prevents multiple reviews for same rental by same user
 * - Builds trust and transparency in the platform
 * - Helps users make informed decisions about rentals
 * 
 * FUTURE ENHANCEMENTS:
 * - Average rating calculation for users
 * - Review helpfulness voting system
 * - Photo attachments to reviews
 * - Response system for reviewees
 */

module.exports = mongoose.model('Review', reviewSchema);
