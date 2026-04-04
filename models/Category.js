// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true },
  nameSi: { type: String, default: '', trim: true },
  image:  { type: String, default: null },   // base64 data URL
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
