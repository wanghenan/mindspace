import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'

const SOSEmotionPage = () => {
  const navigate = useNavigate()
  const [emotionIntensity, setEmotionIntensity] = useState<string>('')
  const [bodyFeelings, setBodyFeelings] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')

  // 情绪强度选项
  const intensityOptions = [
    { id: 'mild', emoji: '😌', text: '还好', description: '有点不舒服' },
    { id: 'moderate', emoji: '😟', text: '有点难受', description: '明显的不适感' },
    { id: 'severe', emoji: '😰', text: '很痛苦', description: '很难承受' },
    { id: 'extreme', emoji: '😭', text: '快崩溃了', description: '已经到极限' },
  ]

  // 身体感受选项
  const bodyFeelingOptions = [
    { id: 'heartbeat', emoji: '💓', text: '心跳快' },
    { id: 'shaking', emoji: '🤲', text: '手发抖' },
    { id: 'angry', emoji: '😤', text: '想发火' },
    { id: 'crying', emoji: '😢', text: '想哭' },
    { id: 'tired', emoji: '😴', text: '很累' },
    { id: 'chest', emoji: '🫁', text: '胸口闷' },
    { id: 'headache', emoji: '🤕', text: '头很痛' },
    { id: 'nausea', emoji: '🤢', text: '想吐' },
  ]

  const handleIntensitySelect = (intensityId: string) => {
    setEmotionIntensity(intensityId)
  }

  const handleBodyFeelingToggle = (feelingId: string) => {
    setBodyFeelings(prev => {
      if (prev.includes(feelingId)) {
        return prev.filter(id => id !== feelingId)
      } else {
        // 最多选择3个身体感受
        if (prev.length >= 3) {
          return [...prev.slice(1), feelingId]
        }
        return [...prev, feelingId]
      }
    })
  }

  const handleContinue = () => {
    if (!emotionIntensity) return
    
    // 跳转到AI分析页面
    navigate('/sos/analysis', {
      state: {
        intensity: emotionIntensity,
        bodyFeelings,
        customInput: customInput.trim(),
        timestamp: Date.now()
      }
    })
  }

  const hasRequiredInput = emotionIntensity !== ''

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="mb-4">
          <span className="text-4xl">💙</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">
          你现在怎么了？
        </h2>
        <p className="text-neutral-600 text-sm">
          我们一步步来了解你的感受
        </p>
      </motion.div>

      <div className="w-full max-w-sm space-y-8">
        {/* Step 1: 情绪强度评估 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-lg font-medium text-neutral-800 mb-4 text-center">
            你现在感觉有多难受？
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {intensityOptions.map((option, index) => {
              const isSelected = emotionIntensity === option.id
              return (
                <motion.button
                  key={option.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => handleIntensitySelect(option.id)}
                  className={`p-4 rounded-2xl border-2 transition-all text-center ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-2xl mb-2">{option.emoji}</div>
                  <div className="font-medium text-sm mb-1">{option.text}</div>
                  <div className="text-xs text-neutral-500">{option.description}</div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Step 2: 身体感受选择 */}
        {emotionIntensity && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-medium text-neutral-800 mb-4 text-center">
              你的身体有什么感觉？
            </h3>
            <p className="text-sm text-neutral-500 text-center mb-4">
              最多选择3个，可以不选
            </p>
            <div className="grid grid-cols-2 gap-3">
              {bodyFeelingOptions.map((feeling, index) => {
                const isSelected = bodyFeelings.includes(feeling.id)
                return (
                  <motion.button
                    key={feeling.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    onClick={() => handleBodyFeelingToggle(feeling.id)}
                    className={`p-3 rounded-xl border transition-all text-center relative ${
                      isSelected
                        ? 'border-secondary-400 bg-secondary-50 text-secondary-700'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-1 right-1 w-4 h-4 bg-secondary-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-xs font-bold">✓</span>
                      </motion.div>
                    )}
                    <div className="text-lg mb-1">{feeling.emoji}</div>
                    <div className="text-xs font-medium">{feeling.text}</div>
                  </motion.button>
                )
              })}
            </div>
            {bodyFeelings.length > 0 && (
              <p className="text-xs text-center text-neutral-500 mt-2">
                已选择 {bodyFeelings.length}/3 个
              </p>
            )}
          </motion.div>
        )}

        {/* Step 3: 文字描述 */}
        {emotionIntensity && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-medium text-neutral-800 mb-4 text-center">
              还想告诉我什么吗？
            </h3>
            <p className="text-sm text-neutral-500 text-center mb-4">
              可以详细说说发生了什么（选填）
            </p>
            <div className="relative">
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="比如：刚才开会被批评了，感觉很委屈..."
                className="w-full p-4 border border-neutral-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                rows={3}
                maxLength={200}
              />
              <div className="absolute bottom-2 right-2 text-xs text-neutral-400">
                {customInput.length}/200
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Continue Button */}
      {hasRequiredInput && (
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={handleContinue}
          className="btn-primary w-full max-w-sm mt-8 mb-4 flex items-center justify-center gap-3"
          whileTap={{ scale: 0.95 }}
        >
          下一步
          <span className="text-xl arrow-right">→</span>
        </motion.button>
      )}

      {/* Back Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        onClick={() => navigate('/')}
        className="btn-secondary flex items-center justify-center gap-2"
      >
        <span className="text-lg arrow-left">←</span>
        返回首页
      </motion.button>
    </div>
  )
}

export default SOSEmotionPage