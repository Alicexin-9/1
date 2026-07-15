import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Eye, Tag } from 'lucide-react'
import axios from 'axios'
import { Post as PostType, Tag as TagType } from '../types'

interface ExtendedPost extends PostType {
  tags?: TagType[]
  relatedPosts?: any[]
}

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<PostType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    if (!slug) return
    
    try {
      setLoading(true)
      const response = await axios.get(`/api/posts/${slug}`)
      setPost(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.message || '加载文章失败')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-12 text-red-600 dark:text-red-400">{error}</div>
  }

  if (!post) {
    return <div className="text-center py-12">文章不存在</div>
  }

  return (
    <article className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:underline mb-6">
        <ArrowLeft size={16} className="mr-2" />
        返回首页
      </Link>

      <header className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          {post.category_name && (
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">{post.category_name}</span>
          )}
          <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar size={14} className="mr-1" />
            {formatDate(post.published_at || post.created_at)}
          </span>
          <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Eye size={14} className="mr-1" />
            {post.view_count}阅读
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{post.title}</h1>

        {post.author_username && (
          <div className="flex items-center space-x-3">
            {post.author_avatar ? (
              <img src={post.author_avatar} alt={post.author_username} className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">{post.author_username.charAt(0).toUpperCase()}</div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{post.author_username}</p>
              {post.author_bio && <p className="text-xs text-gray-500 dark:text-gray-400">{post.author_bio}</p>}
            </div>
          </div>
        )}
      </header>

      {post.cover_image && (
        <div className="mb-8 overflow-hidden rounded-xl">
          <img src={post.cover_image} alt={post.title} className="w-full h-96 object-cover transform hover:scale-105 transition-transform duration-300" />
        </div>
      )}

      <div 
        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-purple-600 dark:prose-a:text-purple-400"
        dangerouslySetInnerHTML={{ __html: (post as ExtendedPost).contentHtml || post.content }}
      />

      {(post as ExtendedPost).tags && (post as ExtendedPost).tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {(post as ExtendedPost).tags.map((tag: TagType) => (
              <a key={tag.id} href="#" className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-800 dark:hover:text-purple-200 transition-colors">
                <Tag size={14} className="mr-1" />
                {tag.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {(post as ExtendedPost).relatedPosts && (post as ExtendedPost).relatedPosts.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">相关文章</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(post as ExtendedPost).relatedPosts.slice(0, 4).map((relatedPost: any) => (
              <Link key={relatedPost.id} to={`/post/${relatedPost.slug}`} className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                {relatedPost.cover_image && (
                  <img src={relatedPost.cover_image} alt={relatedPost.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                )}
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">{relatedPost.title}</h4>
                {relatedPost.excerpt && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{relatedPost.excerpt}</p>}
                {relatedPost.category_name && <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">{relatedPost.category_name}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
