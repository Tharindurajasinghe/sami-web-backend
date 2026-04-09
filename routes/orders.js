// routes/orders.js
const router = require('express').Router();
const Order  = require('../models/Order');
const { protect } = require('../middleware/auth');

// POST /api/orders — authenticated user places order
router.post('/', protect, async (req, res) => {
  try {
    const { items, total, address, phone, message, location } = req.body;

    if (!items?.length || !total || !address || !phone)
      return res.status(400).json({ message: 'items, total, address, phone required' });

    // Build location object only when both lat and lng are valid numbers.
    // If the customer skipped sharing location, location field is omitted
    // entirely and the schema default { lat: null, lng: null } is used.
    const locationData =
      location?.lat != null && location?.lng != null
        ? { lat: Number(location.lat), lng: Number(location.lng) }
        : { lat: null, lng: null };

    const order = await Order.create({
      userPhone:    req.user.phone,
      customerName: req.user.fullName || '',
      items,
      total,
      address,
      phone,
      message:  message  || '',
      location: locationData,
    });

    res.status(201).json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/orders/mine — user's own orders
router.get('/mine', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userPhone: req.user.phone }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
