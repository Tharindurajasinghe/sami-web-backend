// routes/auth.js
const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User   = require('../models/User');

const sign = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)        return res.status(400).json({ message: 'Phone and password required' });
    if (password.length < 6)        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (!/^\d{9,12}$/.test(phone.replace(/\s/g, '')))
      return res.status(400).json({ message: 'Invalid phone number' });

    const exists = await User.findOne({ phone: phone.trim() });
    if (exists) return res.status(409).json({ message: 'Phone already registered' });

    const user  = await User.create({ phone: phone.trim(), password });
    const token = sign({ id: user._id, phone: user.phone, isAdmin: false });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: 'Phone and password required' });

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) return res.status(401).json({ message: 'Invalid phone or password' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid phone or password' });

    const token = sign({ id: user._id, phone: user.phone, isAdmin: false });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/admin-login ────────────────────────────────────────────────
router.post('/admin-login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (phone !== process.env.ADMIN_PHONE)
      return res.status(401).json({ message: 'Invalid admin credentials' });
    if (password !== process.env.ADMIN_PASSWORD)
      return res.status(401).json({ message: 'Invalid admin credentials' });

    const token = sign({ phone, isAdmin: true });
    res.json({ token, user: { phone, isAdmin: true } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
