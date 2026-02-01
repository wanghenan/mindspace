import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FirstAidSuggestion } from '../types'
import { EmotionType } from '../data/firstAidContent'
import { useAppStore } from '../store/useAppStore'

interface LocationState {
  emotionType?: EmotionType
  suggestion?: FirstAidSuggestion
  completed?: boolean
  intensity?: string
  bodyFeelings?: string[]
  customInput?: string
  analysisResult?: {
    emotionType?: string
  }
}

const SOSFeedbackPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState
  const addEmotionRecord = useAppStore(state => state.addEmotionRecord)

  // 获取情绪类型：优先使用分析结果，其次使用传递的类型
  const getEmotionType = (): string => {
    return state.analysisResult?.emotionType || 
           state.emotionType || 
           '未知情绪'
  }

  const handleFeelBetter = async () => {
    const emotionType = getEmotionType()
    console.log('[SOSFeedback] 保存情绪记录 - 好多了:', { 
      emotionType, 
      intensity: state.intensity,
      bodyFeelings: state.bodyFeelings,
      customInput: state.customInput
    })
    
    // 验证必需数据
    if (!state.intensity) {
      console.error('[SOSFeedback] ❌ 缺少 intensity 数据，跳过保存')
      navigate('/', { replace: true })
      return
    }

    // 保存情绪记录
    try {
      await addEmotionRecord({
        emotion: emotionType,
        intensity: state.intensity === 'extreme' ? 10 : 
                   state.intensity === 'severe' ? 8 : 
                   state.intensity === 'moderate' ? 5 : 3,
        trigger: state.customInput || undefined,
        context: state.bodyFeelings?.length ? state.bodyFeelings.join(', ') : undefined,
        copingMethod: 'sos-first-aid',
        effectiveness: 4 // 感觉好多了
      })
      console.log('[SOSFeedback] ✅ 情绪记录保存成功')
    } catch (error) {
      console.error('[SOSFeedback] ❌ 保存情绪记录失败:', error)
    }
    
    // 返回首页
    navigate('/', { replace: true })
  }

  const handleStillBad = async () => {
    const emotionType = getEmotionType()
    console.log('[SOSFeedback] 保存情绪记录 - 还是很痛苦:', { emotionType, intensity: state.intensity })
    
    // 验证必需数据
    if (!state.intensity) {
      console.error('[SOSFeedback] ❌ 缺少 intensity 数据，跳过保存')
      navigate('/chat', { 
        state: { 
          fromSOS: true,
          emotionType: emotionType 
        } 
      })
      return
    }
    
    // 保存情绪记录（效果较差）
    try {
      await addEmotionRecord({
        emotion: emotionType,
        intensity: state.intensity === 'extreme' ? 10 : 
                   state.intensity === 'severe' ? 8 : 
                   state.intensity === 'moderate' ? 5 : 3,
        trigger: state.customInput || undefined,
        context: state.bodyFeelings?.length ? state.bodyFeelings.join(', ') : undefined,
        copingMethod: 'sos-first-aid',
        effectiveness: 2 // 效果不太好
      })
      console.log('[SOSFeedback] ✅ 情绪记录保存成功')
    } catch (error) {
      console.error('[SOSFeedback] ❌ 保存情绪记录失败:', error)
    }
    
    // 推荐进入AI对话
    navigate('/chat', { 
      state: { 
        fromSOS: true,
        emotionType: emotionType
      } 
    })
  }

  const handleWantToChat = async () => {
    const emotionType = getEmotionType()
    console.log('[SOSFeedback] 保存情绪记录 - 想聊聊:', { emotionType, intensity: state.intensity })
    
    // 验证必需数据
    if (!state.intensity) {
      console.error('[SOSFeedback] ❌ 缺少 intensity 数据，跳过保存')
      navigate('/chat', { 
        state: { 
          fromSOS: true,
          emotionType: emotionType 
        } 
      })
      return
    }
    
    // 保存情绪记录
    try {
      await addEmotionRecord({
        emotion: emotionType,
        intensity: state.intensity === 'extreme' ? 10 : 
                   state.intensity === 'severe' ? 8 : 
                   state.intensity === 'moderate' ? 5 : 3,
        trigger: state.customInput || undefined,
        context: state.bodyFeelings?.length ? state.bodyFeelings.join(', ') : undefined,
        copingMethod: 'sos-first-aid',
        effectiveness: 3 // 中等效果
      })
      console.log('[SOSFeedback] ✅ 情绪记录保存成功')
    } catch (error) {
      console.error('[SOSFeedback] ❌ 保存情绪记录失败:', error)
    }
    
    // 无缝跳转到AI对话
    navigate('/chat', { 
      state: { 
        fromSOS: true,
        emotionType: emotionType
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
