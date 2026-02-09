import { create } from 'zustand';
import type { AIProviderId } from '../types/aiProvider';
import { DEFAULT_PROVIDER, AI_PROVIDERS } from '../types/aiProvider';
import { MODEL_REGISTRY, type AIModel } from '../config/models';
import { validateApiKey as validateKey, isProviderConfigured as checkConfigured } from '../lib/aiKeyManager';

const STORAGE_KEY = 'mindspace-ai-config';

interface StoredConfig {
  selectedProvider: AIProviderId;
  customApiKeys: Partial<Record<AIProviderId, string>>;
  defaultModels: Partial<Record<AIProviderId, string>>;
}

interface AIConfigStore extends StoredConfig {
  // Models state
  models: AIModel[];
  selectedModel: string | null;

  // Actions
  setProvider: (provider: AIProviderId) => void;
  setApiKey: (provider: AIProviderId, apiKey: string) => void;
  clearApiKey: (provider: AIProviderId) => void;
  setDefaultModel: (provider: AIProviderId, model: string) => void;
  setSelectedModel: (modelId: string) => void;
  validateApiKey: (provider: AIProviderId, apiKey: string) => Promise<boolean>;
  isProviderConfigured: (provider: AIProviderId) => boolean;

  // Getters
  getApiKey: (provider: AIProviderId) => string | undefined;
  getApiBase: (provider: AIProviderId) => string | undefined;
  getCurrentModel: () => string;
  getSelectedAIModel: () => AIModel | undefined;
}

const loadFromStorage = (): StoredConfig & { models: AIModel[]; selectedModel: string | null } => {
  if (typeof window === 'undefined') {
    return {
      selectedProvider: DEFAULT_PROVIDER,
      customApiKeys: {},
      defaultModels: {},
      models: MODEL_REGISTRY.getAll(),
      selectedModel: null,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<StoredConfig>;
      return {
        selectedProvider: parsed.selectedProvider ?? DEFAULT_PROVIDER,
        customApiKeys: parsed.customApiKeys ?? {},
        defaultModels: parsed.defaultModels ?? {},
        models: MODEL_REGISTRY.getAll(),
        selectedModel: null,
      };
    }
  } catch (error) {
    console.error('Failed to load AI config from storage:', error);
  }

  return {
    selectedProvider: DEFAULT_PROVIDER,
    customApiKeys: {},
    defaultModels: {},
    models: MODEL_REGISTRY.getAll(),
    selectedModel: null,
  };
};

const saveToStorage = (config: StoredConfig) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save AI config to storage:', error);
  }
};

export const useAIConfigStore = create<AIConfigStore>((set, get) => {
  const initialConfig = loadFromStorage();

  return {
    ...initialConfig,

    setProvider: (provider) => {
      set({ selectedProvider: provider });
      saveToStorage({ ...get() });
    },

    setApiKey: (provider, apiKey) => {
      set((state) => ({
        customApiKeys: {
          ...state.customApiKeys,
          [provider]: apiKey,
        },
      }));
      saveToStorage({ ...get() });
    },

    clearApiKey: (provider) => {
      set((state) => {
        const newKeys = { ...state.customApiKeys };
        delete newKeys[provider];
        return { customApiKeys: newKeys };
      });
      saveToStorage({ ...get() });
    },

    setDefaultModel: (provider, model) => {
      set((state) => ({
        defaultModels: {
          ...state.defaultModels,
          [provider]: model,
        },
      }));
      saveToStorage({ ...get() });
    },

    setSelectedModel: (modelId) => {
      set({ selectedModel: modelId });
      saveToStorage({ ...get() });
    },

    validateApiKey: async (provider, apiKey) => {
      return validateKey(provider, apiKey);
    },

    isProviderConfigured: (provider) => {
      return checkConfigured(provider);
    },

    getApiKey: (provider) => {
      return get().customApiKeys[provider];
    },

    getApiBase: (provider) => {
      return AI_PROVIDERS[provider]?.apiBase;
    },

    getCurrentModel: () => {
      const state = get();
      const provider = state.selectedProvider;

      // Use custom model if set, otherwise use provider's default
      return state.defaultModels[provider] ?? AI_PROVIDERS[provider]?.defaultModel ?? '';
    },

    getSelectedAIModel: () => {
      const state = get();
      if (!state.selectedModel) return undefined;
      const provider = state.selectedProvider;
      return MODEL_REGISTRY.getById(provider, state.selectedModel);
    },
  };
});

// Selector helpers for common use cases
export const selectCurrentProvider = (state: AIConfigStore) => state.selectedProvider;
export const selectCurrentModel = (state: AIConfigStore) => state.getCurrentModel();
export const selectHasApiKey = (provider: AIProviderId) => (state: AIConfigStore) =>
  !!state.getApiKey(provider) || !AI_PROVIDERS[provider]?.requiresApiKey;
