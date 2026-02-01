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
    // 跳转到反馈页面保存记录，然后返回首页
    navigate('/sos/feedback', { 
      state: { 
        emotionType: state.emotionType,
        intensity: state.intensity,
        bodyFeelings: state.bodyFeelings,
        customInput: state.customInput,
        analysisResult: state.analysisResult,
        completed: true,
        fromCelebration: true  // 标记来自庆祝页面，直接返回首页
      } 
    })
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
        <div className="flex flex-col items-center justify-center min-h-screen px-6" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {celebrationContent.title}
            </h2>
          </motion.div>

          {/* 个性化庆祝内容 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-sm mb-6 p-6 rounded-xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <div className="text-center">
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-primary)' }}>
                {celebrationContent.message}
              </p>
              <div className="pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
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
              className="w-full px-6 py-3 rounded-xl flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              还想继续聊一聊
            </motion.button>

            <motion.button
              onClick={handleBackHome}
              className="w-full px-6 py-3 rounded-xl flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              回到首页
            </motion.button>
          </motion.div>

          {/* 温馨提示 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              记住，每一次的自我关怀都很珍贵
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
              MindSpace 随时在这里陪伴你 💙
            </p>
          </motion.div>
        </div>
      )}
    </>
  )
}

export default SOSCelebrationPage