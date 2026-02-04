'use client';

import { useState } from 'react';
import { sanitizeInput, securityCheck } from '@/lib/security';

interface SecurityResult {
  originalInput?: string;
  sanitizedOutput?: string;
  sanitization?: {
    isSafe: boolean;
    detectedThreats: string[];
    sanitizedInput?: string;
    securityCheck: {
      isSafe: boolean;
      detectedThreats: string[];
    };
  };
  summary?: {
    totalTests: number;
    detectedThreats: number;
    sanitizedSuccessfully: number;
  };
  error?: string;
  results?: {
    originalInput: string;
    sanitization: {
      securityCheck: {
        isSafe: boolean;
        detectedThreats: string[];
      };
      isXSS?: boolean;
      isSQLInjection?: boolean;
    };
  };
  tests?: {
    sanitization?: {
      xssTests: { original: string; sanitized: string }[];
      sqlTests: { original: string; sanitized: string }[];
      validTests: { original: string }[];
    };
    encoding?: {
      htmlEncoding: { original: string; encoded: string }[];
    };
  };
}

export default function SecurityDemo() {
  const [input, setInput] = useState('');
  const [testResults, setTestResults] = useState<SecurityResult | null>(null);
  const [activeTab, setActiveTab] = useState('input');

  // Test cases for demonstration
  const testCases = {
    xss: [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>'
    ],
    sql: [
      "' OR '1'='1",
      '"; DROP TABLE users; --',
      "'; UPDATE users SET password='hacked' WHERE id=1; --"
    ],
    valid: [
      'Hello World',
      'user@example.com',
      'This is a normal text input',
      '123-456-7890'
    ]
  };

  const runSecurityTest = async () => {
    try {
      const response = await fetch('/api/security-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input)
      });
      
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({ error: 'Failed to run security test' });
    }
  };

  const runAutomatedTests = async () => {
    try {
      const response = await fetch('/api/security-test');
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Automated tests failed:', error);
      setTestResults({ error: 'Failed to run automated tests' });
    }
  };

  const runLocalSanitization = () => {
    if (!input.trim()) {
      setTestResults({ error: 'Please enter some text to sanitize' });
      return;
    }
    
    try {
      const securityResult = securityCheck(input);
      const sanitizedValue = sanitizeInput(input);
      
      const localResults = {
        results: {
          originalInput: input,
          sanitizedOutput: sanitizedValue,
          sanitization: {
            ...securityResult,
            securityCheck: {
              isSafe: securityResult.isSafe,
              detectedThreats: securityResult.detectedThreats
            }
          }
        },
        summary: {
          totalTests: 1,
          detectedThreats: securityResult.detectedThreats.length,
          sanitizedSuccessfully: securityResult.isSafe ? 1 : 0
        }
      };
      
      setTestResults(localResults);
    } catch (error) {
      console.error('Local sanitization failed:', error);
      setTestResults({ error: 'Failed to run local sanitization' });
    }
  };

  const formatJson = (obj: unknown) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔐 Security Testing Dashboard
            </h1>
            <p className="text-gray-600">
              Demonstrate OWASP security compliance with real-time input sanitization and attack detection
            </p>
          </div>

          <div className="p-6">
            {/* Input Testing Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🔍 Input Security Testing
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Input
                  </label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter text to test for XSS, SQL injection, or other security issues..."
                  />
                  <div className="mt-3 flex space-x-3">
                    <button
                      onClick={runSecurityTest}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Test Input
                    </button>
                    <button
                      onClick={runAutomatedTests}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Run Automated Tests
                    </button>
                    <button
                      onClick={runLocalSanitization}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Local Sanitization
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Test Cases
                  </label>
                  <div className="space-y-2">
                    {[
                      ...testCases.xss.slice(0, 2),
                      ...testCases.sql.slice(0, 2),
                      ...testCases.valid.slice(0, 2)
                    ].map((test, index) => (
                      <button
                        key={index}
                        onClick={() => setInput(test)}
                        className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <span className="font-mono text-gray-800 truncate block">
                          {test.length > 50 ? test.substring(0, 50) + '...' : test}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {testResults && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  📊 Security Analysis Results
                </h2>
                
                <div className="border rounded-lg overflow-hidden">
                  {/* Tabs */}
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                      {[
                        { id: 'input', label: 'Input Analysis' },
                        { id: 'sanitization', label: 'Sanitization' },
                        { id: 'encoding', label: 'Encoding' },
                        { id: 'summary', label: 'Summary' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6 bg-gray-50">
                    {activeTab === 'input' && testResults.results && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Original Input</h3>
                          <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
                            {formatJson(testResults.results.originalInput)}
                          </pre>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium text-gray-900 mb-2">Security Check</h3>
                            <div className={`p-3 rounded ${testResults.results.sanitization.securityCheck.isSafe ? 'bg-green-100' : 'bg-red-100'}`}>
                              <p className="font-medium">
                                Status: {testResults.results.sanitization.securityCheck.isSafe ? '✅ Safe' : '❌ Threats Detected'}
                              </p>
                              {testResults.results.sanitization.securityCheck.detectedThreats.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm">Threats:</p>
                                  <ul className="list-disc list-inside text-sm">
                                    {testResults.results.sanitization.securityCheck.detectedThreats.map((threat, index: number) => (
                                      <li key={index} className="text-red-700">{threat}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-gray-900 mb-2">Detection Results</h3>
                            <div className="bg-white p-3 rounded border">
                              <p>XSS Detected: {testResults.results.sanitization.isXSS ? 'Yes' : 'No'}</p>
                              <p>SQL Injection: {testResults.results.sanitization.isSQLInjection ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'sanitization' && (
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Sanitization Demonstration</h3>
                        {testResults.tests?.sanitization ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-medium text-red-700 mb-2">XSS Attacks</h4>
                              {testResults.tests.sanitization.xssTests.map((test, index: number) => (
                                <div key={index} className="bg-white p-3 rounded border mb-2">
                                  <p className="text-xs text-gray-500">Original:</p>
                                  <p className="font-mono text-sm mb-2 truncate">{test.original}</p>
                                  <p className="text-xs text-gray-500">Sanitized:</p>
                                  <p className="font-mono text-sm text-green-700 truncate">{test.sanitized}</p>
                                </div>
                              ))}
                            </div>
                                                          
                            <div>
                              <h4 className="font-medium text-red-700 mb-2">SQL Injection</h4>
                              {testResults.tests.sanitization.sqlTests.map((test, index: number) => (
                                <div key={index} className="bg-white p-3 rounded border mb-2">
                                  <p className="text-xs text-gray-500">Original:</p>
                                  <p className="font-mono text-sm mb-2 truncate">{test.original}</p>
                                  <p className="text-xs text-gray-500">Sanitized:</p>
                                  <p className="font-mono text-sm text-green-700 truncate">{test.sanitized}</p>
                                </div>
                              ))}
                            </div>
                                                          
                            <div>
                              <h4 className="font-medium text-green-700 mb-2">Valid Inputs</h4>
                              {testResults.tests.sanitization.validTests.map((test, index: number) => (
                                <div key={index} className="bg-white p-3 rounded border mb-2">
                                  <p className="font-mono text-sm">{test.original}</p>
                                  <p className="text-xs text-green-600 mt-1">✓ No sanitization needed</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p>No sanitization test data available</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'encoding' && (
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">HTML Encoding</h3>
                        {testResults.tests?.encoding ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {testResults.tests.encoding.htmlEncoding.map((test, index: number) => (
                              <div key={index} className="bg-white p-4 rounded border">
                                <p className="text-sm text-gray-500 mb-2">Original:</p>
                                <p className="font-mono text-sm mb-3 text-red-600">{test.original}</p>
                                <p className="text-sm text-gray-500 mb-2">HTML Safe:</p>
                                <p className="font-mono text-sm text-green-600" 
                                   dangerouslySetInnerHTML={{ __html: test.encoded }}>
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>No encoding test data available</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'summary' && testResults.summary && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-2xl font-bold text-blue-700">{testResults.summary.totalTests}</p>
                          <p className="text-blue-600">Total Tests</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <p className="text-2xl font-bold text-red-700">{testResults.summary.detectedThreats}</p>
                          <p className="text-red-600">Threats Detected</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-2xl font-bold text-green-700">{testResults.summary.sanitizedSuccessfully}</p>
                          <p className="text-green-600">Successfully Sanitized</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Security Information */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🛡️ Security Features Implemented
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-medium text-gray-900 mb-2">XSS Protection</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• HTML sanitization</li>
                    <li>• Script tag removal</li>
                    <li>• Attribute validation</li>
                    <li>• Real-time detection</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-medium text-gray-900 mb-2">SQL Injection Prevention</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Input pattern detection</li>
                    <li>• Quote escaping</li>
                    <li>• Query validation</li>
                    <li>• Prisma ORM protection</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-medium text-gray-900 mb-2">Security Headers</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Content Security Policy</li>
                    <li>• XSS Protection</li>
                    <li>• Frame Options</li>
                    <li>• Strict Transport Security</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}