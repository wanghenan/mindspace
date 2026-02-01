import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = 'mindspace-theme'

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && (stored === 'light' || stored === 'dark')) {
    return stored as Theme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = create<ThemeStore>((set) => {
  const initialTheme = getInitialTheme()

  return {
    theme: initialTheme,
    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem(STORAGE_KEY, newTheme)
      return { theme: newTheme }
    }),
    setTheme: (theme) => {
      localStorage.setItem(STORAGE_KEY, theme)
      set({ theme })
    }
  }
})

// 辅助函数：获取当前主题（用于 CSS 类）
export const getTheme = () => {
  return getInitialTheme()
}
