import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const { theme } = useThemeStore()

  const showSidebar = !location.pathname.startsWith('/sos')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [theme])

  return (
    <div className="min-h-screen flex relative" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {showSidebar && (
        <aside className="w-16 border-r flex-shrink-0 z-50" style={{ borderColor: 'var(--border-color)' }}>
          <nav className="flex flex-col items-center py-6 space-y-6">
            <a
              href="/"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-opacity-80 relative group"
              style={{
                backgroundColor: location.pathname === '/' ? 'var(--accent)' : 'var(--bg-secondary)',
                color: location.pathname === '/' ? '#FFFFFF' : 'var(--accent)'
              }}
              title="首页"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </a>

            <a
              href="/chat"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group"
              style={{
                backgroundColor: location.pathname === '/chat' ? 'var(--accent)' : 'var(--bg-secondary)',
                color: location.pathname === '/chat' ? '#FFFFFF' : 'var(--accent)'
              }}
              title="对话"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </a>

            <a
              href="/insight"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group"
              style={{
                backgroundColor: location.pathname === '/insight' ? 'var(--accent)' : 'var(--bg-secondary)',
                color: location.pathname === '/insight' ? '#FFFFFF' : 'var(--accent)'
              }}
              title="洞察"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </a>
          </nav>
        </aside>
      )}

      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}

export default Layout
