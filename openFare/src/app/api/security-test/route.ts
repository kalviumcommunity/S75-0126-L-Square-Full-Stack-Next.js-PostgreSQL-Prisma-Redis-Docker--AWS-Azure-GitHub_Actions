/**
 * Security Testing API
 * Demonstration endpoints for security features
 */
import { NextResponse } from 'next/server';
import { 
  sanitizeInput, 
  detectXSS, 
  detectSQLInjection, 
  securityCheck,
  safeForHtml,
  validateWithSecurity,
  securityString,
  createSecureResponse,
  logSecurityEvent
} from '@/lib/security';

// Test cases for demonstration
const TEST_CASES = {
  XSS_ATTACKS: [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    'onerror=alert("XSS")',
    '<img src=x onerror=alert("XSS")>',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>'
  ],
  SQL_INJECTION: [
    "' OR '1'='1",
    '"; DROP TABLE users; --',
    "'; UPDATE users SET password='hacked' WHERE id=1; --",
    'UNION SELECT * FROM users'
  ],
  VALID_INPUTS: [
    'Hello World',
    'user@example.com',
    'This is a normal text input',
    '123-456-7890'
  ]
};

export async function GET() {
  try {
    // Test sanitization functions
    const sanitizationTests = {
      xssTests: TEST_CASES.XSS_ATTACKS.map(input => ({
        original: input,
        sanitized: sanitizeInput(input),
        isXSS: detectXSS(input),
        securityCheck: securityCheck(input)
      })),
      sqlTests: TEST_CASES.SQL_INJECTION.map(input => ({
        original: input,
        sanitized: sanitizeInput(input),
        isSQLInjection: detectSQLInjection(input),
        securityCheck: securityCheck(input)
      })),
      validTests: TEST_CASES.VALID_INPUTS.map(input => ({
        original: input,
        sanitized: sanitizeInput(input),
        isXSS: detectXSS(input),
        isSQLInjection: detectSQLInjection(input),
        securityCheck: securityCheck(input)
      }))
    };

    // Test encoding functions
    const encodingTests = {
      htmlEncoding: TEST_CASES.XSS_ATTACKS.slice(0, 2).map(input => ({
        original: input,
        encoded: safeForHtml(input)
      }))
    };

    // Test validation
    const validationTests = TEST_CASES.VALID_INPUTS.map(input => {
      const result = validateWithSecurity(
        { testField: input },
        securityString
      );
      return {
        input,
        isValid: result.isValid,
        errors: result.errors,
        securityIssues: result.securityIssues
      };
    });

    const response = {
      success: true,
      message: 'Security testing completed successfully',
      timestamp: new Date().toISOString(),
      tests: {
        sanitization: sanitizationTests,
        encoding: encodingTests,
        validation: validationTests
      },
      summary: {
        totalTests: 
          TEST_CASES.XSS_ATTACKS.length + 
          TEST_CASES.SQL_INJECTION.length + 
          TEST_CASES.VALID_INPUTS.length,
        detectedThreats: sanitizationTests.xssTests.filter(t => t.isXSS).length +
          sanitizationTests.sqlTests.filter(t => t.isSQLInjection).length,
        sanitizedSuccessfully: sanitizationTests.xssTests.length +
          sanitizationTests.sqlTests.length +
          sanitizationTests.validTests.length
      }
    };

    return createSecureResponse(response);
  } catch (error) {
    console.error('Security testing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Security testing failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Test the input with our security functions
    const testResults = {
      originalInput: body,
      sanitization: {
        sanitized: typeof body === 'string' ? sanitizeInput(body) : body,
        isXSS: typeof body === 'string' ? detectXSS(body) : false,
        isSQLInjection: typeof body === 'string' ? detectSQLInjection(body) : false,
        securityCheck: typeof body === 'string' ? securityCheck(body) : {
          isSafe: true,
          detectedThreats: [],
          sanitizedInput: body
        }
      },
      encoding: {
        htmlSafe: typeof body === 'string' ? safeForHtml(body) : body
      }
    };

    return createSecureResponse({
      success: true,
      message: 'Input security analysis completed',
      results: testResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Security POST test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid request format',
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }
}