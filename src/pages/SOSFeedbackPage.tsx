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
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="text-4xl mb-4">✨</div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">
          感觉好点了吗？
        </h2>
        <p className="text-sm text-neutral-600">
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
          className="btn-primary w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          好多了 😊
        </motion.button>
        
        <motion.button
          onClick={handleStillBad}
          className="btn-secondary w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          还是很难受，需要更多帮助
        </motion.button>

        <motion.button
          onClick={handleWantToChat}
          className="btn-secondary w-full flex items-center justify-center gap-2"
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
        <p className="text-xs text-neutral-500 mb-2">
          如果你正在经历严重的心理危机，请立即寻求专业帮助：
        </p>
        <p className="text-sm text-sos-600 font-medium">
          全国24小时心理危机干预热线：400-161-9995
        </p>
      </motion.div>
    </div>
  )
}

export default SOSFeedbackPage
