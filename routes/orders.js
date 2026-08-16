// routes/orders.js
const router  = require('express').Router();
const Order   = require('../models/Order');
const Counter = require('../models/Counter');
const { protect } = require('../middleware/auth');

async function generateOrderId() {
  const seq = await Counter.next('order');
  return 'DCC' + String(seq).padStart(6, '0');
}

// Optional auth middleware — attaches req.user if token present, but
// does NOT block the request if there is no token (guest orders allowed).
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    req.user = null;   // guest — no user attached
    return next();
  }
  try {
    const jwt     = require('jsonwebtoken');
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = {
      id:       decoded.id,
      phone:    decoded.phone,
      isAdmin:  decoded.isAdmin,
      fullName: decoded.fullName || '',
    };
  } catch {
    req.user = null;   // invalid/expired token — treat as guest
  }
  next();
}

// POST /api/orders — place a new order (guests and logged-in users)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { items, total, address, phone, message, location, customerName } = req.body;
    if (!items?.length || !total || !address || !phone)
      return res.status(400).json({ message: 'items, total, address, phone required' });

    const orderId = await generateOrderId();

    const order = await Order.create({
      orderId,
      // For logged-in users use their account phone; for guests use the phone they typed
      userPhone:    req.user?.phone || phone.trim(),
      customerName: req.user?.fullName || customerName?.trim() || '',
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

// GET /api/orders/mine — logged-in user's own orders (still requires auth)
router.get('/mine', protect, async (req, res) => {
  try {
    const orders = await Order
      .find({ userPhone: req.user.phone })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;