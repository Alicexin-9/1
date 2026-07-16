# 个人博客系统

一个全栈个人博客系统，支持文章管理、Markdown 渲染、分类标签管理、用户认证等功能。

## 功能特性

- 首页文章列表（分页、时间倒序、分类/标签筛选）
- 文章详情页（Markdown 渲染 + 阅读量统计 + 相关推荐）
- 标签和分类系统（独立管理页面，删除前检查关联）
- 搜索功能（按标题和内容模糊搜索）
- 关于页面（站点统计信息）
- 用户注册/登录（JWT 认证）
- 后台管理（文章 CRUD、分类管理、标签管理、个人设置）
- 响应式设计（支持移动端）
- 暗色模式切换

## 技术栈

### 前端
- React 18 + TypeScript
- TailwindCSS
- Vite
- React Router DOM
- Axios
- Lucide React（图标库）

### 后端
- Node.js + Express
- SQLite（better-sqlite3）
- JWT 身份验证
- bcryptjs 密码加密
- express-validator 参数校验
- marked Markdown 渲染

## 快速开始

### 方式一：生产部署（单端口）

```bash
# 一键部署
chmod +x start.sh && ./start.sh

# 或分步执行
cd frontend && npm install && npm run build
cd ../backend && npm install && node src/index.js
```

访问 `http://localhost:3001` 即可使用。

### 方式二：开发模式（前后端热更新）

```bash
# 安装依赖
cd backend && npm install
cd ../frontend && npm install
cd ..

# 同时启动前后端
npm run dev

# 或分别启动
cd backend && npm run dev    # 后端 http://localhost:3001
cd frontend && npm run dev   # 前端 http://localhost:3000
```

### 部署到 Railway

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | `admin` | `admin123` |

## 项目结构

```
personal-blog/
├── backend/                  # 后端服务
│   ├── src/
│   │   └── index.js         # 主入口（路由、数据库、认证、CRUD）
│   ├── data/                 # SQLite 数据库文件（自动生成）
│   └── package.json
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # 公共组件（Navbar、Footer）
│   │   ├── pages/            # 页面组件（Home、PostDetail、Dashboard 等）
│   │   ├── stores/           # 状态管理（authStore）
│   │   ├── contexts/         # React Context（ThemeContext）
│   │   ├── utils/            # 工具函数（api.ts）
│   │   └── types/            # TypeScript 类型定义
│   └── package.json
├── docker-compose.yml         # Docker Compose 配置
├── start.sh                  # 一键部署脚本
└── package.json              # 根目录统一管理脚本
```

## API 接口

### 公开接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/posts | 文章列表（支持 page、limit、categoryId、tagId、search） |
| GET | /api/posts/:slug | 文章详情 |
| GET | /api/categories | 分类列表 |
| GET | /api/tags | 标签列表 |
| GET | /api/about | 站点信息 |

### 认证接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| PUT | /api/auth/password | 修改密码 |

### 管理接口（需 JWT 认证）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/posts/me/list | 我的文章列表 |
| POST | /api/posts | 创建文章 |
| PUT | /api/posts/:id | 更新文章 |
| DELETE | /api/posts/:id | 删除文章 |
| POST | /api/categories | 创建分类 |
| PUT | /api/categories/:id | 更新分类 |
| DELETE | /api/categories/:id | 删除分类 |
| POST | /api/tags | 创建标签 |
| PUT | /api/tags/:id | 更新标签 |
| DELETE | /api/tags/:id | 删除标签 |
| GET | /api/profile | 获取个人资料 |
| PUT | /api/profile | 更新个人资料 |

## 环境变量

后端通过 `.env` 文件配置：

```env
PORT=3001
JWT_SECRET=your-secret-key-here
```

## 配置说明

- 后端默认端口：`3001`
- 开发模式下前端默认端口：`3000`（Vite proxy 转发 `/api` 到后端）
- 生产模式后端统一 serve 前端静态文件（`frontend/dist`）
- 数据库位置：`backend/data/blog.db`（自动创建）

## License

MIT
