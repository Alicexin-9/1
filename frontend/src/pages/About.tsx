import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, User, Calendar, BookOpen, TrendingUp } from 'lucide-react'
import axios from 'axios'

export default function About() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAboutData()
  }, [])

  const fetchAboutData = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/about')
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch about data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12 mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">关于我</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">认识一下博客的主人</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6">
            {data?.admin?.avatar ? (
              <img
                src={data.admin.avatar}
                alt={data.admin.username}
                className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold">
                {data?.admin?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="mt-4 md:mt-0 md:ml-6 flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{data?.admin?.username}</h2>
              <p className="text-gray-600 dark:text-gray-400">{data?.admin?.bio || '分享技术，记录生活'}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Mail className="text-purple-600 dark:text-purple-400 mr-3" size={20} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">邮箱</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{data?.admin?.email}</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Calendar className="text-purple-600 dark:text-purple-400 mr-3" size={20} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">加入时间</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(data?.admin?.memberSince).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="flex items-center p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              <User size={20} className="mr-2" />
              <span className="font-medium">管理文章</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
              <BookOpen className="mx-auto mb-2 text-purple-600 dark:text-purple-400" size={32} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.stats?.totalPosts || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">文章数量</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
              <BookOpen className="mx-auto mb-2 text-pink-600 dark:text-pink-400" size={32} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.stats?.totalCategories || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">分类目录</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
              <TrendingUp className="mx-auto mb-2 text-green-600 dark:text-green-400" size={32} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">∞</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">持续学习</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
              <CalibrateIcon className="mx-auto mb-2 text-blue-600 dark:text-blue-400" size={32} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">100%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">全力以赴</p>
            </div>
          </div>

          {/* About Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h2>为什么写这个博客</h2>
            <p>
              创建这个博客的初衷是记录和分享我的学习笔记、技术心得和生活感悟。在这个快节奏的时代，
              写博客让我能够静心思考，系统性地整理所学的知识。
            </p>
            
            <h2>我的兴趣领域</h2>
            <p>
              主要关注前端开发、全栈设计和软件架构。同时也喜欢探索新技术，尝试不同的编程范式和工具链。
              相信通过持续学习和分享，能够帮助自己和他人共同成长。
            </p>

            <h2>使用技术</h2>
            <p>
              这个博客使用了现代 Web 技术构建，包括 React、TypeScript、Node.js、Express 和 SQLite。
              设计风格追求极简主义，注重用户体验和响应式布局。
            </p>

            <h2>联系我</h2>
            <p>
              如果您有任何问题、建议或者只是想聊聊技术和生活，欢迎通过邮件联系！也欢迎您将本站分享给您朋友。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple icon component for calibration
function CalibrateIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}
