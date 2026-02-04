/**
 * Security Validation Utilities
 * Enhanced validation schemas and security checks
 */
import { z } from 'zod';
import { detectXSS, detectSQLInjection } from './sanitization';

/**
 * Security-aware string validation
 */
export const securityString = z.string().superRefine((val, ctx) => {
  if (detectXSS(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Potential XSS attack detected',
      path: ['security']
    });
  }
  
  if (detectSQLInjection(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Potential SQL injection detected',
      path: ['security']
    });
  }
});

/**
 * Enhanced email validation with security checks
 */
export const secureEmail = z.string().email().superRefine((val, ctx) => {
  if (detectXSS(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Email contains malicious content',
      path: ['security']
    });
  }
});

/**
 * Enhanced password validation
 */
export const securePassword = z.string().min(8).max(128).superRefine((val, ctx) => {
  // Check for common weak passwords
  const weakPasswords = [
    'password', '123456', 'qwerty', 'admin', 'welcome'
  ];
  
  const lowerVal = val.toLowerCase();
  if (weakPasswords.some(weak => lowerVal.includes(weak))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password is too weak',
      path: ['strength']
    });
  }
  
  // Check for XSS/SQL injection
  if (detectXSS(val) || detectSQLInjection(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password contains malicious content',
      path: ['security']
    });
  }
});

/**
 * Secure name validation
 */
export const secureName = z.string().min(1).max(100).superRefine((val, ctx) => {
  // Check for suspicious characters
  if (/[%<>'"&]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Name contains invalid characters',
      path: ['format']
    });
  }
  
  if (detectXSS(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Name contains malicious content',
      path: ['security']
    });
  }
});

/**
 * Secure phone number validation
 */
export const securePhone = z.string().min(5).max(20).regex(/^[\+]?[0-9\s\-\(\)]+$/).superRefine((val, ctx) => {
  if (detectXSS(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Phone number contains malicious content',
      path: ['security']
    });
  }
});

/**
 * Secure URL validation
 */
export const secureUrl = z.string().url().superRefine((val, ctx) => {
  try {
    const url = new URL(val);
    
    // Only allow http/https protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only HTTP/HTTPS URLs are allowed',
        path: ['protocol']
      });
    }
    
    if (detectXSS(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'URL contains malicious content',
        path: ['security']
      });
    }
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid URL format',
      path: ['format']
    });
  }
});

/**
 * Security validation for user input objects
 */
export const securityObject = z.record(z.string(), securityString);

/**
 * Rate limiting validation
 */
export const rateLimitValidation = z.object({
  ip: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/),
  timestamp: z.number(),
  requestCount: z.number().min(0)
});

/**
 * Security event logging schema
 */
export const securityEventSchema = z.object({
  timestamp: z.number(),
  eventType: z.enum(['XSS_ATTEMPT', 'SQL_INJECTION', 'RATE_LIMIT_EXCEEDED', 'UNAUTHORIZED_ACCESS']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  sourceIp: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/).optional(),
  userAgent: z.string().optional(),
  details: z.string(),
  blocked: z.boolean()
});

/**
 * Input validation result type
 */
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  sanitizedData?: Record<string, unknown>;
  securityIssues: string[];
};

/**
 * Comprehensive input validation with security checks
 * @param data - Input data to validate
 * @param schema - Zod schema to validate against
 * @returns Validation result with security information
 */
export function validateWithSecurity<T>(
  data: Record<string, unknown>, 
  schema: z.ZodSchema<T>
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    securityIssues: []
  };
  
  try {
    // First, perform security checks on all string values
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        if (detectXSS(value)) {
          result.securityIssues.push(`XSS detected in field: ${key}`);
        }
        if (detectSQLInjection(value)) {
          result.securityIssues.push(`SQL injection detected in field: ${key}`);
        }
      }
    }
    
    // Then validate against schema
    schema.parse(data);
    
    // If we get here, validation passed
    result.isValid = result.securityIssues.length === 0;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      result.errors = error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      );
      result.isValid = false;
    } else {
      result.errors = ['Unknown validation error'];
      result.isValid = false;
    }
  }
  
  return result;
}

/**
 * Security-focused error handling
 * @param error - Error to process
 * @returns Sanitized error message
 */
export function handleSecurityError(error: unknown): string {
  if (error instanceof z.ZodError) {
    // Don't expose internal validation details
    return 'Invalid input data';
  }
  
  if (error instanceof Error) {
    // Log the real error but return generic message
    console.error('Security error:', error.message);
    return 'An error occurred processing your request';
  }
  
  return 'An unknown error occurred';
}

/**
 * Security audit log entry
 */
export interface SecurityLogEntry {
  timestamp: number;
  userId?: number;
  ip: string;
  userAgent: string;
  action: string;
  resource: string;
  success: boolean;
  details?: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}