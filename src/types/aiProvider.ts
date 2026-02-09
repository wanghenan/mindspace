/**
 * AI Provider Configuration Types
 * 
 * Defines supported AI providers and their metadata.
 */

export type AIProviderId =
  | 'openai'
  | 'zhipu'
  | 'grok'
  | 'deepseek'
  | 'minimax'
  | 'alibaba';

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  envVarName: string;
  requiresApiKey: boolean;
  defaultModel?: string;
  apiBase?: string;
}

export const AI_PROVIDERS: Record<AIProviderId, AIProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    envVarName: 'VITE_OPENAI_API_KEY',
    requiresApiKey: true,
    defaultModel: 'gpt-4o-mini',
    apiBase: 'https://api.openai.com/v1',
  },
  zhipu: {
    id: 'zhipu',
    name: 'Zhipu AI',
    envVarName: 'VITE_ZHIPU_API_KEY',
    requiresApiKey: true,
    defaultModel: 'glm-4-flash',
    apiBase: 'https://open.bigmodel.cn/api/paas/v4',
  },
  grok: {
    id: 'grok',
    name: 'Grok',
    envVarName: 'VITE_GROK_API_KEY',
    requiresApiKey: true,
    defaultModel: 'grok-beta',
    apiBase: 'https://api.x.ai/v1',
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    envVarName: 'VITE_DEEPSEEK_API_KEY',
    requiresApiKey: true,
    defaultModel: 'deepseek-chat',
    apiBase: 'https://api.deepseek.com/v1',
  },
  minimax: {
    id: 'minimax',
    name: 'MiniMax',
    envVarName: 'VITE_MINIMAX_API_KEY',
    requiresApiKey: true,
    defaultModel: 'abab6.5s-chat',
    apiBase: 'https://api.minimax.chat/v1',
  },
  alibaba: {
    id: 'alibaba',
    name: 'Alibaba DashScope',
    envVarName: 'VITE_DASHSCOPE_API_KEY',
    requiresApiKey: true,
    defaultModel: 'qwen-plus',
    apiBase: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
};

export interface ApiKeySource {
  key: string;
  source: 'localStorage' | 'env' | 'cloudbase-env' | 'none';
}

/**
 * Default provider (requires API key - more practical for users)
 */
export const DEFAULT_PROVIDER: AIProviderId = 'openai';
