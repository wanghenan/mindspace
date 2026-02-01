import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { userService } from '../services/userService'
import type { UserProfile, UserStats, RegisterForm } from '../types/user'

interface UserState {
  user: UserProfile | null
  userStats: UserStats | null
  isLoading: boolean
  isRegistered: boolean

  // Actions - 初始化
  initializeUser: () => Promise<void>

  // Actions - 注册/登录
  register: (form: RegisterForm) => Promise<boolean>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  logout: () => Promise<void>

  // Actions - 统计
  loadUserStats: () => Promise<void>
}

export const useUserStore = create<UserState>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    userStats: null,
    isLoading: true,
    isRegistered: false,

    initializeUser: async () => {
      set({ isLoading: true })
      try {
        const user = await userService.getUser()
        const isRegistered = await userService.isRegistered()
        
        set({
          user,
          isRegistered,
          isLoading: false
        })

        // 如果已登录，更新最后登录时间并加载统计
        if (user) {
          await userService.updateLastLogin()
          await get().loadUserStats()
        }
      } catch (error) {
        console.error('Failed to initialize user:', error)
        set({ isLoading: false })
      }
    },

    register: async (form: RegisterForm) => {
      try {
        // 验证表单
        if (!form.nickname.trim()) {
          console.error('昵称不能为空')
          return false
        }

        // 检查是否已注册
        if (await userService.isRegistered()) {
          console.error('用户已注册')
          return false
        }

        // 注册用户
        const user = await userService.register(form)
        
        set({
          user,
          isRegistered: true
        })

        // 加载统计
        await get().loadUserStats()
        
        return true
      } catch (error) {
        console.error('注册失败:', error)
        return false
      }
    },

    updateProfile: async (updates: Partial<UserProfile>) => {
      const user = get().user
      if (!user) return

      try {
        const updated = await userService.updateProfile(updates)
        if (updated) {
          set({ user: updated })
        }
      } catch (error) {
        console.error('更新用户信息失败:', error)
      }
    },

    logout: async () => {
      try {
        await userService.logout()
        set({
          user: null,
          userStats: null,
          isRegistered: false
        })
      } catch (error) {
        console.error('注销失败:', error)
      }
    },

    loadUserStats: async () => {
      try {
        const stats = await userService.getStats()
        set({ userStats: stats })
      } catch (error) {
        console.error('加载用户统计失败:', error)
      }
    }
  }))
)
