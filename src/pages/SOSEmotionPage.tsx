import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'

const SOSEmotionPage = () => {
  const navigate = useNavigate()
  const [emotionIntensity, setEmotionIntensity] = useState<string>('')
  const [bodyFeelings, setBodyFeelings] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const addEmotionRecord = useAppStore(state => state.addEmotionRecord)

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

  const handleContinue = async () => {
    if (!emotionIntensity) return
    
    // 立即保存情绪记录（初步记录，不包含分析结果）
    const intensityValue = emotionIntensity === 'extreme' ? 10 : 
                          emotionIntensity === 'severe' ? 8 : 
                          emotionIntensity === 'moderate' ? 5 : 3
    
    console.log('[SOSEmotionPage] 保存初步情绪记录:', {
      intensity: emotionIntensity,
      intensityValue,
      bodyFeelings,
      customInput
    })
    
    try {
      await addEmotionRecord({
        emotion: '待分析',  // 待AI分析后更新
        intensity: intensityValue,
        trigger: customInput.trim() || undefined,
        context: bodyFeelings.length ? bodyFeelings.join(', ') : undefined,
        copingMethod: 'sos-initial',
        effectiveness: undefined  // 尚未评估
      })
      console.log('[SOSEmotionPage] ✅ 初步情绪记录保存成功')
    } catch (error) {
      console.error('[SOSEmotionPage] ❌ 保存初步情绪记录失败:', error)
    }
    
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
    <div className="flex flex-col items-center justify-center min-h-screen px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
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
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          你现在怎么了？
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
          <h3 className="text-lg font-medium mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
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
                  className="p-4 rounded-2xl border-2 transition-all text-center"
                  style={{
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border-color)',
                    backgroundColor: isSelected ? 'var(--bg-secondary)' : 'transparent',
                    color: 'var(--text-primary)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-2xl mb-2">{option.emoji}</div>
                  <div className="font-medium text-sm mb-1">{option.text}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{option.description}</div>
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
            <h3 className="text-lg font-medium mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
              你的身体有什么感觉？
            </h3>
            <p className="text-sm text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
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
                    className="p-3 rounded-xl border transition-all text-center relative"
                    style={{
                      borderColor: isSelected ? 'var(--accent)' : 'var(--border-color)',
                      backgroundColor: isSelected ? 'var(--bg-secondary)' : 'transparent',
                      color: 'var(--text-primary)'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--accent)' }}
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
              <p className="text-xs text-center mt-2" style={{ color: 'var(--text-secondary)' }}>
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
            <h3 className="text-lg font-medium mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
              还想告诉我什么吗？
            </h3>
            <p className="text-sm text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
              可以详细说说发生了什么（选填）
            </p>
            <div className="relative">
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="比如：刚才开会被批评了，感觉很委屈..."
                className="w-full p-4 border rounded-2xl resize-none focus:outline-none transition-all text-sm"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}
                rows={3}
                maxLength={200}
              />
              <div className="absolute bottom-2 right-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
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
          className="w-full max-w-sm mt-8 mb-4 flex items-center justify-center gap-3 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--accent)' }}
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
        className="flex items-center justify-center gap-2 mb-8 px-6 py-3 rounded-xl font-medium transition-all hover:opacity-80"
        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
      >
        <span className="text-lg arrow-left">←</span>
        返回首页
      </motion.button>
    </div>
  )
}

export default SOSEmotionPage