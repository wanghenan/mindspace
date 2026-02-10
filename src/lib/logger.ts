/**
 * Logger Utility
 *
 * Centralized logging utility for the MindSpace application.
 * Provides structured logging with different log levels and contexts.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LEVEL_NAMES = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  context: string;
  message: string;
  data?: unknown;
}

/**
 * Current log level (configurable in development)
 */
let currentLogLevel = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO;

/**
 * Set the current log level
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * Get the current log level
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

/**
 * Create a logger instance for a specific context
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }



  /**
   * Log a debug message
   */
  debug(message: string, data?: unknown): void {
    if (currentLogLevel <= LogLevel.DEBUG) {
      this.log(LogLevel.DEBUG, message, data);
    }
  }

  /**
   * Log an info message
   */
  info(message: string, data?: unknown): void {
    if (currentLogLevel <= LogLevel.INFO) {
      this.log(LogLevel.INFO, message, data);
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: unknown): void {
    if (currentLogLevel <= LogLevel.WARN) {
      this.log(LogLevel.WARN, message, data);
    }
  }

  /**
   * Log an error message
   */
  error(message: string, data?: unknown): void {
    if (currentLogLevel <= LogLevel.ERROR) {
      this.log(LogLevel.ERROR, message, data);
    }
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LOG_LEVEL_NAMES[level],
      context: this.context,
      message,
      data,
    };

    const formattedMessage = this.formatEntry(entry);

    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(formattedMessage, data ?? '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data ?? '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, data ?? '');
        break;
    }
  }

  /**
   * Format a log entry for output
   */
  private formatEntry(entry: LogEntry): string {
    const { timestamp, levelName, context, message } = entry;
    return `${timestamp} ${levelName} ${context}: ${message}`;
  }
}

/**
 * Global logger for the chat service
 */
export const chatLogger = createLogger('ChatService');

/**
 * Global logger for adapter operations
 */
export const adapterLogger = createLogger('Adapter');

/**
 * Global logger for configuration
 */
export const configLogger = createLogger('Config');

/**
 * Log a chat message exchange (info level)
 */
export function logChatExchange(
  direction: 'sent' | 'received',
  messageLength: number,
  provider: string,
  model: string
): void {
  chatLogger.info(
    `${direction === 'sent' ? '→' : '←'} Chat ${direction} (${messageLength} chars) via ${provider}/${model}`
  );
}

/**
 * Log a retry attempt
 */
export function logRetryAttempt(
  attempt: number,
  maxRetries: number,
  errorMessage: string
): void {
  chatLogger.warn(
    `Retry attempt ${attempt}/${maxRetries}: ${errorMessage}`
  );
}

/**
 * Log an API error
 */
export function logAPIError(
  provider: string,
  statusCode: number,
  errorMessage: string
): void {
  chatLogger.error(
    `API Error [${provider}] ${statusCode}: ${errorMessage}`
  );
}
