/**
 * AI Model Configuration
 *
 * Curated list of production-ready models for each AI provider.
 * Models are manually curated to ensure stability and availability.
 *
 * Excluded models (deprecated/beta):
 * - gpt-3.5-turbo, text-davinci-003 (OpenAI - legacy)
 * - gemini-2.0-flash-exp (Google - deprecated)
 * - abab6, abab6.5s-chat (MiniMax - deprecated)
 * - grok-beta (xAI - beta)
 */

import { AIProviderId } from '../types/aiProvider';

/**
 * Model metadata interface
 */
export interface ModelConfig {
  id: string;
  name: string;
  provider: AIProviderId;
  contextLength?: number;
  supportsStreaming: boolean;
  description?: string;
}

/**
 * Model lists organized by provider
 */
export const MODELS: Record<AIProviderId, ModelConfig[]> = {
  openai: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      contextLength: 128000,
      supportsStreaming: true,
      description: 'OpenAI flagship multimodal model',
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      contextLength: 128000,
      supportsStreaming: true,
      description: 'Cost-effective OpenAI model',
    },
  ],

  zhipu: [
    {
      id: 'glm-4.7',
      name: 'GLM-4.7',
      provider: 'zhipu',
      contextLength: 128000,
      supportsStreaming: true,
      description: 'Zhipu flagship model',
    },
    {
      id: 'glm-4.7-flash',
      name: 'GLM-4.7 Flash',
      provider: 'zhipu',
      contextLength: 128000,
      supportsStreaming: true,
      description: 'Fast variant of GLM-4.7',
    },
    {
      id: 'glm-4.6',
      name: 'GLM-4.6',
      provider: 'zhipu',
      contextLength: 128000,
      supportsStreaming: true,
      description: 'Stable GLM-4 variant',
    },
  ],

  gemini: [
    {
      id: 'gemini-3-pro-preview',
      name: 'Gemini 3 Pro',
      provider: 'gemini',
      contextLength: 131072,
      supportsStreaming: true,
      description: 'Google Gemini 3 Pro',
    },
    {
      id: 'gemini-3-flash-preview',
      name: 'Gemini 3 Flash',
      provider: 'gemini',
      contextLength: 131072,
      supportsStreaming: true,
      description: 'Fast Gemini 3 Flash variant',
    },
  ],

  deepseek: [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      provider: 'deepseek',
      contextLength: 131072,
      supportsStreaming: true,
      description: 'DeepSeek general purpose model',
    },
    {
      id: 'deepseek-reasoner',
      name: 'DeepSeek Reasoner',
      provider: 'deepseek',
      contextLength: 131072,
      supportsStreaming: true,
      description: 'DeepSeek reasoning-focused model',
    },
  ],

  alibaba: [
    {
      id: 'qwen3-max',
      name: 'Qwen3 Max',
      provider: 'alibaba',
      contextLength: 131072,
      supportsStreaming: true,
      description: 'Alibaba Qwen flagship model',
    },
    {
      id: 'qwen-plus',
      name: 'Qwen Plus',
      provider: 'alibaba',
      contextLength: 131072,
      supportsStreaming: true,
      description: 'Alibaba Qwen balanced model',
    },
    {
      id: 'qwen-flash',
      name: 'Qwen Flash',
      provider: 'alibaba',
      contextLength: 131072,
      supportsStreaming: true,
      description: 'Alibaba Qwen fast variant',
    },
  ],

  minimax: [
    {
      id: 'MiniMax-M2.1',
      name: 'MiniMax M2.1',
      provider: 'minimax',
      contextLength: 1048576,
      supportsStreaming: true,
      description: 'MiniMax flagship reasoning model',
    },
    {
      id: 'MiniMax-M2.1-lightning',
      name: 'MiniMax M2.1 Lightning',
      provider: 'minimax',
      contextLength: 1048576,
      supportsStreaming: true,
      description: 'Fast MiniMax M2.1 variant',
    },
  ],

  grok: [
    {
      id: 'grok-4',
      name: 'Grok-4',
      provider: 'grok',
      contextLength: 131072,
      supportsStreaming: true,
      description: 'xAI Grok flagship model',
    },
    {
      id: 'grok-4-fast',
      name: 'Grok-4 Fast',
      provider: 'grok',
      contextLength: 131072,
      supportsStreaming: true,
      description: 'Fast Grok-4 variant',
    },
  ],

  hunyuan: [
    {
      id: 'hunyuan-lite',
      name: 'Hunyuan Lite',
      provider: 'hunyuan',
      contextLength: 131072,
      supportsStreaming: true,
      description: 'Tencent Hunyuan free tier',
    },
    {
      id: 'hunyuan-turbo',
      name: 'Hunyuan Turbo',
      provider: 'hunyuan',
      contextLength: 131072,
      supportsStreaming: true,
      description: 'Tencent Hunyuan balanced model',
    },
    {
      id: 'hunyuan-turbos-latest',
      name: 'Hunyuan Turbos',
      provider: 'hunyuan',
      contextLength: 131072,
      supportsStreaming: true,
      description: 'Tencent Hunyuan latest variant',
    },
  ],
};

/**
 * Get all models for a specific provider
 */
export function getModelsByProvider(provider: AIProviderId): ModelConfig[] {
  return MODELS[provider] || [];
}

/**
 * Get a specific model by provider and model ID
 */
export function getModelById(
  provider: AIProviderId,
  modelId: string
): ModelConfig | undefined {
  const providerModels = getModelsByProvider(provider);
  return providerModels.find((model) => model.id === modelId);
}

/**
 * Get all available models
 */
export function getAllModels(): ModelConfig[] {
  return Object.values(MODELS).flat();
}

/**
 * Get model registry for querying
 */
export const MODEL_REGISTRY = {
  // Get all models for a provider
  getByProvider: (provider: AIProviderId): ModelConfig[] =>
    getModelsByProvider(provider),

  // Get a specific model
  getById: (
    provider: AIProviderId,
    modelId: string
  ): ModelConfig | undefined => getModelById(provider, modelId),

  // Get all available models
  getAll: (): ModelConfig[] => getAllModels(),

  // Check if a model exists
  has: (provider: AIProviderId, modelId: string): boolean =>
    getModelById(provider, modelId) !== undefined,

  // Get streaming-capable models for a provider
  getStreamingModels: (provider: AIProviderId): ModelConfig[] =>
    getModelsByProvider(provider).filter((model) => model.supportsStreaming),

  // Get total model count
  getCount: (): number => getAllModels().length,

  // Get providers with models
  getProviders: (): AIProviderId[] => Object.keys(MODELS) as AIProviderId[],
};
