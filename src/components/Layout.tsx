import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()

  // 底部导航栏配置
  const navItems = [
    { path: '/', icon: '🏠', label: '首页' },
    { path: '/chat', icon: '💬', label: '对话' },
    { path: '/insight', icon: '📊', label: '洞察' },
  ]

  // 是否显示底部导航栏（某些页面不需要）
  const showBottomNav = !location.pathname.startsWith('/sos')

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col">
      {/* 主内容区域 */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* 底部导航栏 */}
      {showBottomNav && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-lg z-50"
        >
          <div className="flex justify-around items-center py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all ${
                    isActive
                      ? 'text-primary-500 bg-primary-50'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </motion.nav>
      )}
    </div>
  )
}

export default Layout
