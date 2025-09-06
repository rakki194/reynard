/**
 * Security Validation Utilities
 * Input validation and sanitization functions
 */

/**
 * Validate and sanitize HTML content
 */
export function sanitizeHTML(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/javascript:.*/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<form[^>]*>.*?<\/form>/gi, '')
    .replace(/<input[^>]*>/gi, '')
    .replace(/<button[^>]*>.*?<\/button>/gi, '')
    .replace(/<select[^>]*>.*?<\/select>/gi, '')
    .replace(/<textarea[^>]*>.*?<\/textarea>/gi, '')
    .replace(/<img[^>]*on\w+[^>]*>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
}

/**
 * Validate URL for security
 */
export function validateURL(url: string): { isValid: boolean; sanitized?: string } {
  if (!url || typeof url !== 'string') {
    return { isValid: false };
  }

  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: false };
    }

    // Check for dangerous patterns
    if (parsed.hostname.includes('localhost') || 
        parsed.hostname.includes('127.0.0.1') ||
        parsed.hostname.includes('0.0.0.0')) {
      return { isValid: false };
    }

    return { isValid: true, sanitized: parsed.toString() };
  } catch {
    return { isValid: false };
  }
}

/**
 * Validate file name for security
 */
export function validateFileName(filename: string): { isValid: boolean; sanitized?: string } {
  if (!filename || typeof filename !== 'string') {
    return { isValid: false };
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /\.\./,           // Directory traversal
    /[<>:"|?*]/,      // Invalid characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i, // Windows reserved names
    /^\./,            // Hidden files
    /\.(exe|bat|cmd|com|scr|pif|msi)$/i, // Executable files
    // Null bytes - using string method instead of regex
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(filename)) {
      return { isValid: false };
    }
  }

  // Check for null bytes using string method
  if (filename.includes('\0')) {
    return { isValid: false };
  }

  // Sanitize filename
  const sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');

  return { isValid: true, sanitized };
}

/**
 * Validate JSON for security
 */
export function validateJSON(input: string): { isValid: boolean; parsed?: unknown } {
  if (!input || typeof input !== 'string') {
    return { isValid: false };
  }

  try {
    const parsed = JSON.parse(input);
    
    // Check for prototype pollution
    if (typeof parsed === 'object' && parsed !== null) {
      if (Object.prototype.hasOwnProperty.call(parsed, '__proto__') || Object.prototype.hasOwnProperty.call(parsed, 'constructor')) {
        return { isValid: false };
      }
    }

    return { isValid: true, parsed };
  } catch {
    return { isValid: false };
  }
}

/**
 * Validate SQL injection patterns
 */
export function validateSQLInput(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return true;
  }

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(\b(OR|AND)\b.*=.*\b(OR|AND)\b)/i,
    /(\b(OR|AND)\b.*\d+\s*=\s*\d+)/i,
    /(UNION.*SELECT)/i,
    /(SCRIPT.*>)/i,
    /(<\s*SCRIPT)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\b\s+['"]\s*=\s*['"])/i,
    /(\b(OR|AND)\b\s+['"]\d+['"]\s*=\s*['"]\d+['"])/i,
    /(\b(OR|AND)\b\s+['"]\d+['"]\s*=\s*\d+)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*['"]\d+['"])/i,
    /(\b(OR|AND)\b.*1.*=.*1)/i,
    /(\b(OR|AND)\b.*'1'.*=.*'1')/i,
  ];

  return !sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate XSS patterns
 */
export function validateXSSInput(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return true;
  }

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /<img[^>]*src[^>]*>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi,
  ];

  return !xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Validate MIME type
 */
export function validateMimeType(mimeType: string, allowedTypes: string[]): boolean {
  if (!mimeType || !Array.isArray(allowedTypes)) {
    return false;
  }

  return allowedTypes.includes(mimeType);
}

/**
 * Comprehensive input validation
 */
export function validateInput(input: string, options: {
  maxLength?: number;
  allowHTML?: boolean;
  allowSQL?: boolean;
  allowXSS?: boolean;
  pattern?: RegExp;
} = {}): { isValid: boolean; sanitized?: string; errors: string[] } {
  const errors: string[] = [];
  let sanitized = input;

  if (!input || typeof input !== 'string') {
    return { isValid: false, errors: ['Invalid input type'] };
  }

  // Length validation
  if (options.maxLength && input.length > options.maxLength) {
    errors.push(`Input exceeds maximum length of ${options.maxLength}`);
  }

  // HTML validation
  if (!options.allowHTML && !validateXSSInput(input)) {
    errors.push('Input contains potentially dangerous HTML');
    sanitized = sanitizeHTML(input);
  }

  // SQL injection validation
  if (!options.allowSQL && !validateSQLInput(input)) {
    errors.push('Input contains potentially dangerous SQL patterns');
  }

  // XSS validation
  if (!options.allowXSS && !validateXSSInput(input)) {
    errors.push('Input contains potentially dangerous XSS patterns');
  }

  // Path traversal validation
  if (/\.\./.test(input)) {
    errors.push('Input contains path traversal patterns');
  }

  // Windows reserved names validation
  if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i.test(input)) {
    errors.push('Input contains Windows reserved names');
  }

  // Executable file validation (but not for email addresses)
  if (/\.(exe|bat|cmd|scr|pif|msi)$/i.test(input) || /\.com$/i.test(input) && !/@/.test(input)) {
    errors.push('Input contains executable file extensions');
  }

  // Null byte validation
  if (input.includes('\0')) {
    errors.push('Input contains null bytes');
  }

  // Hidden file validation
  if (/^\./.test(input)) {
    errors.push('Input contains hidden files');
  }

  // JavaScript file validation
  if (/\.(js|javascript)$/i.test(input)) {
    errors.push('Input contains JavaScript file extensions');
  }

  // Pattern validation
  if (options.pattern && !options.pattern.test(input)) {
    errors.push('Input does not match required pattern');
  }

  return {
    isValid: errors.length === 0,
    sanitized: errors.length > 0 ? sanitized : input,
    errors
  };
}
