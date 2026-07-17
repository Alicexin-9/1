const request = require('supertest');
const { createApp } = require('../src/app');
const { createTestDatabase } = require('../src/db');

describe('Blog API Tests', () => {
  let app;
  let db;
  let authToken;
  let testUser;

  beforeAll(() => {
    db = createTestDatabase();
    app = createApp(db);
  });

  afterAll(() => {
    db.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Registered');
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.token).toBeDefined();
    });

    it('should reject duplicate username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'other@example.com', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'user2', email: 'user2@example.com', password: '123' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('testuser');
      authToken = res.body.token;
      testUser = res.body.user;
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/categories', () => {
    it('should return empty list initially', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('POST /api/categories', () => {
    it('should create category when authenticated', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Technology', description: 'Tech articles' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Technology');
      expect(res.body.slug).toBe('technology');
    });

    it('should reject without auth', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'NoAuth' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/categories after create', () => {
    it('should return created categories', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Technology');
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update category when authenticated', async () => {
      const res = await request(app)
        .put('/api/categories/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Tech', description: 'Updated description' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Tech');
      expect(res.body.slug).toBe('tech');
    });

    it('should reject non-existent category', async () => {
      const res = await request(app)
        .put('/api/categories/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Ghost' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete category when authenticated', async () => {
      const res = await request(app)
        .delete('/api/categories/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Deleted');
    });

    it('should reject non-existent category', async () => {
      const res = await request(app)
        .delete('/api/categories/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/posts', () => {
    let categoryId;

    beforeAll(async () => {
      const catRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Testing' });
      categoryId = catRes.body.id;
    });

    it('should create a draft post when authenticated', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'My First Post',
          content: 'This is the content of my first post.',
          excerpt: 'A short excerpt',
          category_id: categoryId,
          tags: ['javascript', 'nodejs'],
          is_published: false
        });

      expect(res.status).toBe(201);
      expect(res.body.post.title).toBe('My First Post');
      expect(res.body.post.is_published).toBe(false);
    });

    it('should create a published post when authenticated', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Published Post',
          content: 'This post is published.',
          is_published: true
        });

      expect(res.status).toBe(201);
      expect(res.body.post.is_published).toBe(true);
      expect(res.body.post.published_at).toBeDefined();
    });

    it('should reject without auth', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ title: 'No Auth', content: 'test' });

      expect(res.status).toBe(401);
    });

    it('should reject empty title', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '', content: 'test' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/posts', () => {
    it('should return only published posts', async () => {
      const res = await request(app).get('/api/posts');
      expect(res.status).toBe(200);
      expect(res.body.posts.length).toBe(1);
      expect(res.body.posts[0].title).toBe('Published Post');
    });

    it('should support pagination', async () => {
      const res = await request(app).get('/api/posts?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination.total).toBe(1);
    });

    it('should return empty for out-of-range page', async () => {
      const res = await request(app).get('/api/posts?page=999');
      expect(res.status).toBe(200);
      expect(res.body.posts.length).toBe(0);
    });
  });

  describe('GET /api/posts/:slug', () => {
    it('should return post by slug', async () => {
      const res = await request(app).get('/api/posts/published-post');
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Published Post');
      expect(res.body.contentHtml).toBeDefined();
    });

    it('should increment view count', async () => {
      const res1 = await request(app).get('/api/posts/published-post');
      const res2 = await request(app).get('/api/posts/published-post');
      expect(res2.body.view_count).toBe(res1.body.view_count + 1);
    });

    it('should return 404 for non-existent slug', async () => {
      const res = await request(app).get('/api/posts/non-existent');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Post not found');
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update own post when authenticated', async () => {
      const res = await request(app)
        .put('/api/posts/2')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Post Title', content: 'Updated content' });

      expect(res.status).toBe(200);
      expect(res.body.post.title).toBe('Updated Post Title');
    });

    it('should reject update from another user', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'otheruser', email: 'other@example.com', password: 'password123' });

      const otherToken = regRes.body.token;

      const res = await request(app)
        .put('/api/posts/2')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked Title' });

      expect(res.status).toBe(403);
    });

    it('should reject non-existent post', async () => {
      const res = await request(app)
        .put('/api/posts/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Ghost' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should reject non-existent post', async () => {
      const res = await request(app)
        .delete('/api/posts/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('should delete own post when authenticated', async () => {
      const res = await request(app)
        .delete('/api/posts/2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Deleted');
    });
  });

  describe('GET /api/search', () => {
    beforeAll(async () => {
      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'JavaScript Guide', content: 'Learn JavaScript basics', is_published: true });
      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Python Tutorial', content: 'Learn Python programming', is_published: true });
    });

    it('should search posts by keyword', async () => {
      const res = await request(app).get('/api/search?keyword=JavaScript');
      expect(res.status).toBe(200);
      expect(res.body.posts.length).toBe(1);
      expect(res.body.posts[0].title).toContain('JavaScript');
    });

    it('should search posts by content', async () => {
      const res = await request(app).get('/api/search?keyword=basics');
      expect(res.status).toBe(200);
      expect(res.body.posts.length).toBe(1);
    });

    it('should return multiple matches', async () => {
      const res = await request(app).get('/api/search?keyword=Learn');
      expect(res.status).toBe(200);
      expect(res.body.posts.length).toBe(2);
    });

    it('should reject empty keyword', async () => {
      const res = await request(app).get('/api/search');
      expect(res.status).toBe(400);
    });
  });
});
