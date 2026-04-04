// routes/admin.js
const router = require('express').Router();
const Order  = require('../models/Order');
const User   = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// GET /api/admin/orders — all orders
router.get('/orders', async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/admin/orders/:id/status — update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'rejected', 'complete'];
    if (!valid.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/users?phone=xxx — search user by phone
router.get('/users', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ message: 'phone query required' });
    const user = await User.findOne({ phone: phone.trim() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/admin/users/:phone — delete user by phone
router.delete('/users/:phone', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ phone: req.params.phone });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
