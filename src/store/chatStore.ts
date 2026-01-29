import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Message, Conversation } from '../types'

interface ChatStore {
  // 状态
  conversations: Conversation[]
  currentConversationId: string | null
  isTyping: boolean
  
  // 操作
  createConversation: (emotionContext?: string) => string
  getCurrentConversation: () => Conversation | null
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  updateMessage: (messageId: string, content: string) => void
  deleteConversation: (conversationId: string) => void
  clearAllConversations: () => void
  setTyping: (isTyping: boolean) => void
  
  // 辅助方法
  getConversationMessages: (conversationId: string) => Message[]
  exportConversation: (conversationId: string) => string
}

export const useChatStore = create<ChatStore>()(
  persist<ChatStore>(
    (set, get) => ({
      // 初始状态
      conversations: [],
      currentConversationId: null,
      isTyping: false,
      
      // 创建新对话
      createConversation: (emotionContext?: string) => {
        const newConversation: Conversation = {
          id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          messages: [],
          startTime: Date.now(),
          emotionSummary: emotionContext
        }
        
        set({
          conversations: [newConversation, ...(get().conversations || [])],
          currentConversationId: newConversation.id
        })
        
        return newConversation.id
      },
      
      // 获取当前对话
      getCurrentConversation: () => {
        const state = get()
        const conversations = state.conversations || []
        const currentConversationId = state.currentConversationId
        return conversations.find(conv => conv.id === currentConversationId) || null
      },
      
      // 添加消息
      addMessage: (message) => {
        const state = get()
        const { currentConversationId } = state
        if (!currentConversationId) return
        
        const newMessage: Message = {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        }
        
        set({
          conversations: (state.conversations || []).map(conv =>
            conv.id === currentConversationId
              ? { ...conv, messages: [...conv.messages, newMessage] }
              : conv
          )
        })
      },
      
      // 更新消息（用于AI流式回复）
      updateMessage: (messageId, content) => {
        const { currentConversationId } = get()
        if (!currentConversationId) return
        
        set({
          conversations: (get().conversations || []).map(conv =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === messageId ? { ...msg, content } : msg
                  )
                }
              : conv
          )
        })
      },
      
      // 删除对话
      deleteConversation: (conversationId) => {
        const currentState = get()
        set({
          conversations: (currentState.conversations || []).filter(conv => conv.id !== conversationId),
          currentConversationId: 
            currentState.currentConversationId === conversationId 
              ? null 
              : currentState.currentConversationId,
          isTyping: currentState.isTyping
        })
      },
      
      // 清空所有对话
      clearAllConversations: () => {
        set({
          conversations: [],
          currentConversationId: null,
          isTyping: false
        })
      },
      
      // 设置打字状态
      setTyping: (isTyping) => {
        set({ isTyping })
      },
      
      // 获取对话消息
      getConversationMessages: (conversationId) => {
        const { conversations } = get()
        const conversation = conversations?.find(conv => conv.id === conversationId)
        return conversation?.messages || []
      },
      
      // 导出对话为文本
      exportConversation: (conversationId) => {
        const { conversations } = get()
        const conversation = conversations?.find(conv => conv.id === conversationId)
        if (!conversation) return ''
        
        let text = `MindSpace 对话记录\n`
        text += `开始时间: ${new Date(conversation.startTime).toLocaleString()}\n`
        if (conversation.emotionSummary) {
          text += `情绪背景: ${conversation.emotionSummary}\n`
        }
        text += `\n${'='.repeat(50)}\n\n`
        
        conversation.messages.forEach(msg => {
          const sender = msg.role === 'user' ? '你' : 'MindSpace'
          const time = new Date(msg.timestamp).toLocaleTimeString()
          text += `[${time}] ${sender}:\n${msg.content}\n\n`
        })
        
        return text
      }
    }),
    {
      name: 'mindspace-chat-storage',
      storage: createJSONStorage(() => localStorage),
      // 只持久化必要的数据
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        isTyping: state.isTyping,
        createConversation: state.createConversation,
        getCurrentConversation: state.getCurrentConversation,
        addMessage: state.addMessage,
        updateMessage: state.updateMessage,
        deleteConversation: state.deleteConversation,
        clearAllConversations: state.clearAllConversations,
        setTyping: state.setTyping,
        getConversationMessages: state.getConversationMessages,
        exportConversation: state.exportConversation
      })
    }
  )
)

// 选择器hooks，优化性能
export const useCurrentConversation = () => 
  useChatStore((state) => state.getCurrentConversation())

export const useConversations = () => 
  useChatStore((state) => state.conversations)

export const useIsTyping = () => 
  useChatStore((state) => state.isTyping)