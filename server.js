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

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));   // 2MB for base64 images

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

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
