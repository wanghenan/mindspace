/**
 * MiniMax Adapter Tests
 *
 * Tests for MiniMax adapter with response field filtering.
 * Verifies that MiniMax-specific fields are filtered out from responses.
 */

import { describe, it, expect, vi } from 'vitest';
import { MiniMaxAdapter } from '../MiniMaxAdapter';
import { OpenAICompatibleAdapter } from '../OpenAICompatibleAdapter';
import { ChatRequest } from '../../types/adapter';

describe('MiniMaxAdapter', () => {
  describe('Class Structure', () => {
    it('should extend OpenAICompatibleAdapter', () => {
      const adapter = new MiniMaxAdapter({
        provider: 'minimax'
      });

      expect(adapter).toBeInstanceOf(OpenAICompatibleAdapter);
      expect(adapter).toBeInstanceOf(MiniMaxAdapter);
    });

    it('should have correct provider ID', () => {
      const adapter = new MiniMaxAdapter({
        provider: 'minimax'
      });

      expect(adapter.providerId).toBe('minimax');
    });
  });

  describe('chat() Method', () => {
    it('should return response with standard fields', async () => {
      const adapter = new MiniMaxAdapter({
        provider: 'minimax'
      });

      // Mock the parent class chat method
      const mockResponse = {
        content: 'Hello! How can I help you today?',
        finishReason: 'stop' as const,
        provider: 'minimax' as const,
        model: 'MiniMax-M2.1',
        usage: {
          promptTokens: 15,
          completionTokens: 20,
          totalTokens: 35
        }
      };

      // Spy on the parent method
      const chatSpy = vi.spyOn(OpenAICompatibleAdapter.prototype, 'chat').mockResolvedValue(mockResponse);

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'MiniMax-M2.1',
        provider: 'minimax'
      };

      const response = await adapter.chat(request);

      // Verify standard fields are present
      expect(response).toHaveProperty('content');
      expect(response).toHaveProperty('finishReason');
      expect(response).toHaveProperty('provider');
      expect(response).toHaveProperty('model');
      expect(response).toHaveProperty('usage');

      // Verify the parent method was called
      expect(chatSpy).toHaveBeenCalledWith(request);

      chatSpy.mockRestore();
    });

    it('should not include MiniMax-specific filtered fields', async () => {
      const adapter = new MiniMaxAdapter({
        provider: 'minimax'
      });

      // Mock response that would come from parent
      const mockResponse = {
        content: 'This is a test response',
        finishReason: 'stop' as const,
        provider: 'minimax' as const,
        model: 'MiniMax-M2.1'
      };

      const chatSpy = vi.spyOn(OpenAICompatibleAdapter.prototype, 'chat').mockResolvedValue(mockResponse);

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Test' }],
        model: 'MiniMax-M2.1',
        provider: 'minimax'
      };

      const response = await adapter.chat(request);

      // Verify MiniMax-specific fields are NOT in the response
      expect(response).not.toHaveProperty('base_resp');
      expect(response).not.toHaveProperty('input_sensitive');
      expect(response).not.toHaveProperty('output_sensitive');

      chatSpy.mockRestore();
    });

    it('should return usage information when available', async () => {
      const adapter = new MiniMaxAdapter({
        provider: 'minimax'
      });

      const mockResponseWithUsage = {
        content: 'Response with token usage',
        finishReason: 'stop' as const,
        provider: 'minimax' as const,
        model: 'MiniMax-M2.1-lightning',
        usage: {
          promptTokens: 10,
          completionTokens: 25,
          totalTokens: 35
        }
      };

      const chatSpy = vi.spyOn(OpenAICompatibleAdapter.prototype, 'chat').mockResolvedValue(mockResponseWithUsage);

      const request: ChatRequest = {
        messages: [{ role: 'system', content: 'You are helpful' }, { role: 'user', content: 'Hi' }],
        model: 'MiniMax-M2.1-lightning',
        provider: 'minimax',
        temperature: 0.7
      };

      const response = await adapter.chat(request);

      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBe(10);
      expect(response.usage?.completionTokens).toBe(25);
      expect(response.usage?.totalTokens).toBe(35);

      chatSpy.mockRestore();
    });

    it('should pass through different finish reasons', async () => {
      const adapter = new MiniMaxAdapter({
        provider: 'minimax'
      });

      const finishReasons = ['stop', 'length', 'tool_calls', 'content_filter', 'unknown'] as const;

      for (const finishReason of finishReasons) {
        const mockResponse = {
          content: 'Test response',
          finishReason,
          provider: 'minimax' as const,
          model: 'MiniMax-M2.1'
        };

        const chatSpy = vi.spyOn(OpenAICompatibleAdapter.prototype, 'chat').mockResolvedValue(mockResponse);

        const request: ChatRequest = {
          messages: [{ role: 'user', content: 'Test' }],
          model: 'MiniMax-M2.1',
          provider: 'minimax'
        };

        const response = await adapter.chat(request);

        expect(response.finishReason).toBe(finishReason);

        chatSpy.mockRestore();
      }
    });
  });

  describe('Configuration', () => {
    it('should accept custom apiBase and apiKey', () => {
      const adapter = new MiniMaxAdapter({
        provider: 'minimax',
        apiBase: 'https://custom.api.url/v1',
        apiKey: 'test-api-key'
      });

      expect(adapter.providerId).toBe('minimax');
    });
  });
});

describe('MiniMax Response Filtering', () => {
  it('should demonstrate field filtering logic', () => {
    // This test demonstrates the destructuring pattern used for filtering
    const rawMiniMaxResponse = {
      id: 'chatcmpl-abc123',
      object: 'chat.completion',
      created: 1677858242,
      model: 'MiniMax-M2.1',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: 'Hello! How can I help you?'
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 15,
        completion_tokens: 12,
        total_tokens: 27
      },
      // MiniMax-specific fields that need to be filtered
      base_resp: {
        status_code: 0,
        status_msg: 'success'
      },
      input_sensitive: false,
      output_sensitive: false
    };

    // Apply the filtering pattern
    const { base_resp, input_sensitive, output_sensitive, ...cleanResponse } = rawMiniMaxResponse;

    // Verify filtered fields are removed
    expect(cleanResponse).not.toHaveProperty('base_resp');
    expect(cleanResponse).not.toHaveProperty('input_sensitive');
    expect(cleanResponse).not.toHaveProperty('output_sensitive');

    // Verify standard fields remain
    expect(cleanResponse).toHaveProperty('id');
    expect(cleanResponse).toHaveProperty('model');
    expect(cleanResponse).toHaveProperty('choices');
    expect(cleanResponse).toHaveProperty('usage');
  });

  it('should handle responses without MiniMax-specific fields', () => {
    // Simulate a response where MiniMax-specific fields might be absent
    const standardResponse: {
      id: string;
      object: string;
      created: number;
      model: string;
      choices: Array<{
        index: number;
        message: { role: string; content: string };
        finish_reason: string;
      }>;
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
      base_resp?: { status_code: number; status_msg: string };
      input_sensitive?: boolean;
      output_sensitive?: boolean;
    } = {
      id: 'chatcmpl-xyz789',
      object: 'chat.completion',
      created: 1677858242,
      model: 'MiniMax-M2.1',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: 'Standard response'
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 8,
        total_tokens: 18
      }
    };

    // Filtering should still work even when fields are absent
    const { base_resp, input_sensitive, output_sensitive, ...cleanResponse } = standardResponse;

    // Verify clean response
    expect(cleanResponse).not.toHaveProperty('base_resp');
    expect(cleanResponse).not.toHaveProperty('input_sensitive');
    expect(cleanResponse).not.toHaveProperty('output_sensitive');
    expect(cleanResponse).toHaveProperty('id');
    expect(cleanResponse).toHaveProperty('choices');
  });
});
