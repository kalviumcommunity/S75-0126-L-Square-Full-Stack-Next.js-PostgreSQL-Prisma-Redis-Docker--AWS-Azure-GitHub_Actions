/**
 * Security Configuration
 * Centralized security settings and constants
 */

// Security Headers Configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

// Content Security Policy
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"], // Consider removing unsafe-inline in production
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'frame-ancestors': ["'none'"]
};

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
};

// Sanitization Configuration
export const SANITIZATION_CONFIG = {
  // Allowed tags for HTML content (empty for maximum security)
  allowedTags: [],
  allowedAttributes: {},
  // Disallow all protocols except http/https for links
  allowedSchemes: ['http', 'https'],
  // Transform potentially dangerous characters
  transformTags: {
    'script': 'span',
    'iframe': 'span',
    'object': 'span',
    'embed': 'span'
  }
};

// XSS Protection Configuration
export const XSS_CONFIG = {
  whiteList: {}, // No tags allowed by default
  stripIgnoreTag: true, // Strip all HTML tags
  stripIgnoreTagBody: ['script'] // Remove script tag contents
};

// Security Logging Configuration
export const SECURITY_LOG_LEVEL = process.env.SECURITY_LOGGING === 'true' ? 'verbose' : 'silent';

// Environment-based configurations
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// Security Feature Flags
export const SECURITY_FEATURES = {
  headers: process.env.SECURITY_HEADERS === 'true',
  csp: process.env.CSP_ENABLED === 'true',
  xssProtection: process.env.XSS_PROTECTION === 'true',
  rateLimiting: process.env.RATE_LIMIT_ENABLED === 'true',
  logging: process.env.SECURITY_LOGGING === 'true'
};

// Common attack patterns to detect
export const ATTACK_PATTERNS = {
  XSS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
  ],
  SQL_INJECTION: [
    /('|").*('|")\s*(OR|AND)\s*('|").*('|")/gi,
    /(;).*?(DROP|DELETE|UPDATE|INSERT)/gi,
    /\/\*.*?\*\//g,
    /--.*$/gm
  ]
};