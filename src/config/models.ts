/**
 * AI Model Configuration
 *
 * Curated list of stable, production-ready models for all supported AI providers.
 * Excludes beta, preview, experimental, and deprecated models.
 *
 * Excluded models:
 * - gpt-3.5-turbo (OpenAI - deprecated)
 * - gemini-2.0-flash-exp (Google - deprecated)
 * - abab6, abab6.5s-chat (MiniMax - deprecated)
 * - grok-beta (xAI - beta)
 * - Hunyuan models (removed from scope)
 */

import { AIProviderId } from '../types/aiProvider';

/**
 * Individual model configuration interface
 */
export interface AIModel {
  id: string;
  name: string;
  provider: AIProviderId;
  contextLength: number;
  supportsStreaming: boolean;
}

/**
 * Provider-specific model lists organized by provider ID
 */
export const PROVIDER_MODELS: Record<AIProviderId, AIModel[]> = {
  openai: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      contextLength: 128000,
      supportsStreaming: true
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      contextLength: 128000,
      supportsStreaming: true
    }
  ],

  zhipu: [
    {
      id: 'glm-4.7',
      name: 'GLM-4.7',
      provider: 'zhipu',
      contextLength: 200000,
      supportsStreaming: true
    },
    {
      id: 'glm-4.7-flash',
      name: 'GLM-4.7 Flash',
      provider: 'zhipu',
      contextLength: 200000,
      supportsStreaming: true
    },
    {
      id: 'glm-4.6',
      name: 'GLM-4.6',
      provider: 'zhipu',
      contextLength: 200000,
      supportsStreaming: true
    }
  ],

  gemini: [
    {
      id: 'gemini-3-pro',
      name: 'Gemini 3 Pro',
      provider: 'gemini',
      contextLength: 200000,
      supportsStreaming: true
    },
    {
      id: 'gemini-3-flash',
      name: 'Gemini 3 Flash',
      provider: 'gemini',
      contextLength: 1000000,
      supportsStreaming: true
    }
  ],

  deepseek: [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      provider: 'deepseek',
      contextLength: 131072,
      supportsStreaming: true
    },
    {
      id: 'deepseek-reasoner',
      name: 'DeepSeek Reasoner',
      provider: 'deepseek',
      contextLength: 131072,
      supportsStreaming: true
    }
  ],

  alibaba: [
    {
      id: 'qwen3-max',
      name: 'Qwen3 Max',
      provider: 'alibaba',
      contextLength: 131072,
      supportsStreaming: true
    },
    {
      id: 'qwen-plus',
      name: 'Qwen Plus',
      provider: 'alibaba',
      contextLength: 131072,
      supportsStreaming: true
    },
    {
      id: 'qwen-flash',
      name: 'Qwen Flash',
      provider: 'alibaba',
      contextLength: 131072,
      supportsStreaming: true
    }
  ],

  minimax: [
    {
      id: 'MiniMax-M2.1',
      name: 'MiniMax-M2.1',
      provider: 'minimax',
      contextLength: 200000,
      supportsStreaming: true
    },
    {
      id: 'MiniMax-M2.1-lightning',
      name: 'MiniMax-M2.1 Lightning',
      provider: 'minimax',
      contextLength: 200000,
      supportsStreaming: true
    }
  ],

  grok: [
    {
      id: 'grok-4',
      name: 'Grok-4',
      provider: 'grok',
      contextLength: 131072,
      supportsStreaming: true
    },
    {
      id: 'grok-4-fast',
      name: 'Grok-4 Fast',
      provider: 'grok',
      contextLength: 131072,
      supportsStreaming: true
    }
  ],

  hunyuan: []
};

/**
 * Get all models for a specific provider
 */
export function getModelsByProvider(provider: AIProviderId): AIModel[] {
  return PROVIDER_MODELS[provider] || [];
}

/**
 * Get a specific model by provider and model ID
 */
export function getModelById(
  provider: AIProviderId,
  modelId: string
): AIModel | undefined {
  const providerModels = getModelsByProvider(provider);
  return providerModels.find((model) => model.id === modelId);
}

/**
 * Get all available models
 */
export function getAllModels(): AIModel[] {
  return Object.values(PROVIDER_MODELS).flat();
}

/**
 * Get all model IDs
 */
export function getAllModelIds(): string[] {
  return getAllModels().map(model => model.id);
}

/**
 * Check if a model is valid for a provider
 */
export function isValidModelForProvider(provider: AIProviderId, modelId: string): boolean {
  return getModelById(provider, modelId) !== undefined;
}

/**
 * Get model registry for querying
 */
export const MODEL_REGISTRY = {
  // Get all models for a provider
  getByProvider: (provider: AIProviderId): AIModel[] =>
    getModelsByProvider(provider),

  // Get a specific model
  getById: (
    provider: AIProviderId,
    modelId: string
  ): AIModel | undefined => getModelById(provider, modelId),

  // Get all available models
  getAll: (): AIModel[] => getAllModels(),

  // Check if a model exists
  has: (provider: AIProviderId, modelId: string): boolean =>
    getModelById(provider, modelId) !== undefined,

  // Get streaming-capable models for a provider
  getStreamingModels: (provider: AIProviderId): AIModel[] =>
    getModelsByProvider(provider).filter((model) => model.supportsStreaming),

  // Get total model count
  getCount: (): number => getAllModels().length,

  // Get providers with models
  getProviders: (): AIProviderId[] => Object.keys(PROVIDER_MODELS) as AIProviderId[]
};
