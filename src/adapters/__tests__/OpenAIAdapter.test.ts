/**
 * OpenAI Adapter Tests
 */

import { describe, it, expect } from 'vitest';
import { OpenAIAdapter } from '../OpenAIAdapter';
import { AI_PROVIDERS } from '../../types/aiProvider';

describe('OpenAIAdapter', () => {
  describe('Instantiation', () => {
    it('should create adapter instance', () => {
      const adapter = new OpenAIAdapter();

      expect(adapter).toBeInstanceOf(OpenAIAdapter);
      expect(adapter.providerId).toBe('openai');
    });

    it('should have correct providerId', () => {
      const adapter = new OpenAIAdapter();

      expect(adapter.providerId).toBe('openai');
    });
  });

  describe('Required Methods', () => {
    it('should have chat method', () => {
      const adapter = new OpenAIAdapter();

      expect(typeof adapter.chat).toBe('function');
    });

    it('should have chatStream method', () => {
      const adapter = new OpenAIAdapter();

      expect(typeof adapter.chatStream).toBe('function');
    });

    it('should have isConfigured method', () => {
      const adapter = new OpenAIAdapter();

      expect(typeof adapter.isConfigured).toBe('function');
    });

    it('should have validateApiKey method', () => {
      const adapter = new OpenAIAdapter();

      expect(typeof adapter.validateApiKey).toBe('function');
    });
  });

  describe('Configuration', () => {
    it('should indicate not configured when no API key', () => {
      const adapter = new OpenAIAdapter();

      expect(adapter.isConfigured()).toBe(false);
    });
  });

  describe('API Key Validation', () => {
    it('should reject empty API key', async () => {
      const adapter = new OpenAIAdapter();

      const isValid = await adapter.validateApiKey('');

      expect(isValid).toBe(false);
    });

    it('should reject whitespace-only API key', async () => {
      const adapter = new OpenAIAdapter();

      const isValid = await adapter.validateApiKey('   ');

      expect(isValid).toBe(false);
    });
  });

  describe('Provider Configuration', () => {
    it('should use correct apiBase from AI_PROVIDERS', () => {
      const adapter = new OpenAIAdapter();

      expect(adapter.providerId).toBe('openai');
      expect(AI_PROVIDERS.openai.apiBase).toBe('https://api.openai.com/v1');
    });

    it('should use correct envVarName', () => {
      expect(AI_PROVIDERS.openai.envVarName).toBe('VITE_OPENAI_API_KEY');
    });

    it('should have defaultModel configured', () => {
      expect(AI_PROVIDERS.openai.defaultModel).toBe('gpt-4o-mini');
    });
  });
});
