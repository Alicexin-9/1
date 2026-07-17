const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const slugify = require('slugify');
const { body, param, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

function createApp(db) {
  const JWT_SECRET = process.env.JWT_SECRET || 'blog-secret-key-2026';
  const app = express();
  app.use(cors());
  app.use(express.json());

  const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  };

  const generateToken = (user) => jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

  const auth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token required' });
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch {
      res.status(403).json({ error: 'Invalid token' });
    }
  };

  // Auth - Register
  app.post('/api/auth/register', [body('username').trim().notEmpty().isLength({min:3,max:20}), body('email').isEmail(), body('password').trim().isLength({min:6})], handleValidation, (req, res) => {
    let { username, email, password } = req.body;
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing) return res.status(400).json({ error: 'Username or email already exists' });
    const result = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)').run(username, bcrypt.hashSync(password, 10), email);
    const user = { id: result.lastInsertRowid, username, email, avatar: null, bio: null, created_at: new Date().toISOString() };
    res.status(201).json({ message: 'Registered', user: { id: user.id, username, email }, token: generateToken(user) });
  });

  // Auth - Login
  app.post('/api/auth/login', [body('username').notEmpty(), body('password').notEmpty()], handleValidation, (req,res) => {
    let { username,password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
    const { password: _, ...userWithoutPass } = user;
    res.json({ message: 'Login successful', user: userWithoutPass, token: generateToken(user) });
  });

  // Categories
  app.get('/api/categories', (req,res) => {
    const categories = db.prepare('SELECT * FROM categories ORDER BY id').all();
    res.json(categories);
  });
  app.post('/api/categories', auth, [body('name').trim().notEmpty().isLength({max:50})], handleValidation, (req, res) => {
    let { name, description } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    const existing = db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug);
    if (existing) return res.status(400).json({ error: `Category "${name}" already exists` });
    const result = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)').run(name, slug, description || null);
    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(cat);
  });
  app.put('/api/categories/:id', auth, [param('id').isInt(), body('name').trim().notEmpty().isLength({max:50})], handleValidation, (req, res) => {
    const catId = parseInt(req.params.id);
    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(catId);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    let { name, description } = req.body;
    db.prepare('UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?').run(name, slugify(name, { lower: true, strict: true }), description || null, catId);
    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(catId);
    res.json(updated);
  });
  app.delete('/api/categories/:id', auth, [param('id').isInt()], handleValidation, (req, res) => {
    const catId = parseInt(req.params.id);
    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(catId);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    const postCount = db.prepare('SELECT COUNT(*) as cnt FROM posts WHERE category_id = ?').get(catId).cnt;
    if (postCount > 0) return res.status(400).json({ error: `Cannot delete category: ${postCount} post(s) are using it` });
    db.prepare('DELETE FROM categories WHERE id = ?').run(catId);
    res.json({ message: 'Deleted' });
  });

  // Tags
  app.get('/api/tags', (req,res) => {
    const tags = db.prepare('SELECT * FROM tags ORDER BY id').all();
    res.json(tags);
  });
  app.post('/api/tags', auth, [body('name').trim().notEmpty().isLength({max:30})], handleValidation, (req, res) => {
    let { name } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    const existing = db.prepare('SELECT * FROM tags WHERE slug = ?').get(slug);
    if (existing) return res.status(400).json({ error: `Tag "${name}" already exists` });
    const result = db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)').run(name, slug);
    const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(tag);
  });
  app.put('/api/tags/:id', auth, [param('id').isInt(), body('name').trim().notEmpty().isLength({max:30})], handleValidation, (req, res) => {
    const tagId = parseInt(req.params.id);
    const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(tagId);
    if (!tag) return res.status(404).json({ error: 'Tag not found' });
    let { name } = req.body;
    db.prepare('UPDATE tags SET name = ?, slug = ? WHERE id = ?').run(name, slugify(name, { lower: true, strict: true }), tagId);
    const updated = db.prepare('SELECT * FROM tags WHERE id = ?').get(tagId);
    res.json(updated);
  });
  app.delete('/api/tags/:id', auth, [param('id').isInt()], handleValidation, (req, res) => {
    const tagId = parseInt(req.params.id);
    const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(tagId);
    if (!tag) return res.status(404).json({ error: 'Tag not found' });
    const postCount = db.prepare('SELECT COUNT(*) as cnt FROM post_tags WHERE tag_id = ?').get(tagId).cnt;
    if (postCount > 0) return res.status(400).json({ error: `Cannot delete tag: ${postCount} post(s) use it` });
    db.prepare('DELETE FROM tags WHERE id = ?').run(tagId);
    res.json({ message: 'Deleted' });
  });

  // Posts - List all
  app.get('/api/posts', (req, res) => {
    let { page = 1, limit = 10, categoryId, tagId, search } = req.query;
    let sql = 'SELECT p.*, c.name as category_name FROM posts p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_published = 1';
    let params = [];
    if (categoryId) { sql += ' AND p.category_id = ?'; params.push(categoryId); }
    if (tagId) { sql += ' AND p.id IN (SELECT post_id FROM post_tags WHERE tag_id = ?)'; params.push(tagId); }
    if (search) { sql += ' AND (p.title LIKE ? OR p.content LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY p.created_at DESC';
    const countSql = 'SELECT COUNT(*) as total FROM (' + sql.replace(/SELECT p\.\*.*?FROM(\s)/s, 'SELECT 1 FROM$1') + ')';
    const total = db.prepare(countSql).get(...params).total;
    const totalPages = Math.ceil(total / parseInt(limit));
    const start = (parseInt(page) - 1) * parseInt(limit);
    const posts = db.prepare(sql + ' LIMIT ? OFFSET ?').all(...params, parseInt(limit), start);
    const resultPosts = posts.map(({ category_id, author_id, ...p }) => ({...p, is_published: !!p.is_published}));
    res.json({ posts: resultPosts, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages }});
  });

  // Posts - Get by slug
  app.get('/api/posts/:slug', (req, res) => {
    const post = db.prepare('SELECT * FROM posts WHERE slug = ?').get(req.params.slug);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?').run(post.id);
    post.view_count++;
    const related = db.prepare('SELECT p.*, c.name as category_name FROM posts p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id != ? AND p.is_published = 1 ORDER BY p.created_at DESC LIMIT 5').all(post.id);
    const relatedResult = related.map(({ category_id, ...p }) => ({...p, is_published: !!p.is_published}));
    const tagNames = db.prepare('SELECT t.name FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?').all(post.id).map(t => t.name).join(', ');
    const tagList = db.prepare('SELECT t.id, t.name, t.slug FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?').all(post.id);
    const marked = require('marked');
    res.json({...post, is_published: !!post.is_published, contentHtml: marked.parse(post.content), tags: tagList, relatedPosts: relatedResult, tag_names: tagNames});
  });

  // Posts - Get my posts
  app.get('/api/posts/me/list', auth, (req, res) => {
    const myPosts = db.prepare(`
      SELECT p.id, p.title, p.slug, p.content, p.excerpt, p.cover_image, p.category_id, c.name as category_name,
             p.view_count, p.is_published, p.published_at, p.created_at, p.updated_at
      FROM posts p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.author_id = ? ORDER BY p.created_at DESC
    `).all(req.user.id);
    const tagFn = db.prepare('SELECT t.name FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?');
    const result = myPosts.map(p => {
      const tagNames = tagFn.all(p.id).map(t => t.name).join(', ');
      return {...p, is_published: !!p.is_published, tag_names: tagNames};
    });
    res.json(result);
  });

  // Posts - Create
  app.post('/api/posts', auth, [body('title').trim().notEmpty(), body('content').trim().notEmpty()], handleValidation, (req, res) => {
    const { title, content, excerpt, cover_image, category_id, tags, is_published = false } = req.body;
    const slug = slugify(title, { lower: true, strict: true });
    const now = new Date().toISOString();
    const result = db.prepare('INSERT INTO posts (title, slug, content, excerpt, cover_image, category_id, author_id, is_published, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      title, slug, content, excerpt || null, cover_image || null, category_id || null, req.user.id, is_published ? 1 : 0, is_published ? now : null, now, now
    );
    const postId = result.lastInsertRowid;
    const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)');
    const findTag = db.prepare('SELECT id FROM tags WHERE name = ?');
    const linkTag = db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)');
    if (tags?.length) {
      tags.forEach(tName => {
        const slug = slugify(tName, {lower:true,strict:true});
        insertTag.run(tName, slug);
        const tag = findTag.get(tName);
        if (tag) linkTag.run(postId, tag.id);
      });
    }
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    res.status(201).json({ message: 'Created', post: {...post, is_published: !!post.is_published} });
  });

  // Posts - Update  
  app.put('/api/posts/:id', auth, [param('id').isInt()], handleValidation, (req, res) => {
    const postId = parseInt(req.params.id);
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (post.author_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    let { title, content, excerpt, cover_image, category_id, tags, is_published } = req.body;
    const now = new Date().toISOString();
    const updates = [];
    const params = [];
    if (title) { updates.push('title = ?'); params.push(title); updates.push('slug = ?'); params.push(slugify(title, { lower: true, strict: true })); }
    if (content) { updates.push('content = ?'); params.push(content); }
    if (excerpt !== undefined) { updates.push('excerpt = ?'); params.push(excerpt); }
    if (cover_image) { updates.push('cover_image = ?'); params.push(cover_image); }
    if (category_id !== undefined) { updates.push('category_id = ?'); params.push(category_id); }
    if (is_published !== undefined) {
      updates.push('is_published = ?'); params.push(is_published ? 1 : 0);
      updates.push('published_at = ?'); params.push(is_published ? now : null);
    }
    if (updates.length > 0) {
      updates.push('updated_at = ?'); params.push(now);
      params.push(postId);
      db.prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }
    if (tags !== undefined) {
      db.prepare('DELETE FROM post_tags WHERE post_id = ?').run(postId);
      if (tags.length) {
        const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)');
        const findTag = db.prepare('SELECT id FROM tags WHERE name = ?');
        const linkTag = db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)');
        tags.forEach(tName => {
          const slug = slugify(tName, {lower:true,strict:true});
          insertTag.run(tName, slug);
          const tag = findTag.get(tName);
          if (tag) linkTag.run(postId, tag.id);
        });
      }
    }
    const updated = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    res.json({ message: 'Updated', post: {...updated, is_published: !!updated.is_published} });
  });

  // Posts - Delete
  app.delete('/api/posts/:id', auth, [param('id').isInt()], handleValidation, (req, res) => {
    const postId = parseInt(req.params.id);
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (post.author_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    db.prepare('DELETE FROM post_tags WHERE post_id = ?').run(postId);
    db.prepare('DELETE FROM posts WHERE id = ?').run(postId);
    res.json({ message: 'Deleted' });
  });

  // Profile
  app.get('/api/profile', auth, (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, ...u } = user;
    res.json(u);
  });

  app.put('/api/profile', auth, [body('avatar').optional({nullable:true}).isString(), body('bio').optional({nullable:true}).isString()], handleValidation, (req, res) => {
    let { avatar, bio } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (avatar !== undefined) db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatar, req.user.id);
    if (bio !== undefined) db.prepare('UPDATE users SET bio = ? WHERE id = ?').run(bio, req.user.id);
    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const { password, ...u } = updated;
    res.json({ message: 'Updated', user: u });
  });

  // Password change
  app.put('/api/auth/password', auth, [body('oldPassword').notEmpty(), body('newPassword').trim().isLength({min:6})], handleValidation, (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!bcrypt.compareSync(req.body.oldPassword, user.password)) return res.status(400).json({ error: 'Current password is incorrect' });
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(req.body.newPassword, 10), req.user.id);
    res.json({ message: 'Password updated' });
  });

  // About
  app.get('/api/about', (req, res) => {
    const admin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    const stats = db.prepare('SELECT COUNT(*) as totalPosts FROM posts WHERE is_published = 1').get();
    const totalCategories = db.prepare('SELECT COUNT(*) as total FROM categories').get().total;
    res.json({
      admin: { username: admin?.username || 'Admin', email: admin?.email || 'contact@example.com', avatar: admin?.avatar || null, bio: admin?.bio || 'A passionate developer.', memberSince: admin?.created_at },
      stats: { totalPosts: stats.totalPosts, totalCategories }
    });
  });

  // Search endpoint (alias for /api/posts with search param)
  app.get('/api/search', (req, res) => {
    let { keyword } = req.query;
    if (!keyword) return res.status(400).json({ error: 'Keyword is required' });
    const posts = db.prepare(`
      SELECT p.*, c.name as category_name FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_published = 1 AND (p.title LIKE ? OR p.content LIKE ?) 
      ORDER BY p.created_at DESC
    `).all(`%${keyword}%`, `%${keyword}%`);
    const resultPosts = posts.map(({ category_id, author_id, ...p }) => ({...p, is_published: !!p.is_published}));
    res.json({ posts: resultPosts, total: resultPosts.length });
  });

  return app;
}

module.exports = { createApp };
