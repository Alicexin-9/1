import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, PlusCircle, Edit2, Trash2, Eye, TrendingUp, Tags, Layers, Settings as SettingsIcon } from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import { Category, Tag } from '../types'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [posts, setPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    cover_image: '',
    categoryId: '',
    tags: [] as string[],
    is_published: false
  })

  useEffect(() => {
    fetchMyPosts()
    fetchCategories()
    fetchTags()
  }, [])

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  const fetchMyPosts = async () => {
    try {
      const response = await axios.get('/api/posts/me/list', authConfig())
      setPosts(response.data)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await axios.get('/api/tags')
      setTags(response.data)
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'tags') {
      setFormData(prev => ({ ...prev, tags: value ? value.split(',').map(t => t.trim()).filter(Boolean) : [] }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleCreatePost = async () => {
    try {
      await axios.post('/api/posts', {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        cover_image: formData.cover_image || undefined,
        category_id: formData.categoryId ? Number(formData.categoryId) : null,
        tags: formData.tags,
        is_published: formData.is_published
      }, authConfig())

      setShowCreateModal(false)
      resetForm()
      fetchMyPosts()
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('创建失败，请重试')
    }
  }

  const handleDeletePost = async (id: number) => {
    try {
      await axios.delete(`/api/posts/${id}`, authConfig())
      setPosts(posts.filter(p => p.id !== id))
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('删除失败，请重试')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      cover_image: '',
      categoryId: '',
      tags: [],
      is_published: false
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">文章管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">欢迎来到您的后台管理系统</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/settings" className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <SettingsIcon size={18} className="mr-1" />设置
          </Link>
          <Link to="/categories" className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Layers size={18} className="mr-1" />分类
          </Link>
          <Link to="/tags" className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Tags size={18} className="mr-1" />标签
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            <PlusCircle className="mr-2" size={20} />
            新建文章
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">总文章数</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{posts.length}</p>
            </div>
            <BookOpen className="text-purple-600 dark:text-purple-400" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">总阅读量</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {posts.reduce((sum: number, p: any) => sum + p.view_count, 0)}
              </p>
            </div>
            <TrendingUp className="text-green-600 dark:text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">分类数量</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">C</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">标签数量</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{tags.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">#</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">标题</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">分类</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">浏览量</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">发布时间</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">加载中...</td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">还没有文章，去创建一篇吧！</td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">{post.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                        {post.category_name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.is_published
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {post.is_published ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center text-gray-600 dark:text-gray-400">
                      <Eye size={14} className="mr-1" />
                      {post.view_count}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/edit/${post.id}`}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => setShowDeleteConfirm(post.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 size={18} />
                        </button>
                        <a
                          href={`/post/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="查看"
                        >
                          <Eye size={18} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" onClick={() => { setShowCreateModal(false); resetForm() }}></div>
            <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">创建新文章</h3>
                <button
                  onClick={() => { setShowCreateModal(false); resetForm() }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  X
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">标题</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="请输入文章标题" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">封面图片 URL</label>
                    <input type="url" name="cover_image" value={formData.cover_image} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="https://example.com/image.jpg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分类</label>
                    <select name="categoryId" value={formData.categoryId} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500">
                      <option value="">请选择分类</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">摘要</label>
                  <textarea name="excerpt" value={formData.excerpt} onChange={handleInputChange} rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="请输入文章摘要（可选）" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">标签</label>
                  <input type="text" name="tags" value={formData.tags?.join(',')} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="用逗号分隔，如：React, JavaScript" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">内容</label>
                  <textarea name="content" value={formData.content} onChange={handleInputChange} rows={15}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    placeholder="# 标题\n\n输入 Markdown 格式的内容..." required />
                </div>

                <div className="flex items-center">
                  <input type="checkbox" id="modal_is_published" checked={formData.is_published}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" />
                  <label htmlFor="modal_is_published" className="ml-2 text-sm text-gray-700 dark:text-gray-300">立即发布</label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => { setShowCreateModal(false); resetForm() }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">取消</button>
                <button onClick={handleCreatePost} disabled={!formData.title || !formData.content}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">发布文章</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" onClick={() => setShowDeleteConfirm(null)}></div>
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-xl shadow-xl">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">确认删除</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">您确定要删除这篇文章吗？此操作无法撤销。</p>
              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">取消</button>
                <button onClick={() => handleDeletePost(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">删除</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
