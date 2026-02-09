/**
 * OpenAI Adapter
 *
 * Adapter for OpenAI's GPT models using the OpenAI-compatible API format.
 */

import { OpenAICompatibleAdapter } from './OpenAICompatibleAdapter.js';
import { AI_PROVIDERS } from '../types/aiProvider.js';

/**
 * OpenAI Adapter
 *
 * Provides access to OpenAI's GPT models including:
 * - gpt-4o
 * - gpt-4o-mini
 */
export class OpenAIAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super({
      provider: 'openai',
      apiBase: AI_PROVIDERS.openai.apiBase,
    });
  }
}
