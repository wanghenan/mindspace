import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAIConfigStore } from '../../store/aiConfigStore'
import { AI_PROVIDERS, type AIProviderId } from '../../types/aiProvider'

const ApiKeySection: React.FC = () => {
  const selectedProvider = useAIConfigStore((state) => state.selectedProvider)
  const setApiKey = useAIConfigStore((state) => state.setApiKey)
  const getApiKey = useAIConfigStore((state) => state.getApiKey)
  const validateApiKey = useAIConfigStore((state) => state.validateApiKey)

  const [apiKey, setApiKeyInput] = useState('')
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [showCurrentKey, setShowCurrentKey] = useState(false)

  const currentProvider = AI_PROVIDERS[selectedProvider]
  const storedKey = getApiKey(selectedProvider)
  const hasKey = !!storedKey

  useEffect(() => {
    setApiKeyInput('')
    setError('')
    setShowCurrentKey(false)
  }, [selectedProvider])

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('请输入 API Key')
      return
    }

    if (apiKey.length < 10) {
      setError('API Key 格式不正确')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      const isValid = await validateApiKey(selectedProvider, apiKey.trim())

      if (isValid) {
        setApiKey(selectedProvider, apiKey.trim())
        setApiKeyInput('')
        setIsValidating(false)
      } else {
        setError('API Key 验证失败，请检查后重试')
        setIsValidating(false)
      }
    } catch (err) {
      setError('验证失败，请检查网络连接')
      setIsValidating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  const maskKey = (key: string) => {
    if (key.length <= 8) return '*'.repeat(key.length)
    return `${key.substring(0, 4)}${'*'.repeat(key.length - 8)}${key.substring(key.length - 4)}`
  }

  const getHelpUrl = () => {
    const helpUrls: Record<AIProviderId, string> = {
      openai: 'https://platform.openai.com/api-keys',
      zhipu: 'https://open.bigmodel.cn/usercenter/apikeys',
      grok: 'https://console.x.ai/',
      gemini: 'https://aistudio.google.com/app/apikey',
      deepseek: 'https://platform.deepseek.com/api_keys',
      minimax: 'https://www.minimaxi.com/user-center/basic-information/interface-key',
      alibaba: 'https://bailian.console.aliyun.com/',
      hunyuan: '#',
    }
    return helpUrls[selectedProvider]
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: 'var(--bg-card)' }}
      role="region"
      aria-labelledby="apikey-heading"
    >
        <div className="mb-4">
          <h3
            className="text-lg font-semibold mb-1"
            style={{ color: 'var(--text-primary)' }}
            id="apikey-heading"
          >
            API Key 配置
          </h3>
          <p
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            为 {currentProvider.name} 配置 API Key
          </p>
        </div>

      {hasKey && !showCurrentKey && (
        <div
          className="mb-4 p-3 rounded-xl"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs text-white"
                style={{ backgroundColor: '#22c55e' }}
              >
                ✓
              </motion.span>
              <span
                className="text-sm font-mono"
                style={{ color: 'var(--text-secondary)' }}
              >
                {maskKey(storedKey || '')}
              </span>
            </div>
            <button
              onClick={() => setShowCurrentKey(true)}
              className="text-sm font-medium px-3 py-1 rounded-lg transition-all"
              style={{
                color: 'var(--accent)',
                backgroundColor: 'var(--accent-light)'
              }}
            >
              更改
            </button>
          </div>
        </div>
      )}

      {(!hasKey || showCurrentKey) && (
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {currentProvider.name} API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKeyInput(e.target.value)
                setError('')
              }}
              onKeyDown={handleKeyPress}
              disabled={isValidating}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: error ? '#EF4444' : 'var(--border-color)',
                color: 'var(--text-primary)',
                '--tw-ring-color': error ? '#EF4444' : 'var(--accent)'
              } as React.CSSProperties}
              aria-label={`${currentProvider.name} API Key`}
              aria-invalid={!!error}
              aria-describedby={error ? 'apikey-error' : undefined}
              placeholder="输入您的 API Key"
            />
            {error && (
              <motion.p
                id="apikey-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm mt-2"
                style={{ color: '#EF4444' }}
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isValidating || !apiKey.trim()}
              className="flex-1 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white'
              }}
            >
              {isValidating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  验证中...
                </span>
              ) : (
                '验证并保存'
              )}
            </motion.button>

            {hasKey && showCurrentKey && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowCurrentKey(false)
                  setApiKeyInput('')
                  setError('')
                }}
                disabled={isValidating}
                className="px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent'
                }}
              >
                取消
              </motion.button>
            )}
          </div>

          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--accent-light)' }}
          >
            <p
              className="text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              <strong style={{ color: 'var(--accent)' }}>如何获取 API Key：</strong>
              <br />
              访问{' '}
              <a
                href={getHelpUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: 'var(--accent)' }}
              >
                {currentProvider.name} 控制台
              </a>
              {' '}创建应用并获取 API Key
            </p>
          </div>

          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
          >
            <p
              className="text-xs"
              style={{ color: '#22c55e' }}
            >
              🔒 你的 API Key 仅存储在本地浏览器中，不会上传到任何服务器
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApiKeySection
