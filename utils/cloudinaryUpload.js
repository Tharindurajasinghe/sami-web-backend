// utils/cloudinaryUpload.js
// Small helper layer so routes never call the cloudinary SDK directly.
const cloudinary = require('../config/cloudinary');

// A base64 data URL looks like "data:image/png;base64,iVBORw0KG...".
// An already-migrated image is a plain https Cloudinary URL.
// Only base64 strings need to be uploaded — URLs are left untouched.
function isBase64DataUrl(str) {
  return typeof str === 'string' && str.startsWith('data:');
}

// Uploads a base64 data URL to Cloudinary under the given folder.
// Returns { url, publicId } on success, or null if input is empty.
async function uploadImage(base64, folder = 'shop') {
  if (!base64) return null;
  const result = await cloudinary.uploader.upload(base64, {
    folder,
    resource_type: 'image',
    // auto quality/format lets Cloudinary pick the smallest file that still
    // looks good for each visitor's browser (webp/avif where supported)
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

// Deletes an image from Cloudinary by its public_id.
// Safe no-op if publicId is missing — never throws, just logs.
async function deleteImage(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete failed for', publicId, '-', err.message);
  }
}

module.exports = { isBase64DataUrl, uploadImage, deleteImage };
