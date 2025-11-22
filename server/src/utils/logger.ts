/**
 * Production-ready logger for telemetry and observability
 *
 * In production, these logs would be:
 * - Shipped to centralized logging (e.g., CloudWatch, DataDog, Splunk)
 * - Used for monitoring, alerting, and debugging
 * - Analyzed for performance metrics and user behavior
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

class Logger {
  private serviceName = "legal-triage-api";
  private isDevelopment = process.env.NODE_ENV !== "production";

  private formatLog(level: LogLevel, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      service: this.serviceName,
      message,
      ...metadata,
    };

    // In production, output as JSON for easy parsing
    if (!this.isDevelopment) {
      return JSON.stringify(logEntry);
    }

    // In development, output human-readable format
    const metaStr = metadata ? ` | ${JSON.stringify(metadata)}` : "";
    return `[${timestamp}] ${level} - ${message}${metaStr}`;
  }

  debug(message: string, metadata?: LogMetadata): void {
    console.debug(this.formatLog(LogLevel.DEBUG, message, metadata));
  }

  info(message: string, metadata?: LogMetadata): void {
    console.info(this.formatLog(LogLevel.INFO, message, metadata));
  }

  warn(message: string, metadata?: LogMetadata): void {
    console.warn(this.formatLog(LogLevel.WARN, message, metadata));
  }

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
    };

    console.error(this.formatLog(LogLevel.ERROR, message, errorMetadata));
  }

  // Structured logging for specific events
  httpRequest(method: string, path: string, statusCode: number, duration: number, metadata?: LogMetadata): void {
    this.info("HTTP request completed", {
      method,
      path,
      statusCode,
      durationMs: duration,
      ...metadata,
    });
  }

  aiRequest(model: string, messageCount: number, duration: number, success: boolean, metadata?: LogMetadata): void {
    this.info("AI request completed", {
      model,
      messageCount,
      durationMs: duration,
      success,
      ...metadata,
    });
  }

  configChange(action: string, resourceId?: string, metadata?: LogMetadata): void {
    this.info("Configuration change", {
      action,
      resourceId,
      ...metadata,
    });
  }
}

// Export singleton instance
export const logger = new Logger();
