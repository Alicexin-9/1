import { Heart, Github, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="flex items-center space-x-2 text-lg font-bold text-purple-600 dark:text-purple-400">
              <BookOpen size={24} />
              <span>我的博客</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">记录生活，分享知识</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              <Github size={20} />
            </a>
            <span className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <Heart size={16} className="text-red-500 fill-current" />
              <span className="text-sm">Made with love</span>
            </span>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} 个人博客。All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
