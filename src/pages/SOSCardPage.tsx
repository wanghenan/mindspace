import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getFirstAidByType } from '../services/firstAidService'
import { EmotionType } from '../data/firstAidContent'
import { FirstAidSuggestion } from '../types'
import { EmotionAnalysisResult } from '../services/aiService'
import { useThemeStore } from '../store/themeStore'
import { useAppStore } from '../store/useAppStore'

interface LocationState {
  intensity: string
  bodyFeelings: string[]
  customInput: string
  timestamp: number
  analysisResult?: EmotionAnalysisResult
  emotionRecordId?: string  // 情绪记录ID，用于更新而不是创建新记录
}

const SOSCardPage = () => {
  const { theme } = useThemeStore()
  const { emotionType } = useParams<{ emotionType: EmotionType }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [suggestion, setSuggestion] = useState<FirstAidSuggestion | null>(null)
  const addEmotionRecord = useAppStore(state => state.addEmotionRecord)
  
  // 倒计时初始值 - 本地开发环境 (localhost) 缩短为 10 秒，线上保持 60 秒
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  const initialCountdown = isLocalhost ? 10 : 60
  const [countdown, setCountdown] = useState(initialCountdown)
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

    // 倒计时 - 本地开发环境 (localhost) 缩短为 10 秒，线上保持 60 秒
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

  const handleContinueChat = async () => {
    console.log('[SOSCardPage] 选择继续聊聊，开始保存情绪记录...')
    
    const emotionTypeStr = analysisResult?.emotionType || emotionType || '未知情绪'
    const intensityValue = state?.intensity === 'extreme' ? 10 : 
                          state?.intensity === 'severe' ? 8 : 
                          state?.intensity === 'moderate' ? 5 : 3
    
    // 保存情绪记录
    if (state?.emotionRecordId) {
      try {
        await useAppStore.getState().updateEmotionRecord(state.emotionRecordId, {
          emotion: emotionTypeStr,
          intensity: intensityValue,
          trigger: state?.customInput || undefined,
          context: state?.bodyFeelings?.length ? state?.bodyFeelings.join(', ') : undefined,
          copingMethod: 'sos-first-aid',
          effectiveness: 4
        })
      } catch (error) {
        console.error('[SOSCardPage] ❌ 更新情绪记录失败:', error)
      }
    } else {
      try {
        await addEmotionRecord({
          emotion: emotionTypeStr,
          intensity: intensityValue,
          trigger: state?.customInput || undefined,
          context: state?.bodyFeelings?.length ? state?.bodyFeelings.join(', ') : undefined,
          copingMethod: 'sos-first-aid',
          effectiveness: 4
        })
      } catch (error) {
        console.error('[SOSCardPage] ❌ 保存情绪记录失败:', error)
      }
    }
    
    // 跳转到对话页，带上情绪上下文
    navigate('/chat', { 
      state: { 
        fromSOS: true,
        emotionType: emotionTypeStr,
        intensity: state?.intensity || 'moderate',
        bodyFeelings: state?.bodyFeelings || [],
        customInput: state?.customInput || '',
        empathyMessage: analysisResult?.empathyMessage || suggestion?.empathy || ''
      } 
    })
  }

  const handleWantQuiet = async () => {
    console.log('[SOSCardPage] 选择静静，保存记录后跳转完成页...')
    
    const emotionTypeStr = analysisResult?.emotionType || emotionType || '未知情绪'
    const intensityValue = state?.intensity === 'extreme' ? 10 : 
                          state?.intensity === 'severe' ? 8 : 
                          state?.intensity === 'moderate' ? 5 : 3
    
    // 保存情绪记录
    if (state?.emotionRecordId) {
      try {
        await useAppStore.getState().updateEmotionRecord(state.emotionRecordId, {
          emotion: emotionTypeStr,
          intensity: intensityValue,
          trigger: state?.customInput || undefined,
          context: state?.bodyFeelings?.length ? state?.bodyFeelings.join(', ') : undefined,
          copingMethod: 'sos-first-aid',
          effectiveness: 4
        })
      } catch (error) {
        console.error('[SOSCardPage] ❌ 更新情绪记录失败:', error)
      }
    } else {
      try {
        await addEmotionRecord({
          emotion: emotionTypeStr,
          intensity: intensityValue,
          trigger: state?.customInput || undefined,
          context: state?.bodyFeelings?.length ? state?.bodyFeelings.join(', ') : undefined,
          copingMethod: 'sos-first-aid',
          effectiveness: 4
        })
      } catch (error) {
        console.error('[SOSCardPage] ❌ 保存情绪记录失败:', error)
      }
    }
    
    // 跳转到完成页
    navigate('/sos/complete', { 
      state: { 
        emotionType, 
        suggestion,
        completed: true,
        intensity: state?.intensity || null,
        bodyFeelings: state?.bodyFeelings || [],
        customInput: state?.customInput || '',
        analysisResult: state?.analysisResult || null
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
    <div className="flex flex-col items-center justify-center min-h-screen px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
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
            <div className="absolute inset-0 rounded-3xl blur-xl opacity-60" style={{ background: 'linear-gradient(to right, rgba(107, 115, 255, 0.2), rgba(255, 107, 107, 0.2))' }}></div>

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
              className="relative backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border shadow-lg"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(25, 25, 25, 0.8)',
                borderColor: 'var(--border-color)'
              }}
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
                <p className="text-base sm:text-lg leading-relaxed font-medium tracking-wide"
                   style={{
                     fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                     letterSpacing: '0.02em',
                     lineHeight: '1.6',
                     color: 'var(--text-primary)'
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
                className="h-0.5 mx-auto mt-4 rounded-full"
                style={{ background: 'linear-gradient(to right, transparent, var(--accent), transparent)' }}
              ></motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* 主要行动区域 - 占据视觉中心 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border mb-8"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="text-center">
            {/* 行动标题 */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-6"
            >
              <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {suggestion.action.name}
              </h3>
              <div className="w-12 h-1 rounded-full mx-auto" style={{ background: 'linear-gradient(to right, var(--accent), var(--accent))' }}></div>
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
                  <div className="w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-full border-4 animate-breathe flex items-center justify-center" style={{ borderColor: 'var(--accent)' }}>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to right, var(--accent), var(--accent))' }}>
                      <span className="text-xl sm:text-2xl text-white">🫁</span>
                    </div>
                  </div>
                  <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>跟着圆圈一起呼吸</p>
                </div>
              )}

              {suggestion.action.type === 'physical' && (
                <div className="relative">
                  <div className="w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to right, rgba(251, 146, 60, 0.2), rgba(239, 68, 68, 0.2))' }}>
                    <span className="text-5xl sm:text-6xl">💪</span>
                  </div>
                  <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>让身体动起来</p>
                </div>
              )}

              {suggestion.action.type === 'cognitive' && (
                <div className="relative">
                  <div className="w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to right, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))' }}>
                    <span className="text-5xl sm:text-6xl">🧘‍♀️</span>
                  </div>
                  <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>专注内心感受</p>
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
              <p className="text-base sm:text-lg font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {suggestion.action.instruction}
              </p>
            </motion.div>

            {/* 倒计时 - 仅在未完成时显示 */}
            {!isComplete && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="mb-6"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--accent)' }}>
                    {countdown}
                  </div>
                  <span className="text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>秒</span>
                </div>

                {/* 进度条 - 更醒目 */}
                <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: initialCountdown, ease: 'linear' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(to right, var(--accent), var(--accent))' }}
                  />
                </div>

                <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>专注这一刻，你做得很好</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* 完成按钮 */}
        {isComplete && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <motion.button
              onClick={handleContinueChat}
              className="w-full text-lg py-4 rounded-xl text-white font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--accent)' }}
              whileTap={{ scale: 0.95 }}
            >
              💬 继续聊聊
            </motion.button>
            
            <motion.button
              onClick={handleWantQuiet}
              className="w-full text-lg py-4 rounded-xl font-medium transition-all hover:opacity-80"
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              🌙 我想静一静
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default SOSCardPage
