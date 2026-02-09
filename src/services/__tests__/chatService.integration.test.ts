/**
 * Integration tests for chatService
 * Tests the full flow: chatService → adapter → mock API
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sendChatMessage } from '../chatService';
import { adapterFactory } from '../../adapters/AdapterFactory';
import type { ChatMessage, ChatResponse as AdapterChatResponse } from '../types/adapter';

// Mock the adapter factory
vi.mock('../../adapters/AdapterFactory', () => ({
  adapterFactory: {
    getAdapter: vi.fn()
  }
}));

// Mock the AI config store
vi.mock('../store/aiConfigStore', () => ({
  useAIConfigStore: {
    getState: vi.fn().mockReturnValue({
      selectedProvider: 'openai',
      getCurrentModel: vi.fn().mockReturnValue('gpt-4o-mini')
    })
  }
}));

// Mock the logger
vi.mock('../lib/logger', () => ({
  chatLogger: {
    info: vi.fn(),
    error: vi.fn()
  },
  logChatExchange: vi.fn(),
  logRetryAttempt: vi.fn(),
  logAPIError: vi.fn()
}));

describe('chatService integration tests', () => {
  let mockAdapter: {
    chat: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockAdapter = {
      chat: vi.fn()
    };

    vi.mocked(adapterFactory.getAdapter).mockReturnValue(mockAdapter);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendChatMessage', () => {
    it('should send message and return AI response', async () => {
      // Arrange
      const conversationHistory: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' }
      ];
      const userMessage = 'How are you?';
      const expectedResponse: AdapterChatResponse = {
        content: 'I am doing well, thank you for asking!',
        provider: 'openai',
        model: 'gpt-4o-mini'
      };

      mockAdapter.chat.mockResolvedValue(expectedResponse);

      // Act
      const result = await sendChatMessage(conversationHistory, userMessage);

      // Assert
      expect(result).toEqual({
        content: 'I am doing well, thank you for asking!',
        needsSOS: false,
        crisis: false
      });

      expect(adapterFactory.getAdapter).toHaveBeenCalledWith('openai');
      expect(mockAdapter.chat).toHaveBeenCalledTimes(1);

      // Verify model was passed in the request
      const chatCall = mockAdapter.chat.mock.calls[0][0];
      expect(chatCall.model).toBe('gpt-4o-mini');
    });

    it('should detect crisis keywords and return crisis response', async () => {
      // Arrange - crisis keyword
      const userMessage = '我喘不上气，感觉要疯了';
      mockAdapter.chat.mockResolvedValue({
        content: '我在这里陪你，深呼吸',
        provider: 'openai',
        model: 'gpt-4o-mini'
      });

      // Act
      const result = await sendChatMessage([], userMessage);

      // Assert - crisis flags should be set, API response should be returned
      expect(result.needsSOS).toBe(true);
      expect(result.crisis).toBe(true);
      expect(result.content).toBe('我在这里陪你，深呼吸');
    });

    it('should return local fallback response when API fails', async () => {
      // Arrange - API error
      const userMessage = '我感到焦虑';
      mockAdapter.chat.mockRejectedValue(new Error('API Error'));

      // Act
      const result = await sendChatMessage([], userMessage);

      // Assert
      expect(result.needsSOS).toBe(false);
      expect(result.crisis).toBe(false);
      expect(result.content).toContain('焦虑');
      expect(result.content.length).toBeGreaterThan(0);
    });

    it('should return local crisis fallback when API fails with crisis keywords', async () => {
      // Arrange - acute crisis keyword + API error
      // This triggers the first crisis response (SOS breathing exercise)
      const userMessage = '手在抖，心跳好快';
      mockAdapter.chat.mockRejectedValue(new Error('API Error'));

      // Act
      const result = await sendChatMessage([], userMessage);

      // Assert - should return local crisis response with SOS guidance
      expect(result.needsSOS).toBe(true);
      expect(result.crisis).toBe(true);
      expect(result.content).toContain('深呼吸');
      expect(result.content).toContain('SOS');
    });

    it('should format messages with system prompt and history', async () => {
      // Arrange
      const conversationHistory: ChatMessage[] = [
        { role: 'user', content: 'Previous message 1' },
        { role: 'assistant', content: 'Previous response 1' },
        { role: 'user', content: 'Previous message 2' }
      ];
      const userMessage = 'New message';

      mockAdapter.chat.mockResolvedValue({
        content: 'Response',
        provider: 'openai',
        model: 'gpt-4o-mini'
      });

      // Act
      await sendChatMessage(conversationHistory, userMessage);

      // Assert - verify messages were passed to adapter
      const chatCall = mockAdapter.chat.mock.calls[0][0];
      const messages = chatCall.messages;

      // Should include system prompt
      expect(messages[0].role).toBe('system');
      expect(messages[0].content).toContain('MindSpace');

      // Should include last 10 messages from history
      const lastMessage = messages[messages.length - 1];
      expect(lastMessage.role).toBe('user');
      expect(lastMessage.content).toBe('New message');
    });

    it('should handle empty conversation history', async () => {
      // Arrange
      const userMessage = 'Hello';

      mockAdapter.chat.mockResolvedValue({
        content: 'Hi there!',
        provider: 'openai',
        model: 'gpt-4o-mini'
      });

      // Act
      const result = await sendChatMessage([], userMessage);

      // Assert
      expect(result.content).toBe('Hi there!');
      expect(mockAdapter.chat).toHaveBeenCalledTimes(1);
    });

    it('should limit conversation history to last 10 messages', async () => {
      // Arrange - create 15 messages (more than 10 limit)
      const conversationHistory: ChatMessage[] = Array.from(
        { length: 15 },
        (_, i) => ({
          role: i % 2 === 0 ? 'user' as const : 'assistant' as const,
          content: `Message ${i + 1}`
        })
      );

      mockAdapter.chat.mockResolvedValue({
        content: 'Response',
        provider: 'openai',
        model: 'gpt-4o-mini'
      });

      // Act
      await sendChatMessage(conversationHistory, 'New message');

      // Assert
      const chatCall = mockAdapter.chat.mock.calls[0][0];
      const messages = chatCall.messages;

      // System prompt + 10 history messages + new message = 12 total
      expect(messages.length).toBe(12);
      expect(messages[0].role).toBe('system');
      expect(messages[messages.length - 1].content).toBe('New message');
    });
  });
});
