require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');

const authRoutes     = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const itemRoutes     = require('./routes/items');
const orderRoutes    = require('./routes/orders');
const adminRoutes    = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Bug 3 fix: CORS ───────────────────────────────────────────────────────────
// Build the allowed-origins list from FRONTEND_URL env var.
// Warns clearly at startup if FRONTEND_URL is not set (would block production).
const allowedOrigins = [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:3000',  // CRA dev server (fallback)
];

if (process.env.FRONTEND_URL) {
  // Only add if it is not already in the list (avoids duplicating localhost)
  if (!allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }
} else {
  console.warn(
    '⚠️  FRONTEND_URL is not set in .env — only localhost origins are allowed.\n' +
    '   Set FRONTEND_URL to your deployed frontend URL in production.'
  );
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));   // 2 MB for base64 images

// ── DB ────────────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items',      itemRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/admin',      adminRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({ status: 'ok', message: 'Shop API running' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});
