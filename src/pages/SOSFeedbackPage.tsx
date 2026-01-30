import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FirstAidSuggestion } from '../types'
import { EmotionType } from '../data/firstAidContent'

interface LocationState {
  emotionType?: EmotionType
  suggestion?: FirstAidSuggestion
  completed?: boolean
}

const SOSFeedbackPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState

  const handleFeelBetter = () => {
    // 返回首页
    navigate('/', { replace: true })
  }

  const handleStillBad = () => {
    // 推荐进入AI对话
    navigate('/chat', { 
      state: { 
        fromSOS: true,
        emotionType: state.emotionType 
      } 
    })
  }

  const handleWantToChat = () => {
    // 无缝跳转到AI对话
    navigate('/chat', { 
      state: { 
        fromSOS: true,
        emotionType: state.emotionType 
      } 
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="text-4xl mb-4">✨</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          感觉好点了吗？
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          我们在这里陪伴你
        </p>
      </motion.div>

      {/* Feedback Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4 w-full max-w-sm"
      >
        <motion.button
          onClick={handleFeelBetter}
          className="w-full py-3 rounded-xl text-white font-medium transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--accent)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          好多了 😊
        </motion.button>

        <motion.button
          onClick={handleStillBad}
          className="w-full py-3 rounded-xl font-medium transition-all hover:opacity-80"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          还是很难受，需要更多帮助
        </motion.button>

        <motion.button
          onClick={handleWantToChat}
          className="w-full py-3 rounded-xl font-medium transition-all hover:opacity-80 flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          想聊聊 💬
        </motion.button>
      </motion.div>

      {/* 危机热线提示 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 text-center"
      >
        <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
          如果你正在经历严重的心理危机，请立即寻求专业帮助：
        </p>
        <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
          全国24小时心理危机干预热线：400-161-9995
        </p>
      </motion.div>
    </div>
  )
}

export default SOSFeedbackPage
