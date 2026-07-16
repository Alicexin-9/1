import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, User, Lock, ArrowLeft } from 'lucide-react'
import { authService } from '../utils/api'
import { useAuthStore } from '../stores/authStore'

export default function Settings() {
  const navigate = useNavigate()
  const { user, login } = useAuthStore()
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setBio(user.bio || '')
      setAvatar(user.avatar || '')
    }
  }, [user])

  const handleSaveProfile = async () => {
    setProfileMsg('')
    setProfileError('')
    setSavingProfile(true)
    try {
      const result = await authService.updateProfile({ avatar: avatar || null, bio: bio || null })
      if (result.user) login(result.user, localStorage.getItem('token') || '')
      setProfileMsg('个人资料已更新')
    } catch (e: any) {
      setProfileError(e.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordMsg('')
    setPasswordError('')
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('新密码长度至少为 6 个字符')
      return
    }
    setSavingPassword(true)
    try {
      await authService.changePassword(oldPassword, newPassword)
      setPasswordMsg('密码已更新')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: any) {
      setPasswordError(e.message)
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <button onClick={() => navigate('/dashboard')} className="text-purple-600 dark:text-purple-400 hover:underline flex items-center mb-6">
        <ArrowLeft size={16} className="mr-2" />返回后台
      </button>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">个人设置</h1>

      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User size={20} className="mr-2 text-purple-600" />个人资料
          </h2>

          {profileMsg && <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg text-sm">{profileMsg}</div>}
          {profileError && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">{profileError}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">用户名</label>
              <input type="text" value={user?.username || ''} disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮箱</label>
              <input type="email" value={user?.email || ''} disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">头像 URL</label>
              <input type="url" value={avatar} onChange={e => setAvatar(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/avatar.jpg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">个人简介</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="介绍一下自己..." />
            </div>
            <div className="flex justify-end">
              <button onClick={handleSaveProfile} disabled={savingProfile}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <Save size={16} className="mr-1" />{savingProfile ? '保存中...' : '保存资料'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Lock size={20} className="mr-2 text-purple-600" />修改密码
          </h2>

          {passwordMsg && <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg text-sm">{passwordMsg}</div>}
          {passwordError && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">{passwordError}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">当前密码</label>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">新密码</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">确认新密码</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="flex justify-end">
              <button onClick={handleChangePassword} disabled={savingPassword || !oldPassword || !newPassword || !confirmPassword}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <Lock size={16} className="mr-1" />{savingPassword ? '修改中...' : '修改密码'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
