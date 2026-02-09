/**
 * Chat Service Error Types
 *
 * Defines error types and categorization for retry logic in the chat service.
 * This provides clear error classification for better error handling and user feedback.
 */

import type { AIProviderId } from './aiProvider';

/**
 * Error codes for chat service errors
 */
export enum ChatErrorCode {
  // Configuration errors
  INVALID_API_KEY = 'INVALID_API_KEY',
  MISSING_API_KEY = 'MISSING_API_KEY',
  PROVIDER_NOT_CONFIGURED = 'PROVIDER_NOT_CONFIGURED',

  // API errors with HTTP status categorization
  UNAUTHORIZED = 'UNAUTHORIZED',        // 401 - Invalid credentials
  FORBIDDEN = 'FORBIDDEN',               // 403 - Permission denied
  RATE_LIMITED = 'RATE_LIMITED',        // 429 - Rate limit exceeded
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR', // 500
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',     // 503
  BAD_GATEWAY = 'BAD_GATEWAY',          // 502
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',  // 504

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Provider-specific errors
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  CONTENT_FILTERED = 'CONTENT_FILTERED',

  // Service errors
  ADAPTER_ERROR = 'ADAPTER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Map of HTTP status codes to error codes
 */
const HTTP_STATUS_TO_ERROR_CODE: Record<number, ChatErrorCode> = {
  400: ChatErrorCode.PROVIDER_ERROR,
  401: ChatErrorCode.UNAUTHORIZED,
  403: ChatErrorCode.FORBIDDEN,
  404: ChatErrorCode.MODEL_NOT_FOUND,
  429: ChatErrorCode.RATE_LIMITED,
  500: ChatErrorCode.INTERNAL_SERVER_ERROR,
  502: ChatErrorCode.BAD_GATEWAY,
  503: ChatErrorCode.SERVICE_UNAVAILABLE,
  504: ChatErrorCode.GATEWAY_TIMEOUT,
};

/**
 * Check if an HTTP status code indicates a retryable error
 */
export function isRetryableStatus(statusCode: number): boolean {
  // Retryable: 429 (rate limit), 500, 502, 503, 504
  return [429, 500, 502, 503, 504].includes(statusCode);
}

/**
 * Error codes that are always retryable
 */
export const RETRYABLE_ERROR_CODES: Set<ChatErrorCode> = new Set([
  ChatErrorCode.RATE_LIMITED,
  ChatErrorCode.INTERNAL_SERVER_ERROR,
  ChatErrorCode.SERVICE_UNAVAILABLE,
  ChatErrorCode.BAD_GATEWAY,
  ChatErrorCode.GATEWAY_TIMEOUT,
  ChatErrorCode.NETWORK_ERROR,
  ChatErrorCode.TIMEOUT,
]);

/**
 * Error codes that are not retryable
 */
export const NON_RETRYABLE_ERROR_CODES: Set<ChatErrorCode> = new Set([
  ChatErrorCode.INVALID_API_KEY,
  ChatErrorCode.MISSING_API_KEY,
  ChatErrorCode.PROVIDER_NOT_CONFIGURED,
  ChatErrorCode.UNAUTHORIZED,
  ChatErrorCode.FORBIDDEN,
  ChatErrorCode.MODEL_NOT_FOUND,
  ChatErrorCode.CONTENT_FILTERED,
]);

/**
 * Chat service error class
 */
export class ChatServiceError extends Error {
  constructor(
    message: string,
    public readonly code: ChatErrorCode,
    public readonly provider?: AIProviderId,
    public readonly statusCode?: number,
    public readonly originalError?: Error,
    public readonly isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'ChatServiceError';
  }

  /**
   * Create an error from an HTTP response
   */
  static fromHTTPResponse(
    statusCode: number,
    message: string,
    provider?: AIProviderId,
    originalError?: Error
  ): ChatServiceError {
    const code = HTTP_STATUS_TO_ERROR_CODE[statusCode] || ChatErrorCode.PROVIDER_ERROR;
    const isRetryable = isRetryableStatus(statusCode);

    return new ChatServiceError(
      message,
      code,
      provider,
      statusCode,
      originalError,
      isRetryable
    );
  }

  /**
   * Create an error for unauthorized access (401)
   */
  static unauthorized(provider?: AIProviderId, message: string = 'API key is invalid or expired'): ChatServiceError {
    return new ChatServiceError(
      message,
      ChatErrorCode.UNAUTHORIZED,
      provider,
      401,
      undefined,
      false
    );
  }

  /**
   * Create an error for rate limiting (429)
   */
  static rateLimited(provider?: AIProviderId, message: string = 'Rate limit exceeded. Please try again later.'): ChatServiceError {
    return new ChatServiceError(
      message,
      ChatErrorCode.RATE_LIMITED,
      provider,
      429,
      undefined,
      true
    );
  }

  /**
   * Create an error for server errors (5xx)
   */
  static serverError(
    provider?: AIProviderId,
    statusCode: number = 500,
    message: string = 'Server error. Please try again.'
  ): ChatServiceError {
    return new ChatServiceError(
      message,
      ChatErrorCode.INTERNAL_SERVER_ERROR,
      provider,
      statusCode,
      undefined,
      isRetryableStatus(statusCode)
    );
  }

  /**
   * Create an error for missing configuration
   */
  static configurationError(
    provider?: AIProviderId,
    message: string = 'Provider is not properly configured'
  ): ChatServiceError {
    return new ChatServiceError(
      message,
      ChatErrorCode.PROVIDER_NOT_CONFIGURED,
      provider,
      undefined,
      undefined,
      false
    );
  }

  /**
   * Create an error for network failures
   */
  static networkError(
    provider?: AIProviderId,
    originalError?: Error
  ): ChatServiceError {
    return new ChatServiceError(
      'Network error. Please check your connection.',
      ChatErrorCode.NETWORK_ERROR,
      provider,
      undefined,
      originalError,
      true
    );
  }

  /**
   * Create an error for missing API key
   */
  static missingApiKey(provider?: AIProviderId): ChatServiceError {
    return new ChatServiceError(
      `API key is not configured for provider: ${provider}`,
      ChatErrorCode.MISSING_API_KEY,
      provider,
      undefined,
      undefined,
      false
    );
  }
}

/**
 * User-friendly error messages for different error types
 */
export function getUserFriendlyErrorMessage(error: ChatServiceError): string {
  switch (error.code) {
    case ChatErrorCode.UNAUTHORIZED:
    case ChatErrorCode.INVALID_API_KEY:
      return 'API key is invalid. Please check your settings.';

    case ChatErrorCode.MISSING_API_KEY:
    case ChatErrorCode.PROVIDER_NOT_CONFIGURED:
      return 'AI service is not configured. Please add your API key in settings.';

    case ChatErrorCode.RATE_LIMITED:
      return 'Too many requests. Please wait a moment and try again.';

    case ChatErrorCode.INTERNAL_SERVER_ERROR:
    case ChatErrorCode.SERVICE_UNAVAILABLE:
    case ChatErrorCode.BAD_GATEWAY:
    case ChatErrorCode.GATEWAY_TIMEOUT:
      return 'AI service is temporarily unavailable. Please try again later.';

    case ChatErrorCode.NETWORK_ERROR:
      return 'Network error. Please check your connection.';

    case ChatErrorCode.CONTENT_FILTERED:
      return 'Content was filtered. Please try a different message.';

    case ChatErrorCode.MODEL_NOT_FOUND:
      return 'AI model not found. Please select a different model.';

    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}
