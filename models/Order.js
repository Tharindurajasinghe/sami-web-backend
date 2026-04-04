// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  name:    String,
  nameSi:  { type: String, default: '' },
  price:   Number,
  qty:     Number,
}, { _id: false });

const ORDER_STATUSES = ['pending', 'confirmed', 'rejected', 'complete'];

const orderSchema = new mongoose.Schema({
  userPhone: { type: String, required: true },
  items:     { type: [orderItemSchema], required: true },
  total:     { type: Number, required: true },
  address:   { type: String, required: true },
  phone:     { type: String, required: true },
  message:   { type: String, default: '' },
  status:    { type: String, enum: ORDER_STATUSES, default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
