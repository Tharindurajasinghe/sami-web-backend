// models/Order.js
const mongoose = require('mongoose');

// Sub-schema for each line item stored inside an order.
// We snapshot name, price, and qty at order time so the order record
// stays accurate even if the item is later edited or deleted in the catalogue.
const orderItemSchema = new mongoose.Schema({
  itemId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  name:    { type: String, required: true },   // English name snapshot
  nameSi:  { type: String, default: '' },      // Sinhala name snapshot
  price:   { type: Number, required: true },   // finalPrice at the time of order
  qty:     { type: Number, required: true, min: 1 },
}, { _id: false });                            // no separate _id per item line

const orderSchema = new mongoose.Schema({
  // Which registered user placed the order (matched by phone, not ObjectId,
  // because the app links orders to accounts via phone number throughout)
  userPhone: { type: String, required: true, trim: true },
  customerName: { type: String, default: '', trim: true },

  // Snapshot of the cart at checkout time
  items:    { type: [orderItemSchema], required: true },
  total:    { type: Number, required: true, min: 0 },

  // Delivery details supplied by the customer
  address:  { type: String, required: true, trim: true },
  phone:    { type: String, required: true, trim: true },
  message:  { type: String, default: '', trim: true },

  // Order lifecycle status
  // 'pending'   — just placed, waiting for admin action
  // 'confirmed' — admin accepted the order
  // 'rejected'  — admin rejected the order
  // 'complete'  — order delivered / fulfilled
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'complete'],
    default: 'pending',
  },

  // Bug 5 fix: persists the admin's rejection reason so the customer can see
  // it on the Track Order page. Cleared automatically if status moves away
  // from 'rejected' (handled in routes/admin.js).
  rejectionMsg: { type: String, default: '', trim: true },

}, { timestamps: true });   // adds createdAt and updatedAt automatically

module.exports = mongoose.model('Order', orderSchema);
