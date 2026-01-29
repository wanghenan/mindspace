import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { sendChatMessage } from '../services/enhancedChatService'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  isTyping?: boolean
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '你好，我是MindSpace 🌿\n\n我在这里陪伴你，倾听你的感受。无论发生了什么，这里都是安全的空间。',
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // 获取当前对话的消息历史
      const historyMessages = messages
        .map(msg => ({
          id: msg.id,
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content,
          timestamp: msg.timestamp.getTime()
        }))

      // 调用AI服务
      const response = await sendChatMessage(historyMessages, userMessage.content)

      // 添加AI回复
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        sender: 'ai',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])

      // 如果需要SOS，显示提示
      if (response.needsSOS) {
        setTimeout(() => {
          const sosMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: '💡 提示：如果你现在感到很难受，可以点击右下角的红色SOS按钮，我们有专门的60秒急救练习。',
            sender: 'ai',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, sosMessage])
        }, 2000)
      }

      // 如果是危机情况，显示后续消息
      if (response.crisis && !response.needsSOS) {
        setTimeout(() => {
          const crisisMessage: Message = {
            id: (Date.now() + 3).toString(),
            content: '你想聊聊发生了什么吗？或者我们直接开始做一些缓解练习？',
            sender: 'ai',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, crisisMessage])
        }, 3000)
      }

    } catch (error) {
      console.error('发送消息失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，我现在有点忙不过来。🌙\n\n不过我还是在这里陪着你，你可以继续和我说话。',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Minimal Header - Only Logo */}
      <div className="absolute top-0 left-0 right-0 px-6 py-6 z-10">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">M</span>
          </div>
        </div>
      </div>

      {/* Messages - Centered and Spacious */}
      <div className="flex-1 overflow-y-auto px-6 py-20 space-y-8">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-sm lg:max-w-lg px-6 py-5 rounded-3xl ${
                message.sender === 'user'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-50 text-neutral-800'
              }`}>
                <div className="whitespace-pre-wrap text-base leading-relaxed font-normal">
                  {message.content}
                </div>
                <div className={`text-xs mt-3 ${
                  message.sender === 'user' ? 'text-neutral-400' : 'text-neutral-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Minimal Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-neutral-50 text-neutral-800 px-6 py-5 rounded-3xl">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Immersive Input Area */}
      <div className="px-6 py-8 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-xl mx-auto">
          <div className="flex items-end gap-4">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="这一刻，你在想什么..."
                className="w-full px-6 py-5 border-0 bg-neutral-50 rounded-3xl resize-none focus:outline-none focus:ring-2 focus:ring-neutral-200 transition-all text-base max-h-40 placeholder:text-neutral-400"
                rows={1}
                style={{
                  minHeight: '56px',
                  height: 'auto'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 160) + 'px'
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`px-6 py-5 rounded-2xl font-medium transition-all ${
                inputValue.trim() && !isLoading
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              }`}
            >
              发送
            </button>
          </div>
        </div>
      </div>

      {/* Minimal SOS Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        onClick={() => navigate('/sos/emotion')}
        className="fixed bottom-8 right-8 w-12 h-12 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors flex items-center justify-center font-bold text-xs z-50"
        whileTap={{ scale: 0.95 }}
      >
        SOS
      </motion.button>
    </div>
  )
}

export default ChatPage