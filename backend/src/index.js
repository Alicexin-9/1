const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const slugify = require('slugify');
const { body, param, validationResult } = require('express-validator');
require('dotenv').config();

let db = { users: [], categories: [], posts: [], tags: [], postTags: [] };
let nextId = 1;
const JWT_SECRET = process.env.JWT_SECRET || 'blog-secret-key-2026';
let authSecret = JWT_SECRET;

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

// Initial admin user
db.users.push({
  id: nextId++, username: 'admin', email: 'admin@example.com',
  password: bcrypt.hashSync('admin123', 10), avatar: null, bio: 'A passionate developer.', created_at: new Date().toISOString()
});

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const generateToken = (user) => jwt.sign({ id: user.id, username: user.username }, authSecret, { expiresIn: '7d' });

// Auth - Register
app.post('/api/auth/register', [body('username').trim().notEmpty().isLength({min:3,max:20}), body('email').isEmail(), body('password').trim().isLength({min:6})], handleValidation, (req, res) => {
  let { username, email, password } = req.body;
  if (db.users.find(u => u.username === username || u.email === email)) return res.status(400).json({ error: 'Username or email already exists' });
  const user = { id: nextId++, username, email, password: bcrypt.hashSync(password, 10), avatar: null, bio: null, created_at: new Date().toISOString() };
  db.users.push(user);
  res.status(201).json({ message: 'Registered', user: { id: user.id, username, email }, token: generateToken(user) });
});

// Auth - Login
app.post('/api/auth/login', [body('username').notEmpty(), body('password').notEmpty()], handleValidation, (req,res) => {
  let { username,password } = req.body;
  const user = db.users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  const { password: _, ...userWithoutPass } = user;
  res.json({ message: 'Login successful', user: userWithoutPass, token: generateToken(user) });
});

// Categories
app.get('/api/categories', (req,res) => res.json(db.categories));
app.post('/api/categories', (req, res) => {
  let { name, description } = req.body;
  const cat = { id: nextId++, name, slug: slugify(name, { lower: true, strict: true }), description, created_at: new Date().toISOString() };
  db.categories.push(cat);
  res.status(201).json(cat);
}, [body('name').trim().notEmpty().isLength({max:50})]);

// Tags
app.get('/api/tags', (req,res) => res.json(db.tags));
app.post('/api/tags', (req, res) => {
  let { name } = req.body;
  const tag = { id: nextId++, name, slug: slugify(name, { lower: true, strict: true }), created_at: new Date().toISOString() };
  db.tags.push(tag);
  res.status(201).json(tag);
}, [body('name').trim().notEmpty().isLength({max:30})]);

// Posts - List all
app.get('/api/posts', (req, res) => {
  let { page = 1, limit = 10, categoryId, search } = req.query;
  let posts = db.posts.filter(p => p.is_published);
  if (categoryId) posts = posts.filter(p => p.category_id == categoryId);
  if (search) posts = posts.filter(p => p.title.includes(search) || p.content.includes(search));
  const total = posts.length, totalPages = Math.ceil(total / parseInt(limit)), start = (parseInt(page) - 1) * parseInt(limit);
  const paginated = posts.slice(start, start + parseInt(limit)).map(({ category_id, author_id, ...p }) => ({...p, category_name: db.categories.find(c => c.id === category_id)?.name}));
  res.json({ posts: paginated, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages }});
});

// Posts - Get by slug
app.get('/api/posts/:slug', (req, res) => {
  const post = db.posts.find(p => p.slug === req.params.slug);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  post.view_count++;
  const related = db.posts.filter(p => p.id !== post.id && p.is_published).slice(0, 5).map(({ category_id, ...p }) => ({...p, category_name: db.categories.find(c => c.id === category_id)?.name}));
  const tagNames = db.postTags.filter(pt => pt.post_id === post.id).map(pt => db.tags.find(t => t.id === pt.tag_id)).filter(Boolean).map(t => t.name).join(', ');
  const marked = require('marked');
  res.json({...post, contentHtml: marked.parse(post.content), tags: [], relatedPosts: related, tag_names: tagNames});
});

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  try {
    req.user = jwt.verify(token, authSecret);
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Posts - Get my posts
app.get('/api/posts/me/list', auth, (req, res) => {
  const myPosts = db.posts.filter(p => p.author_id === req.user.id).map(({ author_id, ...p }) => p);
  res.json(myPosts);
});

// Posts - Create
app.post('/api/posts', auth, [body('title').trim().notEmpty(), body('content').trim().notEmpty()], handleValidation, (req, res) => {
  const { title, content, excerpt, cover_image, category_id, tags, is_published = false } = req.body;
  const post = { id: nextId++, title, slug: slugify(title, { lower: true, strict: true }), content, excerpt, cover_image, category_id: category_id || null, author_id: req.user.id, view_count: 0, is_published, published_at: is_published ? new Date().toISOString() : null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  db.posts.push(post);
  if (tags?.length) {
    tags.forEach(tName => {
      let tag = db.tags.find(t => t.name.toLowerCase() === tName.toLowerCase());
      if (!tag) { tag = { id: nextId++, name: tName, slug: slugify(tName, {lower:true,strict:true}), created_at: new Date().toISOString() }; db.tags.push(tag); }
      db.postTags.push({ post_id: post.id, tag_id: tag.id });
    });
  }
  res.status(201).json({ message: 'Created', post });
});

// Posts - Update  
app.put('/api/posts/:id', auth, [param('id').isInt()], handleValidation, (req, res) => {
  const postId = parseInt(req.params.id);
  const post = db.posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (post.author_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
  let { title, content, excerpt, cover_image, category_id, tags, is_published } = req.body;
  if (title) post.title = title;
  if (content) post.content = content;
  if (excerpt !== undefined) post.excerpt = excerpt;
  if (cover_image) post.cover_image = cover_image;
  if (category_id !== undefined) post.category_id = category_id;
  if (is_published !== undefined) { post.is_published = is_published; post.published_at = is_published ? new Date().toISOString() : null; }
  post.updated_at = new Date().toISOString();
  if (tags !== undefined) {
    db.postTags = db.postTags.filter(pt => pt.post_id !== postId);
    if (tags.length) {
      tags.forEach(tName => {
        let tag = db.tags.find(t => t.name.toLowerCase() === tName.toLowerCase());
        if (!tag) { tag = { id: nextId++, name: tName, slug: slugify(tName, {lower:true,strict:true}), created_at: new Date().toISOString() }; db.tags.push(tag); }
        db.postTags.push({ post_id: postId, tag_id: tag.id });
      });
    }
  }
  res.json({ message: 'Updated' });
});

// Posts - Delete
app.delete('/api/posts/:id', auth, [param('id').isInt()], handleValidation, (req, res) => {
  const postId = parseInt(req.params.id);
  const post = db.posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (post.author_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
  db.posts = db.posts.filter(p => p.id !== postId);
  res.json({ message: 'Deleted' });
});

// Profile
app.get('/api/profile', auth, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...u } = user;
  res.json(u);
});

app.put('/api/profile', auth, [body('avatar').optional().isURL(), body('bio').optional().isString()], handleValidation, (req, res) => {
  let { avatar, bio } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  if (avatar) user.avatar = avatar;
  if (bio !== null) user.bio = bio;
  res.json({ message: 'Updated', user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio, created_at: user.created_at }});
});

// About
app.get('/api/about', (req, res) => {
  const admin = db.users.find(u => u.username === 'admin');
  res.json({
    admin: { username: admin?.username || 'Admin', email: admin?.email || 'contact@example.com', avatar: admin?.avatar || null, bio: admin?.bio || 'A passionate developer.', memberSince: admin?.created_at },
    stats: { totalPosts: db.posts.filter(p => p.is_published).length, totalCategories: db.categories.length }
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
