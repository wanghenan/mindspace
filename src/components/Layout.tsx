import React from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './navigation'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()

  // 是否显示侧边栏（某些页面不需要）
  const showSidebar = !location.pathname.startsWith('/sos')

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
      {/* 左侧边栏 */}
      {showSidebar && <Sidebar />}

      {/* 主内容区域 */}
      <main 
        className={`
          flex-1 transition-all duration-300
          ${showSidebar ? 'ml-16' : ''}
        `}
      >
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
