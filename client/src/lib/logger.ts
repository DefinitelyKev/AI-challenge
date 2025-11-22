/**
 * Production-Level Logger for Frontend Applications
 *
 * This logger provides structured, production-ready logging capabilities
 * for the frontend, mirroring the server's logging architecture.
 *
 * ## Features:
 * - Structured JSON logging in production (for log aggregators)
 * - Human-readable logs in development
 * - Automatic browser context capture (user agent, viewport, locale)
 * - Performance timing with performance.now()
 * - Frontend-specific log types (API, streaming, navigation, interactions)
 *
 * ## Log Levels:
 * - DEBUG: Verbose development information (only shown in dev mode)
 * - INFO: General informational messages
 * - WARN: Non-critical issues
 * - ERROR: Critical failures with stack traces
 *
 * ## Usage Examples:
 *
 * ```typescript
 * import { logger } from './lib/logger';
 *
 * // Basic logging
 * logger.info('User logged in', { userId: '123' });
 * logger.error('API failed', error, { endpoint: '/api/data' });
 *
 * // API requests (automatic timing)
 * logger.apiRequest('GET', '/api/config', 200, 145);
 *
 * // Streaming events
 * logger.streamEvent('start', { endpoint: '/api/chat' });
 * logger.streamEvent('chunk', { chunkCount: 5 });
 * logger.streamEvent('complete', { duration: 2500 });
 *
 * // User interactions
 * logger.userInteraction('button_click', 'submit_form', { formName: 'login' });
 *
 * // Navigation
 * logger.navigation('/home', '/profile');
 *
 * // Performance metrics
 * logger.performance('page_load', 1234, 'ms');
 *
 * // Cache events (TanStack Query)
 * logger.cacheEvent('hit', 'config/detail');
 * logger.cacheEvent('invalidate', 'config/detail');
 * ```
 *
 * ## Production Format (JSON):
 * ```json
 * {
 *   "timestamp": "2024-01-15T10:30:45.123Z",
 *   "level": "INFO",
 *   "service": "legal-triage-ui",
 *   "message": "API request completed",
 *   "method": "GET",
 *   "endpoint": "/api/config",
 *   "statusCode": 200,
 *   "durationMs": 145
 * }
 * ```
 *
 * ## Development Format (Human-readable):
 * ```
 * [2024-01-15T10:30:45.123Z] INFO - API request completed | {"method":"GET","endpoint":"/api/config","statusCode":200,"durationMs":145}
 * ```
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

interface LogMetadata {
  [key: string]: unknown;
}

interface UserContext {
  userAgent: string;
  viewport: string;
  locale: string;
}

class Logger {
  private serviceName = "legal-triage-ui";
  private isDevelopment = import.meta.env.MODE === "development";

  /**
   * Get browser context for logging
   */
  private getUserContext(): UserContext {
    return {
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      locale: navigator.language,
    };
  }

  /**
   * Format log entry with timestamp and metadata
   */
  private formatLog(level: LogLevel, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      service: this.serviceName,
      message,
      ...metadata,
    };

    // In production, output as JSON for easy parsing by log aggregators
    if (!this.isDevelopment) {
      return JSON.stringify(logEntry);
    }

    // In development, output human-readable format with colors
    const metaStr = metadata ? ` | ${JSON.stringify(metadata)}` : "";
    return `[${timestamp}] ${level} - ${message}${metaStr}`;
  }

  /**
   * Debug level logging - verbose information for development
   */
  debug(message: string, metadata?: LogMetadata): void {
    if (this.isDevelopment) {
      console.debug(this.formatLog(LogLevel.DEBUG, message, metadata));
    }
  }

  /**
   * Info level logging - general information
   */
  info(message: string, metadata?: LogMetadata): void {
    console.info(this.formatLog(LogLevel.INFO, message, metadata));
  }

  /**
   * Warning level logging - non-critical issues
   */
  warn(message: string, metadata?: LogMetadata): void {
    console.warn(this.formatLog(LogLevel.WARN, message, metadata));
  }

  /**
   * Error level logging - critical issues
   */
  error(message: string, error?: Error | unknown, metadata?: LogMetadata): void {
    const errorMetadata = {
      ...metadata,
      ...(error instanceof Error
        ? {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
          }
        : { error: String(error) }),
      context: this.getUserContext(),
    };

    console.error(this.formatLog(LogLevel.ERROR, message, errorMetadata));
  }

  /**
   * Log API requests (success or failure)
   */
  apiRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    metadata?: LogMetadata
  ): void {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    const message = statusCode >= 400 ? "API request failed" : "API request completed";

    const logMethod = statusCode >= 400 ? this.warn.bind(this) : this.info.bind(this);
    logMethod(message, {
      method,
      endpoint,
      statusCode,
      durationMs: duration,
      ...metadata,
    });
  }

  /**
   * Log navigation/routing events
   */
  navigation(from: string, to: string, metadata?: LogMetadata): void {
    this.debug("Navigation event", {
      from,
      to,
      ...metadata,
    });
  }

  /**
   * Log user interactions
   */
  userInteraction(action: string, target: string, metadata?: LogMetadata): void {
    this.debug("User interaction", {
      action,
      target,
      ...metadata,
    });
  }

  /**
   * Log component lifecycle events (development only)
   */
  componentLifecycle(component: string, event: "mount" | "unmount" | "render", metadata?: LogMetadata): void {
    if (this.isDevelopment) {
      this.debug(`Component ${event}`, {
        component,
        event,
        ...metadata,
      });
    }
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, value: number, unit: string = "ms", metadata?: LogMetadata): void {
    this.info("Performance metric", {
      metric,
      value,
      unit,
      ...metadata,
    });
  }

  /**
   * Log streaming events (chat streaming)
   */
  streamEvent(
    event: "start" | "chunk" | "complete" | "error",
    metadata?: LogMetadata
  ): void {
    const level = event === "error" ? LogLevel.ERROR : LogLevel.DEBUG;
    const logMethod = event === "error" ? this.error.bind(this) : this.debug.bind(this);

    logMethod(`Stream ${event}`, {
      event,
      ...metadata,
    });
  }

  /**
   * Log state changes (development only)
   */
  stateChange(stateName: string, oldValue: unknown, newValue: unknown, metadata?: LogMetadata): void {
    if (this.isDevelopment) {
      this.debug("State change", {
        stateName,
        oldValue,
        newValue,
        ...metadata,
      });
    }
  }

  /**
   * Log cache events (TanStack Query)
   */
  cacheEvent(
    event: "hit" | "miss" | "invalidate" | "update",
    queryKey: string,
    metadata?: LogMetadata
  ): void {
    this.debug(`Cache ${event}`, {
      event,
      queryKey,
      ...metadata,
    });
  }

  /**
   * Log form validation events
   */
  formValidation(
    formName: string,
    isValid: boolean,
    errors?: Record<string, unknown>,
    metadata?: LogMetadata
  ): void {
    const level = isValid ? LogLevel.DEBUG : LogLevel.WARN;
    const logMethod = isValid ? this.debug.bind(this) : this.warn.bind(this);

    logMethod("Form validation", {
      formName,
      isValid,
      errors,
      ...metadata,
    });
  }

  /**
   * Log application initialization
   */
  appInit(metadata?: LogMetadata): void {
    this.info("Application initialized", {
      mode: import.meta.env.MODE,
      ...this.getUserContext(),
      ...metadata,
    });
  }

  /**
   * Group related logs (development only)
   */
  group(label: string, callback: () => void): void {
    if (this.isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing/mocking
export { Logger };
