/**
 * Security Module Index
 * Export all security utilities and functions
 */

// Core security utilities
export * from './config';
export * from './sanitization';
export * from './encoding';
export * from './validation';
export * from './middleware';

// Convenience re-exports
export { 
  sanitizeInput,
  sanitizeObject,
  sanitizeFormData,
  securityCheck
} from './sanitization';

export {
  safeForHtml,
  safeForJavaScript,
  safeForCss,
  safeForUrl,
  safeForAttribute,
  encodeForContext,
  createSafeHtml
} from './encoding';

export {
  securityString,
  secureEmail,
  securePassword,
  secureName,
  securePhone,
  secureUrl,
  validateWithSecurity,
  handleSecurityError
} from './validation';

export {
  applySecurityHeaders,
  securityMiddleware,
  createSecureResponse,
  logSecurityEvent
} from './middleware';