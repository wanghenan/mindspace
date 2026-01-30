import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'

const HomePage = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useThemeStore()

  const handleSOSClick = () => {
    navigate('/sos/emotion')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 relative" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <motion.button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full transition-all hover:scale-105"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
        whileTap={{ scale: 0.95 }}
      >
        {theme === 'light' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </motion.button>

      {/* Logo和标题 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-xl" style={{ 
          background: theme === 'light' 
            ? 'linear-gradient(135deg, #6B73FF 0%, #FF6B6B 100%)'
            : 'linear-gradient(135deg, #8186FF 0%, #FF9999 100%)'
        }}>
          <span className="text-3xl text-white font-bold">M</span>
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>MindSpace</h1>
        <p className="text-lg font-medium" style={{ color: 'var(--accent)' }}>60秒情绪急救</p>
      </motion.div>

      {/* 产品描述 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center max-w-sm mb-8"
      >
        <p className="text-lg leading-relaxed font-medium">
          <span style={{
            background: theme === 'light'
              ? 'linear-gradient(135deg, #6B73FF 0%, #FF6B6B 100%)'
              : 'linear-gradient(135deg, #8186FF 0%, #FF9999 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            transition: 'none'
          }}>
            当你感到情绪崩溃时
          </span>
          <br />
          <span style={{
            background: theme === 'light'
              ? 'linear-gradient(135deg, #6B73FF 0%, #FF6B6B 100%)'
              : 'linear-gradient(135deg, #8186FF 0%, #FF9999 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            transition: 'none'
          }}>
            我们懂你，陪伴你
          </span>
        </p>
      </motion.div>

      {/* 开始急救按钮 */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        onClick={handleSOSClick}
        className="w-full max-w-sm flex items-center justify-center gap-3 mb-10 relative overflow-hidden font-semibold text-white rounded-2xl"
        style={{
          backgroundColor: 'var(--accent)',
          boxShadow: '0 10px 30px -8px var(--accent)',
          padding: '1rem 2.5rem',
          fontSize: '1.125rem'
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        开始急救
        <motion.span
          className="arrow-right"
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          →
        </motion.span>
      </motion.button>

      {/* 功能说明 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center max-w-sm"
      >
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: 'var(--accent)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--accent)' }}>秒级响应</p>
            <p className="text-xs" style={{ color: 'var(--text-quaternary)' }}>随时在线</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: 'var(--accent)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--accent)' }}>AI共情</p>
            <p className="text-xs" style={{ color: 'var(--text-quaternary)' }}>深度理解</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: 'var(--accent)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--accent)' }}>私密空间</p>
            <p className="text-xs" style={{ color: 'var(--text-quaternary)' }}>安全无忧</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default HomePage
