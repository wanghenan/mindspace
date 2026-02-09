import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '../store/useUserStore'
import { useAppStore } from '../store/useAppStore'
import { useChatStore } from '../store/chatStore'
import { useThemeStore } from '../store/themeStore'

// 可选头像列表
const AVATARS = ['👤', '😊', '🌸', '🌟', '💫', '🎀', '🧡', '💙', '💜', '🖤']

export default function AccountPage() {
  const {
    user,
    userStats,
    isRegistered,
    register,
    updateProfile,
    logout,
    initializeUser
  } = useUserStore()

  const {
    storageStats,
    loadStorageStats,
    exportAllData,
    deleteAllData
  } = useAppStore()

  const conversations = useChatStore(state => state.conversations)
  const chatCount = conversations.length
  const { theme } = useThemeStore()

  // 个人信息编辑状态
  const [isEditing, setIsEditing] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  // 数据管理状态
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleteType, setDeleteType] = useState<'all' | 'emotions' | null>(null)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null)

  // API Key 管理状态
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiKeyError, setApiKeyError] = useState('')
  const [apiKeyStatus, setApiKeyStatus] = useState<'loading' | 'configured' | 'not_set'>('loading')
  const [isValidating, setIsValidating] = useState(false)

  // 初始化
  useEffect(() => {
    initializeUser()
    loadStorageStats()
    checkApiKey()
  }, [initializeUser, loadStorageStats])

  useEffect(() => {
    if (user) {
      setEditNickname(user.nickname)
      setEditEmail(user.email || '')
      setSelectedAvatar(user.avatar || '👤')
    }
  }, [user])

  const checkApiKey = () => {
    const envKey = import.meta.env.VITE_DASHSCOPE_API_KEY
    const storedKey = localStorage.getItem('mindspace_dashscope_api_key')
    if (envKey || storedKey) {
      setApiKeyStatus('configured')
    } else {
      setApiKeyStatus('not_set')
    }
  }

  const showNotificationFn = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  // 个人信息处理函数
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
      return
    }

    // 登录成功后，检查是否配置过 API Key
    const storedKey = localStorage.getItem('mindspace_dashscope_api_key')
    const envKey = import.meta.env.VITE_DASHSCOPE_API_KEY

    if (!storedKey && !envKey) {
      // 未配置 API Key，提示用户配置
      alert('登录成功！\n\n为使用 AI 对话功能，建议您先配置 API Key。\n点击「设置」卡片中的「配置」按钮即可。')
    } else {
      alert('登录成功！')
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

  // 数据管理处理函数
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await exportAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mindspace-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showNotificationFn('success', '数据导出成功')
    } catch (error) {
      showNotificationFn('error', '导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteType) return

    setIsDeleting(true)
    try {
      await deleteAllData()
      showNotificationFn('success', deleteType === 'all' ? '所有数据已删除' : '情绪记录已删除')
      setShowConfirm(false)
      setDeleteType(null)
    } catch (error) {
      showNotificationFn('error', '删除失败，请重试')
    } finally {
      setIsDeleting(false)
    }
  }

  // API Key 管理函数
  const validateApiKey = async (key: string): Promise<boolean> => {
    console.log('[API Key] 开始验证 Key...')
    setIsValidating(true)
    setApiKeyError('')

    try {
      const testUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key.trim()}`
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            { role: 'user', content: 'Hi' }
          ],
          max_tokens: 5,
          temperature: 0.1
        })
      })

      console.log('[API Key] 验证响应状态:', response.status)

      if (response.status === 401) {
        console.warn('[API Key] 验证失败: Key 无效 (401)')
        setApiKeyError('API Key 无效，请检查后重试')
        return false
      }

      if (!response.ok) {
        console.warn('[API Key] 验证失败: 服务器错误', response.status)
        setApiKeyError(`验证失败 (${response.status})，请稍后重试`)
        return false
      }

      console.log('[API Key] ✅ 验证成功')
      return true
    } catch (error) {
      console.error('[API Key] 验证异常:', error)
      setApiKeyError('验证失败，请检查网络连接')
      return false
    } finally {
      setIsValidating(false)
    }
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setApiKeyError('请输入 API Key')
      return
    }
    if (apiKey.length < 10) {
      setApiKeyError('API Key 格式不正确')
      return
    }

    const isValid = await validateApiKey(apiKey)
    if (!isValid) {
      return
    }

    localStorage.setItem('mindspace_dashscope_api_key', apiKey.trim())
    setShowApiKeyModal(false)
    setApiKeyError('')
    setApiKeyStatus('configured')
    alert('API Key 验证通过，已保存')
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
              建议定期在「账户」页面导出备份。
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

  // 已登录 - 显示账户页面
  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          账户
        </motion.h1>

        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg text-white z-50 ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        {/* 👤 个人资料卡片 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl shadow-lg p-6 mb-6"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            👤 个人资料
          </h3>

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
                  className="absolute top-20 left-0 rounded-xl shadow-lg p-3 grid grid-cols-5 gap-2 z-10"
                  style={{ backgroundColor: 'var(--bg-card)' }}
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
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  maxLength={20}
                />
              ) : (
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {user?.nickname}
                </h2>
              )}
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                加入于 {user ? formatDate(user.createdAt) : '-'}
              </p>
            </div>
          </div>

          {/* 邮箱 */}
          {isEditing ? (
            <div className="mb-4">
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                邮箱
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="请输入邮箱"
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          ) : (
            user?.email && (
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
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
                  className="flex-1 py-2 text-white rounded-lg font-medium transition-all"
                  style={{ backgroundColor: 'var(--accent)' }}
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
                  className="flex-1 py-2 rounded-lg font-medium transition-all"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2 rounded-lg font-medium transition-all"
                style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                编辑资料
              </button>
            )}
          </div>
        </motion.div>

        {/* 📊 我的数据卡片 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl shadow-lg p-6 mb-6"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            📊 我的数据
          </h3>

          {/* 使用统计 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
              使用统计
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                  {userStats?.totalEmotions || 0}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>情绪记录</div>
              </div>

              <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-2xl font-bold" style={{ color: '#3B82F6' }}>
                  {userStats?.totalSOS || 0}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>急救次数</div>
              </div>

              <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-2xl font-bold" style={{ color: '#10B981' }}>
                  {userStats?.streak || 0}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>连续天数</div>
              </div>

              <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-2xl font-bold" style={{ color: '#F59E0B' }}>
                  {userStats?.avgEffectiveness?.toFixed(1) || '0.0'}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>平均效果</div>
              </div>
            </div>
          </div>

          {/* 数据管理 */}
          <div>
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
              数据管理
            </h4>

            {storageStats ? (
              <div className="space-y-2 mb-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>情绪记录</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{storageStats.emotionCount} 条</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>对话历史</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{chatCount} 条</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>总存储空间</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{storageStats.storageSize}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>加载中...</p>
            )}

            <div className="space-y-2">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-2.5 text-white rounded-lg font-medium transition-all text-sm"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {isExporting ? '导出中...' : '📥 导出所有数据'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setDeleteType('emotions')
                    setShowConfirm(true)
                  }}
                  className="py-2.5 rounded-lg transition-all text-sm"
                  style={{
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)',
                    border: '1px solid'
                  }}
                >
                  删除情绪记录
                </button>

                <button
                  onClick={() => {
                    setDeleteType('all')
                    setShowConfirm(true)
                  }}
                  className="py-2.5 text-white rounded-lg font-medium transition-all text-sm"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  删除所有数据
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--accent-light)' }}>
            <p style={{ color: 'var(--accent)' }}>
              💡 数据存储在当前浏览器的本地存储空间中。请定期导出备份，以防数据丢失。
            </p>
          </div>
        </motion.div>

        {/* ⚙️ 设置卡片 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl shadow-lg p-6 mb-6"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            ⚙️ 设置
          </h3>

          {/* AI 对话配置 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
              AI 对话配置
            </h4>

            <div className="flex items-center justify-between p-3 rounded-xl mb-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${apiKeyStatus === 'configured' ? 'bg-green-500' : apiKeyStatus === 'loading' ? 'bg-gray-300' : 'bg-yellow-500'}`}></div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {apiKeyStatus === 'configured' ? 'API Key 已配置' : apiKeyStatus === 'loading' ? '检查中...' : '未配置 API Key'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {apiKeyStatus === 'configured' ? '可正常使用对话功能' : '需要配置才能使用 AI 对话'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleOpenApiKeyModal}
                className="px-3 py-1.5 rounded-lg font-medium transition-all text-sm"
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
          </div>

          {/* 退出登录 */}
          <button
            onClick={handleLogout}
            className="w-full py-2.5 border rounded-xl font-medium transition-all text-sm"
            style={{ borderColor: '#EF4444', color: '#EF4444' }}
          >
            🚪 退出登录
          </button>

          <div className="mt-4 p-3 rounded-lg text-center" style={{ backgroundColor: 'var(--accent-light)' }}>
            <p className="text-sm" style={{ color: 'var(--accent)' }}>
              💙 数据存储在本地
            </p>
          </div>
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
                className="rounded-2xl p-6 max-w-md w-full"
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
                      disabled={isValidating}
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSaveApiKey}
                      className="flex-1 py-3 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: isValidating ? 'var(--text-tertiary)' : 'var(--accent)',
                        cursor: isValidating ? 'not-allowed' : 'pointer'
                      }}
                      disabled={isValidating}
                    >
                      {isValidating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          验证中...
                        </>
                      ) : (
                        '保存'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 删除确认弹窗 */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="rounded-xl p-6 max-w-sm w-full" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                确认删除
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                {deleteType === 'all'
                  ? '确定要删除所有数据吗？此操作无法撤销。'
                  : '确定要删除所有情绪记录吗？此操作无法撤销。'}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowConfirm(false)
                    setDeleteType(null)
                  }}
                  className="flex-1 py-2 rounded-lg transition-all"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                    border: '1px solid'
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 text-white rounded-lg transition-all"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  {isDeleting ? '删除中...' : '确认删除'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
