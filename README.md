# 个人博客系统

全栈个人博客，支持文章管理、Markdown 渲染、分类标签管理、用户认证。

## 功能特性

- 首页文章列表（分页、分类/标签筛选）
- 文章详情（Markdown 渲染 + 阅读量统计 + 相关推荐）
- 分类/标签管理（删除前检查关联文章）
- 搜索（标题+内容模糊匹配）
- 用户注册/登录（JWT）
- 后台管理（文章/分类/标签 CRUD、个人设置、密码修改）
- 响应式设计 + 暗色模式

## 技术栈

| 层 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + TailwindCSS + React Router + Axios |
| 后端 | Node.js + Express + SQLite (better-sqlite3) + JWT + bcryptjs |
| 部署 | Docker / Docker Compose |

## 一键部署

```bash
git clone https://github.com/Alicexin-9/1.git my-blog
cd my-blog

docker compose up -d
```

构建到启动全自动完成，访问 `http://localhost:3001`。

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | `admin` | `admin123` |

## 开发模式

```bash
cd backend && npm install && npm run dev   # 后端 http://localhost:3001
cd frontend && npm install && npm run dev  # 前端 http://localhost:3000
```

## 项目结构

```
├── backend/               # Express 后端
│   ├── src/index.js       # 全部路由 + 数据库 + 认证
│   └── package.json
├── frontend/              # React 前端
│   └── src/
│       ├── pages/         # Home, PostDetail, Dashboard, EditPost ...
│       ├── components/    # Navbar, Footer
│       ├── stores/        # authStore
│       ├── contexts/      # ThemeContext
│       └── utils/         # api.ts
├── Dockerfile             # 多阶段构建，单进程部署
├── docker-compose.yml     # 一键启动 + 数据持久化
└── start.sh               # 非 Docker 一键部署
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/posts | 文章列表（page, limit, categoryId, tagId, search） |
| GET | /api/posts/:slug | 文章详情 |
| GET | /api/categories | 分类列表 |
| GET | /api/tags | 标签列表 |
| GET | /api/about | 站点信息 |
| POST | /api/auth/register | 注册 |
| POST | /api/auth/login | 登录 |
| PUT | /api/auth/password | 修改密码（需认证） |
| GET | /api/posts/me/list | 我的文章（需认证） |
| POST | /api/posts | 创建文章（需认证） |
| PUT | /api/posts/:id | 更新文章（需认证） |
| DELETE | /api/posts/:id | 删除文章（需认证） |
| POST | /api/categories | 创建分类（需认证） |
| PUT | /api/categories/:id | 更新分类（需认证） |
| DELETE | /api/categories/:id | 删除分类（需认证） |
| POST | /api/tags | 创建标签（需认证） |
| PUT | /api/tags/:id | 更新标签（需认证） |
| DELETE | /api/tags/:id | 删除标签（需认证） |
| GET | /api/profile | 个人资料（需认证） |
| PUT | /api/profile | 更新资料（需认证） |

## 环境变量

```env
PORT=3001
JWT_SECRET=your-secret-key-here
```

## License

MIT
