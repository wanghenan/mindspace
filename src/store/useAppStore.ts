import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  emotionStorage,
  chatStorage,
  preferencesStorage,
  privacyService,
  initializeStorage,
  DEFAULT_PREFERENCES
} from '../services/storageService';
import type {
  EmotionRecord,
  ChatSession,
  UserPreferences,
  StorageMetadata
} from '../types/storage';

interface AppState {
  // 状态
  emotionHistory: EmotionRecord[];
  chatHistory: ChatSession[];
  currentChat: ChatSession | null;
  preferences: UserPreferences;
  isLoading: boolean;
  storageStats: {
    emotionCount: number;
    chatCount: number;
    storageSize: string;
  } | null;

  // Actions - 初始化
  initializeApp: () => Promise<void>;

  // Actions - 情绪历史
  addEmotionRecord: (record: Omit<EmotionRecord, 'id' | 'timestamp'>) => Promise<EmotionRecord>;
  updateEmotionRecord: (id: string, updates: Partial<Omit<EmotionRecord, 'id' | 'timestamp'>>) => Promise<EmotionRecord | null>;
  deleteEmotionRecord: (id: string) => Promise<boolean>;
  getRecentEmotions: (limit: number) => Promise<EmotionRecord[]>;

  // Actions - 对话历史
  createChatSession: (messages?: ChatSession['messages']) => Promise<ChatSession>;
  updateChatSession: (id: string, updates: Partial<ChatSession>) => Promise<ChatSession | null>;
  loadChatSession: (id: string) => Promise<ChatSession | null>;
  deleteChatSession: (id: string) => Promise<boolean>;
  cleanupExpiredChats: () => Promise<void>;

  // Actions - 用户偏好
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;

  // Actions - 隐私功能
  exportAllData: () => Promise<{
    version: string;
    exportDate: string;
    emotions: EmotionRecord[];
    chats: ChatSession[];
    preferences: UserPreferences;
    metadata: StorageMetadata;
  }>;
  deleteAllData: () => Promise<void>;
  loadStorageStats: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // 初始状态
    emotionHistory: [],
    chatHistory: [],
    currentChat: null,
    preferences: DEFAULT_PREFERENCES,
    isLoading: true,
    storageStats: null,

    // 初始化
    initializeApp: async () => {
      try {
        // 初始化存储
        await initializeStorage();

        // 并行加载数据
        const [emotions, chats, preferences] = await Promise.all([
          emotionStorage.getAll(),
          chatStorage.getAll(),
          preferencesStorage.get()
        ]);

        set({
          emotionHistory: emotions.sort((a, b) => b.timestamp - a.timestamp),
          chatHistory: chats.sort((a, b) => b.updatedAt - a.updatedAt),
          preferences,
          isLoading: false
        });

        // 加载存储统计
        await get().loadStorageStats();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        set({ isLoading: false });
      }
    },

    // 情绪历史
    addEmotionRecord: async (record) => {
      const newRecord = await emotionStorage.add(record)
      
      set(state => ({
        emotionHistory: [newRecord, ...state.emotionHistory]
      }))

      // 更新存储统计
      await get().loadStorageStats()
      
      return newRecord
    },

    updateEmotionRecord: async (id: string, updates: Record<string, unknown>) => {
      const updated = await emotionStorage.update(id, updates)
      
      if (updated) {
        set(state => ({
          emotionHistory: state.emotionHistory.map(r =>
            r.id === id ? updated : r
          )
        }))
        await get().loadStorageStats()
      }
      
      return updated
    },

    deleteEmotionRecord: async (id: string) => {
      const success = await emotionStorage.delete(id)
      
      if (success) {
        set(state => ({
          emotionHistory: state.emotionHistory.filter(r => r.id !== id)
        }))
        await get().loadStorageStats()
      }
      
      return success
    },

    getRecentEmotions: async (limit: number) => {
      return await emotionStorage.getRecent(limit)
    },

    // 对话历史
    createChatSession: async (messages = []) => {
      const session = await chatStorage.add({ messages });
      
      set(state => ({
        chatHistory: [session, ...state.chatHistory],
        currentChat: session
      }));

      return session;
    },

    updateChatSession: async (id, updates) => {
      const updated = await chatStorage.update(id, updates);
      
      if (updated) {
        set(state => ({
          chatHistory: state.chatHistory.map(s =>
            s.id === id ? updated : s
          ),
          currentChat: state.currentChat?.id === id ? updated : state.currentChat
        }));
      }

      return updated;
    },

    loadChatSession: async (id) => {
      const session = await chatStorage.getById(id);
      if (session) {
        set({ currentChat: session });
      }
      return session;
    },

    deleteChatSession: async (id) => {
      const success = await chatStorage.delete(id);
      
      if (success) {
        set(state => ({
          chatHistory: state.chatHistory.filter(s => s.id !== id),
          currentChat: state.currentChat?.id === id ? null : state.currentChat
        }));
        await get().loadStorageStats();
      }

      return success;
    },

    cleanupExpiredChats: async () => {
      await chatStorage.cleanupExpired();
      
      const chats = await chatStorage.getAll();
      set({
        chatHistory: chats.sort((a, b) => b.updatedAt - a.updatedAt)
      });
      
      await get().loadStorageStats();
    },

    // 用户偏好
    updatePreferences: async (updates) => {
      const newPreferences = await preferencesStorage.update(updates);
      set({ preferences: newPreferences });
    },

    resetPreferences: async () => {
      const defaultPrefs = await preferencesStorage.reset();
      set({ preferences: defaultPrefs });
    },

    // 隐私功能
    exportAllData: async () => {
      return await privacyService.exportAllData();
    },

    deleteAllData: async () => {
      await privacyService.deleteAllData();
      
      set({
        emotionHistory: [],
        chatHistory: [],
        currentChat: null,
        preferences: DEFAULT_PREFERENCES,
        storageStats: {
          emotionCount: 0,
          chatCount: 0,
          storageSize: '0 KB'
        }
      });
    },

    loadStorageStats: async () => {
      const stats = await privacyService.getStorageStats();
      set({
        storageStats: {
          emotionCount: stats.emotionCount,
          chatCount: stats.chatCount,
          storageSize: stats.storageSize
        }
      });
    }
  }))
);
