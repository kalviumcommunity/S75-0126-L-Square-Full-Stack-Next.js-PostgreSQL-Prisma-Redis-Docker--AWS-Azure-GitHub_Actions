/**
 * Input Sanitization Utilities
 * Protect against XSS and other injection attacks
 */
import sanitizeHtml from 'sanitize-html';
import xss from 'xss';
import { SANITIZATION_CONFIG, XSS_CONFIG, ATTACK_PATTERNS } from './config';

/**
 * Sanitize HTML input to prevent XSS attacks
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return input as string;
  }

  try {
    // Primary sanitization using sanitize-html
    let sanitized = sanitizeHtml(input, SANITIZATION_CONFIG);
    
    // Secondary sanitization using xss library
    sanitized = xss(sanitized, XSS_CONFIG);
    
    // Remove common attack patterns
    ATTACK_PATTERNS.XSS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    return sanitized;
  } catch (error) {
    console.error('Sanitization error:', error);
    // Fallback: strip all HTML tags
    return input.replace(/<[^>]*>/g, '');
  }
}

/**
 * Sanitize object properties recursively
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : sanitizeObject(item)
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Sanitize form data
 * @param formData - FormData or object to sanitize
 * @returns Sanitized data
 */
export function sanitizeFormData(formData: FormData | Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  if (formData instanceof FormData) {
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value);
      } else {
        sanitized[key] = value;
      }
    }
  } else {
    return sanitizeObject(formData);
  }
  
  return sanitized;
}

/**
 * Detect potential XSS attacks in input
 * @param input - String to check
 * @returns Boolean indicating if attack patterns detected
 */
export function detectXSS(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  return ATTACK_PATTERNS.XSS.some(pattern => pattern.test(input));
}

/**
 * Detect potential SQL injection attempts
 * @param input - String to check
 * @returns Boolean indicating if attack patterns detected
 */
export function detectSQLInjection(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  return ATTACK_PATTERNS.SQL_INJECTION.some(pattern => pattern.test(input));
}

/**
 * Comprehensive security check for input
 * @param input - String to check
 * @returns Security assessment result
 */
export function securityCheck(input: string): {
  isSafe: boolean;
  detectedThreats: string[];
  sanitizedInput: string;
} {
  const threats: string[] = [];
  let isSafe = true;
  
  if (detectXSS(input)) {
    threats.push('XSS');
    isSafe = false;
  }
  
  if (detectSQLInjection(input)) {
    threats.push('SQL_INJECTION');
    isSafe = false;
  }
  
  const sanitizedInput = sanitizeInput(input);
  
  return {
    isSafe,
    detectedThreats: threats,
    sanitizedInput
  };
}

/**
 * Escape HTML entities for safe output
 * @param input - String to escape
 * @returns Escaped string
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return input as string;
  }
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize URL parameters
 * @param params - URL parameters object
 * @returns Sanitized parameters
 */
export function sanitizeUrlParams(params: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    sanitized[key] = sanitizeInput(value);
  }
  
  return sanitized;
}

/**
 * Sanitize JSON input
 * @param json - JSON string or object
 * @returns Sanitized JSON object
 */
export function sanitizeJson(json: string | Record<string, unknown>): Record<string, unknown> {
  try {
    const obj = typeof json === 'string' ? JSON.parse(json) : json;
    return sanitizeObject(obj);
  } catch (error) {
    console.error('JSON sanitization error:', error);
    return {};
  }
}