/**
 * Grok Adapter
 *
 * Adapter for xAI's Grok models using the OpenAI-compatible API format.
 */

import { OpenAICompatibleAdapter } from './OpenAICompatibleAdapter.js';
import { AI_PROVIDERS } from '../types/aiProvider.js';

/**
 * Grok Adapter
 *
 * Provides access to xAI's Grok models including:
 * - grok-4
 * - grok-4-fast
 */
export class GrokAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super({
      provider: 'grok',
      apiBase: AI_PROVIDERS.grok.apiBase,
    });
  }
}
