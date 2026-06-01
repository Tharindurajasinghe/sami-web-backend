// routes/orders.js
const router  = require('express').Router();
const Order   = require('../models/Order');
const Counter = require('../models/Counter');
const { protect } = require('../middleware/auth');

// Generates the next readable order ID — e.g. DCC000001
async function generateOrderId() {
  const seq = await Counter.next('order');
  return 'DCC' + String(seq).padStart(6, '0');
}

// POST /api/orders — place a new order
router.post('/', protect, async (req, res) => {
  try {
    const { items, total, address, phone, message, location } = req.body;
    if (!items?.length || !total || !address || !phone)
      return res.status(400).json({ message: 'items, total, address, phone required' });

    const orderId = await generateOrderId();

    const order = await Order.create({
      orderId,
      userPhone:    req.user.phone,
      customerName: req.user.fullName || '',
      items,
      total,
      address:  address.trim(),
      phone:    phone.trim(),
      message:  message?.trim() || '',
      location: location?.lat && location?.lng
        ? { lat: location.lat, lng: location.lng }
        : { lat: null, lng: null },
    });
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/orders/mine — logged-in user's own orders
router.get('/mine', protect, async (req, res) => {
  try {
    const orders = await Order
      .find({ userPhone: req.user.phone })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;