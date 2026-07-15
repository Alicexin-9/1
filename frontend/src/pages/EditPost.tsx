import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditPost() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    cover_image: '',
    categoryId: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) { alert('请先登录'); navigate('/login'); return }
      
      await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      
      alert('保存成功！')
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      alert('保存失败')
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link to="/dashboard" className="text-purple-600 dark:text-purple-400 hover:underline flex items-center mb-6">
        <ArrowLeft size={16} className="mr-2" />返回后台
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">创建新文章</h1>

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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分类 ID</label>
              <input
                type="number" name="categoryId" value={formData.categoryId} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="留空表示无分类"
              />
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">内容 *</label>
            <textarea
              name="content" value={formData.content} onChange={handleInputChange} rows={15}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              placeholder="# 标题\n\n输入 Markdown 格式的内容..." required
            />
          </div>

          <div className="flex items-center justify-end pt-4 space-x-4">
            <Link to="/dashboard" className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">取消</Link>
            <button onClick={handleSubmit} disabled={!formData.title || !formData.content} className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              <Save size={18} className="mr-2" />保存文章
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
