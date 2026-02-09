/**
 * Gemini Adapter Tests
 *
 * Test suite for Gemini custom adapter implementation.
 * Tests format conversion, API calls, streaming, and validation.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GeminiAdapter } from '../GeminiAdapter';
import { ChatRequest } from '../../types/adapter';
import { AI_PROVIDERS } from '../../types/aiProvider';

// Mock the aiKeyManager module
vi.mock('../../lib/aiKeyManager', () => ({
  getApiKey: vi.fn(),
}));

// Import the mocked module
import { getApiKey } from '../../lib/aiKeyManager';

describe('GeminiAdapter', () => {
  let adapter: GeminiAdapter;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Default mock for getApiKey - no API key
    vi.mocked(getApiKey).mockReturnValue({ source: 'none', key: '' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('adapter initialization', () => {
    it('should initialize with correct base URL', () => {
      vi.mocked(getApiKey).mockReturnValue({ source: 'env', key: 'test-api-key' });
      adapter = new GeminiAdapter();
      expect(adapter.providerId).toBe('gemini');
    });

    it('should load API key from key manager on construction', () => {
      vi.mocked(getApiKey).mockReturnValue({ source: 'env', key: 'test-api-key' });
      adapter = new GeminiAdapter();
      expect(getApiKey).toHaveBeenCalledWith('gemini');
    });

    it('should be configured when API key is set', () => {
      vi.mocked(getApiKey).mockReturnValue({ source: 'env', key: 'test-api-key' });
      adapter = new GeminiAdapter();
      expect(adapter.isConfigured()).toBe(true);
    });

    it('should not be configured when API key is missing', () => {
      vi.mocked(getApiKey).mockReturnValue({ source: 'none', key: '' });
      adapter = new GeminiAdapter();
      expect(adapter.isConfigured()).toBe(false);
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

  describe('adapter.chat()', () => {
    beforeEach(() => {
      vi.mocked(getApiKey).mockReturnValue({ source: 'env', key: 'test-api-key' });
      adapter = new GeminiAdapter();
    });

    it('should make correct API call using fetch', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Hello, how can I help you?' }],
                role: 'model',
              },
              finishReason: 'STOP',
            },
          ],
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hi' }],
        model: 'gemini-pro',
        provider: 'gemini',
        temperature: 0.7,
        maxTokens: 100,
        topP: 0.9,
      };

      await adapter.chat(request);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];

      // Verify URL contains correct endpoint
      expect(url).toContain('/v1beta/models/gemini-pro:generateContent');
      expect(url).toContain('key=test-api-key');

      // Verify request options
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');

      const body = JSON.parse(options.body as string);
      expect(body.contents).toHaveLength(1);
      expect(body.contents[0].role).toBe('user');
      expect(body.contents[0].parts[0].text).toBe('Hi');
      expect(body.generationConfig.temperature).toBe(0.7);
      expect(body.generationConfig.maxOutputTokens).toBe(100);
      expect(body.generationConfig.topP).toBe(0.9);
    });

    it('should throw ConfigError when API key is not set', async () => {
      vi.mocked(getApiKey).mockReturnValue({ source: 'none', key: '' });
      adapter = new GeminiAdapter();

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hi' }],
        model: 'gemini-pro',
        provider: 'gemini',
      };

      await expect(adapter.chat(request)).rejects.toThrow('Adapter not configured for provider: gemini');
    });

    it('should handle API errors (401, 429, 500)', async () => {
      // Test 401 Unauthorized
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hi' }],
        model: 'gemini-pro',
        provider: 'gemini',
      };

      await expect(adapter.chat(request)).rejects.toThrow('Gemini API error: Unauthorized');

      // Test 429 Too Many Requests
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      await expect(adapter.chat(request)).rejects.toThrow('Gemini API error: Too Many Requests');

      // Test 500 Internal Server Error
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(adapter.chat(request)).rejects.toThrow('Gemini API error: Internal Server Error');
    });

    it('should convert OpenAI messages to Gemini format correctly', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'I understand how you feel.' }],
                role: 'model',
              },
              finishReason: 'STOP',
            },
          ],
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: ChatRequest = {
        messages: [
          { role: 'system', content: 'You are a supportive assistant.' },
          { role: 'user', content: 'I am feeling anxious' },
          { role: 'assistant', content: 'I hear you.' },
        ],
        model: 'gemini-pro',
        provider: 'gemini',
      };

      await adapter.chat(request);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body as string);

      // System message should be prepended to first user message
      expect(body.contents).toHaveLength(2);
      expect(body.contents[0].role).toBe('user');
      expect(body.contents[0].parts[0].text).toContain('You are a supportive assistant.');
      expect(body.contents[0].parts[0].text).toContain('I am feeling anxious');
      expect(body.contents[1].role).toBe('model');
      expect(body.contents[1].parts[0].text).toBe('I hear you.');
    });

    it('should convert Gemini response to OpenAI format correctly', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Take a deep breath.' }],
                role: 'model',
              },
              finishReason: 'STOP',
            },
          ],
          usageMetadata: {
            promptTokenCount: 10,
            candidatesTokenCount: 5,
            totalTokenCount: 15,
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Help me relax' }],
        model: 'gemini-pro',
        provider: 'gemini',
      };

      const response = await adapter.chat(request);

      expect(response.content).toBe('Take a deep breath.');
      expect(response.finishReason).toBe('stop');
      expect(response.provider).toBe('gemini');
      expect(response.model).toBe('gemini-pro');
      expect(response.usage?.promptTokens).toBe(10);
      expect(response.usage?.completionTokens).toBe(5);
      expect(response.usage?.totalTokens).toBe(15);
    });
  });

  describe('chatStream() Method', () => {
    it('should handle SSE streaming response', async () => {
      vi.mocked(getApiKey).mockReturnValue({ source: 'env', key: 'test-api-key' });
      adapter = new GeminiAdapter();

      // Mock SSE stream - each chunk should be processed separately
      const encoder = new TextEncoder();
      let chunkIndex = 0;
      const streamData = [
        encoder.encode('data: {"candidates": [{"content": {"parts": [{"text": "Hello"}]}}]}\n'),
        encoder.encode('data: {"candidates": [{"content": {"parts": [{"text": " world"}]}}]}\n'),
        encoder.encode('data: [DONE]\n')
      ];

      const mockReader = {
        read: async () => {
          if (chunkIndex < streamData.length) {
            return { done: false, value: streamData[chunkIndex++] };
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
        if (!chunk.done) {
          chunks.push(chunk.delta);
        }
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

  describe('adapter.validateApiKey()', () => {
    beforeEach(() => {
      adapter = new GeminiAdapter();
    });

    it('should validate API key via /models endpoint', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ models: [] }),
      });

      const isValid = await adapter.validateApiKey('test-api-key');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/v1beta/models');
      expect(url).toContain('key=test-api-key');
      expect(isValid).toBe(true);
    });

    it('should return false for empty API key', async () => {
      const isValid = await adapter.validateApiKey('');
      expect(isValid).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return false for whitespace-only API key', async () => {
      const isValid = await adapter.validateApiKey('   ');
      expect(isValid).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return false when API returns error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
      });

      const isValid = await adapter.validateApiKey('invalid-key');
      expect(isValid).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const isValid = await adapter.validateApiKey('test-key');
      expect(isValid).toBe(false);
    });
  });

  describe('adapter.isConfigured()', () => {
    it('should return true when API key is set', () => {
      vi.mocked(getApiKey).mockReturnValue({ source: 'env', key: 'valid-key' });
      adapter = new GeminiAdapter();
      expect(adapter.isConfigured()).toBe(true);
    });

    it('should return false when API key is empty', () => {
      vi.mocked(getApiKey).mockReturnValue({ source: 'none', key: '' });
      adapter = new GeminiAdapter();
      expect(adapter.isConfigured()).toBe(false);
    });

    it('should return false when key source is none', () => {
      vi.mocked(getApiKey).mockReturnValue({ source: 'none', key: undefined });
      adapter = new GeminiAdapter();
      expect(adapter.isConfigured()).toBe(false);
    });
  });
});
