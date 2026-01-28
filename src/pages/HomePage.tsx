import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const HomePage = () => {
  const navigate = useNavigate()

  const handleSOSClick = () => {
    navigate('/sos/emotion')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      {/* Logo和标题 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-xl">
          <span className="text-3xl text-white font-bold">M</span>
        </div>
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">MindSpace</h1>
        <p className="text-lg text-primary-600 font-medium">60秒情绪急救</p>
      </motion.div>

      {/* 产品描述 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center max-w-sm mb-10"
      >
        <p className="text-lg leading-relaxed font-medium">
          <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            当你感到情绪崩溃时
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            我们懂你，陪伴你
          </span>
        </p>
      </motion.div>

      {/* 开始急救按钮 */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        onClick={handleSOSClick}
        className="btn-primary text-xl w-full max-w-xs flex items-center justify-center gap-3 mb-12 relative overflow-hidden"
        whileTap={{ scale: 0.95 }}
      >
        {/* 添加微妙的脉冲效果 */}
        <motion.div
          animate={{ 
            boxShadow: [
              "0 0 0 0 rgba(107, 115, 255, 0.4)",
              "0 0 0 10px rgba(107, 115, 255, 0)",
              "0 0 0 0 rgba(107, 115, 255, 0.4)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl"
        />
        开始急救
        <span className="text-2xl arrow-right">→</span>
      </motion.button>

      {/* 功能说明 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center max-w-sm"
      >
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">⚡</div>
            <p className="text-sm font-medium bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">秒级响应</p>
            <p className="text-xs text-neutral-500">随时在线</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">💬</div>
            <p className="text-sm font-medium bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">AI共情</p>
            <p className="text-xs text-neutral-500">深度理解</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🔒</div>
            <p className="text-sm font-medium bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">私密空间</p>
            <p className="text-xs text-neutral-500">安全无忧</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default HomePage
