// routes/customRequests.js
const router        = require('express').Router();
const CustomRequest = require('../models/CustomRequest');
const { protect, adminOnly } = require('../middleware/auth');

// ── POST /api/custom-requests — logged-in user submits a list ────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { itemList, address, phone } = req.body;
    if (!itemList?.trim())
      return res.status(400).json({ message: 'Item list cannot be empty' });

    const cr = await CustomRequest.create({
      userPhone:    req.user.phone,
      customerName: req.user.fullName || '',
      itemList:     itemList.trim(),
      address:      address?.trim() || '',
      phone:        phone?.trim()   || '',
    });
    res.status(201).json(cr);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/custom-requests/mine — user's own requests ──────────────────────
router.get('/mine', protect, async (req, res) => {
  try {
    const list = await CustomRequest
      .find({ userPhone: req.user.phone })
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/custom-requests — admin: all requests ───────────────────────────
router.get('/', protect, adminOnly, async (_req, res) => {
  try {
    const list = await CustomRequest.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/custom-requests/:id/status — admin: update status + msg ───────
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminMsg } = req.body;
    const valid = ['pending', 'confirmed', 'rejected', 'complete'];
    if (!valid.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const update = { status, adminMsg: adminMsg?.trim() || '' };
    const cr = await CustomRequest.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!cr) return res.status(404).json({ message: 'Request not found' });
    res.json(cr);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;