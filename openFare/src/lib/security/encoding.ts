/**
 * Output Encoding Utilities
 * Safe rendering and encoding functions to prevent XSS
 */
import { escapeHtml } from './sanitization';

/**
 * Safe string for HTML output
 * @param input - String to make safe for HTML
 * @returns HTML-safe string
 */
export function safeForHtml(input: string): string {
  return escapeHtml(input);
}

/**
 * Safe string for JavaScript output
 * @param input - String to make safe for JavaScript
 * @returns JavaScript-safe string
 */
export function safeForJavaScript(input: string): string {
  if (!input || typeof input !== 'string') {
    return JSON.stringify(input);
  }
  
  // Escape characters that could break out of JavaScript context
  return input
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
}

/**
 * Safe string for CSS output
 * @param input - String to make safe for CSS
 * @returns CSS-safe string
 */
export function safeForCss(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous CSS characters
  return input
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .trim();
}

/**
 * Safe string for URL parameters
 * @param input - String to make safe for URL
 * @returns URL-safe string
 */
export function safeForUrl(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return encodeURIComponent(input);
}

/**
 * Safe string for attribute values
 * @param input - String to make safe for HTML attributes
 * @returns Attribute-safe string
 */
export function safeForAttribute(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Escape quotes and other dangerous characters
  return input
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Comprehensive output encoding based on context
 * @param input - String to encode
 * @param context - Output context (html, js, css, url, attribute)
 * @returns Appropriately encoded string
 */
export function encodeForContext(input: string, context: 'html' | 'js' | 'css' | 'url' | 'attribute'): string {
  switch (context) {
    case 'html':
      return safeForHtml(input);
    case 'js':
      return safeForJavaScript(input);
    case 'css':
      return safeForCss(input);
    case 'url':
      return safeForUrl(input);
    case 'attribute':
      return safeForAttribute(input);
    default:
      return safeForHtml(input);
  }
}

/**
 * Safe template literal processor for HTML
 * Usage: html`<div>${userInput}</div>`
 */
export function html(template: TemplateStringsArray, ...values: unknown[]): string {
  let result = template[0];
  
  for (let i = 1; i < template.length; i++) {
    result += safeForHtml(String(values[i - 1])) + template[i];
  }
  
  return result;
}

/**
 * Safe template literal processor for attributes
 * Usage: attr`id="${userInput}"`
 */
export function attr(template: TemplateStringsArray, ...values: unknown[]): string {
  let result = template[0];
  
  for (let i = 1; i < template.length; i++) {
    result += safeForAttribute(String(values[i - 1])) + template[i];
  }
  
  return result;
}

/**
 * Safe template literal processor for JavaScript
 * Usage: js`console.log("${userInput}")`
 */
export function js(template: TemplateStringsArray, ...values: unknown[]): string {
  let result = template[0];
  
  for (let i = 1; i < template.length; i++) {
    result += safeForJavaScript(String(values[i - 1])) + template[i];
  }
  
  return result;
}

/**
 * Create a safe React component for displaying user content
 * @param content - User-generated content
 * @param className - Optional CSS class
 * @returns Safe HTML string for React dangerouslySetInnerHTML
 */
export function createSafeHtml(content: string, className?: string): { __html: string } {
  const safeContent = safeForHtml(content);
  const classAttr = className ? ` class="${safeForAttribute(className)}"` : '';
  
  return {
    __html: `<div${classAttr}>${safeContent}</div>`
  };
}

/**
 * Validate and sanitize URL
 * @param url - URL to validate
 * @returns Validated and sanitized URL or null if invalid
 */
export function validateUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow http/https protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null;
    }
    
    // Basic sanitization
    return parsedUrl.toString();
  } catch {
    return null;
  }
}

/**
 * Safe redirect URL validation
 * @param url - Redirect URL to validate
 * @param allowedDomains - List of allowed domains
 * @returns Valid redirect URL or null
 */
export function validateRedirectUrl(url: string, allowedDomains: string[] = []): string | null {
  const validatedUrl = validateUrl(url);
  if (!validatedUrl) {
    return null;
  }
  
  try {
    const parsedUrl = new URL(validatedUrl);
    
    // Check if domain is in allowed list
    if (allowedDomains.length > 0 && !allowedDomains.includes(parsedUrl.hostname)) {
      return null;
    }
    
    return validatedUrl;
  } catch {
    return null;
  }
}