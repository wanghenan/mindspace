/**
 * Zhipu AI Adapter
 *
 * Adapter for Zhipu AI's GLM models using the OpenAI-compatible API format.
 */

import { OpenAICompatibleAdapter } from './OpenAICompatibleAdapter.js';
import { AI_PROVIDERS } from '../types/aiProvider.js';

/**
 * Zhipu AI Adapter
 *
 * Provides access to Zhipu AI's GLM models including:
 * - glm-4.7
 * - glm-4.7-flash
 * - glm-4.6
 */
export class ZhipuAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super({
      provider: 'zhipu',
      apiBase: AI_PROVIDERS.zhipu.apiBase,
    });
  }
}
