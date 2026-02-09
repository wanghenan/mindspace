// AI提供商类型定义
export type AIProviderId =
  | 'hunyuan'
  | 'openai'
  | 'zhipu'
  | 'grok'
  | 'gemini'
  | 'deepseek'
  | 'minimax'
  | 'alibaba'

// AI提供商配置接口
export interface AIProvider {
  id: AIProviderId
  name: string
  baseUrl: string
  defaultModel: string
  description: string
  features: string[]
}

// 所有支持的AI提供商配置
const PROVIDERS: Record<AIProviderId, AIProvider> = {
  hunyuan: {
    id: 'hunyuan',
    name: '腾讯混元',
    baseUrl: 'https://hunyuan.cloud.tencent.com',
    defaultModel: 'hunyuan-pro',
    description: '腾讯混元大模型',
    features: ['多轮对话', '文本生成', '语义理解']
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4',
    description: 'OpenAI GPT系列模型',
    features: ['多轮对话', '代码生成', '创意写作']
  },
  zhipu: {
    id: 'zhipu',
    name: '智谱AI',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4',
    description: '智谱清言GLM大模型',
    features: ['多轮对话', '知识问答', '文本创作']
  },
  grok: {
    id: 'grok',
    name: 'Grok',
    baseUrl: 'https://api.x.ai/v1',
    defaultModel: 'grok-beta',
    description: 'xAI Grok大模型',
    features: ['实时信息', '幽默对话', '深度思考']
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-pro',
    description: 'Google Gemini大模型',
    features: ['多模态', '长文本', '逻辑推理']
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    description: 'DeepSeek推理大模型',
    features: ['代码生成', '数学推理', '深度分析']
  },
  minimax: {
    id: 'minimax',
    name: 'MiniMax',
    baseUrl: 'https://api.minimax.chat/v1',
    defaultModel: 'abab6.5s-chat',
    description: 'MiniMax海螺AI',
    features: ['快速响应', '多轮对话', '情感理解']
  },
  alibaba: {
    id: 'alibaba',
    name: '阿里云通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    description: '阿里云通义千问大模型',
    features: ['中文优化', '知识覆盖', '稳定可靠']
  }
}

// 默认提供商
export const DEFAULT_PROVIDER: AIProviderId = 'hunyuan'

// 获取指定提供商配置
export function getProvider(id: AIProviderId): AIProvider | undefined {
  console.log(`[Provider Registry] 获取提供商: ${id}`)
  const provider = PROVIDERS[id]
  if (provider) {
    console.log(`[Provider Registry] 找到提供商: ${provider.name}`)
  } else {
    console.warn(`[Provider Registry] 未找到提供商: ${id}`)
  }
  return provider
}

// 获取所有提供商配置
export function getAllProviders(): AIProvider[] {
  console.log('[Provider Registry] 获取所有提供商')
  const providers = Object.values(PROVIDERS)
  console.log(`[Provider Registry] 找到 ${providers.length} 个提供商`)
  return providers
}

// 提供商注册表对象
export const PROVIDER_REGISTRY = {
  // 获取所有提供商
  getAll: (): AIProvider[] => getAllProviders(),

  // 根据ID获取提供商
  getById: (id: AIProviderId): AIProvider | undefined => getProvider(id),

  // 检查提供商是否存在
  has: (id: AIProviderId): boolean => {
    const exists = id in PROVIDERS
    console.log(`[Provider Registry] 检查提供商是否存在: ${id} -> ${exists}`)
    return exists
  },

  // 获取提供商ID列表
  getIds: (): AIProviderId[] => {
    return Object.keys(PROVIDERS) as AIProviderId[]
  },

  // 根据特征筛选提供商
  filterByFeature: (feature: string): AIProvider[] => {
    console.log(`[Provider Registry] 筛选具有特征 "${feature}" 的提供商`)
    return getAllProviders().filter(provider =>
      provider.features.includes(feature)
    )
  },

  // 获取默认提供商
  getDefault: (): AIProvider => {
    const defaultProvider = getProvider(DEFAULT_PROVIDER)
    if (!defaultProvider) {
      throw new Error(`默认提供商 ${DEFAULT_PROVIDER} 未配置`)
    }
    return defaultProvider
  }
}
