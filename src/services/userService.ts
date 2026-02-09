import { get, set, del } from 'idb-keyval'
import { v4 as uuidv4 } from 'uuid'
import type { UserProfile, RegisterForm, UserStats } from '../types/user'
import { emotionStorage } from './storageService'
import { chatStorage } from './storageService'

// 存储键名
const USER_KEY = 'mindspace_user'
const USER_STATS_KEY = 'mindspace_user_stats'

// 默认头像
const DEFAULT_AVATAR = '👤'

// 用户服务
export const userService = {
  // 检查是否已注册
  async isRegistered(): Promise<boolean> {
    const user = await this.getUser()
    const isRegistered = !!user

    // 同步更新 localStorage 标识（确保新旧用户都能正常使用）
    if (isRegistered) {
      localStorage.setItem('mindspace_is_registered', 'true')
    }

    return isRegistered
  },

  // 获取当前用户
  async getUser(): Promise<UserProfile | null> {
    return (await get<UserProfile>(USER_KEY)) || null
  },

  // 注册新用户
  async register(form: RegisterForm): Promise<UserProfile> {
    const now = Date.now()
    const user: UserProfile = {
      id: uuidv4(),
      nickname: form.nickname.trim(),
      email: form.email?.trim(),
      avatar: DEFAULT_AVATAR,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    }

    // 保存到 IndexedDB
    await set(USER_KEY, user)

    // 设置登录标识到 localStorage（用于路由守卫检查）
    localStorage.setItem('mindspace_is_registered', 'true')

    return user
  },

  // 更新用户信息
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const user = await this.getUser()
    if (!user) return null
    
    const updated: UserProfile = {
      ...user,
      ...updates,
      updatedAt: Date.now()
    }
    
    await set(USER_KEY, updated)
    return updated
  },

  // 更新最后登录时间
  async updateLastLogin(): Promise<void> {
    const user = await this.getUser()
    if (user) {
      await set(USER_KEY, {
        ...user,
        lastLoginAt: Date.now()
      })
    }
  },

  // 注销用户
  async logout(): Promise<void> {
    // 清除 IndexedDB 中的用户数据
    await del(USER_KEY)
    await del(USER_STATS_KEY)

    // 清除 localStorage 中的登录标识
    localStorage.removeItem('mindspace_is_registered')
  },

  // 获取用户统计
  async getStats(): Promise<UserStats> {
    const [emotions, chats] = await Promise.all([
      emotionStorage.getAll(),
      chatStorage.getAll()
    ])
    
    const user = await this.getUser()
    
    // 计算平均效果
    const emotionsWithEffectiveness = emotions.filter(e => e.effectiveness)
    const avgEffectiveness = emotionsWithEffectiveness.length > 0
      ? emotionsWithEffectiveness.reduce((sum, e) => sum + (e.effectiveness || 0), 0) / emotionsWithEffectiveness.length
      : 0
    
    // 计算连续使用天数
    const streak = await this.calculateStreak(emotions)
    
    return {
      totalEmotions: emotions.length,
      totalChats: chats.length,
      totalSOS: emotions.filter(e => e.copingMethod === 'sos-first-aid').length,
      avgEffectiveness: Math.round(avgEffectiveness * 10) / 10,
      memberSince: user?.createdAt || Date.now(),
      streak
    }
  },

  // 计算连续使用天数
  async calculateStreak(emotions: any[]): Promise<number> {
    if (emotions.length === 0) return 0
    
    // 按时间排序
    const sorted = [...emotions].sort((a, b) => b.timestamp - a.timestamp)
    
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let currentDate = new Date(today)
    
    for (const emotion of sorted) {
      const emotionDate = new Date(emotion.timestamp)
      emotionDate.setHours(0, 0, 0, 0)
      
      const diffDays = Math.floor((currentDate.getTime() - emotionDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 1) {
        if (diffDays === 1) {
          // 不是今天，需要往前一天
          currentDate = new Date(emotionDate)
        }
        streak++
      } else {
        break
      }
    }
    
    return streak
  }
}
