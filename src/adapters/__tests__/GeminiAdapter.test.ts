/**
 * Gemini Adapter Tests
 *
 * Test suite for Gemini custom adapter implementation.
 * Tests format conversion, API calls, streaming, and validation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeminiAdapter } from '../GeminiAdapter';
import { ChatRequest } from '../../types/adapter';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GeminiAdapter', () => {
  let adapter: GeminiAdapter;

  beforeEach(() => {
    adapter = new GeminiAdapter();
    mockFetch.mockClear();
  });

  describe('Construction', () => {
    it('should have correct provider ID', () => {
      expect(adapter.providerId).toBe('gemini');
    });

    it('should implement AIProviderAdapter interface', () => {
      expect(typeof adapter.chat).toBe('function');
      expect(typeof adapter.chatStream).toBe('function');
      expect(typeof adapter.isConfigured).toBe('function');
      expect(typeof adapter.validateApiKey).toBe('function');
    });
  });

  describe('Message Format Conversion', () => {
    it('should convert user message from OpenAI to Gemini format', () => {
      const openaiMessages = [
        { role: 'user' as const, content: 'Hello Gemini' }
      ];

      const geminiContents = adapter['convertToGeminiFormat'](openaiMessages);

      expect(geminiContents).toEqual([
        {
          role: 'user',
          parts: [{ text: 'Hello Gemini' }]
        }
      ]);
    });

    it('should convert assistant message to model role', () => {
      const openaiMessages = [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there!' }
      ];

      const geminiContents = adapter['convertToGeminiFormat'](openaiMessages);

      expect(geminiContents).toEqual([
        { role: 'user', parts: [{ text: 'Hello' }] },
        { role: 'model', parts: [{ text: 'Hi there!' }] }
      ]);
    });

    it('should prefix system message to first user message', () => {
      const openaiMessages = [
        { role: 'system' as const, content: 'You are helpful' },
        { role: 'user' as const, content: 'Hello' }
      ];

      const geminiContents = adapter['convertToGeminiFormat'](openaiMessages);

      expect(geminiContents).toHaveLength(1);
      expect(geminiContents[0].role).toBe('user');
      expect(geminiContents[0].parts[0].text).toContain('You are helpful');
      expect(geminiContents[0].parts[0].text).toContain('Hello');
    });

    it('should handle empty messages array', () => {
      const openaiMessages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [];

      const geminiContents = adapter['convertToGeminiFormat'](openaiMessages);

      expect(geminiContents).toEqual([]);
    });
  });

  describe('Response Format Conversion', () => {
    it('should convert Gemini response to OpenAI format', () => {
      const geminiResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Hello! How can I help?' }]
            },
            finishReason: 'STOP'
          }
        ],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 8,
          totalTokenCount: 18
        }
      };

      const openaiResponse = adapter['convertFromGeminiFormat'](geminiResponse, 'gemini-3-pro');

      expect(openaiResponse.content).toBe('Hello! How can I help?');
      expect(openaiResponse.finishReason).toBe('stop');
      expect(openaiResponse.provider).toBe('gemini');
      expect(openaiResponse.model).toBe('gemini-3-pro');
      expect(openaiResponse.usage).toEqual({
        promptTokens: 10,
        completionTokens: 8,
        totalTokens: 18
      });
    });

    it('should map MAX_TOKENS finish reason to length', () => {
      const geminiResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Response text' }]
            },
            finishReason: 'MAX_TOKENS'
          }
        ]
      };

      const openaiResponse = adapter['convertFromGeminiFormat'](geminiResponse, 'gemini-3-pro');

      expect(openaiResponse.finishReason).toBe('length');
    });

    it('should map SAFETY finish reason to content_filter', () => {
      const geminiResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Response text' }]
            },
            finishReason: 'SAFETY'
          }
        ]
      };

      const openaiResponse = adapter['convertFromGeminiFormat'](geminiResponse, 'gemini-3-pro');

      expect(openaiResponse.finishReason).toBe('content_filter');
    });

    it('should handle missing usage metadata', () => {
      const geminiResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Response' }]
            },
            finishReason: 'STOP'
          }
        ]
      };

      const openaiResponse = adapter['convertFromGeminiFormat'](geminiResponse, 'gemini-3-pro');

      expect(openaiResponse.usage).toBeUndefined();
    });
  });

  describe('chat() Method', () => {
    it('should throw ConfigError when not configured', async () => {
      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemini-3-pro',
        provider: 'gemini'
      };

      await expect(adapter.chat(request)).rejects.toThrow('Adapter not configured');
    });

    it('should make API call with correct format when configured', async () => {
      // Mock localStorage to return API key
      const mockGetItem = vi.fn();
      mockGetItem.mockReturnValue('test-api-key');
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem },
        writable: true
      });

      // Re-create adapter to pick up localStorage
      adapter = new GeminiAdapter();

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: { parts: [{ text: 'Test response' }] },
              finishReason: 'STOP'
            }
          ],
          usageMetadata: {
            promptTokenCount: 5,
            candidatesTokenCount: 3,
            totalTokenCount: 8
          }
        })
      });

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemini-3-pro',
        provider: 'gemini'
      };

      const response = await adapter.chat(request);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(response.content).toBe('Test response');
      expect(response.provider).toBe('gemini');
    });

    it('should handle API errors with APIError', async () => {
      const mockGetItem = vi.fn();
      mockGetItem.mockReturnValue('test-api-key');
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem },
        writable: true
      });

      adapter = new GeminiAdapter();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemini-3-pro',
        provider: 'gemini'
      };

      await expect(adapter.chat(request)).rejects.toThrow();
    });
  });

  describe('chatStream() Method', () => {
    it('should handle SSE streaming response', async () => {
      const mockGetItem = vi.fn();
      mockGetItem.mockReturnValue('test-api-key');
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem },
        writable: true
      });

      adapter = new GeminiAdapter();

      // Mock SSE stream
      const streamChunks = [
        'data: {"candidates": [{"content": {"parts": [{"text": "Hello"}]}}]}',
        'data: {"candidates": [{"content": {"parts": [{"text": " world"}]}}]}',
        'data: [DONE]'
      ];

      const mockReader = {
        read: async () => {
          const chunk = streamChunks.shift();
          if (chunk) {
            return { done: false, value: new TextEncoder().encode(chunk) };
          }
          return { done: true };
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader }
      });

      const chunks: string[] = [];
      const onChunk = (chunk: any) => {
        chunks.push(chunk.delta);
      };

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemini-3-pro',
        provider: 'gemini'
      };

      await adapter.chatStream(request, onChunk);

      expect(chunks).toContain('Hello');
      expect(chunks).toContain(' world');
    });
  });

  describe('validateApiKey() Method', () => {
    it('should return false for empty API key', async () => {
      const result = await adapter.validateApiKey('');
      expect(result).toBe(false);
    });

    it('should return false for invalid API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const result = await adapter.validateApiKey('invalid-key');
      expect(result).toBe(false);
    });

    it('should return true for valid API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [] })
      });

      const result = await adapter.validateApiKey('valid-key');
      expect(result).toBe(true);
    });

    it('should call models endpoint for validation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [] })
      });

      await adapter.validateApiKey('test-key');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toContain('models');
    });
  });

  describe('isConfigured() Method', () => {
    it('should return false when no API key in localStorage', () => {
      const mockGetItem = vi.fn();
      mockGetItem.mockReturnValue(null);
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem },
        writable: true
      });

      adapter = new GeminiAdapter();

      expect(adapter.isConfigured()).toBe(false);
    });

    it('should return true when API key exists in localStorage', () => {
      const mockGetItem = vi.fn();
      mockGetItem.mockReturnValue('test-api-key');
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem },
        writable: true
      });

      adapter = new GeminiAdapter();

      expect(adapter.isConfigured()).toBe(true);
    });
  });
});
