// models/Banner.js
// Single-document collection — only one banner config exists at a time.
// Admin updates it; frontend reads it on every page load.
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  text:       { type: String,},
  leftImage:  { type: String, default: '' },   // base64 data URL or public path
  rightImage: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);