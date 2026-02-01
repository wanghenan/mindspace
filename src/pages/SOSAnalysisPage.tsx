import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { analyzeEmotion } from '../services/aiService'
import { useAppStore } from '../store/useAppStore'

interface AnalysisState {
  intensity: string
  bodyFeelings: string[]
  customInput: string
  timestamp: number
  emotionRecordId: string | null
}

const SOSAnalysisPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [analysisStep, setAnalysisStep] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const updateEmotionRecord = useAppStore(state => state.updateEmotionRecord)

  const state = location.state as AnalysisState

  // 分析步骤文案 - 更温暖人性化
  const analysisSteps = [
    { text: '我在仔细听你说...', icon: '👂' },
    { text: '感受到你的不容易了...', icon: '💙' },
    { text: '在为你寻找最合适的方法...', icon: '🔍' },
    { text: '马上就好，请再等我一下...', icon: '✨' },
  ]

  useEffect(() => {
    if (!state) {
      navigate('/sos/emotion')
      return
    }

    performAnalysis()
  }, [state, navigate])

  const performAnalysis = async () => {
    try {
      // 模拟分析步骤 - 本地测试时缩短等待时间
      // 通过 window.location.hostname 判断是否为本地开发环境
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      const stepDelays = isLocalhost
        ? [1000, 1000, 1000, 2000]  // 本地开发: 5 秒
        : [1200, 1800, 1500, 2000]  // 生产环境: 7.5 秒

      for (let i = 0; i < analysisSteps.length; i++) {
        setAnalysisStep(i)
        await new Promise(resolve => setTimeout(resolve, stepDelays[i]))
      }

      // 调用AI分析服务
      const result = await analyzeEmotion({
        intensity: state.intensity,
        bodyFeelings: state.bodyFeelings,
        customInput: state.customInput
      })

      setAnalysisResult(result)

      // 更新情绪记录（无论AI成功还是使用备用分析）
      if (state.emotionRecordId) {
        console.log('[SOSAnalysisPage] 更新情绪记录:', {
          recordId: state.emotionRecordId,
          emotionType: result.emotionType,
          confidence: result.confidence,
          reasoning: result.reasoning
        })

        await updateEmotionRecord(state.emotionRecordId, {
          emotion: result.emotionType,
          context: result.reasoning,
          effectiveness: undefined  // 尚未评估
        })

        console.log('[SOSAnalysisPage] ✅ 情绪记录更新成功')
      }

      // 分析完成后跳转到急救卡片页面
      setTimeout(() => {
        navigate(`/sos/card/${result.emotionType}`, {
          state: {
            ...state,
            analysisResult: result
          }
        })
      }, 2000)

    } catch (err) {
      console.error('AI分析失败:', err)
      setError('遇到了一点小问题，不过没关系，我还有其他方法帮你')

      // 使用备用分析结果
      const fallbackResult = {
        emotionType: 'anxiety' as const,
        confidence: 0.5,
        reasoning: '基于规则匹配的备用分析',
        suggestions: [],
        empathyMessage: '遇到了一点小问题，让我们用最简单的方法帮你缓解'
      }

      // 即使出错也要更新情绪记录（使用备用分析）
      if (state.emotionRecordId) {
        console.log('[SOSAnalysisPage] AI分析失败，使用备用分析更新记录:', {
          recordId: state.emotionRecordId,
          emotionType: fallbackResult.emotionType
        })

        await updateEmotionRecord(state.emotionRecordId, {
          emotion: fallbackResult.emotionType,
          context: fallbackResult.reasoning,
          effectiveness: undefined
        })

        console.log('[SOSAnalysisPage] ✅ 备用分析记录更新成功')
      }

      // 出错时使用默认方案，确保传递完整的 state
      setTimeout(() => {
        navigate('/sos/card/anxiety', {
          state: {
            ...state,
            analysisResult: fallbackResult
          }
        })
      }, 2000)
    }
  }

  const getIntensityText = (intensity: string) => {
    const intensityMap = {
      mild: '轻微不适',
      moderate: '中等难受',
      severe: '很痛苦',
      extreme: '极度痛苦'
    }
    return intensityMap[intensity as keyof typeof intensityMap] || intensity
  }

  const getBodyFeelingText = (feelings: string[]) => {
    const feelingMap = {
      heartbeat: '心跳加速',
      shaking: '手部颤抖',
      angry: '愤怒情绪',
      crying: '想要哭泣',
      tired: '身体疲惫',
      chest: '胸闷气短',
      headache: '头部疼痛',
      nausea: '恶心想吐'
    }
    return feelings.map(f => feelingMap[f as keyof typeof feelingMap] || f).join('、')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent) 100%)' }}>
              <span className="text-2xl">💙</span>
            </div>
          </motion.div>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          我在认真了解你的感受
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          每个人的情绪都值得被温柔对待
        </p>
      </motion.div>

      {/* 用户输入摘要 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-sm mb-8 p-6 rounded-xl"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>我听到了这些</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>难受程度:</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{getIntensityText(state?.intensity)}</span>
          </div>
          {state?.bodyFeelings && state.bodyFeelings.length > 0 && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>身体感受:</span>
              <span className="font-medium text-right flex-1 ml-2" style={{ color: 'var(--text-primary)' }}>
                {getBodyFeelingText(state.bodyFeelings)}
              </span>
            </div>
          )}
          {state?.customInput && (
            <div className="pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>详细描述:</span>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                "{state.customInput}"
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* 分析步骤 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-sm mb-8"
      >
        {analysisSteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{
              x: 0,
              opacity: analysisStep >= index ? 1 : 0.3,
              scale: analysisStep === index ? 1.05 : 1
            }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl mb-2 transition-all"
            style={{
              backgroundColor: analysisStep >= index ? 'var(--bg-secondary)' : 'var(--bg-card)',
              color: analysisStep >= index ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            <span className="text-xl">{step.icon}</span>
            <span className="font-medium text-sm">{step.text}</span>
            {analysisStep === index && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="ml-auto"
              >
                <div className="w-4 h-4 rounded-full" style={{ border: '2px solid var(--accent)', borderTopColor: 'transparent' }}></div>
              </motion.div>
            )}
            {analysisStep > index && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto"
                style={{ color: 'var(--accent)' }}
              >
                ✓
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* 分析完成提示 */}
      {analysisResult && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="text-2xl mb-2">✨</div>
          <p className="font-medium" style={{ color: 'var(--accent)' }}>
            好了！我为你准备了一个特别的方法
          </p>
        </motion.div>
      )}

      {/* 错误提示 */}
      {error && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="text-2xl mb-2">⚠️</div>
          <p className="font-medium text-sm" style={{ color: '#f97316' }}>
            {error}
          </p>
        </motion.div>
      )}

      {/* 返回按钮 */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        onClick={() => navigate('/sos/emotion')}
        className="mt-8 px-6 py-3 rounded-xl flex items-center justify-center gap-2"
        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-lg arrow-left">←</span>
        重新告诉我
      </motion.button>
    </div>
  )
}

export default SOSAnalysisPage