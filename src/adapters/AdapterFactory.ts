/**
 * Adapter Factory
 *
 * Factory class that returns the appropriate adapter for each AI provider.
 * This centralizes adapter creation and makes it easy to add new providers.
 */

import { AIProviderAdapter, ConfigError, UnsupportedProviderError } from '../types/adapter';
import type { AIProviderId } from '../types/aiProvider';
import { OpenAICompatibleAdapter } from './OpenAICompatibleAdapter';

/**
 * Providers that use OpenAI-compatible API format
 */
const OPENAI_COMPATIBLE_PROVIDERS: AIProviderId[] = [
  'openai',
  'zhipu',
  'grok',
  'gemini',
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
  private adapterCache: Map<AIProviderId, AIProviderAdapter | null> = new Map();

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
    // Check if it's an OpenAI-compatible provider
    if (OPENAI_COMPATIBLE_PROVIDERS.includes(providerId)) {
      return new OpenAICompatibleAdapter({
        provider: providerId,
      });
    }

    // Handle special cases or unsupported providers
    if (providerId === 'hunyuan') {
      // Hunyuan uses a different API format (Tencent Cloud)
      // For now, throw an error indicating it needs a custom adapter
      throw new ConfigError(
        'Hunyuan provider requires a custom adapter implementation',
        undefined,
        providerId
      );
    }

    // Unknown provider
    throw new UnsupportedProviderError(providerId);
  }

  /**
   * Check if a provider is supported
   */
  isSupported(providerId: AIProviderId): boolean {
    return OPENAI_COMPATIBLE_PROVIDERS.includes(providerId) || providerId === 'hunyuan';
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
    return [...OPENAI_COMPATIBLE_PROVIDERS, 'hunyuan'];
  }
}

// Export singleton instance for easy use
export const adapterFactory = AdapterFactory.getInstance();
