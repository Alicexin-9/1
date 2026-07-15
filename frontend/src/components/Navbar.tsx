import React from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Sun, Moon, LogOut, UserPlus, LogIn, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuthStore } from '../stores/authStore'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { user, token, logout } = useAuthStore()
  const isAuthenticated = !!token

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-purple-600 dark:text-purple-400">
            <BookOpen size={28} />
            <span>我的博客</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              首页
            </Link>
            <Link to="/about" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              关于我
            </Link>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="切换主题"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="flex items-center space-x-1 text-sm text-purple-600 dark:text-purple-400 hover:underline">
                    <LogIn size={16} />
                    <span>登录</span>
                  </Link>
                  <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all">
                    <UserPlus size={16} className="inline mr-1" />
                    注册
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <span>{user?.username}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    <span>退出</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setIsMenuOpen(false)}>首页</Link>
              <Link to="/about" className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setIsMenuOpen(false)}>关于我</Link>
              
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">主题</span>
                <button onClick={() => { toggleTheme(); setIsMenuOpen(false); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
              </div>

              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setIsMenuOpen(false)}>登录</Link>
                  <Link to="/register" className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all text-center" onClick={() => setIsMenuOpen(false)}>注册账号</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="px-3 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setIsMenuOpen(false)}>仪表盘 ({user?.username})</Link>
                  <button onClick={() => { logout(); window.location.href = '/'; }} className="px-3 py-2 text-red-600 dark:text-red-400 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">退出登录</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
