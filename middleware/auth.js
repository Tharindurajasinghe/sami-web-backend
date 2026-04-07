// middleware/auth.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT — attaches req.user
async function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      phone: decoded.phone,
      isAdmin: decoded.isAdmin,
      fullName: decoded.fullName || '',
    };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Admin-only guard (must come after protect)
function adminOnly(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ message: 'Admin access required' });
  next();
}

module.exports = { protect, adminOnly };
