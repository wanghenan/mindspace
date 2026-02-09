/**
 * Gemini Adapter
 *
 * Custom adapter for Google Gemini API with format conversion between
 * OpenAI-style messages and Gemini's contents/parts format.
 */

import {
  AIProviderAdapter,
  ChatRequest,
  ChatResponse,
  APIError,
  ConfigError,
  StreamHandler,
} from '../types/adapter';
import { getApiKey } from '../lib/aiKeyManager';
import { AI_PROVIDERS } from '../types/aiProvider';

interface GeminiContent {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiAdapter implements AIProviderAdapter {
  readonly providerId = 'gemini';
  private apiKey: string | null = null;

  constructor() {
    this.loadApiKey();
  }

  private loadApiKey(): void {
    const keySource = getApiKey('gemini');
    if (keySource.source === 'none' || !keySource.key) {
      this.apiKey = null;
      return;
    }
    this.apiKey = keySource.key;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.apiKey) {
      throw new ConfigError(
        'Adapter not configured for provider: gemini',
        undefined,
        'gemini'
      );
    }

    try {
      const geminiRequest = this.convertToGeminiFormat(request.messages);
      const url = this.buildApiUrl(request.model, false);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiRequest,
          generationConfig: {
            temperature: request.temperature,
            maxOutputTokens: request.maxTokens,
            topP: request.topP,
          },
        }),
      });

      if (!response.ok) {
        throw new APIError(
          `Gemini API error: ${response.statusText}`,
          response.status,
          'gemini',
          response.status >= 500
        );
      }

      const geminiResponse: GeminiResponse = await response.json();
      return this.convertFromGeminiFormat(geminiResponse, request.model);
    } catch (error) {
      if (error instanceof APIError || error instanceof ConfigError) {
        throw error;
      }

      throw new APIError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        undefined,
        'gemini',
        true
      );
    }
  }

  async chatStream(request: ChatRequest, onChunk: StreamHandler): Promise<void> {
    if (!this.apiKey) {
      throw new ConfigError(
        'Adapter not configured for provider: gemini',
        undefined,
        'gemini'
      );
    }

    try {
      const geminiRequest = this.convertToGeminiFormat(request.messages);
      const url = this.buildApiUrl(request.model, true);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiRequest,
          generationConfig: {
            temperature: request.temperature,
            maxOutputTokens: request.maxTokens,
            topP: request.topP,
          },
        }),
      });

      if (!response.ok) {
        throw new APIError(
          `Gemini streaming API error: ${response.statusText}`,
          response.status,
          'gemini',
          response.status >= 500
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new APIError('No response body', undefined, 'gemini', true);
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onChunk({ delta: '', done: true, model: request.model });
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (text) {
                onChunk({ delta: text, done: false, model: request.model });
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      onChunk({ delta: '', done: true, model: request.model });
    } catch (error) {
      if (error instanceof APIError || error instanceof ConfigError) {
        throw error;
      }

      throw new APIError(
        error instanceof Error ? error.message : 'Unknown streaming error occurred',
        undefined,
        'gemini',
        true
      );
    }
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey || !apiKey.trim()) {
      return false;
    }

    try {
      const provider = AI_PROVIDERS.gemini;
      const url = `${provider.apiBase}/models?key=${encodeURIComponent(apiKey.trim())}`;

      const response = await fetch(url);

      return response.ok;
    } catch {
      return false;
    }
  }

  private convertToGeminiFormat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  ): GeminiContent[] {
    const geminiContents: GeminiContent[] = [];
    let systemMessage = '';

    for (const message of messages) {
      if (message.role === 'system') {
        systemMessage = message.content;
        continue;
      }

      const role: 'user' | 'model' =
        message.role === 'assistant' ? 'model' : 'user';

      let text = message.content;
      if (role === 'user' && systemMessage) {
        text = `${systemMessage}\n\n${message.content}`;
        systemMessage = '';
      }

      geminiContents.push({
        role,
        parts: [{ text }],
      });
    }

    return geminiContents;
  }

  private convertFromGeminiFormat(
    response: GeminiResponse,
    model: string
  ): ChatResponse {
    const candidate = response.candidates[0];
    const text = candidate?.content?.parts?.[0]?.text || '';

    const finishReasonMap: Record<string, 'stop' | 'length' | 'content_filter' | 'unknown'> = {
      STOP: 'stop',
      MAX_TOKENS: 'length',
      SAFETY: 'content_filter',
    };

    const finishReason = finishReasonMap[candidate.finishReason] || 'unknown';

    const result: ChatResponse = {
      content: text,
      finishReason,
      provider: 'gemini',
      model,
    };

    if (response.usageMetadata) {
      result.usage = {
        promptTokens: response.usageMetadata.promptTokenCount,
        completionTokens: response.usageMetadata.candidatesTokenCount,
        totalTokens: response.usageMetadata.totalTokenCount,
      };
    }

    return result;
  }

  private buildApiUrl(model: string, stream: boolean): string {
    const provider = AI_PROVIDERS.gemini;
    const method = stream ? 'streamGenerateContent' : 'generateContent';
    return `${provider.apiBase}/models/${model}:${method}?key=${encodeURIComponent(this.apiKey || '')}`;
  }
}
