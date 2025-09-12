/**
 * Security Validation Utilities
 * Input validation and sanitization functions
 */

import { i18n } from "reynard-i18n";

/**
 * Validate and sanitize HTML content
 */
export function sanitizeHTML(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/javascript:.*/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
    .replace(/<object[^>]*>.*?<\/object>/gi, "")
    .replace(/<embed[^>]*>.*?<\/embed>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<form[^>]*>.*?<\/form>/gi, "")
    .replace(/<input[^>]*>/gi, "")
    .replace(/<button[^>]*>.*?<\/button>/gi, "")
    .replace(/<select[^>]*>.*?<\/select>/gi, "")
    .replace(/<textarea[^>]*>.*?<\/textarea>/gi, "")
    .replace(/<img[^>]*on\w+[^>]*>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
}

/**
 * Validate URL for security
 */
export function validateURL(url: string): {
  isValid: boolean;
  sanitized?: string;
} {
  if (!url || typeof url !== "string") {
    return { isValid: false };
  }

  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { isValid: false };
    }

    // Check for dangerous patterns
    if (
      parsed.hostname.includes("localhost") ||
      parsed.hostname.includes("127.0.0.1") ||
      parsed.hostname.includes("0.0.0.0")
    ) {
      return { isValid: false };
    }

    return { isValid: true, sanitized: parsed.toString() };
  } catch {
    return { isValid: false };
  }
}

/**
 * 🐺 FIXED: Enhanced file name validation with comprehensive path traversal prevention
 * *snarls with predatory glee* No more escaping my security!
 */
export function validateFileName(filename: string): {
  isValid: boolean;
  sanitized?: string;
} {
  if (!filename || typeof filename !== "string") {
    return { isValid: false };
  }

  // Decode URL encoding to check for hidden traversal attempts
  let decoded = filename;
  try {
    decoded = decodeURIComponent(filename);
  } catch {
    // If decoding fails, use original
  }

  // Check for dangerous patterns - comprehensive list
  const dangerousPatterns = [
    // Basic directory traversal
    /\.\./,
    /\.\.\//,
    /\.\.\\/,

    // Encoded directory traversal
    /%2e%2e/,
    /%2E%2E/,
    /%2e\./,
    /\.%2e/,

    // Unicode encoded traversal
    /%c0%ae%c0%ae/,
    /%c1%9c/,

    // Double encoded
    /%252e%252e/,
    /%252E%252E/,

    // Windows path separators
    /\\/,
    /%5c/,
    /%5C/,

    // Invalid characters
    /[<>:"|?*]/,

    // Windows reserved names
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i,

    // Hidden files
    /^\./,

    // Executable files
    /\.(exe|bat|cmd|com|scr|pif|msi|sh|ps1|vbs|js)$/i,

    // Script files
    /\.(php|asp|aspx|jsp|py|rb|pl)$/i,

    // Configuration files
    /\.(conf|config|ini|cfg|xml|json|yaml|yml)$/i,

    // System files
    /\.(sys|dll|so|dylib)$/i,

    // Archive files that could contain malicious content
    /\.(zip|rar|7z|tar|gz|bz2)$/i,

    // Long paths (potential buffer overflow)
    /.{256,}/,

    // Multiple consecutive dots
    /\.{3,}/,

    // Mixed separators
    /[\/\\]/,

    // Absolute paths
    /^[\/\\]/,

    // Drive letters (Windows)
    /^[a-zA-Z]:/,

    // UNC paths
    /^\\\\/,

    // Environment variables
    /%[a-zA-Z_][a-zA-Z0-9_]*%/,

    // Home directory references
    /~\/?/,
    /%7e/,
    /%7E/,
  ];

  // Check both original and decoded filename
  const testStrings = [filename, decoded];

  for (const testString of testStrings) {
    for (const pattern of dangerousPatterns) {
      if (pattern.test(testString)) {
        return { isValid: false };
      }
    }
  }

  // Check for null bytes using string method
  if (filename.includes("\0") || decoded.includes("\0")) {
    return { isValid: false };
  }

  // Check for control characters
  if (
    /[\x00-\x1f\x7f-\x9f]/.test(filename) ||
    /[\x00-\x1f\x7f-\x9f]/.test(decoded)
  ) {
    return { isValid: false };
  }

  // Sanitize filename - more restrictive
  const sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Only allow alphanumeric, dots, underscores, hyphens
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .replace(/^_|_$/g, "") // Remove leading/trailing underscores
    .replace(/^\.|\.$/g, "") // Remove leading/trailing dots
    .substring(0, 100); // Limit length

  // Final validation of sanitized name
  if (!sanitized || sanitized.length === 0) {
    return { isValid: false };
  }

  return { isValid: true, sanitized };
}

/**
 * Validate JSON for security
 */
export function validateJSON(input: string): {
  isValid: boolean;
  parsed?: unknown;
} {
  if (!input || typeof input !== "string") {
    return { isValid: false };
  }

  try {
    const parsed = JSON.parse(input);

    // Check for prototype pollution
    if (typeof parsed === "object" && parsed !== null) {
      if (
        Object.prototype.hasOwnProperty.call(parsed, "__proto__") ||
        Object.prototype.hasOwnProperty.call(parsed, "constructor")
      ) {
        return { isValid: false };
      }
    }

    return { isValid: true, parsed };
  } catch {
    return { isValid: false };
  }
}

/**
 * 🐺 FIXED: Comprehensive SQL injection prevention
 * *snarls with predatory glee* No more bypassing my security!
 */
export function validateSQLInput(input: string): boolean {
  if (!input || typeof input !== "string") {
    return true;
  }

  // Normalize input for analysis
  const normalized = input
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/\/\*.*?\*\//g, "") // Remove block comments
    .replace(/--.*$/gm, "") // Remove line comments
    .replace(/#.*$/gm, "") // Remove hash comments
    .toLowerCase();

  // Comprehensive SQL injection patterns
  const sqlPatterns = [
    // Basic SQL keywords
    /\b(select|insert|update|delete|drop|create|alter|exec|execute|union|script)\b/,

    // Comment patterns (already normalized but check anyway)
    /(--|#|\/\*|\*\/)/,

    // Logic operators
    /\b(or|and)\b.*=.*\b(or|and)\b/,
    /\b(or|and)\b.*\d+\s*=\s*\d+/,
    /\b(or|and)\b\s+\d+\s*=\s*\d+/,
    /\b(or|and)\b\s+['"]\s*=\s*['"]/,
    /\b(or|and)\b\s+['"]\d+['"]\s*=\s*['"]\d+['"]/,
    /\b(or|and)\b\s+['"]\d+['"]\s*=\s*\d+/,
    /\b(or|and)\b\s+\d+\s*=\s*['"]\d+['"]/,
    /\b(or|and)\b.*1.*=.*1/,
    /\b(or|and)\b.*'1'.*=.*'1'/,

    // UNION attacks
    /union.*select/,
    /union.*all.*select/,

    // Script injection
    /script.*>/,
    /<\s*script/,

    // Function calls
    /\b(char|ascii|substring|concat|version|database|user|schema)\s*\(/,
    /\b(sleep|waitfor|benchmark|pg_sleep)\s*\(/,
    /\b(load_file|into\s+outfile|into\s+dumpfile)\b/,

    // Information schema
    /\binformation_schema\b/,
    /\bsys\./,
    /\bmysql\./,

    // Time-based attacks
    /\bwaitfor\s+delay\b/,
    /\bsleep\s*\(/,
    /\bbenchmark\s*\(/,

    // Error-based attacks
    /\bextractvalue\s*\(/,
    /\bupdatexml\s*\(/,
    /\bexp\s*\(/,

    // Boolean-based attacks
    /\bif\s*\(/,
    /\bcase\s+when/,

    // Stacked queries
    /;\s*(select|insert|update|delete|drop|create|alter)/,

    // Hex encoding attempts
    /0x[0-9a-f]+/,

    // String concatenation
    /['"]\s*\+\s*['"]/,
    /\bconcat\s*\(/,

    // Subqueries
    /\(\s*select\s+/,

    // Privilege escalation
    /\bgrant\b/,
    /\brevoke\b/,
    /\bprivileges\b/,

    // 🐺 ENHANCED: Advanced obfuscation patterns
    // Function obfuscation
    /\bchr\s*\(/i,
    /\bascii\s*\(/i,
    /\bord\s*\(/i,
    /\bhex\s*\(/i,
    /\bunhex\s*\(/i,
    /\bbin\s*\(/i,
    /\bunbin\s*\(/i,

    // Database-specific functions
    /\buser\s*\(/i,
    /\bdatabase\s*\(/i,
    /\bversion\s*\(/i,
    /\bconnection_id\s*\(/i,
    /\blast_insert_id\s*\(/i,

    // Advanced injection patterns
    /\bhaving\s+.*\s*=\s*\d+/i,
    /\bgroup\s+by\s+.*\s*having/i,
    /\border\s+by\s+.*\s*--/i,
    /\blimit\s+.*\s*--/i,

    // Blind injection patterns
    /\bexists\s*\(/i,
    /\bnot\s+exists\s*\(/i,
    /\bin\s*\(/i,
    /\bnot\s+in\s*\(/i,

    // Time-based blind patterns
    /\bif\s*\(.*,\s*sleep\s*\(/i,
    /\bcase\s+when.*\s+then\s+sleep\s*\(/i,

    // Error-based blind patterns
    /\bif\s*\(.*,\s*extractvalue\s*\(/i,
    /\bif\s*\(.*,\s*updatexml\s*\(/i,

    // Stacked query patterns
    /\b;\s*drop\s+table/i,
    /\b;\s*truncate\s+table/i,
    /\b;\s*alter\s+table/i,
    /\b;\s*create\s+table/i,

    // Advanced comment patterns
    /\*.*\*/i,
    /--.*$/i,
    /#.*$/i,

    // Whitespace obfuscation
    /\s+select\s+/i,
    /\s+union\s+/i,
    /\s+from\s+/i,
    /\s+where\s+/i,

    // Function obfuscation
    /\bchar\s*\(\s*\d+\s*\)/i,
    /\bascii\s*\(\s*['"]\w+['"]\s*\)/i,

    // String manipulation
    /\bsubstr\s*\(/i,
    /\bsubstring\s*\(/i,
    /\bmid\s*\(/i,
    /\bleft\s*\(/i,
    /\bright\s*\(/i,

    // Mathematical functions
    /\bfloor\s*\(/i,
    /\bceil\s*\(/i,
    /\bround\s*\(/i,
    /\babs\s*\(/i,
    /\bmod\s*\(/i,

    // Date/time functions
    /\bnow\s*\(/i,
    /\bcurrent_date\s*\(/i,
    /\bcurrent_time\s*\(/i,
    /\bcurrent_timestamp\s*\(/i,

    // System functions
    /\b@@version/i,
    /\b@@datadir/i,
    /\b@@hostname/i,
    /\b@@port/i,
    /\b@@socket/i,

    // Advanced injection techniques
    /\bprocedure\s+analyse\s*\(/i,
    /\binto\s+outfile/i,
    /\binto\s+dumpfile/i,
    /\bload\s+file\s*\(/i,

    // Boolean-based blind injection
    /\bif\s*\(\s*length\s*\(/i,
    /\bif\s*\(\s*ascii\s*\(/i,
    /\bif\s*\(\s*substr\s*\(/i,

    // Time-based blind injection
    /\bif\s*\(\s*.*\s*,\s*sleep\s*\(\s*\d+\s*\)/i,
    /\bcase\s+when\s+.*\s+then\s+sleep\s*\(\s*\d+\s*\)/i,

    // Error-based blind injection
    /\bif\s*\(\s*.*\s*,\s*extractvalue\s*\(\s*1\s*,\s*concat\s*\(/i,
    /\bif\s*\(\s*.*\s*,\s*updatexml\s*\(\s*1\s*,\s*concat\s*\(/i,
  ];

  // Check for any SQL injection patterns
  const hasSQLInjection = sqlPatterns.some((pattern) =>
    pattern.test(normalized),
  );

  // 🐺 ENHANCED: Advanced obfuscation detection
  const hasObfuscation = [
    // Comment obfuscation
    /\/\*.*?\*\//,
    /--.*$/,
    /#.*$/,

    // String splitting and concatenation
    /['"]\s*\+\s*['"]/,
    /\bconcat\s*\(/i,
    /\bconcat_ws\s*\(/i,

    // Function obfuscation
    /\bchar\s*\(/i,
    /\bchr\s*\(/i,
    /\bascii\s*\(/i,
    /\bord\s*\(/i,

    // Hex obfuscation
    /0x[0-9a-f]+/i,
    /0X[0-9A-F]+/i,

    // Unicode obfuscation
    /\\u[0-9a-f]{4}/i,
    /\\x[0-9a-f]{2}/i,

    // Whitespace obfuscation
    /\s+select\s+/i,
    /\s+union\s+/i,
    /\s+from\s+/i,
    /\s+where\s+/i,
    /\s+and\s+/i,
    /\s+or\s+/i,

    // Case obfuscation (mixed case in suspicious contexts)
    /[a-z][A-Z][a-z]/,
    /[A-Z][a-z][A-Z]/,

    // Tab and newline obfuscation
    /\t/,
    /\n/,
    /\r/,

    // Multiple consecutive spaces
    /\s{3,}/,

    // Null byte injection
    /\0/,

    // Control characters
    /[\x00-\x1f\x7f-\x9f]/,

    // Advanced encoding
    /%[0-9a-f]{2}/i,
    /&[a-z]+;/i,

    // SQL function obfuscation
    /\bif\s*\(/i,
    /\bcase\s+when/i,
    /\bwhen\s+.*\s+then/i,

    // Mathematical obfuscation
    /\bfloor\s*\(/i,
    /\bceil\s*\(/i,
    /\bround\s*\(/i,
    /\babs\s*\(/i,
    /\bmod\s*\(/i,

    // String manipulation obfuscation
    /\bsubstr\s*\(/i,
    /\bsubstring\s*\(/i,
    /\bmid\s*\(/i,
    /\bleft\s*\(/i,
    /\bright\s*\(/i,

    // Date/time obfuscation
    /\bnow\s*\(/i,
    /\bcurrent_date\s*\(/i,
    /\bcurrent_time\s*\(/i,
    /\bcurrent_timestamp\s*\(/i,

    // System variable obfuscation
    /\b@@version/i,
    /\b@@datadir/i,
    /\b@@hostname/i,
    /\b@@port/i,
    /\b@@socket/i,
  ].some((pattern) => pattern.test(input));

  return !hasSQLInjection && !hasObfuscation;
}

/**
 * Validate XSS patterns
 */
export function validateXSSInput(input: string): boolean {
  if (!input || typeof input !== "string") {
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

  return !xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate file size
 */
export function validateFileSize(
  size: number,
  maxSize: number = 10 * 1024 * 1024,
): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Validate MIME type
 */
export function validateMimeType(
  mimeType: string,
  allowedTypes: string[],
): boolean {
  if (!mimeType || !Array.isArray(allowedTypes)) {
    return false;
  }

  return allowedTypes.includes(mimeType);
}

/**
 * Comprehensive input validation
 */
export function validateInput(
  input: string,
  options: {
    maxLength?: number;
    allowHTML?: boolean;
    allowSQL?: boolean;
    allowXSS?: boolean;
    pattern?: RegExp;
  } = {},
): { isValid: boolean; sanitized?: string; errors: string[] } {
  const errors: string[] = [];
  let sanitized = input;

  if (!input || typeof input !== "string") {
    return {
      isValid: false,
      errors: [i18n.t("core.validation.invalid-input-type")],
    };
  }

  // Length validation
  if (options.maxLength && input.length > options.maxLength) {
    errors.push(`Input exceeds maximum length of ${options.maxLength}`);
  }

  // HTML validation
  if (!options.allowHTML && !validateXSSInput(input)) {
    errors.push(
      i18n.t("core.security.input-contains-potentially-dangerous-html"),
    );
    sanitized = sanitizeHTML(input);
  }

  // SQL injection validation
  if (!options.allowSQL && !validateSQLInput(input)) {
    errors.push(
      i18n.t("core.security.input-contains-potentially-dangerous-sql-patterns"),
    );
  }

  // XSS validation
  if (!options.allowXSS && !validateXSSInput(input)) {
    errors.push(
      i18n.t("core.security.input-contains-potentially-dangerous-xss-patterns"),
    );
  }

  // Path traversal validation
  if (/\.\./.test(input)) {
    errors.push(i18n.t("core.security.input-contains-path-traversal-patterns"));
  }

  // Windows reserved names validation
  if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i.test(input)) {
    errors.push(i18n.t("core.security.input-contains-windows-reserved-names"));
  }

  // Executable file validation (but not for email addresses)
  if (
    /\.(exe|bat|cmd|scr|pif|msi)$/i.test(input) ||
    (/\.com$/i.test(input) && !/@/.test(input))
  ) {
    errors.push(
      i18n.t("core.security.input-contains-executable-file-extensions"),
    );
  }

  // Null byte validation
  if (input.includes("\0")) {
    errors.push(i18n.t("core.security.input-contains-null-bytes"));
  }

  // Hidden file validation
  if (/^\./.test(input)) {
    errors.push(i18n.t("core.security.input-contains-hidden-files"));
  }

  // JavaScript file validation
  if (/\.(js|javascript)$/i.test(input)) {
    errors.push(
      i18n.t("core.security.input-contains-javascript-file-extensions"),
    );
  }

  // Pattern validation
  if (options.pattern && !options.pattern.test(input)) {
    errors.push(i18n.t("core.validation.does-not-match-pattern"));
  }

  return {
    isValid: errors.length === 0,
    sanitized: errors.length > 0 ? sanitized : input,
    errors,
  };
}
