# 个人博客系统 📝

一个简单的全栈个人博客系统，支持文章管理、Markdown 渲染、分类标签等功能。

## ✨ 功能特性

- ✅ 首页文章列表（分页、时间倒序）
- ✅ 文章详情页（Markdown 实时预览 + 阅读量统计）
- ✅ 标签和分类系统
- ✅ 搜索功能（按标题和内容搜索）
- ✅ 关于我页面
- ✅ 用户注册/登录
- ✅ 后台管理（创建/编辑/删除文章）
- ✅ 响应式设计（支持移动端）
- ✅ 暗色模式切换

## 🛠️ 技术栈

### 前端
- React 18 + TypeScript
- TailwindCSS
- Vite
- React Router DOM
- Axios

### 后端
- Node.js + Express
- in-memory database (可扩展到 SQLite/MongoDB)
- JWT 身份验证

## 📦 安装与运行

### 方式一：克隆整个项目

```bash
# 克隆项目
git clone <repo-url>
cd blog-system

# 安装依赖
cd frontend && npm install
cd ../backend && npm install

# 启动服务
# 终端 1 - 后端服务
cd backend && npm run dev

# 终端 2 - 前端服务  
cd frontend && npm run dev
```

### 方式二：直接访问预览

部署时会自动启动前后端服务，直接访问提供的预览链接即可使用。

## 🔐 默认账号

**管理员账号**:
- 用户名：`admin`
- 密码：`admin123`

## 📂 项目结构

```
blog-system/
├── backend/                # 后端服务
│   ├── src/
│   │   └── index.js       # 主入口文件
│   └── package.json
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── components/    # 公共组件
│   │   ├── pages/         # 页面组件
│   │   ├── stores/        # 状态管理
│   │   └── utils/         # 工具函数
│   └── package.json
└── README.md
```

## 🌐 API 接口

### 认证 API
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 内容 API
- `GET /api/posts` - 获取文章列表
- `GET /api/posts/:slug` - 获取单篇文章详情
- `GET /api/categories` - 获取分类列表
- `GET /api/tags` - 获取标签列表
- `GET /api/about` - 获取关于信息

### 管理 API（需认证）
- `POST /api/posts/me/list` - 获取我的文章列表
- `POST /api/posts` - 创建文章
- `PUT /api/posts/:id` - 更新文章
- `DELETE /api/posts/:id` - 删除文章
- `GET /api/profile` - 获取个人资料
- `PUT /api/profile` - 更新个人资料

## 🎨 UI 设计

- **极简风格**: 简洁现代的界面设计
- **响应式布局**: 完美适配手机、平板、桌面
- **暗色模式**: 一键切换深色主题
- **代码高亮**: Markdown 表格支持语法高亮

## 📱 使用方法

1. **阅读文章**: 访问首页浏览最新文章
2. **查看详情**: 点击文章进入详情页，支持阅读量和相关推荐
3. **管理内容**: 
   - 登录后自动跳转至后台
   - 点击"新建文章"创建内容
   - 支持 Markdown 语法格式

## 🔧 配置说明

### 环境变量

后端可通过 `.env` 文件配置：

```env
PORT=3001
JWT_SECRET=your-secret-key
```

### 开发参数

- 后端默认端口：`3001`
- 前端默认端口：`3000`
- 前端通过 Vite 代理转发 `/api` 请求到后端

## 📝 开发计划

- [ ] 数据库持久化（SQLite/MongoDB 迁移）
- [ ] 图片上传功能
- [ ] 评论系统
- [ ] 文章收藏功能
- [ ] RSS 订阅
- [ ] SEO 优化

## 📄 License

MIT License

---
