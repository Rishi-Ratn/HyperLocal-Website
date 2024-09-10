const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  userEmail: { type: String, required: true },
  rating: { type: Number, required: true },
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
