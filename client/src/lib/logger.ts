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
  apiRequest(method: string, endpoint: string, statusCode: number, duration: number, metadata?: LogMetadata): void {
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
  streamEvent(event: "start" | "chunk" | "complete" | "error", metadata?: LogMetadata): void {
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
  cacheEvent(event: "hit" | "miss" | "invalidate" | "update", queryKey: string, metadata?: LogMetadata): void {
    this.debug(`Cache ${event}`, {
      event,
      queryKey,
      ...metadata,
    });
  }

  /**
   * Log form validation events
   */
  formValidation(formName: string, isValid: boolean, errors?: Record<string, unknown>, metadata?: LogMetadata): void {
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
