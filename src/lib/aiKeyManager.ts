import type { AIProviderId, ApiKeySource } from '../types/aiProvider';
import { AI_PROVIDERS } from '../types/aiProvider';

const CUSTOM_API_KEYS_STORAGE_KEY = 'mindspace_customApiKeys';

interface CustomApiKeys {
  [providerId: string]: string;
}

function getCustomApiKeys(): CustomApiKeys {
  try {
    const stored = localStorage.getItem(CUSTOM_API_KEYS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getApiKey(provider: AIProviderId): ApiKeySource {
  const providerConfig = AI_PROVIDERS[provider];

  // Special case: hunyuan uses cloudbase-env marker
  if (provider === 'hunyuan') {
    return {
      key: 'cloudbase-env',
      source: 'cloudbase-env'
    };
  }

  // First: check localStorage customApiKeys
  const customKeys = getCustomApiKeys();
  const localKey = customKeys[provider];
  if (localKey?.trim()) {
    console.log(`[AI Key Manager] ${provider} key source: localStorage`);
    return {
      key: localKey.trim(),
      source: 'localStorage'
    };
  }

  // Second: check environment variables
  const envKey = import.meta.env[providerConfig.envVarName];
  if (envKey?.trim()) {
    console.log(`[AI Key Manager] ${provider} key source: env var (${providerConfig.envVarName})`);
    return {
      key: envKey.trim(),
      source: 'env'
    };
  }

  // Third: no key available
  console.log(`[AI Key Manager] ${provider} key source: none (not configured)`);
  return {
    key: '',
    source: 'none'
  };
}

export function maskApiKey(key: string): string {
  if (!key || key.length <= 8) {
    return '***';
  }
  return `${key.substring(0, 8)}...`;
}

export async function validateApiKey(provider: AIProviderId, apiKey: string): Promise<boolean> {
  if (!apiKey?.trim()) {
    return false;
  }

  try {
    let testUrl: string;
    let headers: Record<string, string> = {};

    switch (provider) {
      case 'openai':
        testUrl = 'https://api.openai.com/v1/models';
        headers = {
          'Authorization': `Bearer ${apiKey}`
        };
        break;

      case 'zhipu':
        testUrl = 'https://open.bigmodel.cn/api/paas/v4/models';
        headers = {
          'Authorization': `Bearer ${apiKey}`
        };
        break;

      case 'grok':
        testUrl = 'https://api.x.ai/v1/models';
        headers = {
          'Authorization': `Bearer ${apiKey}`
        };
        break;

      case 'gemini':
        testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        break;

      case 'deepseek':
        testUrl = 'https://api.deepseek.com/v1/models';
        headers = {
          'Authorization': `Bearer ${apiKey}`
        };
        break;

      case 'minimax':
        testUrl = 'https://api.minimax.chat/v1/text/chatcompletion_v2';
        headers = {
          'Authorization': `Bearer ${apiKey}`
        };
        break;

      case 'alibaba':
        testUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/models';
        headers = {
          'Authorization': `Bearer ${apiKey}`
        };
        break;

      case 'hunyuan':
        return true;

      default:
        return false;
    }

    const response = await fetch(testUrl, {
      method: 'GET',
      headers
    });

    if (response.ok) {
      console.log(`[AI Key Manager] ${provider} key validation: success`);
      return true;
    }

    if (response.status === 401 || response.status === 403) {
      console.log(`[AI Key Manager] ${provider} key validation: failed (invalid key)`);
      return false;
    }

    console.log(`[AI Key Manager] ${provider} key validation: failed (status ${response.status})`);
    return false;
  } catch (error) {
    console.error(`[AI Key Manager] ${provider} key validation: error`, error);
    return false;
  }
}

export function isProviderConfigured(provider: AIProviderId): boolean {
  const { key } = getApiKey(provider);

  if (AI_PROVIDERS[provider].requiresApiKey === false) {
    return true;
  }

  return !!key;
}
