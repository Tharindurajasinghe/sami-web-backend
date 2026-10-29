// models/Banner.js
// Single-document collection — only one banner config exists at a time.
// Admin updates it; frontend reads it on every page load.
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  text:               { type: String },
  leftImage:          { type: String, default: '' },   // Cloudinary secure URL (was base64)
  leftImagePublicId:  { type: String, default: null },  // for delete/replace
  rightImage:         { type: String, default: '' },
  rightImagePublicId: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);