// controllers/rentalController.js
const RentalRequest = require('../models/RentalRequest');
const Item = require('../models/Item');
const Review = require('../models/Review');

// Logic for creating a new rental request
exports.createRentalRequest = async (req, res) => {
  try {
    // Find the item by its ID from req.params.itemId
    const item = await Item.findById(req.params.itemId);

    // This new check handles both a missing item AND an item with a missing owner.
    if (!item || !item.owner) {
      return res.status(404).send('Item not found or has no owner.');
    }

    // Prevent users from renting their own items
    if (item.owner.toString() === req.user.id) {
      return res.status(400).send('You cannot rent your own item');
    }

    // Check if user already has a pending request for this item
    const existingRequest = await RentalRequest.findOne({
      item: item._id,
      renter: req.user.id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).send('You already have a pending request for this item');
    }

    // Create a new RentalRequest instance using the item's ID, the renter's ID (from req.user.id), and the item's owner ID.
    const newRentalRequest = new RentalRequest({
      item: item._id,
      renter: req.user.id, // from authentication middleware
      owner: item.owner,
      status: 'pending'
    });

    // Save the new request
    await newRentalRequest.save();

    // Redirect the user to a page called '/my-rentals'
    res.redirect('/my-rentals');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Logic for updating the status of a request (accept/decline)
exports.updateRentalStatus = async (req, res) => {
  try {
    // Find the RentalRequest by its ID from req.params.rentalId
    const rentalRequest = await RentalRequest.findById(req.params.rentalId);
    if (!rentalRequest) {
      return res.status(404).send('Rental request not found');
    }

    // Check if the authenticated user is the owner of the item (only owners can update status)
    if (rentalRequest.owner.toString() !== req.user.id) {
      return res.status(403).send('Not authorized to update this rental request');
    }

    // Update its status using the value from req.body.status
    rentalRequest.status = req.body.status;

    // Save the changes
    await rentalRequest.save();

    // Redirect the user to a page called '/manage-rentals'
    res.redirect('/manage-rentals');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get user's rental requests (items they want to rent)
exports.getMyRentals = async (req, res) => {
  try {
    const rentalRequests = await RentalRequest.find({ renter: req.user.id })
      .populate('item')
      .populate('owner', 'email');
    res.render('my-rentals', { rentalRequests });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get rental requests for user's items (items others want to rent from them)
exports.getManageRentals = async (req, res) => {
  try {
    const rentalRequests = await RentalRequest.find({ owner: req.user.id })
      .populate('item')
      .populate('renter', 'email');
    res.render('manage-rentals', { rentalRequests });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get review page for a specific rental
exports.getReviewPage = async (req, res) => {
  try {
    // Find the RentalRequest by its ID and populate necessary fields
    const rentalRequest = await RentalRequest.findById(req.params.rentalId)
      .populate('item')
      .populate('owner', 'email')
      .populate('renter', 'email');
    
    if (!rentalRequest) {
      return res.status(404).send('Rental request not found');
    }

    // Check if the authenticated user is the renter (only renters can leave reviews)
    if (rentalRequest.renter._id.toString() !== req.user.id) {
      return res.status(403).send('Not authorized to review this rental');
    }

    // Check if rental is completed
    if (rentalRequest.status !== 'completed') {
      return res.status(400).send('Can only review completed rentals');
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ rental: req.params.rentalId });
    if (existingReview) {
      return res.status(400).send('Review already exists for this rental');
    }

    res.render('leave-review', { rentalRequest });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Handle review submission
exports.postReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Find the RentalRequest by its ID
    const rentalRequest = await RentalRequest.findById(req.params.rentalId)
      .populate('owner');
    
    if (!rentalRequest) {
      return res.status(404).send('Rental request not found');
    }

    // Check if the authenticated user is the renter
    if (rentalRequest.renter.toString() !== req.user.id) {
      return res.status(403).send('Not authorized to review this rental');
    }

    // Check if rental is completed
    if (rentalRequest.status !== 'completed') {
      return res.status(400).send('Can only review completed rentals');
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ rental: req.params.rentalId });
    if (existingReview) {
      return res.status(400).send('Review already exists for this rental');
    }

    // Create a new Review document
    const newReview = new Review({
      rating: parseInt(rating),
      comment,
      rental: req.params.rentalId,
      reviewer: req.user.id,
      reviewee: rentalRequest.owner._id
    });

    await newReview.save();

    // Redirect to the profile page of the person they just reviewed
    res.redirect(`/users/${rentalRequest.owner._id}/profile`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
