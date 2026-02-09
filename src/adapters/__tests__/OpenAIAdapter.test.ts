/**
 * OpenAI Adapter Unit Tests
 *
 * Tests for the OpenAI adapter implementation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAIAdapter } from '../OpenAIAdapter';
import { APIError, ConfigError } from '../../types/adapter';

// Mock the OpenAI SDK
const mockChatCompletionsCreate = vi.fn();
const mockModelsList = vi.fn();

vi.mock('openai', () => {
  // Define error classes inside the factory to avoid hoisting issues
  const AuthenticationError = class AuthenticationError extends Error {
    constructor(message: string, public status: number) {
      super(message);
      this.name = 'AuthenticationError';
    }
  };

  const RateLimitError = class RateLimitError extends Error {
    constructor(message: string, public status: number) {
      super(message);
      this.name = 'RateLimitError';
    }
  };

  const APIConnectionError = class APIConnectionError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'APIConnectionError';
    }
  };

  // Create a constructor function
  const MockOpenAI = function(this: any) {
    this.chat = {
      completions: {
        create: mockChatCompletionsCreate,
      },
    };
    this.models = {
      list: mockModelsList,
    };
  } as any;

  MockOpenAI.AuthenticationError = AuthenticationError;
  MockOpenAI.RateLimitError = RateLimitError;
  MockOpenAI.APIConnectionError = APIConnectionError;

  return {
    default: MockOpenAI,
    OpenAI: MockOpenAI,
  };
});

// Mock the AI key manager
vi.mock('../lib/aiKeyManager', () => ({
  getApiKey: vi.fn().mockReturnValue({
    source: 'localStorage',
    key: 'test-api-key',
  }),
}));

// Mock AI_PROVIDERS
vi.mock('../types/aiProvider', () => ({
  AI_PROVIDERS: {
    openai: {
      id: 'openai',
      name: 'OpenAI',
      apiBase: 'https://api.openai.com/v1',
      models: ['gpt-4o', 'gpt-4o-mini'],
    },
  },
}));

describe('OpenAIAdapter', () => {
  let adapter: OpenAIAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new OpenAIAdapter();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with correct provider ID', () => {
      expect(adapter.providerId).toBe('openai');
    });

    it('should initialize with correct base URL', () => {
      expect(adapter.isConfigured()).toBe(true);
    });
  });

  describe('chat()', () => {
    it('should make correct API call and return response', async () => {
      const mockResponse = {
        id: 'chatcmpl-abc123',
        object: 'chat.completion',
        created: 1677858242,
        model: 'gpt-4o',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant' as const,
              content: 'Hello! How can I help you today?',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 15,
          completion_tokens: 12,
          total_tokens: 27,
        },
      };

      mockChatCompletionsCreate.mockResolvedValue(mockResponse);

      const request = {
        messages: [
          { role: 'user' as const, content: 'Say hello!' },
        ],
        model: 'gpt-4o',
        provider: 'openai' as const,
        temperature: 0.7,
        maxTokens: 100,
      };

      const response = await adapter.chat(request);

      expect(mockChatCompletionsCreate).toHaveBeenCalledWith({
        model: 'gpt-4o',
        messages: [{ role: 'user' as const, content: 'Say hello!' }],
        temperature: 0.7,
        max_tokens: 100,
        top_p: 0.9,
      });

      expect(response.content).toBe('Hello! How can I help you today?');
      expect(response.provider).toBe('openai');
      expect(response.model).toBe('gpt-4o');
      expect(response.finishReason).toBe('stop');
      expect(response.usage).toEqual({
        promptTokens: 15,
        completionTokens: 12,
        totalTokens: 27,
      });
    });

    it('should use default values when not specified', async () => {
      const mockResponse = {
        id: 'chatcmpl-abc123',
        object: 'chat.completion',
        created: 1677858242,
        model: 'gpt-4o-mini',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant' as const,
              content: 'Response',
            },
            finish_reason: 'stop',
          },
        ],
      };

      mockChatCompletionsCreate.mockResolvedValue(mockResponse);

      const request = {
        messages: [{ role: 'user' as const, content: 'Test' }],
        model: 'gpt-4o-mini',
        provider: 'openai' as const,
      };

      await adapter.chat(request);

      expect(mockChatCompletionsCreate).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user' as const, content: 'Test' }],
        temperature: 0.8,
        max_tokens: 1000,
        top_p: 0.9,
      });
    });
  });

  describe('validateApiKey()', () => {
    it('should return true for valid API key format', async () => {
      const mockListResponse = {
        data: [{ id: 'gpt-4o' }, { id: 'gpt-4o-mini' }],
      };

      mockModelsList.mockResolvedValue(mockListResponse);

      const result = await adapter.validateApiKey('sk-test-api-key-12345');

      expect(result).toBe(true);
      expect(mockModelsList).toHaveBeenCalled();
    });

    it('should return false for empty API key', async () => {
      const result = await adapter.validateApiKey('');
      expect(result).toBe(false);
    });

    it('should return false for whitespace-only API key', async () => {
      const result = await adapter.validateApiKey('   ');
      expect(result).toBe(false);
    });

    it('should return false when API call fails', async () => {
      mockModelsList.mockRejectedValue(new Error('Invalid API key'));

      const result = await adapter.validateApiKey('invalid-key');
      expect(result).toBe(false);
    });
  });

  describe('isConfigured()', () => {
    it('should return true when API key is set', () => {
      const adapterWithKey = new OpenAIAdapter();
      expect(adapterWithKey.isConfigured()).toBe(true);
    });

    it('should return false when no client is initialized', () => {
      const adapterWithoutKey = new OpenAIAdapter();
      // Simulate no client by accessing private client property
      (adapterWithoutKey as any).client = null;
      expect(adapterWithoutKey.isConfigured()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 Authentication Error', async () => {
      const authError = Object.assign(new Error('Invalid API key'), { status: 401 });
      mockChatCompletionsCreate.mockRejectedValue(authError);

      const request = {
        messages: [{ role: 'user' as const, content: 'Test' }],
        model: 'gpt-4o',
        provider: 'openai' as const,
      };

      await expect(adapter.chat(request)).rejects.toThrow(APIError);
      await expect(adapter.chat(request)).rejects.toMatchObject({
        code: 'API_ERROR',
        statusCode: 401,
        isRetryable: false,
      });
    });

    it('should handle 429 Rate Limit Error', async () => {
      const rateLimitError = Object.assign(new Error('Rate limit exceeded'), { status: 429 });
      mockChatCompletionsCreate.mockRejectedValue(rateLimitError);

      const request = {
        messages: [{ role: 'user' as const, content: 'Test' }],
        model: 'gpt-4o',
        provider: 'openai' as const,
      };

      await expect(adapter.chat(request)).rejects.toThrow(APIError);
      await expect(adapter.chat(request)).rejects.toMatchObject({
        code: 'API_ERROR',
        statusCode: 429,
        isRetryable: true,
      });
    });

    it('should handle 500 Server Error', async () => {
      const serverError = Object.assign(new Error('Internal server error'), { status: 500 });
      mockChatCompletionsCreate.mockRejectedValue(serverError);

      const request = {
        messages: [{ role: 'user' as const, content: 'Test' }],
        model: 'gpt-4o',
        provider: 'openai' as const,
      };

      await expect(adapter.chat(request)).rejects.toThrow(APIError);
      await expect(adapter.chat(request)).rejects.toMatchObject({
        code: 'API_ERROR',
        statusCode: 500,
        isRetryable: true,
      });
    });

    it('should handle API connection errors', async () => {
      const connectionError = Object.assign(new Error('Failed to connect'), { cause: new Error('Connection failed') });
      mockChatCompletionsCreate.mockRejectedValue(connectionError);

      const request = {
        messages: [{ role: 'user' as const, content: 'Test' }],
        model: 'gpt-4o',
        provider: 'openai' as const,
      };

      await expect(adapter.chat(request)).rejects.toThrow(APIError);
      await expect(adapter.chat(request)).rejects.toMatchObject({
        code: 'API_ERROR',
        statusCode: undefined,
        isRetryable: true,
      });
    });

    it('should throw ConfigError when adapter is not configured', async () => {
      const adapterWithoutConfig = new OpenAIAdapter();
      (adapterWithoutConfig as any).client = null;

      const request = {
        messages: [{ role: 'user' as const, content: 'Test' }],
        model: 'gpt-4o',
        provider: 'openai' as const,
      };

      await expect(adapterWithoutConfig.chat(request)).rejects.toThrow(ConfigError);
    });
  });
});
