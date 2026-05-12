// routes/banner.js
const router = require('express').Router();
const Banner = require('../models/Banner');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/banner — public, read by SeasonalBanner on homepage
router.get('/', async (_req, res) => {
  try {
    let banner = await Banner.findOne();
    // Auto-create default document on first ever request
    if (!banner) banner = await Banner.create({});
    res.json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/banner — admin only, update text and/or images
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const { text, leftImage, rightImage } = req.body;
    let banner = await Banner.findOne();
    if (!banner) banner = new Banner();
    if (text        !== undefined) banner.text       = text.trim();
    if (leftImage   !== undefined) banner.leftImage  = leftImage;
    if (rightImage  !== undefined) banner.rightImage = rightImage;
    await banner.save();
    res.json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;