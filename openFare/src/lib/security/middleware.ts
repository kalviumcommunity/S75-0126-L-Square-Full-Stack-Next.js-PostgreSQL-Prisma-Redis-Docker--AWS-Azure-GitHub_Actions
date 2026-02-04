/**
 * Security Middleware
 * HTTP security headers and request validation middleware
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SECURITY_HEADERS, CSP_CONFIG, SECURITY_FEATURES, isProduction } from './config';
import { detectXSS, detectSQLInjection } from './sanitization';
import { SecurityLogEntry } from './validation';

/**
 * Apply security headers to response
 * @param response - NextResponse to modify
 * @returns Modified response with security headers
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  if (!SECURITY_FEATURES.headers) {
    return response;
  }

  // Apply basic security headers
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    response.headers.set(header, value);
  });

  // Apply Content Security Policy
  if (SECURITY_FEATURES.csp) {
    const cspHeader = Object.entries(CSP_CONFIG)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
    response.headers.set('Content-Security-Policy', cspHeader);
  }

  // Additional security headers for production
  if (isProduction) {
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');
  }

  return response;
}

/**
 * Security logging middleware
 * @param request - Incoming request
 * @param eventType - Type of security event
 * @param severity - Severity level
 * @param details - Additional details
 * @param blocked - Whether request was blocked
 */
export function logSecurityEvent(
  request: NextRequest,
  eventType: 'XSS_ATTEMPT' | 'SQL_INJECTION' | 'RATE_LIMIT_EXCEEDED' | 'UNAUTHORIZED_ACCESS',
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  details: string,
  blocked: boolean = true
): void {
  if (!SECURITY_FEATURES.logging) {
    return;
  }

  const logEntry: SecurityLogEntry = {
    timestamp: Date.now(),
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    action: eventType,
    resource: request.nextUrl.pathname,
    success: !blocked,
    details,
    threatLevel: severity
  };

  // In production, you'd send this to a logging service
  console.log('SECURITY EVENT:', JSON.stringify(logEntry, null, 2));
}

/**
 * Input validation middleware
 * @param request - Incoming request
 * @returns Response if malicious input detected, null if clean
 */
export async function validateInput(request: NextRequest): Promise<NextResponse | null> {
  try {
    // Check query parameters
    const searchParams = request.nextUrl.searchParams;
    for (const [key, value] of searchParams.entries()) {
      if (typeof value === 'string') {
        if (detectXSS(value)) {
          logSecurityEvent(request, 'XSS_ATTEMPT', 'HIGH', `XSS detected in query param: ${key}=${value}`);
          return NextResponse.json(
            { error: 'Invalid input detected', code: 'SECURITY_VIOLATION' },
            { status: 400 }
          );
        }
        
        if (detectSQLInjection(value)) {
          logSecurityEvent(request, 'SQL_INJECTION', 'CRITICAL', `SQL injection detected in query param: ${key}=${value}`);
          return NextResponse.json(
            { error: 'Invalid input detected', code: 'SECURITY_VIOLATION' },
            { status: 400 }
          );
        }
      }
    }

    // Check headers for suspicious content
    const suspiciousHeaders = ['user-agent', 'referer', 'x-forwarded-for'];
    for (const header of suspiciousHeaders) {
      const headerValue = request.headers.get(header);
      if (headerValue && (detectXSS(headerValue) || detectSQLInjection(headerValue))) {
        logSecurityEvent(request, 'XSS_ATTEMPT', 'MEDIUM', `Malicious content in header: ${header}=${headerValue}`);
        // Log but don't block header-based attacks by default
      }
    }

    // For POST/PUT requests, check body content
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const contentType = request.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const body = await request.clone().json();
          // We'll validate the body in the route handler
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          const formData = await request.clone().formData();
          for (const [key, value] of formData.entries()) {
            if (typeof value === 'string' && (detectXSS(value) || detectSQLInjection(value))) {
              logSecurityEvent(request, 'XSS_ATTEMPT', 'HIGH', `Malicious content in form field: ${key}`);
              return NextResponse.json(
                { error: 'Invalid form data', code: 'SECURITY_VIOLATION' },
                { status: 400 }
              );
            }
          }
        }
      } catch (error) {
        // If we can't parse the body, that's suspicious
        logSecurityEvent(request, 'XSS_ATTEMPT', 'LOW', 'Failed to parse request body');
      }
    }

    return null; // No security issues detected
  } catch (error) {
    console.error('Input validation error:', error);
    return NextResponse.json(
      { error: 'Request validation failed', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }
}

/**
 * Rate limiting middleware (simple implementation)
 * @param request - Incoming request
 * @param maxRequests - Maximum requests per window
 * @param windowMs - Time window in milliseconds
 * @returns Response if rate limit exceeded, null if within limits
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  request: NextRequest,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
): NextResponse | null {
  if (!SECURITY_FEATURES.rateLimiting) {
    return null;
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowKey = `${ip}-${Math.floor(now / windowMs)}`;

  const windowData = rateLimitStore.get(windowKey) || { count: 0, resetTime: now + windowMs };

  if (now > windowData.resetTime) {
    // Reset the window
    windowData.count = 0;
    windowData.resetTime = now + windowMs;
  }

  windowData.count++;

  if (windowData.count > maxRequests) {
    logSecurityEvent(request, 'RATE_LIMIT_EXCEEDED', 'LOW', `Rate limit exceeded for IP: ${ip}`);
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded', 
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((windowData.resetTime - now) / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((windowData.resetTime - now) / 1000).toString()
        }
      }
    );
  }

  rateLimitStore.set(windowKey, windowData);

  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    const cutoff = now - (windowMs * 2);
    for (const [key, data] of rateLimitStore.entries()) {
      if (data.resetTime < cutoff) {
        rateLimitStore.delete(key);
      }
    }
  }

  return null;
}

/**
 * Comprehensive security middleware
 * Combines all security checks
 * @param request - Incoming request
 * @returns Response if security violation, null if request is clean
 */
export async function securityMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Apply rate limiting first
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Validate input
  const inputValidationResponse = await validateInput(request);
  if (inputValidationResponse) {
    return inputValidationResponse;
  }

  // If we get here, the request passed all security checks
  return null;
}

/**
 * Create a secure response with proper headers
 * @param data - Response data
 * @param status - HTTP status code
 * @param request - Original request (for logging)
 * @returns Secure NextResponse
 */
export function createSecureResponse(
  data: unknown,
  status: number = 200,
  request?: NextRequest
): NextResponse {
  const response = NextResponse.json(data, { status });
  
  // Apply security headers
  const securedResponse = applySecurityHeaders(response);
  
  // Log successful request
  if (request && SECURITY_FEATURES.logging) {
    logSecurityEvent(request, 'UNAUTHORIZED_ACCESS', 'LOW', 'Request processed successfully', false);
  }
  
  return securedResponse;
}