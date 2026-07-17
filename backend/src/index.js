const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { createDatabase } = require('./db');
const { createApp } = require('./app');

const db = createDatabase(path.join(__dirname, '..', 'data', 'blog.db'));

const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  db.prepare('INSERT INTO users (username, password, email, avatar, bio) VALUES (?, ?, ?, ?, ?)').run(
    'admin',
    bcrypt.hashSync('admin123', 10),
    'admin@example.com',
    null,
    'A passionate developer.'
  );
}

const app = createApp(db);
const PORT = process.env.PORT || 3001;

const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
  console.log(`Serving static frontend from ${frontendPath}`);
} else {
  console.log('Frontend dist not found, API only mode');
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
