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
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">对话历史</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {conversations.length === 0 ? (
              <div className="text-center text-neutral-500 py-8">
                <p>还没有对话记录</p>
                <p className="text-sm mt-2">开始第一次对话吧</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-neutral-50 rounded-lg p-4 hover:bg-neutral-100 transition-colors cursor-pointer group"
                >
                  <div
                    onClick={() => onSelectConversation(conversation)}
                    className="mb-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-600">
                        {formatDate(conversation.startTime)}
                      </span>
                      <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">
                        {conversation.messages.length} 条消息
                      </span>
                    </div>
                    {conversation.emotionSummary && (
                      <div className="text-xs text-primary-600 mb-1">
                        🏷️ {conversation.emotionSummary}
                      </div>
                    )}
                    <p className="text-sm text-neutral-700 line-clamp-2">
                      {getPreview(conversation)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(conversation.id)
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        deleteConfirm === conversation.id
                          ? 'bg-red-500 text-white'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      {deleteConfirm === conversation.id ? '确认删除?' : '删除'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // 导出功能
                        const text = useChatStore.getState().exportConversation(conversation.id)
                        const blob = new Blob([text], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `mindspace-conversation-${new Date(conversation.startTime).toISOString().split('T')[0]}.txt`
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="flex-1 py-2 px-3 bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-300 transition-colors"
                    >
                      导出
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 p-4">
            <button
              onClick={() => {
                if (confirm('确定要清空所有对话记录吗？此操作不可恢复。')) {
                  useChatStore.getState().clearAllConversations()
                }
              }}
              className="w-full py-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
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