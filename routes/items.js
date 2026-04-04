// routes/items.js
const router = require('express').Router();
const Item   = require('../models/Item');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/items?categoryId=xxx — public
router.get('/', async (req, res) => {
  try {
    const filter = req.query.categoryId ? { categoryId: req.query.categoryId } : {};
    const items  = await Item.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/items — admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { categoryId, name, nameSi, price, discount, available, image } = req.body;
    if (!name?.trim() || !categoryId || price == null)
      return res.status(400).json({ message: 'categoryId, name, price required' });

    const item = await Item.create({
      categoryId, name: name.trim(), nameSi: nameSi?.trim() || '',
      price: Number(price), discount: Number(discount || 0),
      available: available !== false, image: image || null,
    });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/items/:id — admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, nameSi, categoryId, price, discount, available, image } = req.body;
    const update = {};
    if (name      !== undefined) update.name      = name.trim();
    if (nameSi    !== undefined) update.nameSi    = nameSi.trim();
    if (categoryId !== undefined) update.categoryId = categoryId;
    if (price     !== undefined) update.price     = Number(price);
    if (discount  !== undefined) update.discount  = Number(discount);
    if (available !== undefined) update.available = available;
    if (image     !== undefined) update.image     = image;

    const item = await Item.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/items/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
