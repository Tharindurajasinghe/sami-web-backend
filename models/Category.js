// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true },
  nameSi: { type: String, default: '', trim: true },
  image:  { type: String, default: null },   // Cloudinary secure URL (was base64)
  imagePublicId: { type: String, default: null }, // Cloudinary public_id, needed to delete/replace the image
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);