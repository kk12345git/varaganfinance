const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from root

// ── API: Capture Leads ───────────────────────────────────────
app.post('/api/leads', (req, res) => {
  const { name, mobile, loan_type, amount, income, source_page } = req.body;
  
  try {
    const stmt = db.prepare('INSERT INTO leads (name, mobile, loan_type, amount, income, source_page) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(name, mobile, loan_type, amount, income, source_page);
    
    // Also create/update portal status for this user
    const statusStmt = db.prepare('INSERT OR IGNORE INTO portal_status (mobile, loan_type, status) VALUES (?, ?, ?)');
    statusStmt.run(mobile, loan_type, 'Pending Verification');

    res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// ── API: Capture Referrals ───────────────────────────────────
app.post('/api/referrals', (req, res) => {
  const { referrer_name, referrer_mobile, friend_name, friend_mobile } = req.body;
  
  try {
    const stmt = db.prepare('INSERT INTO referrals (referrer_name, referrer_mobile, friend_name, friend_mobile) VALUES (?, ?, ?, ?)');
    const info = stmt.run(referrer_name, referrer_mobile, friend_name, friend_mobile);
    res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// ── API: Admin Data (Protected in a real app) ────────────────
app.get('/api/admin/data', (req, res) => {
  try {
    const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
    const referrals = db.prepare('SELECT * FROM referrals ORDER BY created_at DESC').all();
    res.json({ leads, referrals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ── API: Auth ───────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, full_name, mobile } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password, full_name, mobile) VALUES (?, ?, ?, ?)');
    stmt.run(email, hashedPassword, full_name, mobile);
    res.json({ success: true });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      res.status(400).json({ success: false, error: 'Email already exists' });
    } else {
      res.status(500).json({ success: false, error: 'Signup failed' });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ success: false, error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, user: { name: user.full_name, email: user.email, mobile: user.mobile } });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`Varagan Finance Backend running at http://localhost:${PORT}`);
});
