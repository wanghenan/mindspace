/**
 * Model Configuration Tests
 * 
 * Validates the curated model list for all AI providers.
 */

import { describe, it, expect } from 'vitest';
import { 
  getModelsByProvider, 
  getModelById, 
  getAllModels,
  getAllModelIds,
  isValidModelForProvider,
  AIModel
} from '../models';
import { AIProviderId } from '../../types/aiProvider';

describe('Model Configuration', () => {
  describe('Provider Coverage', () => {
    it('should have models for all 6 providers', () => {
      const providers: AIProviderId[] = ['openai', 'zhipu', 'grok', 'deepseek', 'minimax', 'alibaba'];
      
      providers.forEach(provider => {
        const models = getModelsByProvider(provider);
        expect(models.length).toBeGreaterThan(0);
      });
    });

    it('should have minimum 6 total models', () => {
      const allModels = getAllModels();
      expect(allModels.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('Model Fields', () => {
    it('should have required fields for all models', () => {
      const allModels = getAllModels();
      
      allModels.forEach(model => {
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('provider');
        expect(model).toHaveProperty('contextLength');
        expect(model).toHaveProperty('supportsStreaming');
      });
    });

    it('should have valid field types', () => {
      const allModels = getAllModels();
      
      allModels.forEach(model => {
        expect(typeof model.id).toBe('string');
        expect(typeof model.name).toBe('string');
        expect(typeof model.provider).toBe('string');
        expect(typeof model.contextLength).toBe('number');
        expect(typeof model.supportsStreaming).toBe('boolean');
      });
    });

    it('should have positive context length for all models', () => {
      const allModels = getAllModels();
      
      allModels.forEach(model => {
        expect(model.contextLength).toBeGreaterThan(0);
      });
    });
  });

  describe('Model Uniqueness', () => {
    it('should have unique model IDs across all providers', () => {
      const allIds = getAllModels().map((m: AIModel) => m.id);
      const uniqueIds = new Set(allIds);
      
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });

  describe('Provider-Specific Models', () => {
    it('should have OpenAI models', () => {
      const openaiModels = getModelsByProvider('openai');
      
      expect(openaiModels.length).toBe(2);
      expect(openaiModels.map((m: AIModel) => m.id)).toEqual(['gpt-4o', 'gpt-4o-mini']);
    });

    it('should have Zhipu models', () => {
      const zhipuModels = getModelsByProvider('zhipu');
      
      expect(zhipuModels.length).toBe(3);
      expect(zhipuModels.map((m: AIModel) => m.id)).toEqual(['glm-4.7', 'glm-4.7-flash', 'glm-4.6']);
    });

    it('should have DeepSeek models', () => {
      const deepseekModels = getModelsByProvider('deepseek');
      
      expect(deepseekModels.length).toBe(2);
      expect(deepseekModels.map((m: AIModel) => m.id)).toEqual(['deepseek-chat', 'deepseek-reasoner']);
    });

    it('should have Alibaba models', () => {
      const alibabaModels = getModelsByProvider('alibaba');
      
      expect(alibabaModels.length).toBe(3);
      expect(alibabaModels.map((m: AIModel) => m.id)).toEqual(['qwen3-max', 'qwen-plus', 'qwen-flash']);
    });

    it('should have MiniMax models', () => {
      const minimaxModels = getModelsByProvider('minimax');
      
      expect(minimaxModels.length).toBe(2);
      expect(minimaxModels.map((m: AIModel) => m.id)).toEqual(['MiniMax-M2.1', 'MiniMax-M2.1-lightning']);
    });

    it('should have Grok models', () => {
      const grokModels = getModelsByProvider('grok');
      
      expect(grokModels.length).toBe(2);
      expect(grokModels.map((m: AIModel) => m.id)).toEqual(['grok-4', 'grok-4-fast']);
    });

    it('should have no Hunyuan models (provider removed)', () => {
      const hunyuanModels = getModelsByProvider('hunyuan' as AIProviderId);
      
      expect(hunyuanModels.length).toBe(0);
    });
  });

  describe('Deprecated Models Excluded', () => {
    it('should not include gpt-3.5-turbo', () => {
      const allIds = getAllModelIds();
      
      expect(allIds).not.toContain('gpt-3.5-turbo');
    });

    it('should not include gemini-2.0-flash-exp', () => {
      const allIds = getAllModelIds();
      
      expect(allIds).not.toContain('gemini-2.0-flash-exp');
    });

    it('should not include abab6 models', () => {
      const allIds = getAllModelIds();
      
      expect(allIds).not.toContain('abab6.5s-chat');
      expect(allIds).not.toContain('abab6');
    });

    it('should not include grok-beta', () => {
      const allIds = getAllModelIds();
      
      expect(allIds).not.toContain('grok-beta');
    });
  });

  describe('Streaming Support', () => {
    it('should have streaming support enabled for all models', () => {
      const allModels = getAllModels();
      
      allModels.forEach(model => {
        expect(model.supportsStreaming).toBe(true);
      });
    });
  });

  describe('Provider Assignment', () => {
    it('should correctly assign provider to each model', () => {
      const providers = ['openai', 'zhipu', 'grok', 'gemini', 'deepseek', 'minimax', 'alibaba'] as AIProviderId[];
      
      providers.forEach(provider => {
        const models = getModelsByProvider(provider);
        
        models.forEach(model => {
          expect(model.provider).toBe(provider);
        });
      });
    });
  });

  describe('Model Lookup Functions', () => {
    it('should find existing model by provider and id', () => {
      const model = getModelById('openai', 'gpt-4o');
      
      expect(model).toBeDefined();
      expect(model?.id).toBe('gpt-4o');
      expect(model?.name).toBe('GPT-4o');
    });

    it('should return undefined for non-existing model', () => {
      const model = getModelById('openai', 'non-existing-model');
      
      expect(model).toBeUndefined();
    });

    it('should validate existing model correctly', () => {
      const isValid = isValidModelForProvider('openai', 'gpt-4o');
      
      expect(isValid).toBe(true);
    });

    it('should invalidate non-existing model correctly', () => {
      const isValid = isValidModelForProvider('openai', 'non-existing-model');
      
      expect(isValid).toBe(false);
    });
  });
});
