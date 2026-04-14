require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── In-memory store (replace with DB in production) ──
let siteData = {
  heroTitle1  : 'Lighting Minds,',
  heroTitle2  : 'Building Futures',
  heroSub     : 'A self-financed, community-rooted organisation running government-recognised schools since 1993.',
  stats       : { years: 30, schools: 2, students: 1000, locations: 2 },
  announcement: { text: '', active: false },
  contacts    : []   // stores contact form submissions
};

// ─────────────────────────────────────────
//  API ROUTES
// ─────────────────────────────────────────

// GET stats
app.get('/api/stats', (req, res) => res.json(siteData.stats));

// GET site content (for admin)
app.get('/api/content', (req, res) => res.json({
  heroTitle1  : siteData.heroTitle1,
  heroTitle2  : siteData.heroTitle2,
  heroSub     : siteData.heroSub,
  announcement: siteData.announcement
}));

// POST contact form
app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ success: false, error: 'Name, email and message are required.' });
  const entry = { id: Date.now(), name, email, phone, subject, message, date: new Date().toISOString() };
  siteData.contacts.push(entry);
  console.log('📩 New contact:', name, '|', email);
  res.json({ success: true, message: 'Message received! We will get back to you soon.' });
});

// POST admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === (process.env.ADMIN_USER || 'admin') &&
      password === (process.env.ADMIN_PASS || 'snrmo2025')) {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, error: 'Invalid credentials.' });
});

// POST admin update content
app.post('/api/admin/update', (req, res) => {
  const { heroTitle1, heroTitle2, heroSub, announcementText, announcementActive } = req.body;
  if (heroTitle1)         siteData.heroTitle1            = heroTitle1;
  if (heroTitle2)         siteData.heroTitle2            = heroTitle2;
  if (heroSub)            siteData.heroSub               = heroSub;
  if (announcementText !== undefined) siteData.announcement.text   = announcementText;
  if (announcementActive !== undefined) siteData.announcement.active = announcementActive;
  res.json({ success: true });
});

// GET admin contacts list
app.get('/api/admin/contacts', (req, res) => res.json(siteData.contacts));

// GET announcement
app.get('/api/announcement', (req, res) => res.json(siteData.announcement));

// Serve index.html for all other routes
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

// ── Start ──
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   🌐  SNRMO Website                          ║
  ║   Running at → http://localhost:${PORT}          ║
  ║   Shantabai Nimbalkar Remembrance Org        ║
  ╚══════════════════════════════════════════════╝
  `);
});
