// models/CustomRequest.js
// Stores a free-text item list sent by a customer from the home page.
// Separate from Order so normal cart orders are not mixed with these.
const mongoose = require('mongoose');

const customRequestSchema = new mongoose.Schema({
  userPhone:    { type: String, required: true, trim: true },
  customerName: { type: String, default: '',    trim: true },

  // The raw text the customer typed — e.g. "2kg rice\n1 bottle coconut oil"
  itemList: { type: String, required: true, trim: true },

  // Optional delivery details
  address:  { type: String, default: '', trim: true },
  phone:    { type: String, default: '', trim: true },

  // Lifecycle — same statuses as Order for consistency
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'complete'],
    default: 'pending',
  },

  // Admin can optionally send a message back to the customer on confirm/reject
  adminMsg: { type: String, default: '', trim: true },

}, { timestamps: true });

module.exports = mongoose.model('CustomRequest', customRequestSchema);