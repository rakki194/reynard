/**
 * General Input Validation Utilities
 * Core input validation and sanitization functions
 */

import { t } from "../../utils/optional-i18n";
import { validateSQLInput } from "../sql-validation.js";
import { validateXSSInput, sanitizeXSSInput } from "../xss-validation.js";
import { sanitizeHTML } from "./html.js";

/**
 * Validate and sanitize general input
 */
export function validateInput(input: string, options: {
  maxLength?: number;
  minLength?: number;
  allowHTML?: boolean;
  allowSQL?: boolean;
  allowXSS?: boolean;
  allowSpecialChars?: boolean;
  pattern?: RegExp;
} = {}): {
  isValid: boolean;
  sanitized?: string;
  errors?: string[];
} {
  if (!input || typeof input !== "string") {
    return { isValid: false, errors: ["core.validation.invalid-input-type"] };
  }

  const errors: string[] = [];
  let sanitized = input;

  // Path traversal validation
  const pathTraversalPatterns = [
    /\.\./g,
    /\.\.\//g,
    /\.\.\\/g,
    /\.\.%2f/gi,
    /\.\.%2F/gi,
    /\.\.%5c/gi,
    /\.\.%5C/gi,
    /\.\.%252f/gi,
    /\.\.%252F/gi,
    /\.\.%255c/gi,
    /\.\.%255C/gi,
  ];

  for (const pattern of pathTraversalPatterns) {
    if (pattern.test(input)) {
      errors.push("Input contains path traversal attempts");
      break;
    }
  }

  // Check for null bytes and control characters
  if (/[\x00-\x1f\x7f]/.test(input)) {
    errors.push("Input contains invalid control characters");
  }

  // Check for hidden files (files starting with a dot)
  if (input.startsWith(".")) {
    errors.push("Input contains hidden file");
  }

  // Check for executable file extensions (only if it looks like a filename, not an email)
  const executableExtensions = [
    "exe", "bat", "cmd", "com", "scr", "msi", "dll", "sys", "drv",
    "pif", "vbs", "js", "jar", "app", "deb", "rpm", "sh", "ps1"
  ];
  
  const parts = input.split(".");
  // Only check if it looks like a filename (not an email or complex path)
  // Emails typically have @ symbol, so skip the check if @ is present
  if (parts.length > 1 && parts.length <= 3 && !input.includes("@")) {
    const extension = parts.pop()?.toLowerCase();
    if (extension && executableExtensions.includes(extension)) {
      errors.push("Input contains executable file extension");
    }
  }

  // Check for Windows reserved names
  const reservedNames = [
    "CON", "PRN", "AUX", "NUL",
    "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
    "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
  ];

  const nameWithoutExt = input.split(".")[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    errors.push("Input contains reserved system name");
  }

  // Length validation
  if (options.maxLength && input.length > options.maxLength) {
    errors.push(`Input exceeds maximum length of ${options.maxLength}`);
  }

  if (options.minLength && input.length < options.minLength) {
    errors.push(`Input must be at least ${options.minLength} characters`);
  }

  // HTML validation
  if (options.allowHTML === false) {
    if (sanitizeHTML(input) !== input) {
      errors.push("Input contains potentially dangerous HTML");
    }
    sanitized = sanitizeHTML(sanitized);
  }

  // SQL validation
  if (options.allowSQL === false) {
    const sqlResult = validateSQLInput(input);
    if (!sqlResult.isValid) {
      errors.push("Input contains potentially dangerous SQL");
    }
  }

  // XSS validation
  if (options.allowXSS === false) {
    if (!validateXSSInput(input)) {
      errors.push("Input contains potentially dangerous XSS content");
    }
    sanitized = sanitizeXSSInput(sanitized);
  }

  // Pattern validation
  if (options.pattern && !options.pattern.test(input)) {
    errors.push("Input does not match required pattern");
  }

  // Special character validation
  if (options.allowSpecialChars === false) {
    const specialCharPattern = /[<>:"|?*\x00-\x1f]/;
    if (specialCharPattern.test(sanitized)) {
      errors.push("Input contains invalid characters");
    }
  }

  const result = {
    isValid: errors.length === 0,
    sanitized: errors.length === 0 ? sanitized : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };

  return result;
}
