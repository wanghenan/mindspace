import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '../store/chatStore'
import type { Conversation } from '../types'

interface ChatHistoryProps {
  isOpen: boolean
  onClose: () => void
  onSelectConversation: (conversation: Conversation) => void
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  isOpen,
  onClose,
  onSelectConversation
}) => {
  const conversations = useChatStore((state) => state.conversations)
  const deleteConversation = useChatStore((state) => state.deleteConversation)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleDelete = (conversationId: string) => {
    if (deleteConfirm === conversationId) {
      deleteConversation(conversationId)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(conversationId)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
  }

  const getPreview = (conversation: Conversation): string => {
    if (conversation.messages.length === 0) return '暂无消息'
    const firstUserMessage = conversation.messages.find(msg => msg.role === 'user')
    return firstUserMessage?.content.slice(0, 30) + '...' || '暂无消息'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '20rem', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full flex flex-col flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>对话历史</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full transition-all hover:opacity-80"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {conversations.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                <p>还没有对话记录</p>
                <p className="text-sm mt-2">开始第一次对话吧</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-lg p-4 transition-all cursor-pointer group hover:opacity-80"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <div
                    onClick={() => onSelectConversation(conversation)}
                    className="mb-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(conversation.startTime)}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                        {conversation.messages.length} 条消息
                      </span>
                    </div>
                    {conversation.emotionSummary && (
                      <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                        🏷️ {conversation.emotionSummary}
                      </div>
                    )}
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                      {getPreview(conversation)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(conversation.id)
                      }}
                      className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: deleteConfirm === conversation.id ? '#ef4444' : 'var(--bg-card)',
                        color: deleteConfirm === conversation.id ? '#ffffff' : '#ef4444'
                      }}
                    >
                      {deleteConfirm === conversation.id ? '确认删除?' : '删除'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const text = useChatStore.getState().exportConversation(conversation.id)
                        const blob = new Blob([text], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `mindspace-conversation-${new Date(conversation.startTime).toISOString().split('T')[0]}.txt`
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    >
                      导出
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="p-4">
            <button
              onClick={() => {
                if (confirm('确定要清空所有对话记录吗？此操作不可恢复。')) {
                  useChatStore.getState().clearAllConversations()
                }
              }}
              className="w-full py-3 rounded-lg text-sm font-medium transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              清空所有对话
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ChatHistory
