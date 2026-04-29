const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// ── Security: Block sensitive server-side files ──────────────
app.use((req, res, next) => {
  const blocked = [
    '/server.js', '/db.js', '/.env', '/package.json',
    '/package-lock.json', '/database.db', '/.gitignore'
  ];
  if (blocked.some(f => req.path.toLowerCase() === f)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

// ── Serve Static Files ───────────────────────────────────────
app.use(express.static(path.join(__dirname), {
  extensions: ['html'],
  index: 'index.html'
}));

// ── API: Health Check ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API: Capture Leads ───────────────────────────────────────
app.post('/api/leads', (req, res) => {
  const { name, mobile, loan_type, amount, income, source_page } = req.body;

  if (!name || !mobile) {
    return res.status(400).json({ success: false, error: 'Name and mobile are required' });
  }

  try {
    const stmt = db.prepare('INSERT INTO leads (name, mobile, loan_type, amount, income, source_page) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(name, mobile, loan_type || '', amount || '', income || '', source_page || 'Website');

    // Also create/update portal status for this user
    const statusStmt = db.prepare('INSERT OR IGNORE INTO portal_status (mobile, loan_type, status) VALUES (?, ?, ?)');
    statusStmt.run(mobile, loan_type || 'General', 'Pending Verification');

    res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error('[LEADS ERROR]', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// ── API: Capture Referrals ───────────────────────────────────
app.post('/api/referrals', (req, res) => {
  const { referrer_name, referrer_mobile, friend_name, friend_mobile } = req.body;

  if (!referrer_name || !referrer_mobile || !friend_name || !friend_mobile) {
    return res.status(400).json({ success: false, error: 'All referral fields are required' });
  }

  try {
    const stmt = db.prepare('INSERT INTO referrals (referrer_name, referrer_mobile, friend_name, friend_mobile) VALUES (?, ?, ?, ?)');
    const info = stmt.run(referrer_name, referrer_mobile, friend_name, friend_mobile);
    res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error('[REFERRALS ERROR]', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// ── API: Portal Status Lookup ────────────────────────────────
app.get('/api/status/:mobile', (req, res) => {
  const { mobile } = req.params;

  try {
    const row = db.prepare('SELECT * FROM portal_status WHERE mobile = ?').get(mobile);
    if (row) {
      res.json({ success: true, data: row });
    } else {
      res.status(404).json({ success: false, error: 'No application found for this number' });
    }
  } catch (err) {
    console.error('[STATUS ERROR]', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// ── API: Admin Data ──────────────────────────────────────────
app.get('/api/admin/data', (req, res) => {
  try {
    const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
    const referrals = db.prepare('SELECT * FROM referrals ORDER BY created_at DESC').all();
    res.json({ leads, referrals });
  } catch (err) {
    console.error('[ADMIN ERROR]', err);
    res.status(500).json({ success: false });
  }
});

// ── API: Auth — Signup ───────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, full_name, mobile } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password, full_name, mobile) VALUES (?, ?, ?, ?)');
    stmt.run(email, hashedPassword, full_name, mobile || '');
    res.json({ success: true });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      res.status(400).json({ success: false, error: 'Email already exists' });
    } else {
      console.error('[SIGNUP ERROR]', err);
      res.status(500).json({ success: false, error: 'Signup failed' });
    }
  }
});

// ── API: Auth — Login ────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ success: false, error: 'Invalid password' });

    const secret = process.env.JWT_SECRET || 'varagan_fallback_secret';
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '24h' });
    res.json({
      success: true,
      token,
      user: { name: user.full_name, email: user.email, mobile: user.mobile }
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ── 404 Fallback — Serve index.html for unknown HTML routes ──
app.use((req, res) => {
  // For API routes, return JSON 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'API endpoint not found' });
  }
  // For page routes, serve index.html (SPA-style fallback)
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Varagan Finance Backend running at http://localhost:${PORT}`);
  console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin.html`);
  console.log(`🔐 Auth Portal: http://localhost:${PORT}/auth.html`);
});
