/**
 * Retry Utility Tests
 *
 * Tests for the withRetry function and retry behavior.
 */

import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../retry';
import { ChatServiceError, ChatErrorCode } from '../../types/errors';

describe('withRetry', () => {
  describe('retry with backoff succeeds on retryable error', () => {
    it('should succeed after retrying on a retryable error (rate limited)', async () => {
      let attempts = 0;
      
      const fn = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new ChatServiceError(
            'Rate limit exceeded',
            ChatErrorCode.RATE_LIMITED,
            undefined,
            429,
            undefined,
            true
          );
        }
        return 'success';
      });

      const result = await withRetry(fn, {
        maxRetries: 3,
        baseDelay: 10,
        maxDelay: 100,
        jitterFactor: 0,
      });

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should call onRetry callback before each retry', async () => {
      const onRetryCallback = vi.fn();
      let attempts = 0;
      
      const fn = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new ChatServiceError(
            'Server error',
            ChatErrorCode.INTERNAL_SERVER_ERROR,
            undefined,
            500,
            undefined,
            true
          );
        }
        return 'success';
      });

      await withRetry(fn, {
        maxRetries: 3,
        baseDelay: 10,
        maxDelay: 100,
        jitterFactor: 0,
        onRetry: onRetryCallback,
      });

      expect(attempts).toBe(3);
      expect(onRetryCallback).toHaveBeenCalledTimes(2);
      expect(onRetryCallback).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Error),
        expect.any(Number)
      );
    });
  });

  describe('retry fails after max retries', () => {
    it('should throw after exhausting all retries', async () => {
      const fn = vi.fn().mockImplementation(() => {
        throw new ChatServiceError(
          'Service unavailable',
          ChatErrorCode.SERVICE_UNAVAILABLE,
          undefined,
          503,
          undefined,
          true
        );
      });

      await expect(
        withRetry(fn, {
          maxRetries: 2,
          baseDelay: 10,
          maxDelay: 100,
          jitterFactor: 0,
        })
      ).rejects.toThrow('Service unavailable');

      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should track actual number of attempts when all retries fail', async () => {
      let attempts = 0;
      
      const fn = vi.fn().mockImplementation(() => {
        attempts++;
        throw new ChatServiceError(
          'Gateway timeout',
          ChatErrorCode.GATEWAY_TIMEOUT,
          undefined,
          504,
          undefined,
          true
        );
      });

      await expect(
        withRetry(fn, {
          maxRetries: 3,
          baseDelay: 10,
          maxDelay: 100,
          jitterFactor: 0,
        })
      ).rejects.toThrow();

      expect(attempts).toBe(4); // Initial + 3 retries
    });
  });

  describe('retry skips non-retryable errors', () => {
    it('should not retry non-retryable errors (401 unauthorized)', async () => {
      const fn = vi.fn().mockImplementation(() => {
        throw new ChatServiceError(
          'API key is invalid',
          ChatErrorCode.UNAUTHORIZED,
          undefined,
          401,
          undefined,
          false
        );
      });

      await expect(
        withRetry(fn, {
          maxRetries: 3,
          baseDelay: 10,
          maxDelay: 100,
          jitterFactor: 0,
        })
      ).rejects.toThrow('API key is invalid');

      // Should only attempt once since 401 is not retryable
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not retry configuration errors', async () => {
      const fn = vi.fn().mockImplementation(() => {
        throw new ChatServiceError(
          'Provider not configured',
          ChatErrorCode.PROVIDER_NOT_CONFIGURED,
          undefined,
          undefined,
          undefined,
          false
        );
      });

      await expect(
        withRetry(fn, {
          maxRetries: 3,
          baseDelay: 10,
          maxDelay: 100,
          jitterFactor: 0,
        })
      ).rejects.toThrow('Provider not configured');

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should use custom isRetryable function when provided', async () => {
      const fn = vi.fn().mockImplementation(() => {
        throw new Error('Custom error that should not retry');
      });

      // Custom isRetryable that returns false for all errors
      await expect(
        withRetry(fn, {
          maxRetries: 3,
          baseDelay: 10,
          maxDelay: 100,
          jitterFactor: 0,
          isRetryable: () => false,
        })
      ).rejects.toThrow('Custom error that should not retry');

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
