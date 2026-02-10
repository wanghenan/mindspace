/**
 * Adapter Factory
 *
 * Factory class that returns the appropriate adapter for each AI provider.
 * This centralizes adapter creation and makes it easy to add new providers.
 */

import { AIProviderAdapter, UnsupportedProviderError } from '../types/adapter.js';
import type { AIProviderId } from '../types/aiProvider.js';
import { OpenAICompatibleAdapter } from './OpenAICompatibleAdapter.js';
import { OpenAIAdapter } from './OpenAIAdapter.js';
import { ZhipuAdapter } from './ZhipuAdapter.js';
import { DeepSeekAdapter } from './DeepSeekAdapter.js';
import { AlibabaAdapter } from './AlibabaAdapter.js';
import { GrokAdapter } from './GrokAdapter.js';

// Re-export UnsupportedProviderError for convenience
export { UnsupportedProviderError } from '../types/adapter.js';

/**
 * Providers that use OpenAI-compatible API format
 */
const OPENAI_COMPATIBLE_PROVIDERS: AIProviderId[] = [
  'openai',
  'zhipu',
  'grok',
  'deepseek',
  'minimax',
  'alibaba',
];

/**
 * Adapter Factory
 *
 * Singleton factory for creating and caching adapter instances.
 * Each provider ID always returns the same adapter instance.
 */
export class AdapterFactory {
  private static instance: AdapterFactory;
  private adapterCache: Map<AIProviderId, AIProviderAdapter | undefined> = new Map();

  private constructor() {
    console.log('[AdapterFactory] Initialized');
  }

  /**
   * Get the singleton factory instance
   */
  static getInstance(): AdapterFactory {
    if (!AdapterFactory.instance) {
      AdapterFactory.instance = new AdapterFactory();
    }
    return AdapterFactory.instance;
  }

  /**
   * Get or create an adapter for the specified provider
   *
   * @param providerId - The AI provider ID
   * @returns The appropriate adapter for the provider
   * @throws UnsupportedProviderError - If the provider is not supported
   */
  getAdapter(providerId: AIProviderId): AIProviderAdapter {
    // Check cache first
    if (this.adapterCache.has(providerId)) {
      const cachedAdapter = this.adapterCache.get(providerId);
      
      if (cachedAdapter !== undefined) {
        return cachedAdapter;
      }
    }

    // Create the appropriate adapter
    const adapter = this.createAdapter(providerId);
    this.adapterCache.set(providerId, adapter);

    console.log(`[AdapterFactory] Created adapter for provider: ${providerId}`);
    return adapter;
  }

  /**
   * Create an adapter for the specified provider
   */
  private createAdapter(providerId: AIProviderId): AIProviderAdapter {
    // Use specific adapters for each provider
    switch (providerId) {
      case 'openai':
        return new OpenAIAdapter();
      case 'zhipu':
        return new ZhipuAdapter();
      case 'deepseek':
        return new DeepSeekAdapter();
      case 'alibaba':
        return new AlibabaAdapter();
      case 'grok':
        return new GrokAdapter();
      case 'minimax':
        return new OpenAICompatibleAdapter({
          provider: providerId,
        });
      default:
        throw new UnsupportedProviderError(providerId);
    }
  }

  /**
   * Check if a provider is supported
   */
  isSupported(providerId: AIProviderId): boolean {
    return OPENAI_COMPATIBLE_PROVIDERS.includes(providerId);
  }

  /**
   * Clear the adapter cache (useful for testing)
   */
  clearCache(): void {
    this.adapterCache.clear();
    console.log('[AdapterFactory] Cache cleared');
  }

  /**
   * Get all supported provider IDs
   */
  getSupportedProviders(): AIProviderId[] {
    return [...OPENAI_COMPATIBLE_PROVIDERS];
  }
}

// Export singleton instance for easy use
export const adapterFactory = AdapterFactory.getInstance();
