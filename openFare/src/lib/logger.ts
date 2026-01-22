/**
 * Structured logger utility for consistent error tracking and debugging
 * Provides environment-aware logging with JSON formatting for better observability
 */

interface LogMeta {
  [key: string]: string | number | boolean | null | undefined | LogMeta | Array<LogMeta>;
}

export const logger = {
  /**
   * Log informational messages
   * @param message - Main log message
   * @param meta - Additional metadata/context
   */
  info: (message: string, meta?: LogMeta) => {
    console.log(
      JSON.stringify({
        level: "info",
        message,
        meta,
        timestamp: new Date().toISOString(),
      })
    );
  },

  /**
   * Log warning messages
   * @param message - Warning message
   * @param meta - Additional context
   */
  warn: (message: string, meta?: LogMeta) => {
    console.warn(
      JSON.stringify({
        level: "warn",
        message,
        meta,
        timestamp: new Date().toISOString(),
      })
    );
  },

  /**
   * Log error messages with full context
   * In production, sensitive data should be redacted
   * @param message - Error description
   * @param meta - Error details (will be redacted in production)
   */
  error: (message: string, meta?: LogMeta) => {
    const isProd = process.env.NODE_ENV === "production";
    
    // Redact sensitive information in production
    const safeMeta = isProd 
      ? { ...meta, stack: meta?.stack ? "REDACTED" : undefined }
      : meta;

    console.error(
      JSON.stringify({
        level: "error",
        message,
        meta: safeMeta,
        timestamp: new Date().toISOString(),
      })
    );
  },

  /**
   * Log debug messages (only in development)
   * @param message - Debug message
   * @param meta - Debug context
   */
  debug: (message: string, meta?: LogMeta) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        JSON.stringify({
          level: "debug",
          message,
          meta,
          timestamp: new Date().toISOString(),
        })
      );
    }
  },
};