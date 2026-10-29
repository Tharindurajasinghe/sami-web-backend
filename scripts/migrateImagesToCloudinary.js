// scripts/migrateImagesToCloudinary.js
//
// One-time migration: finds every Category, Item and Banner document that
// still has a base64 image stored in MongoDB, uploads it to Cloudinary, and
// replaces the base64 string with the resulting URL (+ publicId for cleanup).
//
// Run once, from the backend/ folder:
//   node scripts/migrateImagesToCloudinary.js
//
// Safe to re-run — it only touches documents whose image field still starts
// with "data:" (base64). Already-migrated documents (plain https URLs) are
// skipped automatically, so running it twice does nothing the second time.

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Item     = require('../models/Item');
const Banner   = require('../models/Banner');
const { isBase64DataUrl, uploadImage } = require('../utils/cloudinaryUpload');

async function migrateCategories() {
  const cats = await Category.find({ image: { $regex: '^data:' } });
  console.log(`\nCategories to migrate: ${cats.length}`);
  let ok = 0, failed = 0;
  for (const cat of cats) {
    try {
      const uploaded = await uploadImage(cat.image, 'shop/categories');
      cat.image = uploaded.url;
      cat.imagePublicId = uploaded.publicId;
      await cat.save();
      ok++;
      console.log(`  ✅ ${cat.name}`);
    } catch (err) {
      failed++;
      console.error(`  ❌ ${cat.name} — ${err.message}`);
    }
  }
  console.log(`Categories done: ${ok} migrated, ${failed} failed`);
}

async function migrateItems() {
  const items = await Item.find({ image: { $regex: '^data:' } });
  console.log(`\nItems to migrate: ${items.length}`);
  let ok = 0, failed = 0;
  for (const item of items) {
    try {
      const uploaded = await uploadImage(item.image, 'shop/items');
      item.image = uploaded.url;
      item.imagePublicId = uploaded.publicId;
      await item.save();
      ok++;
      console.log(`  ✅ ${item.name}`);
    } catch (err) {
      failed++;
      console.error(`  ❌ ${item.name} — ${err.message}`);
    }
  }
  console.log(`Items done: ${ok} migrated, ${failed} failed`);
}

async function migrateBanner() {
  const banner = await Banner.findOne();
  if (!banner) { console.log('\nNo banner document found — skipping.'); return; }

  let changed = false;

  if (isBase64DataUrl(banner.leftImage)) {
    const uploaded = await uploadImage(banner.leftImage, 'shop/banner');
    banner.leftImage = uploaded.url;
    banner.leftImagePublicId = uploaded.publicId;
    changed = true;
    console.log('  ✅ Banner left image');
  }

  if (isBase64DataUrl(banner.rightImage)) {
    const uploaded = await uploadImage(banner.rightImage, 'shop/banner');
    banner.rightImage = uploaded.url;
    banner.rightImagePublicId = uploaded.publicId;
    changed = true;
    console.log('  ✅ Banner right image');
  }

  if (changed) await banner.save();
  else console.log('\nBanner images already migrated or empty — skipping.');
}

async function main() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected\n');
  console.log('Starting migration — this may take a few minutes depending on image count...');

  await migrateCategories();
  await migrateItems();
  await migrateBanner();

  console.log('\n🎉 Migration complete.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
