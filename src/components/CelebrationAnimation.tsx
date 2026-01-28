import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CelebrationAnimationProps {
  isVisible: boolean
  onComplete: () => void
}

// 鼓励文字库
const encouragementTexts = [
  { title: "太棒了！", subtitle: "你已经迈出了重要的一步 ✨" },
  { title: "做得很好！", subtitle: "每一次调节都是成长 🌱" },
  { title: "你真勇敢！", subtitle: "面对情绪需要很大的勇气 💪" },
  { title: "继续加油！", subtitle: "你比想象中更坚强 🌟" },
  { title: "真为你骄傲！", subtitle: "学会照顾自己很了不起 💖" },
  { title: "你做到了！", subtitle: "这一刻的平静来之不易 🕊️" },
  { title: "超级棒！", subtitle: "情绪管理大师就是你 🎯" },
  { title: "Amazing！", subtitle: "你的努力值得被看见 👏" }
]

// 动画效果类型
type AnimationType = 'petals' | 'fireworks' | 'rainbow' | 'stars' | 'hearts' | 'bubbles' | 'confetti' | 'snowflakes'

const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({ isVisible, onComplete }) => {
  const [animationType, setAnimationType] = useState<AnimationType>('petals')
  const [encouragement, setEncouragement] = useState(encouragementTexts[0])
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; emoji: string; delay: number }>>([])

  useEffect(() => {
    if (isVisible) {
      // 随机选择动画类型
      const animations: AnimationType[] = ['petals', 'fireworks', 'rainbow', 'stars', 'hearts', 'bubbles', 'confetti', 'snowflakes']
      const randomAnimation = animations[Math.floor(Math.random() * animations.length)]
      setAnimationType(randomAnimation)

      // 随机选择鼓励文字
      const randomEncouragement = encouragementTexts[Math.floor(Math.random() * encouragementTexts.length)]
      setEncouragement(randomEncouragement)

      // 根据动画类型生成不同的粒子
      generateParticles(randomAnimation)

      // 3秒后完成
      const timer = setTimeout(() => {
        console.log('Celebration animation completed, calling onComplete')
        onComplete()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  const generateParticles = (type: AnimationType) => {
    const particleCount = 25
    let emojis: string[] = []
    
    switch (type) {
      case 'petals':
        emojis = ['🌸', '🌺', '🌻', '🌷', '🌹', '💐']
        break
      case 'fireworks':
        emojis = ['✨', '🎆', '🎇', '💫', '⭐', '🌟']
        break
      case 'rainbow':
        emojis = ['🌈', '🦄', '✨', '💎', '🔮', '🎨']
        break
      case 'stars':
        emojis = ['⭐', '🌟', '✨', '💫', '🌠', '⚡']
        break
      case 'hearts':
        emojis = ['💖', '💕', '💗', '💓', '💝', '💘']
        break
      case 'bubbles':
        emojis = ['🫧', '💙', '🔵', '🟦', '💎', '✨']
        break
      case 'confetti':
        emojis = ['🎊', '🎉', '🎈', '🎁', '🏆', '🥳']
        break
      case 'snowflakes':
        emojis = ['❄️', '⭐', '✨', '🔷', '💎', '🌟']
        break
    }

    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      delay: Math.random() * 1
    }))
    
    setParticles(newParticles)
  }

  // 获取背景渐变样式
  const getBackgroundGradient = () => {
    switch (animationType) {
      case 'petals':
        return 'from-pink-100 via-rose-50 to-red-100'
      case 'fireworks':
        return 'from-purple-100 via-blue-50 to-indigo-100'
      case 'rainbow':
        return 'from-red-100 via-yellow-50 via-green-50 via-blue-50 to-purple-100'
      case 'stars':
        return 'from-indigo-100 via-purple-50 to-blue-100'
      case 'hearts':
        return 'from-pink-100 via-red-50 to-rose-100'
      case 'bubbles':
        return 'from-blue-100 via-cyan-50 to-teal-100'
      case 'confetti':
        return 'from-yellow-100 via-orange-50 to-red-100'
      case 'snowflakes':
        return 'from-blue-100 via-white to-cyan-100'
      default:
        return 'from-pink-100 via-purple-50 to-blue-100'
    }
  }

  // 获取中心图标
  const getCenterIcon = () => {
    switch (animationType) {
      case 'petals': return '🌸'
      case 'fireworks': return '🎆'
      case 'rainbow': return '🌈'
      case 'stars': return '⭐'
      case 'hearts': return '💖'
      case 'bubbles': return '🫧'
      case 'confetti': return '🎊'
      case 'snowflakes': return '❄️'
      default: return '🎉'
    }
  }

  // 渲染特殊效果
  const renderSpecialEffect = () => {
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 800
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 600

    switch (animationType) {
      case 'rainbow':
        return (
          <motion.div
            initial={{ scale: 0, opacity: 0, x: '-50%' }}
            animate={{ scale: 1, opacity: 0.8, x: '-50%' }}
            exit={{ scale: 0, opacity: 0, x: '-50%' }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="fixed top-1/4 left-1/2 z-50"
          >
            <div className="w-80 h-40 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 opacity-70 shadow-2xl"></div>
          </motion.div>
        )
      
      case 'fireworks':
        return (
          <div className="fixed inset-0 z-50 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1, 1.5] }}
                transition={{ 
                  duration: 1.5,
                  delay: 1 + i * 0.5,
                  times: [0, 0.5, 1]
                }}
                className={`absolute ${i === 0 ? 'top-1/4 left-1/4' : i === 1 ? 'top-1/3 right-1/4' : 'bottom-1/3 left-1/2'}`}
              >
                <div className="relative">
                  {Array.from({ length: 12 }).map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: [0, 1, 0],
                        x: Math.cos(j * 30 * Math.PI / 180) * 60,
                        y: Math.sin(j * 30 * Math.PI / 180) * 60
                      }}
                      transition={{ 
                        duration: 1.2,
                        delay: 1 + i * 0.5 + j * 0.05
                      }}
                      className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg"
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )
      
      case 'hearts':
        return (
          <div className="fixed inset-0 z-50 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  opacity: [0, 1, 0.8],
                  y: [0, -20, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: 0.5 + i * 0.2,
                  repeat: 1,
                  repeatType: 'reverse'
                }}
                className="absolute text-4xl"
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${30 + (i % 2) * 20}%`
                }}
              >
                💖
              </motion.div>
            ))}
          </div>
        )
      
      case 'stars':
        return (
          <div className="fixed inset-0 z-50 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 1.5, 1],
                  opacity: [0, 1, 0.6],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 3,
                  delay: 0.3 + i * 0.1,
                  ease: "easeOut"
                }}
                className="absolute text-3xl"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 60 + 20}%`
                }}
              >
                ⭐
              </motion.div>
            ))}
          </div>
        )
      
      case 'confetti':
        return (
          <div className="fixed inset-0 z-50 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: windowWidth / 2,
                  y: windowHeight / 2,
                  scale: 0,
                  rotate: 0
                }}
                animate={{ 
                  x: Math.random() * windowWidth,
                  y: Math.random() * windowHeight,
                  scale: [0, 1, 0.8],
                  rotate: [0, 720]
                }}
                transition={{ 
                  duration: 2,
                  delay: 0.5 + i * 0.05,
                  ease: "easeOut"
                }}
                className="absolute w-4 h-4 rounded"
                style={{
                  backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][i % 6]
                }}
              />
            ))}
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 bg-gradient-to-br ${getBackgroundGradient()} z-50`}
          />

          {/* 中心文字 */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-7xl mb-6"
              >
                {getCenterIcon()}
              </motion.div>
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-4xl font-bold text-primary-700 mb-3"
              >
                {encouragement.title}
              </motion.h2>
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xl text-neutral-700 max-w-sm mx-auto"
              >
                {encouragement.subtitle}
              </motion.p>
            </div>
          </motion.div>

          {/* 特殊效果 */}
          {renderSpecialEffect()}

          {/* 飘落的粒子 */}
          {particles.map((particle) => {
            const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 800
            const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 600
            
            let animationVariant

            switch (animationType) {
              case 'bubbles':
                // 气泡上升效果
                animationVariant = {
                  initial: { 
                    x: particle.x, 
                    y: windowHeight + 50, 
                    opacity: 0,
                    scale: 0
                  },
                  animate: { 
                    x: particle.x + (Math.random() - 0.5) * 100,
                    y: -50,
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1, 1.2, 0],
                    rotate: [0, 180]
                  }
                }
                break
              
              case 'snowflakes':
                // 雪花飘落效果
                animationVariant = {
                  initial: { 
                    x: particle.x, 
                    y: -50, 
                    opacity: 0,
                    scale: 0,
                    rotate: 0
                  },
                  animate: { 
                    x: particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 100,
                    y: windowHeight + 50,
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1, 1, 0],
                    rotate: [0, 360, 720]
                  }
                }
                break
              
              case 'confetti':
                // 彩纸爆炸效果
                animationVariant = {
                  initial: { 
                    x: windowWidth / 2, 
                    y: windowHeight / 2, 
                    opacity: 0,
                    scale: 0,
                    rotate: 0
                  },
                  animate: { 
                    x: particle.x,
                    y: particle.y,
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.5, 1, 0],
                    rotate: [0, 720]
                  }
                }
                break
              
              default:
                // 默认飘落效果
                animationVariant = {
                  initial: { 
                    x: particle.x, 
                    y: -50, 
                    opacity: 0,
                    scale: 0
                  },
                  animate: { 
                    x: particle.x + (Math.random() - 0.5) * 200,
                    y: windowHeight + 50,
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1, 1, 0],
                    rotate: [0, 360]
                  }
                }
            }

            return (
              <motion.div
                key={particle.id}
                initial={animationVariant.initial}
                animate={animationVariant.animate}
                transition={{ 
                  duration: animationType === 'bubbles' ? 4 : animationType === 'confetti' ? 2.5 : 3.5,
                  delay: particle.delay,
                  ease: "easeOut"
                }}
                className="fixed text-3xl z-50 pointer-events-none"
                style={{ left: 0, top: 0 }}
              >
                {particle.emoji}
              </motion.div>
            )
          })}
        </>
      )}
    </AnimatePresence>
  )
}

export default CelebrationAnimation