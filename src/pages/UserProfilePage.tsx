import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '../store/useUserStore'
import { useThemeStore } from '../store/themeStore'

// 可选头像列表
const AVATARS = ['👤', '😊', '🌸', '🌟', '💫', '🎀', '🧡', '💙', '💜', '🖤']

export default function UserProfilePage() {
  const { 
    user, 
    userStats, 
    isRegistered, 
    register, 
    updateProfile, 
    logout,
    initializeUser
  } = useUserStore()
  
  const { theme } = useThemeStore()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  
  // API Key 管理状态
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiKeyError, setApiKeyError] = useState('')
  const [apiKeyStatus, setApiKeyStatus] = useState<'loading' | 'configured' | 'not_set'>('loading')

  // 检查 API Key 状态
  useEffect(() => {
    const checkApiKey = () => {
      const envKey = import.meta.env.VITE_DASHSCOPE_API_KEY
      const storedKey = localStorage.getItem('mindspace_dashscope_api_key')
      if (envKey || storedKey) {
        setApiKeyStatus('configured')
      } else {
        setApiKeyStatus('not_set')
      }
    }
    checkApiKey()
  }, [])

  useEffect(() => {
    initializeUser()
    if (user) {
      setEditNickname(user.nickname)
      setEditEmail(user.email || '')
      setSelectedAvatar(user.avatar || '👤')
    }
  }, [user])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editNickname.trim()) {
      alert('请输入昵称')
      return
    }

    const success = await register({
      nickname: editNickname,
      email: editEmail
    })

    if (!success) {
      alert('注册失败，请重试')
    }
  }

  const handleSaveProfile = async () => {
    if (!editNickname.trim()) {
      alert('昵称不能为空')
      return
    }

    await updateProfile({
      nickname: editNickname,
      email: editEmail,
      avatar: selectedAvatar
    })
    
    setIsEditing(false)
    setShowAvatarPicker(false)
    alert('个人信息已更新')
  }

  const handleLogout = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      await logout()
      window.location.reload()
    }
  }

  // API Key 管理函数
  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      setApiKeyError('请输入 API Key')
      return
    }
    if (apiKey.length < 10) {
      setApiKeyError('API Key 格式不正确')
      return
    }
    localStorage.setItem('mindspace_dashscope_api_key', apiKey.trim())
    setShowApiKeyModal(false)
    setApiKeyError('')
    setApiKeyStatus('configured')
    alert('API Key 已保存')
  }

  const handleDeleteApiKey = () => {
    if (window.confirm('确定要删除 API Key 吗？删除后将无法使用对话功能。')) {
      localStorage.removeItem('mindspace_dashscope_api_key')
      setApiKeyStatus('not_set')
      setApiKey('')
      alert('API Key 已删除')
    }
  }

  const handleOpenApiKeyModal = () => {
    const storedKey = localStorage.getItem('mindspace_dashscope_api_key') || ''
    setApiKey(storedKey)
    setApiKeyError('')
    setShowApiKeyModal(true)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 未注册 - 显示注册表单
  if (!isRegistered) {
    return (
      <div className={`min-h-screen flex items-center justify-center py-8 px-4 ${theme === 'dark' ? 'dark' : ''}`} style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="w-full max-w-md">
          {/* 标题 */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-500">
              <span className="text-3xl text-white font-bold">M</span>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              欢迎使用 MindSpace
            </h1>
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
              开启你的情绪健康管理之旅
            </p>
          </motion.div>

          {/* 注册表单 */}
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleRegister}
            className="rounded-2xl shadow-lg p-6 space-y-4"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                昵称 *
              </label>
              <input
                type="text"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                placeholder="给自己起个名字吧"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ 
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                邮箱（可选）
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="用于接收重要通知"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ 
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              开始使用
            </button>
          </motion.form>

          {/* 重要提示 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-4 rounded-xl"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>
              ⚠️ 重要提示
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              为保护你的隐私，所有数据均存储在本地浏览器中。<br/>
              换浏览器、清除缓存或使用无痕模式将无法找回数据。<br/>
              建议定期在「隐私设置」页面导出备份。
            </p>
          </motion.div>

          {/* 隐私安全标识 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 p-3 rounded-lg text-center"
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
          >
            <p className="text-sm" style={{ color: 'var(--accent)' }}>
              🔒 数据本地存储 | 不上传云端
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // 已登录 - 显示用户资料
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-bold text-gray-800 dark:text-white mb-6"
        >
          我的
        </motion.h1>

        {/* 用户信息卡片 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            {/* 头像 */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-2xl">
                {user?.avatar || '👤'}
              </div>
              {isEditing && (
                <button
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full text-white text-xs"
                >
                  📷
                </button>
              )}
              
              {/* 头像选择器 */}
              {showAvatarPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-20 left-0 bg-white dark:bg-gray-700 rounded-xl shadow-lg p-3 grid grid-cols-5 gap-2 z-10"
                >
                  {AVATARS.map((avatar: string) => (
                    <button
                      key={avatar}
                      onClick={() => {
                        setSelectedAvatar(avatar)
                        setShowAvatarPicker(false)
                      }}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                        selectedAvatar === avatar 
                          ? 'bg-purple-100 dark:bg-purple-900' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* 名称 */}
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength={20}
                />
              ) : (
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {user?.nickname}
                </h2>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                加入于 {user ? formatDate(user.createdAt) : '-'}
              </p>
            </div>
          </div>

          {/* 邮箱 */}
          {isEditing ? (
            <div className="mb-4">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                邮箱
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="请输入邮箱"
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ) : (
            user?.email && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                📧 {user.email}
              </p>
            )
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setShowAvatarPicker(false)
                    setEditNickname(user?.nickname || '')
                    setEditEmail(user?.email || '')
                    setSelectedAvatar(user?.avatar || '👤')
                  }}
                  className="flex-1 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg font-medium hover:bg-purple-200 dark:hover:bg-purple-800"
              >
                编辑资料
              </button>
            )}
          </div>
        </motion.div>

        {/* 统计数据 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
            你的数据统计
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
              <div className="text-3xl font-bold text-purple-500">
                {userStats?.totalEmotions || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">情绪记录</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
              <div className="text-3xl font-bold text-blue-500">
                {userStats?.totalSOS || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">急救次数</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
              <div className="text-3xl font-bold text-green-500">
                {userStats?.streak || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">连续天数</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl">
              <div className="text-3xl font-bold text-orange-500">
                {userStats?.avgEffectiveness?.toFixed(1) || '0.0'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">平均效果</div>
            </div>
          </div>
        </motion.div>

        {/* API Key 管理 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl shadow-lg p-6 mb-6"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            AI 对话配置
          </h3>
          
          <div className="flex items-center justify-between p-4 rounded-xl mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${apiKeyStatus === 'configured' ? 'bg-green-500' : apiKeyStatus === 'loading' ? 'bg-gray-300' : 'bg-yellow-500'}`}></div>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {apiKeyStatus === 'configured' ? 'API Key 已配置' : apiKeyStatus === 'loading' ? '检查中...' : '未配置 API Key'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {apiKeyStatus === 'configured' ? '可正常使用对话功能' : '需要配置才能使用 AI 对话'}
                </p>
              </div>
            </div>
            <button
              onClick={handleOpenApiKeyModal}
              className="px-4 py-2 rounded-lg font-medium transition-all text-sm"
              style={{ 
                backgroundColor: 'var(--accent)',
                color: 'white'
              }}
            >
              {apiKeyStatus === 'configured' ? '更新' : '配置'}
            </button>
          </div>

          {apiKeyStatus === 'configured' && (
          <button
            onClick={handleDeleteApiKey}
            className="w-full py-2 rounded-lg font-medium transition-all text-sm"
            style={{ 
              border: '1px solid #EF4444',
              color: '#EF4444'
            }}
          >
            删除 API Key
          </button>
          )}
        </motion.div>

        {/* 退出登录 */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={handleLogout}
          className="w-full py-3 border border-red-200 dark:border-red-800 text-red-500 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          退出登录
        </motion.button>

        {/* 隐私说明 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 rounded-xl text-center"
          style={{ backgroundColor: 'var(--accent-light)' }}
        >
          <p className="text-sm" style={{ color: 'var(--accent)' }}>
            💙 数据存储在本地
          </p>
        </motion.div>

        {/* API Key 配置弹窗 */}
        <AnimatePresence>
          {showApiKeyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="rounded-2xl p-6 max-w-md w-full transition-colors"
                style={{ backgroundColor: 'var(--bg-card)' }}
              >
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-white font-bold">M</span>
                  </div>
                  <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    配置阿里百炼 API Key
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    用于启用 AI 对话功能
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      API Key
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value)
                        setApiKeyError('')
                      }}
                      placeholder="sk-..."
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: 'var(--bg-input)',
                        borderColor: apiKeyError ? '#EF4444' : 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveApiKey()}
                    />
                    {apiKeyError && (
                      <p className="text-sm mt-1" style={{ color: '#EF4444' }}>{apiKeyError}</p>
                    )}
                  </div>

                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>获取方式：</strong><br/>
                      1. 访问 <span style={{ color: 'var(--accent)' }}>bailian.console.aliyun.com</span><br/>
                      2. 创建应用并获取 API Key<br/>
                      3. 复制并粘贴到上方输入框
                    </p>
                  </div>

                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                    <p className="text-xs" style={{ color: 'var(--accent)' }}>
                      🔒 API Key 仅存储在本地浏览器中
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowApiKeyModal(false)}
                      className="flex-1 py-3 rounded-xl font-medium transition-all"
                      style={{ 
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSaveApiKey}
                      className="flex-1 py-3 text-white rounded-xl font-medium transition-all"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      保存
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
