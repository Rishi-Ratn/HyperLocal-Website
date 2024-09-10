const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: [String], 
  address: String,
  specialization: String,
  website: [String], 
  priority: { type: Number, default: 5 } 
});

const postSchema = new mongoose.Schema({
cat_id: { type: Number, required: true }, 
cat: { type: String, required: true },
data: [itemSchema], 
createdAt: { type: Date, default: Date.now },
});

const societySchema = new mongoose.Schema({
  name:{ type: String },
  link:{ type: String },
  admin: [String],
  post: [postSchema],
});

const Society = mongoose.model('Society', societySchema);

module.exports = Society;
