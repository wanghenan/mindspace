/**
 * AI Provider Adapter Types
 *
 * Defines the adapter interface for different AI providers and common request/response types.
 * This enables decoupling business logic from specific provider implementations.
 */

import type { AIProviderId } from './aiProvider';

/**
 * Chat message structure
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Chat request payload
 */
export interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  provider: AIProviderId;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

/**
 * Token usage information
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Chat response structure
 */
export interface ChatResponse {
  content: string;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'unknown';
  usage?: TokenUsage;
  provider: AIProviderId;
  model: string;
}

/**
 * Base error class for adapter-related errors
 */
export abstract class AdapterError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider?: AIProviderId
  ) {
    super(message);
    this.name = 'AdapterError';
  }
}

/**
 * API-related errors (network issues, API failures, etc.)
 */
export class APIError extends AdapterError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly provider?: AIProviderId,
    public readonly isRetryable: boolean = false
  ) {
    super(message, 'API_ERROR', provider);
    this.name = 'APIError';
  }
}

/**
 * Configuration-related errors (missing keys, invalid config, etc.)
 */
export class ConfigError extends AdapterError {
  constructor(
    message: string,
    public readonly configKey?: string,
    public readonly provider?: AIProviderId
  ) {
    super(message, 'CONFIG_ERROR', provider);
    this.name = 'ConfigError';
  }
}

/**
 * Unsupported provider error
 */
export class UnsupportedProviderError extends AdapterError {
  constructor(providerId: AIProviderId | string) {
    super(`Unsupported provider: ${providerId}`, 'UNSUPPORTED_PROVIDER', providerId as AIProviderId);
    this.name = 'UnsupportedProviderError';
  }
}

/**
 * Stream chunk from chat completion (for future streaming support)
 */
export interface ChatChunk {
  delta: string;
  done: boolean;
  model?: string;
}

/**
 * Stream handler callback type (for future streaming support)
 */
export type StreamHandler = (chunk: ChatChunk) => void;

/**
 * Adapter interface for AI provider implementations
 *
 * All provider adapters must implement this interface to ensure
 * consistent behavior across different AI services.
 */
export interface AIProviderAdapter {
  /**
   * The provider ID this adapter handles
   */
  readonly providerId: AIProviderId;

  /**
   * Send a chat request and get a response
   *
   * @param request - The chat request containing messages and options
   * @returns Promise resolving to chat response
   * @throws APIError - For API-related failures
   * @throws ConfigError - For configuration issues
   */
  chat(request: ChatRequest): Promise<ChatResponse>;

  /**
   * Send a chat request and stream the response (future Wave 2)
   *
   * @param request - The chat request containing messages and options
   * @param onChunk - Callback for each chunk of the response
   * @throws APIError - For API-related failures
   * @throws ConfigError - For configuration issues
   */
  chatStream(request: ChatRequest, onChunk: StreamHandler): Promise<void>;

  /**
   * Check if the adapter is properly configured
   *
   * @returns True if all required configuration is present
   */
  isConfigured(): boolean;

  /**
   * Validate API key (if applicable)
   *
   * @param apiKey - The API key to validate
   * @returns Promise resolving to true if valid
   */
  validateApiKey?(apiKey: string): Promise<boolean>;
}
