import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getFirstAidByType } from '../services/firstAidService'
import { EmotionType } from '../data/firstAidContent'
import { FirstAidSuggestion } from '../types'
import { EmotionAnalysisResult } from '../services/aiService'

interface LocationState {
  intensity: string
  bodyFeelings: string[]
  customInput: string
  timestamp: number
  analysisResult?: EmotionAnalysisResult
}

const SOSCardPage = () => {
  const { emotionType } = useParams<{ emotionType: EmotionType }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [suggestion, setSuggestion] = useState<FirstAidSuggestion | null>(null)
  const [countdown, setCountdown] = useState(60)
  const [isComplete, setIsComplete] = useState(false)
  
  const state = location.state as LocationState
  const analysisResult = state?.analysisResult

  useEffect(() => {
    if (!emotionType) {
      navigate('/sos/emotion')
      return
    }

    // 获取急救内容
    const content = getFirstAidByType(emotionType)
    setSuggestion(content)

    // 倒计时
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsComplete(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [emotionType, navigate])

  const handleComplete = () => {
    navigate('/sos/celebration', { 
      state: { 
        emotionType, 
        suggestion,
        completed: true,
        intensity: state?.intensity,
        bodyFeelings: state?.bodyFeelings,
        customInput: state?.customInput,
        analysisResult: state?.analysisResult
      } 
    })
  }

  if (!suggestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-circle"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* 专注模式 - 单一焦点设计 */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        {/* 温暖的开场 - 更温柔的展现方式 */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8"
        >
          {/* 温柔的背景容器 */}
          <div className="relative">
            {/* 柔和的背景光晕 */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-3xl blur-xl opacity-60"></div>
            
            {/* 主要内容 - 添加轻柔的呼吸效果 */}
            <motion.div
              animate={{ 
                scale: [1, 1.02, 1],
                opacity: [0.9, 1, 0.9]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/50 shadow-lg"
            >
              {/* 小小的爱心图标 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6, type: "spring", bounce: 0.4 }}
                className="mb-4"
              >
                <span className="text-2xl">💙</span>
              </motion.div>
              
              {/* 共情文字 - 更温柔的排版 */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="px-2"
              >
                <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-medium tracking-wide"
                   style={{ 
                     fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                     letterSpacing: '0.02em',
                     lineHeight: '1.6'
                   }}
                >
                  {/* 为文字添加温柔的渐现效果 */}
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 1 }}
                  >
                    {analysisResult?.empathyMessage || suggestion.empathy}
                  </motion.span>
                </p>
              </motion.div>
              
              {/* 温柔的装饰线 */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60px' }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="h-0.5 bg-gradient-to-r from-transparent via-primary-300 to-transparent mx-auto mt-4 rounded-full"
              ></motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* 主要行动区域 - 占据视觉中心 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-100 mb-8"
        >
          <div className="text-center">
            {/* 行动标题 */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-6"
            >
              <h3 className="text-lg sm:text-xl font-bold text-neutral-800 mb-2">
                {suggestion.action.name}
              </h3>
              <div className="w-12 h-1 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full mx-auto"></div>
            </motion.div>
            
            {/* 视觉引导 - 根据动作类型显示 */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mb-6"
            >
              {suggestion.action.type === 'breathing' && (
                <div className="relative">
                  <div className="w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-full border-4 border-primary-300 animate-breathe flex items-center justify-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center">
                      <span className="text-xl sm:text-2xl text-white">🫁</span>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-500 mt-3">跟着圆圈一起呼吸</p>
                </div>
              )}
              
              {suggestion.action.type === 'physical' && (
                <div className="relative">
                  <div className="w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-full bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center">
                    <span className="text-5xl sm:text-6xl">💪</span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-3">让身体动起来</p>
                </div>
              )}
              
              {suggestion.action.type === 'cognitive' && (
                <div className="relative">
                  <div className="w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                    <span className="text-5xl sm:text-6xl">🧘‍♀️</span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-3">专注内心感受</p>
                </div>
              )}
            </motion.div>
            
            {/* 行动指引 */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mb-8"
            >
              <p className="text-base sm:text-lg text-neutral-700 font-medium leading-relaxed">
                {suggestion.action.instruction}
              </p>
            </motion.div>

            {/* 倒计时 - 更突出 */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mb-6"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="text-3xl sm:text-4xl font-bold text-primary-500">
                  {countdown}
                </div>
                <span className="text-base sm:text-lg text-neutral-500">秒</span>
              </div>

              {/* 进度条 - 更醒目 */}
              <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 60, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full"
                />
              </div>
              
              <p className="text-xs text-neutral-400 mt-2">专注这一刻，你做得很好</p>
            </motion.div>
          </div>
        </motion.div>

        {/* 完成按钮 */}
        {isComplete && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            onClick={handleComplete}
            className="btn-primary w-full text-lg py-4"
            whileTap={{ scale: 0.95 }}
          >
            行动完成，感觉好点了 ✨
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}

export default SOSCardPage
