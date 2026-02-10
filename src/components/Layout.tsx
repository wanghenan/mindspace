import React, { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const { theme } = useThemeStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const showLabels = false
  const showSidebar = !location.pathname.startsWith('/sos')

  return (
    <div
      className={`min-h-screen flex relative transition-colors ${theme === 'dark' ? 'dark' : ''}`}
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {showSidebar && (
        <aside
          className={`border-r flex-shrink-0 z-50 transition-all duration-300 ${theme === 'dark' ? 'dark' : ''}`}
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-color)',
            width: sidebarCollapsed ? '48px' : showLabels ? '240px' : '80px',
            height: '100vh',
            position: 'sticky',
            top: 0
          }}
        >
          <nav className="flex flex-col h-full py-4">
            <div className="flex flex-col px-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}
                title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 48 48" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.94971 11.9497H39.9497" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.94971 23.9497H39.9497" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.94971 35.9497H39.9497" />
                </svg>
              </button>
            </div>

            {!sidebarCollapsed && (
              <div className={`flex-1 flex flex-col ${showLabels ? 'px-3' : 'items-center px-2'} mt-2`}>
                <div className={`flex flex-col ${showLabels ? 'space-y-1' : 'items-center space-y-4'}`}>
                  <Link
                    to="/"
                    className={`flex items-center rounded-lg transition-all ${
                      location.pathname === '/' ? 'text-white' : 'text-purple-500 dark:text-purple-400'
                    } ${showLabels ? 'px-3 py-2 w-full' : 'justify-center w-10 h-10'}`}
                    style={{
                      backgroundColor: location.pathname === '/' ? 'var(--accent)' : 'var(--bg-secondary)'
                    }}
                  >
                    <svg className={`${showLabels ? 'w-5 h-5 mr-3' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {showLabels && <span className="text-sm font-medium">首页</span>}
                  </Link>

                  <Link
                    to="/chat"
                    className={`flex items-center rounded-lg transition-all ${
                      location.pathname === '/chat' ? 'text-white' : 'text-purple-500 dark:text-purple-400'
                    } ${showLabels ? 'px-3 py-2 w-full' : 'justify-center w-10 h-10'}`}
                    style={{
                      backgroundColor: location.pathname === '/chat' ? 'var(--accent)' : 'var(--bg-secondary)'
                    }}
                  >
                    <svg className={`${showLabels ? 'w-5 h-5 mr-3' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {showLabels && <span className="text-sm font-medium">对话</span>}
                  </Link>

                  <Link
                    to="/insight"
                    className={`flex items-center rounded-lg transition-all ${
                      location.pathname === '/insight' ? 'text-white' : 'text-purple-500 dark:text-purple-400'
                    } ${showLabels ? 'px-3 py-2 w-full' : 'justify-center w-10 h-10'}`}
                    style={{
                      backgroundColor: location.pathname === '/insight' ? 'var(--accent)' : 'var(--bg-secondary)'
                    }}
                  >
                    <svg className={`${showLabels ? 'w-5 h-5 mr-3' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {showLabels && <span className="text-sm font-medium">洞察</span>}
                  </Link>
                </div>

                <div className={`flex-1`}></div>

                <div className={`flex flex-col ${showLabels ? 'space-y-1' : 'items-center space-y-4'}`}>
                  <Link
                    to="/settings"
                    className={`flex items-center rounded-lg transition-all ${
                      location.pathname === '/settings' ? 'text-white' : 'text-purple-500 dark:text-purple-400'
                    } ${showLabels ? 'px-3 py-2 w-full' : 'justify-center w-10 h-10'}`}
                    style={{
                      backgroundColor: location.pathname === '/settings' ? 'var(--accent)' : 'var(--bg-secondary)'
                    }}
                  >
                    <svg className={`${showLabels ? 'w-5 h-5 mr-3' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {showLabels && <span className="text-sm font-medium">AI设置</span>}
                  </Link>

                  <Link
                    to="/account"
                    className={`flex items-center rounded-lg transition-all ${
                      location.pathname === '/account' ? 'text-white' : 'text-purple-500 dark:text-purple-400'
                    } ${showLabels ? 'px-3 py-2 w-full' : 'justify-center w-10 h-10'}`}
                    style={{
                      backgroundColor: location.pathname === '/account' ? 'var(--accent)' : 'var(--bg-secondary)'
                    }}
                  >
                    <svg className={`${showLabels ? 'w-5 h-5 mr-3' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {showLabels && <span className="text-sm font-medium">账户</span>}
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </aside>
      )}

      <main className={`flex-1 overflow-hidden transition-colors ${theme === 'dark' ? 'dark' : ''}`}>
        {children}
      </main>
    </div>
  )
}

export default Layout
