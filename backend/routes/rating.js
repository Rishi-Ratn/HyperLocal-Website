const express = require('express');
const Rating = require('../models/Rating.js');

const router = express.Router();

router.post('/', async (req, res) => {
  const { itemId, userEmail, rating } = req.body;

  if (!itemId || !userEmail || rating == null) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    const existingRating = await Rating.findOne({ itemId, userEmail });
    if (existingRating) {
      return res.status(200).json({ error: 'You have already rated this item.' });
    }

    const newRating = await Rating.create({ itemId, userEmail, rating });
    res.status(201).json(newRating);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const ratings = await Rating.find();
    res.status(200).json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
