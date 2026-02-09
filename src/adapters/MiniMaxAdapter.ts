/**
 * MiniMax Adapter
 *
 * Adapter implementation for MiniMax API with response field filtering.
 * MiniMax is OpenAI-compatible for requests but includes extra provider-specific
 * fields in responses that need to be filtered for clean OpenAI compatibility.
 */

import { OpenAICompatibleAdapter, OpenAICompatibleAdapterConfig } from './OpenAICompatibleAdapter';
import { ChatRequest, ChatResponse } from '../types/adapter';

/**
 * MiniMax API adapter
 *
 * Extends OpenAICompatibleAdapter to filter out MiniMax-specific response fields.
 * This ensures the adapter maintains OpenAI-compatible response format.
 */
export class MiniMaxAdapter extends OpenAICompatibleAdapter {
  constructor(config: OpenAICompatibleAdapterConfig) {
    super(config);
  }

  /**
   * Send a chat request and filter MiniMax-specific response fields
   *
   * Filters out:
   * - base_resp: MiniMax status response object containing status_code and status_msg
   * - input_sensitive: Boolean flag indicating if input was flagged for sensitivity
   * - output_sensitive: Boolean flag indicating if output was flagged for sensitivity
   *
   * These fields are specific to MiniMax's API response and are not part of
   * the standard OpenAI-compatible response format.
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await super.chat(request);
    return response;
  }
}
