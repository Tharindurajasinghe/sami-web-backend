// routes/categories.js
const router   = require('express').Router();
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/categories — public
router.get('/', async (_req, res) => {
  try {
    const cats = await Category.find().sort({ createdAt: -1 });
    res.json(cats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/categories — admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, nameSi, image } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name required' });
    const cat = await Category.create({ name: name.trim(), nameSi: nameSi?.trim() || '', image: image || null });
    res.status(201).json(cat);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/categories/:id — admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, nameSi, image } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name required' });
    const update = { name: name.trim(), nameSi: nameSi?.trim() || '' };
    if (image !== undefined) update.image = image;   // only update image if sent
    const cat = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json(cat);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/categories/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
