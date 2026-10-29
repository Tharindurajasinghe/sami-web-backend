// routes/categories.js
const router   = require('express').Router();
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');
const { isBase64DataUrl, uploadImage, deleteImage } = require('../utils/cloudinaryUpload');

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

    // If a new image was sent (as base64 from the admin form), upload it to
    // Cloudinary and store the returned URL + publicId instead of the base64.
    let imageUrl = null, imagePublicId = null;
    if (isBase64DataUrl(image)) {
      const uploaded = await uploadImage(image, 'shop/categories');
      imageUrl = uploaded.url;
      imagePublicId = uploaded.publicId;
    }

    const cat = await Category.create({
      name: name.trim(),
      nameSi: nameSi?.trim() || '',
      image: imageUrl,
      imagePublicId,
    });
    res.status(201).json(cat);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/categories/:id — admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, nameSi, image } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name required' });

    const update = { name: name.trim(), nameSi: nameSi?.trim() || '' };

    if (isBase64DataUrl(image)) {
      // Admin picked a NEW image — upload it, then delete the old one
      // from Cloudinary so storage doesn't accumulate orphaned files.
      const existing = await Category.findById(req.params.id);
      const uploaded = await uploadImage(image, 'shop/categories');
      update.image = uploaded.url;
      update.imagePublicId = uploaded.publicId;
      if (existing?.imagePublicId) await deleteImage(existing.imagePublicId);
    }
    // If image is undefined (admin didn't touch the image field), leave it as-is.
    // If image is explicitly null/'' (admin removed it), clear both fields.
    else if (image === null || image === '') {
      const existing = await Category.findById(req.params.id);
      if (existing?.imagePublicId) await deleteImage(existing.imagePublicId);
      update.image = null;
      update.imagePublicId = null;
    }

    const cat = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json(cat);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/categories/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (cat?.imagePublicId) await deleteImage(cat.imagePublicId);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;