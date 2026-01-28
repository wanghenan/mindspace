import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { analyzeEmotion } from '../services/aiService'

interface AnalysisState {
  intensity: string
  bodyFeelings: string[]
  customInput: string
  timestamp: number
}

const SOSAnalysisPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [analysisStep, setAnalysisStep] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

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
      // 模拟分析步骤 - 更自然的时间间隔
      const stepDelays = [1200, 1800, 1500, 2000] // 不同步骤不同的等待时间
      
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
      
      // 出错时使用默认方案
      setTimeout(() => {
        navigate('/sos/card/anxiety', { state })
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
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
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
            <div className="w-full h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white">💙</span>
            </div>
          </motion.div>
        </div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">
          我在认真了解你的感受
        </h2>
        <p className="text-neutral-600 text-sm">
          每个人的情绪都值得被温柔对待
        </p>
      </motion.div>

      {/* 用户输入摘要 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card w-full max-w-sm mb-8"
      >
        <h3 className="font-medium text-neutral-800 mb-3">我听到了这些</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">难受程度:</span>
            <span className="text-neutral-800 font-medium">{getIntensityText(state?.intensity)}</span>
          </div>
          {state?.bodyFeelings && state.bodyFeelings.length > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-600">身体感受:</span>
              <span className="text-neutral-800 font-medium text-right flex-1 ml-2">
                {getBodyFeelingText(state.bodyFeelings)}
              </span>
            </div>
          )}
          {state?.customInput && (
            <div className="pt-2 border-t border-neutral-100">
              <span className="text-neutral-600 text-xs">详细描述:</span>
              <p className="text-neutral-800 text-xs mt-1 leading-relaxed">
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
            className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-all ${
              analysisStep >= index 
                ? 'bg-primary-50 text-primary-700' 
                : 'bg-neutral-50 text-neutral-500'
            }`}
          >
            <span className="text-xl">{step.icon}</span>
            <span className="font-medium text-sm">{step.text}</span>
            {analysisStep === index && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="ml-auto"
              >
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
              </motion.div>
            )}
            {analysisStep > index && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto text-primary-500"
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
          <p className="text-primary-600 font-medium">
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
          <p className="text-orange-600 font-medium text-sm">
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
        className="btn-secondary mt-8 flex items-center justify-center gap-2"
      >
        <span className="text-lg arrow-left">←</span>
        重新告诉我
      </motion.button>
    </div>
  )
}

export default SOSAnalysisPage