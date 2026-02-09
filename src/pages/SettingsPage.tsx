import React from 'react'
import { motion } from 'framer-motion'
import ProviderSelector from '../components/settings/ProviderSelector'
import ApiKeySection from '../components/settings/ApiKeySection'
import ModelSelector from '../components/settings/ModelSelector'

const SettingsPage: React.FC = () => {

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            AI 设置
          </h1>
          <p
            className="text-sm md:text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            配置您的 AI 提供商和模型偏好
          </p>
        </motion.div>

        {/* Provider Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <div className="mb-4">
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              选择提供商
            </h2>
            <p
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              选择您偏好的 AI 服务提供商
            </p>
          </div>
          <ProviderSelector />
        </motion.div>

        {/* API Key Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <ApiKeySection />
        </motion.div>

        {/* Model Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="mb-4">
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              选择模型
            </h2>
            <p
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              为选中的提供商选择默认模型
            </p>
          </div>
          <ModelSelector />
        </motion.div>
      </div>
    </div>
  )
}

export default SettingsPage
