// routes/banner.js
const router = require('express').Router();
const Banner = require('../models/Banner');
const { protect, adminOnly } = require('../middleware/auth');
const { isBase64DataUrl, uploadImage, deleteImage } = require('../utils/cloudinaryUpload');

// GET /api/banner — public, read by SeasonalBanner on homepage
router.get('/', async (_req, res) => {
  try {
    let banner = await Banner.findOne();
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

    if (text !== undefined) banner.text = text.trim();

    if (isBase64DataUrl(leftImage)) {
      const oldPublicId = banner.leftImagePublicId;
      const uploaded = await uploadImage(leftImage, 'shop/banner');
      banner.leftImage = uploaded.url;
      banner.leftImagePublicId = uploaded.publicId;
      if (oldPublicId) await deleteImage(oldPublicId);
    } else if (leftImage !== undefined) {
      // Unchanged URL, or explicit clear — only clear Cloudinary file if emptied
      if (!leftImage && banner.leftImagePublicId) {
        await deleteImage(banner.leftImagePublicId);
        banner.leftImagePublicId = null;
      }
      banner.leftImage = leftImage;
    }

    if (isBase64DataUrl(rightImage)) {
      const oldPublicId = banner.rightImagePublicId;
      const uploaded = await uploadImage(rightImage, 'shop/banner');
      banner.rightImage = uploaded.url;
      banner.rightImagePublicId = uploaded.publicId;
      if (oldPublicId) await deleteImage(oldPublicId);
    } else if (rightImage !== undefined) {
      if (!rightImage && banner.rightImagePublicId) {
        await deleteImage(banner.rightImagePublicId);
        banner.rightImagePublicId = null;
      }
      banner.rightImage = rightImage;
    }

    await banner.save();
    res.json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;