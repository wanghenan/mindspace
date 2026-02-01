# MindSpace 数据持久化方案

## TL;DR

> **快速摘要**：为 MindSpace 添加数据持久化功能，实现情绪记录永久存储（带隐私保护）、对话历史 30 天自动清理、用户偏好设置存储，同时提供数据导出和删除功能。
> 
> **交付物**：
> - 持久化存储服务（IndexedDB + localStorage）
> - 增强版 Zustand Store
> - 隐私设置页面（导出/删除功能）
> - 情绪历史记录功能
> 
> **技术栈**：Zustand + idb-keyval + IndexedDB
> **费用**：完全免费，无 API 要求

---

## 背景

### 原始需求
用户要求为 MindSpace 项目添加数据持久化功能，解决当前无本地存储机制的问题。

### 关键决策
- **对话历史保留期限**：30 天（自动清理过期数据）
- **情绪记录保留期限**：永久保留（需隐私保护）
- **隐私功能要求**：数据导出 + 数据删除
- **周报功能**：暂不开发

---

## 工作目标

### 核心目标
1. 实现情绪历史记录的永久存储（IndexedDB）
2. 实现对话历史的 30 天自动清理机制
3. 实现用户偏好设置的持久化
4. 提供数据导出功能（JSON 格式）
5. 提供数据删除功能（GDPR 合规）
6. 确保用户隐私数据安全

### 非目标
- 多设备同步（当前仅支持单浏览器）
- 周报/月报分析功能
- 云端存储
- 高级加密（AES 等）

---

## 技术方案

### 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    MindSpace 数据架构                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │               Zustand Store (状态管理)                │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │  emotionHistory: EmotionRecord[]            │   │   │
│   │   │  preferences: UserPreferences               │   │   │
│   │   │  chatHistory: ChatSession[]                 │   │   │
│   │   │  isLoading: boolean                         │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   └──────────────────────┬──────────────────────────────┘   │
│                          │                                    │
│                          │ 同步                              │
│                          ▼                                    │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              持久化存储服务 (StorageService)          │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │  IndexedDB (情绪记录、对话历史)               │   │   │
│   │   │  - 情绪记录：永久保留                         │   │   │
│   │   │  - 对话历史：30天自动清理                     │   │   │
│   │   │  - 周报数据：暂不实现                         │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │  localStorage (用户偏好)                     │   │   │
│   │   │  - 主题、语言、通知设置等                     │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   └──────────────────────┬──────────────────────────────┘   │
│                          │                                    │
│                          ▼                                    │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    用户界面                          │   │
│   │   - 情绪历史展示                                    │   │
│   │   - 隐私设置页面（导出/删除）                        │   │
│   │   - 对话历史展示                                    │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 技术选型

| 组件 | 用途 | 费用 | 备注 |
|------|------|------|------|
| **Zustand** | 状态管理 | 免费 | React 生态首选 |
| **idb-keyval** | IndexedDB 封装 | 免费 | 极简 API，200 行代码 |
| **IndexedDB** | 浏览器内置数据库 | 免费 | 大容量存储 |
| **localStorage** | 浏览器内置存储 | 免费 | 小型配置数据 |

### 数据存储策略

#### 1. IndexedDB 存储（情绪记录、对话历史）

| 数据表 | 键名 | 保留策略 | 预计大小 |
|--------|------|---------|---------|
| 情绪历史 | `mindspace_emotions` | 永久保留 | < 100KB/年 |
| 对话历史 | `mindspace_chats` | 30 天自动清理 | < 50KB |
| 元数据 | `mindspace_metadata` | 永久保留 | < 1KB |

#### 2. localStorage 存储（用户偏好）

| 键名 | 数据类型 | 用途 |
|------|---------|------|
| `mindspace_preferences` | UserPreferences | 用户设置 |

---

## 实施步骤

### 阶段 1：基础设施搭建

#### 1.1 安装依赖

- [ ] 1.1.1 安装 zustand
  ```bash
  cd mindspace
  npm install zustand
  ```

- [ ] 1.1.2 安装 idb-keyval
  ```bash
  cd mindspace
  npm install idb-keyval
  ```

- [ ] 1.1.3 安装 uuid（用于生成唯一 ID）
  ```bash
  cd mindspace
  npm install uuid
  ```

- [ ] 1.1.4 安装 @types/uuid
  ```bash
  cd mindspace
  npm install -D @types/uuid
  ```

#### 1.2 创建类型定义

- [ ] 1.2.1 创建 `src/types/storage.ts`
  ```typescript
  // 情绪记录类型
  export interface EmotionRecord {
    id: string;
    emotion: string;           // 情绪类型：焦虑、悲伤、愤怒、平静、疲惫等
    intensity: number;         // 强度：1-10
    trigger?: string;          // 触发因素
    context?: string;          // 详细描述
    copingMethod?: string;     // 应对方法
    effectiveness?: number;    // 效果评价：1-5
    timestamp: number;         // 时间戳
    tags?: string[];           // 自动生成的情绪标签
  }

  // SOS 使用记录
  export interface SOSRecord {
    id: string;
    triggerEmotion: string;    // 触发情绪
    selectedAidType: string;   // 急救类型
    duration: number;          // 使用时长（秒）
    feedback?: number;         // 效果反馈：1-5
    followUpAction?: string;   // 后续行动
    timestamp: number;
  }

  // 对话消息
  export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }

  // 对话会话
  export interface ChatSession {
    id: string;
    messages: ChatMessage[];
    autoTags?: {
      primaryEmotion: string;
      intensity: number;
      topics: string[];
    };
    summary?: string;
    createdAt: number;
    updatedAt: number;
  }

  // 用户偏好
  export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
    privacyMode: boolean;      // 隐私模式开关
    defaultView: 'home' | 'sos' | 'chat' | 'insight';
    aiPersonality: 'empathetic' | 'rational' | 'concise';
    autoSave: boolean;
  }

  // 存储元数据
  export interface StorageMetadata {
    version: string;
    createdAt: number;
    lastUpdated: number;
    emotionCount: number;
    chatCount: number;
    firstUseDate: number;
  }
  ```

#### 1.3 创建持久化存储服务

- [ ] 1.3.1 创建 `src/services/storageService.ts`
  ```typescript
  import { get, set, del, clear, keys } from 'idb-keyval';
  import { v4 as uuidv4 } from 'uuid';
  import type {
    EmotionRecord,
    SOSRecord,
    ChatSession,
    UserPreferences,
    StorageMetadata
  } from '../types/storage';

  // 存储键名定义
  const STORAGE_KEYS = {
    EMOTIONS: 'mindspace_emotions',
    SOS_RECORDS: 'mindspace_sos_records',
    CHATS: 'mindspace_chats',
    PREFERENCES: 'mindspace_preferences',
    METADATA: 'mindspace_metadata'
  } as const;

  // 默认配置
  export const DEFAULT_PREFERENCES: UserPreferences = {
    theme: 'light',
    language: 'zh-CN',
    notifications: true,
    privacyMode: false,
    defaultView: 'home',
    aiPersonality: 'empathetic',
    autoSave: true
  };

  // ============ 情绪历史操作 ============

  export const emotionStorage = {
    async getAll(): Promise<EmotionRecord[]> {
      return (await get<EmotionRecord[]>(STORAGE_KEYS.EMOTIONS)) || [];
    },

    async add(record: Omit<EmotionRecord, 'id' | 'timestamp'>): Promise<EmotionRecord> {
      const newRecord: EmotionRecord = {
        ...record,
        id: uuidv4(),
        timestamp: Date.now()
      };
      
      const all = await this.getAll();
      const updated = [...all, newRecord];
      await set(STORAGE_KEYS.EMOTIONS, updated);
      
      // 更新元数据
      await updateMetadata({ emotionCount: updated.length });
      
      return newRecord;
    },

    async delete(id: string): Promise<boolean> {
      const all = await this.getAll();
      const filtered = all.filter(r => r.id !== id);
      
      if (filtered.length === all.length) return false;
      
      await set(STORAGE_KEYS.EMOTIONS, filtered);
      await updateMetadata({ emotionCount: filtered.length });
      return true;
    },

    async getByDateRange(startDate: number, endDate: number): Promise<EmotionRecord[]> {
      const all = await this.getAll();
      return all.filter(r => r.timestamp >= startDate && r.timestamp <= endDate);
    },

    async getRecent(limit: number): Promise<EmotionRecord[]> {
      const all = await this.getAll();
      return all
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    },

    async clear(): Promise<void> {
      await del(STORAGE_KEYS.EMOTIONS);
      await updateMetadata({ emotionCount: 0 });
    }
  };

  // ============ SOS 记录操作 ============

  export const sosStorage = {
    async getAll(): Promise<SOSRecord[]> {
      return (await get<SOSRecord[]>(STORAGE_KEYS.SOS_RECORDS)) || [];
    },

    async add(record: Omit<SOSRecord, 'id' | 'timestamp'>): Promise<SOSRecord> {
      const newRecord: SOSRecord = {
        ...record,
        id: uuidv4(),
        timestamp: Date.now()
      };
      
      const all = await this.getAll();
      await set(STORAGE_KEYS.SOS_RECORDS, [...all, newRecord]);
      return newRecord;
    },

    async getRecent(limit: number): Promise<SOSRecord[]> {
      const all = await this.getAll();
      return all
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    }
  };

  // ============ 对话历史操作 ============

  export const chatStorage = {
    async getAll(): Promise<ChatSession[]> {
      return (await get<ChatSession[]>(STORAGE_KEYS.CHATS)) || [];
    },

    async add(session: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatSession> {
      const now = Date.now();
      const newSession: ChatSession = {
        ...session,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now
      };
      
      const all = await this.getAll();
      await set(STORAGE_KEYS.CHATS, [...all, newSession]);
      
      // 清理过期对话（30天）
      await this.cleanupExpired();
      
      return newSession;
    },

    async update(id: string, updates: Partial<ChatSession>): Promise<ChatSession | null> {
      const all = await this.getAll();
      const index = all.findIndex(s => s.id === id);
      
      if (index === -1) return null;
      
      const updated = {
        ...all[index],
        ...updates,
        updatedAt: Date.now()
      };
      
      all[index] = updated;
      await set(STORAGE_KEYS.CHATS, all);
      
      return updated;
    },

    async getById(id: string): Promise<ChatSession | null> {
      const all = await this.getAll();
      return all.find(s => s.id === id) || null;
    },

    async delete(id: string): Promise<boolean> {
      const all = await this.getAll();
      const filtered = all.filter(s => s.id !== id);
      
      if (filtered.length === all.length) return false;
      
      await set(STORAGE_KEYS.CHATS, filtered);
      return true;
    },

    async cleanupExpired(): Promise<void> {
      const all = await this.getAll();
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const filtered = all.filter(s => s.updatedAt > thirtyDaysAgo);
      
      if (filtered.length !== all.length) {
        await set(STORAGE_KEYS.CHATS, filtered);
        await updateMetadata({ chatCount: filtered.length });
      }
    },

    async clear(): Promise<void> {
      await del(STORAGE_KEYS.CHATS);
      await updateMetadata({ chatCount: 0 });
    }
  };

  // ============ 用户偏好操作 ============

  export const preferencesStorage = {
    async get(): Promise<UserPreferences> {
      return (await get<UserPreferences>(STORAGE_KEYS.PREFERENCES)) || DEFAULT_PREFERENCES;
    },

    async update(updates: Partial<UserPreferences>): Promise<UserPreferences> {
      const current = await this.get();
      const updated = { ...current, ...updates };
      await set(STORAGE_KEYS.PREFERENCES, updated);
      return updated;
    },

    async reset(): Promise<UserPreferences> {
      await set(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
      return DEFAULT_PREFERENCES;
    }
  };

  // ============ 元数据操作 ============

  async function getMetadata(): Promise<StorageMetadata> {
    return (await get<StorageMetadata>(STORAGE_KEYS.METADATA)) || {
      version: '1.0',
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      emotionCount: 0,
      chatCount: 0,
      firstUseDate: Date.now()
    };
  }

  async function updateMetadata(updates: Partial<StorageMetadata>): Promise<void> {
    const metadata = await getMetadata();
    await set(STORAGE_KEYS.METADATA, {
      ...metadata,
      ...updates,
      lastUpdated: Date.now()
    });
  }

  // ============ 隐私功能 ============

  export const privacyService = {
    async exportAllData(): Promise<{
      version: string;
      exportDate: string;
      emotions: EmotionRecord[];
      chats: ChatSession[];
      preferences: UserPreferences;
      metadata: StorageMetadata;
    }> {
      const [emotions, chats, preferences, metadata] = await Promise.all([
        emotionStorage.getAll(),
        chatStorage.getAll(),
        preferencesStorage.get(),
        getMetadata()
      ]);

      return {
        version: '1.0',
        exportDate: new Date().toISOString(),
        emotions,
        chats,
        preferences,
        metadata
      };
    },

    async deleteAllData(): Promise<void> {
      await Promise.all([
        emotionStorage.clear(),
        chatStorage.clear(),
        del(STORAGE_KEYS.PREFERENCES)
      ]);
      
      await set(STORAGE_KEYS.METADATA, {
        version: '1.0',
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        emotionCount: 0,
        chatCount: 0,
        firstUseDate: Date.now()
      });
    },

    async getStorageStats(): Promise<{
      emotionCount: number;
      chatCount: number;
      storageSize: string;
      oldestRecord: number | null;
      newestRecord: number | null;
    }> {
      const [emotions, chats, metadata] = await Promise.all([
        emotionStorage.getAll(),
        chatStorage.getAll(),
        getMetadata()
      ]);

      const allTimestamps = emotions.map(e => e.timestamp);
      const oldest = allTimestamps.length > 0 ? Math.min(...allTimestamps) : null;
      const newest = allTimestamps.length > 0 ? Math.max(...allTimestamps) : null;

      // 估算存储大小
      const jsonString = JSON.stringify({ emotions, chats, metadata });
      const size = new Blob([jsonString]).size;

      return {
        emotionCount: emotions.length,
        chatCount: chats.length,
        storageSize: formatBytes(size),
        oldestRecord: oldest,
        newestRecord: newest
      };
    }
  };

  // 辅助函数：格式化字节大小
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 初始化存储（首次使用时创建元数据）
  export async function initializeStorage(): Promise<void> {
    const metadata = await getMetadata();
    if (!metadata.firstUseDate) {
      await updateMetadata({
        firstUseDate: Date.now()
      });
    }
  }
  ```

### 阶段 2：集成到 Zustand Store

#### 2.1 创建增强版 Store

- [ ] 2.1.1 创建 `src/store/useAppStore.ts`
  ```typescript
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
    UserPreferences
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
    addEmotionRecord: (record: Omit<EmotionRecord, 'id' | 'timestamp'>) => Promise<void>;
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
    exportAllData: () => Promise<ReturnType<typeof privacyService.exportAllData>>;
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

      // ============ 初始化 ============
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

      // ============ 情绪历史 ============
      addEmotionRecord: async (record) => {
        const newRecord = await emotionStorage.add(record);
        
        set(state => ({
          emotionHistory: [newRecord, ...state.emotionHistory]
        }));

        // 更新存储统计
        await get().loadStorageStats();
      },

      deleteEmotionRecord: async (id) => {
        const success = await emotionStorage.delete(id);
        
        if (success) {
          set(state => ({
            emotionHistory: state.emotionHistory.filter(r => r.id !== id)
          }));
          await get().loadStorageStats();
        }
        
        return success;
      },

      getRecentEmotions: async (limit) => {
        return await emotionStorage.getRecent(limit);
      },

      // ============ 对话历史 ============
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

      // ============ 用户偏好 ============
      updatePreferences: async (updates) => {
        const newPreferences = await preferencesStorage.update(updates);
        set({ preferences: newPreferences });
      },

      resetPreferences: async () => {
        const defaultPrefs = await preferencesStorage.reset();
        set({ preferences: defaultPrefs });
      },

      // ============ 隐私功能 ============
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
  ```

### 阶段 3：创建隐私设置页面

#### 3.1 创建隐私设置组件

- [ ] 3.1.1 创建 `src/pages/PrivacySettingsPage.tsx`
  ```typescript
  import React, { useState, useEffect } from 'react';
  import { useAppStore } from '../store/useAppStore';
  import { motion } from 'framer-motion';

  export default function PrivacySettingsPage() {
    const {
      storageStats,
      loadStorageStats,
      exportAllData,
      deleteAllData,
      deleteEmotionRecord
    } = useAppStore();

    const [isExporting, setIsExporting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteType, setDeleteType] = useState<'all' | 'emotions' | null>(null);
    const [notification, setNotification] = useState<{
      type: 'success' | 'error';
      message: string;
    } | null>(null);

    useEffect(() => {
      loadStorageStats();
    }, [loadStorageStats]);

    const showNotification = (type: 'success' | 'error', message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 3000);
    };

    const handleExport = async () => {
      setIsExporting(true);
      try {
        const data = await exportAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mindspace-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('success', '数据导出成功');
      } catch (error) {
        showNotification('error', '导出失败，请重试');
      } finally {
        setIsExporting(false);
      }
    };

    const handleDelete = async () => {
      if (!deleteType) return;
      
      setIsDeleting(true);
      try {
        if (deleteType === 'all') {
          await deleteAllData();
        }
        showNotification('success', deleteType === 'all' ? '所有数据已删除' : '情绪记录已删除');
        setShowConfirm(false);
        setDeleteType(null);
      } catch (error) {
        showNotification('error', '删除失败，请重试');
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
        <div className="max-w-md mx-auto">
          {/* 标题 */}
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            隐私与数据管理
          </h1>

          {/* 通知提示 */}
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg ${
                notification.type === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {notification.message}
            </motion.div>
          )}

          {/* 存储统计 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              存储使用情况
            </h2>
            
            {storageStats ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">情绪记录</span>
                  <span className="font-medium">{storageStats.emotionCount} 条</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">对话历史</span>
                  <span className="font-medium">{storageStats.chatCount} 条</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">总存储空间</span>
                  <span className="font-medium">{storageStats.storageSize}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">加载中...</p>
            )}
          </div>

          {/* 数据导出 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              数据导出
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              将所有数据导出为 JSON 文件，包括情绪记录、对话历史和偏好设置。
            </p>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium
                         hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isExporting ? '导出中...' : '导出所有数据'}
            </button>
          </div>

          {/* 数据删除 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              数据删除
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              永久删除本地存储的数据。此操作无法撤销。
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setDeleteType('emotions');
                  setShowConfirm(true);
                }}
                className="w-full py-3 border border-red-200 text-red-600 rounded-lg
                           hover:bg-red-50 transition-colors"
              >
                删除情绪记录
              </button>
              
              <button
                onClick={() => {
                  setDeleteType('all');
                  setShowConfirm(true);
                }}
                className="w-full py-3 bg-red-500 text-white rounded-lg font-medium
                           hover:bg-red-600 transition-colors"
              >
                删除所有数据
              </button>
            </div>
          </div>

          {/* 隐私说明 */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="font-medium text-blue-800 mb-2">
              您的数据安全
            </h3>
            <p className="text-sm text-blue-700">
              所有数据都存储在您的浏览器本地，不会上传到任何服务器。
              请定期导出备份以确保数据安全。
            </p>
          </div>

          {/* 确认弹窗 */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  确认删除
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {deleteType === 'all'
                    ? '确定要删除所有数据吗？此操作无法撤销。'
                    : '确定要删除所有情绪记录吗？此操作无法撤销。'}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowConfirm(false);
                      setDeleteType(null);
                    }}
                    className="flex-1 py-2 border border-gray-200 text-gray-600
                               rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg
                               hover:bg-red-600 disabled:opacity-50"
                  >
                    {isDeleting ? '删除中...' : '确认删除'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  ```

#### 3.2 更新路由配置

- [ ] 3.2.1 更新 `src/App.tsx`，添加隐私设置页面路由

#### 3.3 添加隐私设置入口

- [ ] 3.3.1 在设置页面或底部导航添加入口

### 阶段 4：更新现有页面

#### 4.1 更新首页

- [ ] 4.1.1 在首页显示情绪统计（如：总记录数、最近记录等）

#### 4.2 更新 SOS 页面

- [ ] 4.2.1 在 SOS 使用后自动保存记录到 IndexedDB
- [ ] 4.2.2 添加效果反馈收集

#### 4.3 更新对话页面

- [ ] 4.3.1 实现对话历史的存储和加载
- [ ] 4.3.2 实现 30 天自动清理逻辑

---

## 验收标准

### 功能验收

- [ ] 用户首次打开应用时自动初始化存储
- [ ] 情绪记录可以添加、查看、删除
- [ ] 对话历史保留 30 天后自动清理
- [ ] 用户偏好设置永久保存
- [ ] 可以导出所有数据为 JSON 文件
- [ ] 可以删除所有数据（有确认提示）
- [ ] 存储统计信息正确显示

### 验证闭环（必需）

- [ ] 单元测试：存储服务 CRUD 操作
- [ ] 集成测试：Store 与存储服务的同步
- [ ] E2E 测试：完整用户流程（添加情绪→查看历史→导出→删除）
- [ ] 兼容性测试：Chrome/Firefox/Safari 本地存储
- [ ] 性能测试：1000+ 情绪记录的读写性能
- [ ] 边界测试：存储空间不足、IndexedDB 不可用等异常场景

### 回归测试

- [ ] 现有 SOS 功能不受影响
- [ ] 现有 AI 对话功能不受影响
- [ ] 现有首页展示不受影响
- [ ] 页面加载性能无明显下降（< 500ms）

### 性能验收

- [ ] 页面加载时数据加载时间 < 500ms
- [ ] 数据操作（添加/删除）响应时间 < 100ms
- [ ] 存储空间使用正常（< 1MB）

### 体验验收

- [ ] 有加载状态指示
- [ ] 操作有成功/失败反馈
- [ ] 隐私设置页面信息清晰易懂

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| IndexedDB 存储失败 | 功能不可用 | 添加 try-catch 降级到 localStorage |
| 数据损坏 | 用户数据丢失 | 添加导出备份功能 |
| 存储空间不足 | 新数据无法保存 | 实施清理策略 |
| 用户误删数据 | 数据永久丢失 | 二次确认 + 导出提醒 |

---

## 时间估算

| 阶段 | 任务 | 估算时间 |
|------|------|---------|
| 阶段 1 | 基础设施搭建 | 30 分钟 |
| 阶段 2 | 集成到 Store | 20 分钟 |
| 阶段 3 | 隐私设置页面 | 40 分钟 |
| 阶段 4 | 更新现有页面 | 30 分钟 |
| **总计** | | **~2 小时** |

---

## 后续扩展建议

1. **数据加密**：添加 AES 加密保护敏感数据
2. **云端同步**：支持 iCloud/Google Drive 同步
3. **数据导入**：支持从备份文件恢复数据
4. **选择性删除**：支持按日期范围删除数据
5. **自动备份**：定期自动导出备份

---

## GitHub PR 提交流程

### 分支管理

- [ ] 创建特性分支：`feature/data-persistence`
- [ ] 基于 `main` 或 `dev` 分支创建
- [ ] 提交代码后推送到远程

### PR 要求

- [ ] PR 标题：`feat: 添加数据持久化功能`
- [ ] PR 描述：
  - 描述实现的功能
  - 包含测试验证结果
  - 列出关键文件变更
- [ ] 关联 Issue（如果有）

### 提交命令

```bash
# 1. 切换到 MindSpace 目录
cd mindspace

# 2. 创建并切换到特性分支
git checkout -b feature/data-persistence

# 3. 添加所有变更文件
git add .

# 4. 提交变更（使用 Conventional Commits）
git commit -m "feat: 添加数据持久化功能

- 实现情绪历史永久存储（IndexedDB）
- 实现对话历史 30 天自动清理
- 添加用户偏好设置持久化
- 添加隐私设置页面（导出/删除功能）
- 添加完整的类型定义和验证"

# 5. 推送到远程
git push origin feature/data-persistence

# 6. 创建 PR（使用 GitHub CLI）
gh pr create \
  --title "feat: 添加数据持久化功能" \
  --body "## 实现了什么
- 使用 Zustand + IndexedDB 实现数据持久化
- 情绪历史永久存储，对话历史 30 天自动清理
- 提供数据导出和删除功能（隐私保护）

## 验证结果
- ✅ 所有功能测试通过
- ✅ 现有功能不受影响
- ✅ 性能指标达标

## 关键文件变更
- src/types/storage.ts
- src/services/storageService.ts
- src/store/useAppStore.ts
- src/pages/PrivacySettingsPage.tsx"
```

### GitHub Token 配置

**必需环境变量**：
```bash
export GITHUB_TOKEN="your_github_token_here"
```

获取 Token 方式：
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 复制 Token 并设置到环境变量
