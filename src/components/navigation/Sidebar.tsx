import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserProfile, UserData } from '../user'

export interface SidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

// 模拟用户数据
const mockUser: UserData = {
  id: '1',
  name: 'Grace',
  email: 'grace@gmail.com',
  avatar: '', // 空字符串将触发首字母显示
  initials: 'G'
}

const Sidebar: React.FC<SidebarProps> = ({
  className = '',
  isCollapsed: _isCollapsed = false,
  onToggleCollapse: _onToggleCollapse
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full bg-white z-40
        flex flex-col transition-all duration-500 ease-in-out
        w-16
        ${className}
      `}
      role="navigation"
      aria-label="主导航"
    >
      {/* 导航区域 */}
      <nav className="flex-1 px-4 py-6" role="menubar" aria-label="主要导航菜单">
        <div className="space-y-2">
          {/* 首页 */}
          <div className="relative group">
            <button 
              onClick={() => navigate('/')}
              className={`flex items-center justify-center w-full px-4 py-3 rounded-lg transition-all
                ${location.pathname === '/' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              <span className="text-lg font-bold">⌂</span>
            </button>
            <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-sm rounded-md whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              首页
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-neutral-800 rotate-45"></div>
            </div>
          </div>
          
          {/* AI对话 */}
          <div className="relative group">
            <button 
              onClick={() => navigate('/chat')}
              className={`flex items-center justify-center w-full px-4 py-3 rounded-lg transition-all
                ${location.pathname === '/chat' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              <span className="text-lg font-bold">💭</span>
            </button>
            <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-sm rounded-md whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              AI对话
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-neutral-800 rotate-45"></div>
            </div>
          </div>
          
          {/* 洞察 */}
          <div className="relative group">
            <button 
              onClick={() => navigate('/insight')}
              className={`flex items-center justify-center w-full px-4 py-3 rounded-lg transition-all
                ${location.pathname === '/insight' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              <span className="text-lg font-bold">⚡</span>
            </button>
            <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-sm rounded-md whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              洞察
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-neutral-800 rotate-45"></div>
            </div>
          </div>
          
          {/* 设置 */}
          <div className="relative group">
            <button 
              onClick={() => navigate('/settings')}
              className={`flex items-center justify-center w-full px-4 py-3 rounded-lg transition-all
                ${location.pathname === '/settings' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              aria-label="AI设置"
            >
              <span className="text-lg font-bold">⚙️</span>
            </button>
            <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-sm rounded-md whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              AI设置
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-neutral-800 rotate-45"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* 用户信息区域 */}
      <div 
        className="p-4 bg-gradient-to-r from-neutral-25 to-neutral-50"
        role="region"
        aria-label="用户信息区域"
      >
        <UserProfile
          user={{
            ...mockUser,
            // 在窄边栏中只显示头像
            name: mockUser.initials || mockUser.name.slice(0, 2),
            email: ''
          }}
          isCollapsed={true}
        />
      </div>
    </aside>
  )
}

export default Sidebar