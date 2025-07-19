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