import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import CelebrationAnimation from '../components/CelebrationAnimation'
import { FirstAidSuggestion } from '../types'
import { EmotionType } from '../data/firstAidContent'
import { EmotionAnalysisResult } from '../services/aiService'

interface LocationState {
  emotionType?: EmotionType
  suggestion?: FirstAidSuggestion
  completed?: boolean
  intensity?: string
  bodyFeelings?: string[]
  customInput?: string
  analysisResult?: EmotionAnalysisResult
}

const SOSCelebrationPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showCelebration, setShowCelebration] = useState(true)
  const [showContent, setShowContent] = useState(false)
  
  const state = location.state as LocationState

  // 动态生成庆祝内容
  const generateCelebrationContent = () => {
    const contents = [
      {
        title: "你真的很棒！",
        message: "刚才的60秒里，你选择了面对而不是逃避，这需要很大的勇气。",
        insight: "每一次主动调节情绪，都是在为自己的心理健康投资。"
      },
      {
        title: "为你感到骄傲！",
        message: "在情绪最难受的时候，你没有被它淹没，而是选择了行动。",
        insight: "这种自我关怀的能力，会让你在未来的挑战中更加坚韧。"
      },
      {
        title: "你做得太好了！",
        message: "刚才的练习不仅帮助了当下的你，也在训练你的情绪调节能力。",
        insight: "科学研究表明，这样的练习会让大脑更善于处理压力。"
      },
      {
        title: "真的很了不起！",
        message: "在最需要帮助的时候选择自助，这是一种非常成熟的应对方式。",
        insight: "你正在成为自己最好的朋友和支持者。"
      },
      {
        title: "你值得被赞美！",
        message: "刚才的每一个深呼吸、每一个动作，都是在告诉自己'我值得被好好对待'。",
        insight: "这种自我疼惜的态度，是心理健康的重要基石。"
      }
    ]

    // 根据情绪类型和强度个性化内容
    const randomContent = contents[Math.floor(Math.random() * contents.length)]
    
    // 添加个性化元素
    let personalizedMessage = randomContent.message
    if (state.intensity === 'extreme') {
      personalizedMessage += " 特别是在感觉快要崩溃的时候，你依然选择了积极应对，这真的很不容易。"
    } else if (state.intensity === 'severe') {
      personalizedMessage += " 在很痛苦的时候还能坚持完成练习，说明你内心有很强的力量。"
    }

    return {
      ...randomContent,
      message: personalizedMessage
    }
  }

  const [celebrationContent] = useState(() => generateCelebrationContent())

  const handleCelebrationComplete = () => {
    setShowCelebration(false)
    setShowContent(true)
  }

  const handleContinueChat = () => {
    navigate('/chat', { 
      state: { 
        fromSOS: true,
        emotionType: state.emotionType,
        celebrationCompleted: true
      } 
    })
  }

  const handleBackHome = () => {
    // 确保清除所有状态并跳转到首页
    navigate('/', { replace: true, state: null })
  }

  return (
    <>
      {/* 庆祝动画 */}
      <CelebrationAnimation 
        isVisible={showCelebration} 
        onComplete={handleCelebrationComplete}
      />

      {/* 庆祝内容页面 */}
      {showContent && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-2">
              {celebrationContent.title}
            </h2>
          </motion.div>

          {/* 个性化庆祝内容 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card w-full max-w-sm mb-6"
          >
            <div className="text-center">
              <p className="text-neutral-700 leading-relaxed mb-4">
                {celebrationContent.message}
              </p>
              <div className="pt-4 border-t border-neutral-100">
                <p className="text-sm text-primary-600 font-medium">
                  💡 {celebrationContent.insight}
                </p>
              </div>
            </div>
          </motion.div>

          {/* 行动按钮 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-4 w-full max-w-sm"
          >
            <motion.button
              onClick={handleContinueChat}
              className="btn-primary w-full flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              还想继续聊一聊 💬
            </motion.button>
            
            <motion.button
              onClick={handleBackHome}
              className="btn-secondary w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              回到首页 🏠
            </motion.button>
          </motion.div>

          {/* 温馨提示 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-neutral-500 mb-2">
              记住，每一次的自我关怀都很珍贵
            </p>
            <p className="text-xs text-neutral-400">
              MindSpace 随时在这里陪伴你 💙
            </p>
          </motion.div>
        </div>
      )}
    </>
  )
}

export default SOSCelebrationPage