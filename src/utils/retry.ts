/**
 * Retry Utility with Exponential Backoff
 *
 * Provides robust retry logic with configurable exponential backoff for transient failures.
 * This helps handle rate limiting (429) and temporary server errors (5xx) gracefully.
 */

import { ChatServiceError, isRetryableStatus } from '../types/errors';
import type { AIProviderId } from '../types/aiProvider';

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number;
  /** Base delay in milliseconds (default: 1000ms) */
  baseDelay: number;
  /** Maximum delay in milliseconds (default: 10000ms) */
  maxDelay: number;
  /** Jitter factor to add randomness (default: 0.1 = 10%) */
  jitterFactor: number;
  /** Custom function to determine if an error is retryable */
  isRetryable?: (error: Error) => boolean;
  /** Callback called before each retry attempt */
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  jitterFactor: 0.1,
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = config.baseDelay * Math.pow(2, attempt);

  // Add jitter to prevent thundering herd
  const jitter = exponentialDelay * config.jitterFactor * Math.random();

  // Cap at maxDelay
  const delay = Math.min(exponentialDelay + jitter, config.maxDelay);

  return Math.round(delay);
}

/**
 * Check if an error is retryable based on ChatServiceError
 */
function defaultIsRetryable(error: Error): boolean {
  if (error instanceof ChatServiceError) {
    return error.isRetryable;
  }

  // For unknown errors, check if it might be a retryable status code
  // This is a fallback for errors that don't have our error type
  const errorString = error.message || '';
  const statusMatch = errorString.match(/(\d{3})/);

  if (statusMatch) {
    const statusCode = parseInt(statusMatch[1], 10);
    return isRetryableStatus(statusCode);
  }

  // Default: consider network errors as retryable
  return error.name === 'TypeError' ||
         error.message?.includes('fetch') ||
         error.message?.includes('network') ||
         error.message?.includes('timeout');
}

/**
 * Execute a function with retry logic
 *
 * @param fn - The async function to execute
 * @param config - Retry configuration
 * @returns Promise resolving to the function result
 * @throws The last error if all retries are exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T> {
  const mergedConfig: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
    isRetryable: config?.isRetryable ?? defaultIsRetryable,
  };

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= mergedConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      const isRetryableError = mergedConfig.isRetryable!(lastError);

      // If not retryable or we've exhausted retries, throw immediately
      if (!isRetryableError || attempt >= mergedConfig.maxRetries) {
        throw lastError;
      }

      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, mergedConfig);

      // Call onRetry callback if provided
      if (mergedConfig.onRetry) {
        mergedConfig.onRetry(attempt + 1, lastError, delay);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Create a retryable version of a function
 *
 * @param fn - The async function to make retryable
 * @param config - Retry configuration
 * @returns A new function that automatically retries on failure
 */
export function makeRetryable<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  config?: Partial<RetryConfig>
): (...args: Args) => Promise<T> {
  return (...args: Args) => withRetry(() => fn(...args), config);
}

/**
 * Retry configuration builder for fluent API
 */
export class RetryConfigBuilder {
  private config: Partial<RetryConfig> = {};

  maxRetries(n: number): this {
    this.config.maxRetries = n;
    return this;
  }

  baseDelay(ms: number): this {
    this.config.baseDelay = ms;
    return this;
  }

  maxDelay(ms: number): this {
    this.config.maxDelay = ms;
    return this;
  }

  jitter(factor: number): this {
    this.config.jitterFactor = factor;
    return this;
  }

  isRetryable(fn: (error: Error) => boolean): this {
    this.config.isRetryable = fn;
    return this;
  }

  onRetry(fn: (attempt: number, error: Error, delay: number) => void): this {
    this.config.onRetry = fn;
    return this;
  }

  /**
   * Build the retry configuration
   */
  build(): RetryConfig {
    return {
      ...DEFAULT_RETRY_CONFIG,
      ...this.config,
    } as RetryConfig;
  }

  /**
   * Execute a function with the built configuration
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return withRetry(fn, this.build());
  }
}

/**
 * Factory function for RetryConfigBuilder
 */
export function retryConfig(): RetryConfigBuilder {
  return new RetryConfigBuilder();
}

/**
 * Predefined retry configurations for common scenarios
 */
export const RetryPresets = {
  /** Quick retry for rate limiting (shorter delays) */
  rateLimited: retryConfig()
    .maxRetries(3)
    .baseDelay(500)
    .maxDelay(5000)
    .jitter(0.2)
    .build(),

  /** Standard retry for server errors */
  serverError: retryConfig()
    .maxRetries(3)
    .baseDelay(1000)
    .maxDelay(10000)
    .jitter(0.1)
    .build(),

  /** Aggressive retry for critical operations */
  critical: retryConfig()
    .maxRetries(5)
    .baseDelay(2000)
    .maxDelay(30000)
    .jitter(0.15)
    .build(),

  /** Single retry for non-critical operations */
  once: retryConfig()
    .maxRetries(1)
    .baseDelay(1000)
    .maxDelay(2000)
    .jitter(0.1)
    .build(),
};

/**
 * Retry a chat request with appropriate defaults
 *
 * @param fn - The chat request function
 * @param provider - The AI provider ID (for logging)
 * @returns Promise resolving to the chat response
 */
export async function retryChatRequest<T>(
  fn: () => Promise<T>,
  provider?: AIProviderId
): Promise<T> {
  const onRetry = provider
    ? (attempt: number, error: Error) => {
        console.warn(
          `[ChatService] Retry attempt ${attempt} for provider ${provider}:`,
          error.message
        );
      }
    : undefined;

  return withRetry(fn, {
    ...RetryPresets.serverError,
    onRetry,
    isRetryable: (error: Error) => {
      if (error instanceof ChatServiceError) {
        return error.isRetryable;
      }
      return defaultIsRetryable(error);
    },
  });
}
