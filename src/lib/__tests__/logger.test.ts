import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createLogger, setLogLevel, getLogLevel, LogLevel } from '../logger';

describe('Logger', () => {
  beforeEach(() => {
    setLogLevel(LogLevel.DEBUG);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logging at different levels', () => {
    it('should log debug messages', () => {
      const logger = createLogger('TestContext');
      logger.debug('Debug message', { key: 'value' });
      
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG TestContext: Debug message'),
        { key: 'value' }
      );
    });

    it('should log info messages', () => {
      const logger = createLogger('TestContext');
      logger.info('Info message', { data: 123 });
      
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('INFO TestContext: Info message'),
        { data: 123 }
      );
    });

    it('should log warning messages', () => {
      const logger = createLogger('TestContext');
      logger.warn('Warning message', { warning: 'test' });
      
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN TestContext: Warning message'),
        { warning: 'test' }
      );
    });

    it('should log error messages', () => {
      const logger = createLogger('TestContext');
      logger.error('Error message', { error: 'test' });
      
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR TestContext: Error message'),
        { error: 'test' }
      );
    });
  });

  describe('log level filtering', () => {
    it('should not log DEBUG messages when log level is INFO', () => {
      setLogLevel(LogLevel.INFO);
      const logger = createLogger('TestContext');
      
      logger.debug('This should not appear');
      logger.info('This should appear');
      
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('INFO TestContext: This should appear'),
        ''
      );
    });

    it('should not log DEBUG and INFO messages when log level is WARN', () => {
      setLogLevel(LogLevel.WARN);
      const logger = createLogger('TestContext');
      
      logger.debug('Debug should not appear');
      logger.info('Info should not appear');
      logger.warn('Warning should appear');
      
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN TestContext: Warning should appear'),
        ''
      );
    });

    it('should not log DEBUG, INFO, and WARN messages when log level is ERROR', () => {
      setLogLevel(LogLevel.ERROR);
      const logger = createLogger('TestContext');
      
      logger.debug('Debug should not appear');
      logger.info('Info should not appear');
      logger.warn('Warn should not appear');
      logger.error('Error should appear');
      
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR TestContext: Error should appear'),
        ''
      );
    });

    it('should log all messages when log level is DEBUG', () => {
      setLogLevel(LogLevel.DEBUG);
      const logger = createLogger('TestContext');
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('should return correct log level from getLogLevel', () => {
      setLogLevel(LogLevel.DEBUG);
      expect(getLogLevel()).toBe(LogLevel.DEBUG);
      
      setLogLevel(LogLevel.INFO);
      expect(getLogLevel()).toBe(LogLevel.INFO);
      
      setLogLevel(LogLevel.WARN);
      expect(getLogLevel()).toBe(LogLevel.WARN);
      
      setLogLevel(LogLevel.ERROR);
      expect(getLogLevel()).toBe(LogLevel.ERROR);
    });
  });
});
