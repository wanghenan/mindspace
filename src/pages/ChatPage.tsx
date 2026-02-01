import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendChatMessage } from '../services/enhancedChatService'
import { useChatStore } from '../store/chatStore'
import { ChatHistory } from '../components/ChatHistory'
import { useThemeStore } from '../store/themeStore'
import type { Conversation } from '../types'

const ChatPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiKeyError, setApiKeyError] = useState('')
  const { theme, toggleTheme } = useThemeStore()

  const currentConversation = useChatStore((state) => state.getCurrentConversation())
  const isTyping = useChatStore((state) => state.isTyping)

  const createConversation = useChatStore((state) => state.createConversation)
  const addMessage = useChatStore((state) => state.addMessage)
  const updateMessage = useChatStore((state) => state.updateMessage)
  const setTyping = useChatStore((state) => state.setTyping)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // 检查是否需要显示 API Key 配置
  useEffect(() => {
    const storedKey = localStorage.getItem('mindspace_dashscope_api_key')
    const envKey = import.meta.env.VITE_DASHSCOPE_API_KEY
    if (!storedKey && !envKey) {
      setShowApiKeyModal(true)
    }
    if (storedKey) {
      setApiKey(storedKey)
    }
  }, [])

  useEffect(() => {
    if (!currentConversation) {
      createConversation()
    }
  }, [currentConversation, createConversation])

  const messages = currentConversation?.messages || []
  const hasMessages = messages.length > 0

  useEffect(() => {
    if (!hasMessages && inputRef.current) {
      inputRef.current.focus()
      const length = inputRef.current.value.length
      inputRef.current.setSelectionRange(length, length)
    }
  }, [hasMessages])

  useEffect(() => {
    if (hasMessages && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages, hasMessages])

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
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    // 发送前检查 API Key
    const envKey = import.meta.env.VITE_DASHSCOPE_API_KEY
    const localKey = localStorage.getItem('mindspace_dashscope_api_key')
    
    if (!envKey && !localKey) {
      console.log('[ChatPage] 没有配置 API Key，显示配置弹窗')
      setShowApiKeyModal(true)
      return
    }

    const userMessage = {
      role: 'user' as const,
      content: inputValue.trim()
    }

    addMessage(userMessage)
    const userContent = inputValue.trim()
    setInputValue('')
    setTyping(true)

    try {
      const historyMessages = currentConversation?.messages || []

      const aiMessage = {
        role: 'assistant' as const,
        content: ''
      }

      const aiMessageId = addMessage(aiMessage)

      const response = await sendChatMessage(
        historyMessages,
        userContent,
        (chunk) => {
          updateMessage(aiMessageId, chunk)
        }
      )

      updateMessage(aiMessageId, response.content)
      setTyping(false)

      if (response.needsSOS) {
        setTimeout(() => {
          const sosMessage = {
            role: 'assistant' as const,
            content: '💡 提示：如果你现在感到很难受，可以点击右下角的红色SOS按钮，我们有专门的60秒急救练习。'
          }
          addMessage(sosMessage)
        }, 2000)
      }

      if (response.crisis && !response.needsSOS) {
        setTimeout(() => {
          const crisisMessage = {
            role: 'assistant' as const,
            content: '你想聊聊发生了什么吗？或者我们直接开始做一些缓解练习？'
          }
          addMessage(crisisMessage)
        }, 3000)
      }

    } catch (error: any) {
      console.error('发送消息失败:', error)
      
      const errorMessage = {
        role: 'assistant' as const,
        content: '抱歉，我现在有点忙不过来。🌙\n\n不过我还是在这里陪着你，你可以继续和我说话。'
      }
      addMessage(errorMessage)
      setTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    useChatStore.setState({ currentConversationId: conversation.id })
    setIsHistoryOpen(false)
  }

  const handleEndConversation = () => {
    createConversation()
    setInputValue('')
  }

  return (
    <div className="flex h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Chat History Sidebar */}
      <ChatHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectConversation={handleSelectConversation}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-6 py-6 z-10" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 hover:opacity-80 rounded-full transition-all"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" />
            </svg>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 hover:opacity-80 rounded-full transition-all"
            style={{ color: 'var(--text-secondary)' }}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area - Slides Right When Sidebar Opens */}
      <motion.div
        initial={false}
        animate={{
          marginLeft: isHistoryOpen ? '20rem' : '0rem'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="flex-1 flex flex-col h-full overflow-hidden"
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      >
        {/* Messages Area */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6">
          <div className="max-w-2xl mx-auto pt-20 pb-4">
            {!hasMessages ? (
              // Empty State - Centered Input at Top
              <div className="min-h-[60vh] flex items-start justify-center pt-8">
                <div className="w-full">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="这一刻，你在想什么..."
                    className="w-full px-0 py-4 resize-none focus:outline-none transition-all text-lg placeholder:text-neutral-300 bg-transparent text-left"
                    rows={1}
                    style={{
                      minHeight: '56px',
                      maxHeight: '160px',
                      color: 'var(--text-primary)',
                      caretColor: 'var(--text-primary)'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = Math.min(Math.max(target.scrollHeight, 56), 160) + 'px'
                    }}
                  />
                  <AnimatePresence>
                    {inputValue.trim() && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-start mt-4"
                      >
                        <motion.button
                          onClick={handleSendMessage}
                          disabled={isTyping}
                          className="px-6 py-2 font-medium transition-all rounded-2xl"
                          style={{
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            backgroundColor: 'transparent'
                          }}
                          whileHover={{ scale: 1.02, backgroundColor: 'var(--bg-secondary)' }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isTyping ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-tertiary)', opacity: 0.75 }}></div>
                              <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-tertiary)', opacity: 0.75, animationDelay: '0.1s' }}></div>
                              <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-tertiary)', opacity: 0.75, animationDelay: '0.2s' }}></div>
                            </div>
                          ) : (
                            '发送'
                          )}
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              // Messages List
              <div className="space-y-3">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex justify-start"
                    >
                      {message.role === 'assistant' ? (
                        <div className="flex items-start gap-3 max-w-[80%]">
                          <div className="w-1 h-full rounded-full" style={{ backgroundColor: 'var(--accent)' }}></div>
                          <div style={{ color: 'var(--accent)' }}>
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-primary)' }}>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area at Bottom (Only When Has Messages) */}
        {hasMessages && (
          <div className="px-6 pb-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col items-start">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="写在这..."
                  className="w-full px-0 py-3 resize-none focus:outline-none transition-all text-lg placeholder:text-neutral-300 bg-transparent text-left"
                  rows={1}
                  style={{
                    minHeight: '48px',
                    maxHeight: '120px',
                    color: 'var(--text-primary)',
                    caretColor: 'var(--text-primary)'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = Math.min(Math.max(target.scrollHeight, 48), 120) + 'px'
                  }}
                />
                <div className="flex items-center gap-3 mt-3">
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={isTyping || !inputValue.trim()}
                    className="px-6 py-2 font-medium transition-all rounded-2xl"
                    style={{
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'transparent',
                      opacity: inputValue.trim() ? 1 : 0.5
                    }}
                    whileHover={inputValue.trim() ? { scale: 1.02, backgroundColor: 'var(--bg-secondary)' } : {}}
                    whileTap={inputValue.trim() ? { scale: 0.98 } : {}}
                  >
                    {isTyping ? (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-tertiary)', opacity: 0.75 }}></div>
                        <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-tertiary)', opacity: 0.75, animationDelay: '0.1s' }}></div>
                        <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-tertiary)', opacity: 0.75, animationDelay: '0.2s' }}></div>
                      </div>
                    ) : (
                      '发送'
                    )}
                  </motion.button>
                  <motion.button
                    onClick={handleEndConversation}
                    className="px-6 py-2 font-medium transition-all rounded-2xl"
                    style={{
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'transparent'
                    }}
                    whileHover={{ scale: 1.02, backgroundColor: 'var(--bg-secondary)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    结束
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* API Key 配置弹窗 */}
      <AnimatePresence>
        {showApiKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowApiKeyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl p-6 max-w-md w-full transition-colors relative"
              style={{ backgroundColor: 'var(--bg-card)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white font-bold">M</span>
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  配置 API Key
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  为了使用对话功能，请配置你的阿里百炼 API Key
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    阿里百炼 API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value)
                      setApiKeyError('')
                    }}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500"
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

                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-light)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--accent)' }}>如何获取 API Key：</strong><br/>
                    1. 访问 <span style={{ color: 'var(--accent)' }}>https://bailian.console.aliyun.com</span><br/>
                    2. 创建应用并获取 API Key<br/>
                    3. 复制 Key 并粘贴到上方输入框
                  </p>
                </div>

                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                  <p className="text-xs" style={{ color: 'var(--accent)' }}>
                    🔒 你的 API Key 仅存储在本地浏览器中，不会上传到任何服务器
                  </p>
                </div>

                <button
                  onClick={handleSaveApiKey}
                  className="w-full py-3 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  保存并开始对话
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChatPage
