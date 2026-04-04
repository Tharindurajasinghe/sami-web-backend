// models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name:       { type: String, required: true, trim: true },
  nameSi:     { type: String, default: '', trim: true },
  price:      { type: Number, required: true, min: 0 },
  discount:   { type: Number, default: 0, min: 0, max: 100 },
  available:  { type: Boolean, default: true },
  image:      { type: String, default: null },
}, { timestamps: true });

// Virtual: final price after discount
itemSchema.virtual('finalPrice').get(function () {
  if (!this.discount) return this.price;
  return +(this.price - (this.price * this.discount) / 100).toFixed(2);
});

itemSchema.set('toJSON',   { virtuals: true });
itemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Item', itemSchema);
