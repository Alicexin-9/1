import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { postService, categoryService } from '../utils/api'

export default function EditPost() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    cover_image: '',
    categoryId: '',
    tags: [] as string[],
    is_published: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCategories()
    if (isEdit) fetchPost()
    else setLoading(false)
  }, [id])

  const fetchPost = async () => {
    try {
      const posts = await postService.getMyPosts()
      const post = posts.find((p: any) => p.id === Number(id))
      if (post) {
        setFormData({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || '',
          cover_image: post.cover_image || '',
          categoryId: post.category_id || '',
          tags: post.tag_names ? post.tag_names.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
          is_published: Boolean(post.is_published)
        })
      }
    } catch (e) {
      console.error(e)
      alert('加载文章失败')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll()
      setCategories(data)
    } catch (e) {
      console.error(e)
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

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        cover_image: formData.cover_image || undefined,
        category_id: formData.categoryId ? Number(formData.categoryId) : null,
        tags: formData.tags,
        is_published: formData.is_published
      }

      if (isEdit) {
        await postService.update(Number(id), payload)
      } else {
        await postService.create(payload)
      }

      alert('保存成功！')
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto py-8 text-center text-gray-500">加载中...</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link to="/dashboard" className="text-purple-600 dark:text-purple-400 hover:underline flex items-center mb-6">
        <ArrowLeft size={16} className="mr-2" />返回后台
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {isEdit ? '编辑文章' : '创建新文章'}
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">标题 *</label>
            <input
              type="text" name="title" value={formData.title} onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="请输入文章标题" required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">封面图片 URL</label>
              <input
                type="url" name="cover_image" value={formData.cover_image} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分类</label>
              <select
                name="categoryId" value={formData.categoryId} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">请选择分类</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">摘要</label>
            <textarea
              name="excerpt" value={formData.excerpt} onChange={handleInputChange} rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="请输入文章摘要（可选）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">标签</label>
            <input
              type="text" name="tags" value={formData.tags.join(',')} onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="用逗号分隔，如：React, JavaScript"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">内容 *</label>
            <textarea
              name="content" value={formData.content} onChange={handleInputChange} rows={15}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              placeholder="# 标题\n\n输入 Markdown 格式的内容..." required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox" id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="is_published" className="ml-2 text-sm text-gray-700 dark:text-gray-300">立即发布</label>
          </div>

          <div className="flex items-center justify-end pt-4 space-x-4">
            <Link to="/dashboard" className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">取消</Link>
            <button
              onClick={handleSubmit}
              disabled={saving || !formData.title || !formData.content}
              className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save size={18} className="mr-2" />{saving ? '保存中...' : (isEdit ? '更新文章' : '发布文章')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
