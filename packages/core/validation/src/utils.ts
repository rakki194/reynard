/**
 * Convenience validation functions for common use cases
 */

import { ValidationUtils } from "./core.js";
import { CommonSchemas } from "./schemas.js";
import type { PasswordStrength, ValidationResult, ValidationRules } from "./types.js";

// ============================================================================
// Basic Field Validators
// ============================================================================

/**
 * Validate an email address
 */
export function validateEmail(email: string, fieldName = "email"): ValidationResult {
  return ValidationUtils.validateValue(email, CommonSchemas.email, { fieldName });
}

/**
 * Validate a password
 */
export function validatePassword(password: string, fieldName = "password"): ValidationResult {
  return ValidationUtils.validateValue(password, CommonSchemas.password, { fieldName });
}

/**
 * Validate a username
 */
export function validateUsername(username: string, fieldName = "username"): ValidationResult {
  return ValidationUtils.validateValue(username, CommonSchemas.username, { fieldName });
}

/**
 * Validate a URL
 */
export function validateUrl(url: string, fieldName = "url"): ValidationResult {
  return ValidationUtils.validateValue(url, CommonSchemas.url, { fieldName });
}

/**
 * Validate any value against a schema
 */
export function validateValue(
  value: unknown,
  schema: {
    type:
      | "string"
      | "number"
      | "boolean"
      | "object"
      | "array"
      | "email"
      | "url"
      | "date"
      | "phone"
      | "ip"
      | "hex-color"
      | "username"
      | "password"
      | "api-key"
      | "token"
      | "filename"
      | "mime-type"
      | "port"
      | "timeout"
      | "model-name"
      | "prompt"
      | "temperature"
      | "max-tokens"
      | "theme"
      | "language"
      | "color";
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: unknown[];
    errorMessage?: string;
  },
  fieldName = "field"
): ValidationResult {
  return ValidationUtils.validateValue(value, schema, { fieldName });
}

// ============================================================================
// API Validators
// ============================================================================

/**
 * Validate an API key
 */
export function validateApiKey(apiKey: string, fieldName = "apiKey"): ValidationResult {
  return ValidationUtils.validateValue(apiKey, CommonSchemas.apiKey, { fieldName });
}

/**
 * Validate an authentication token
 */
export function validateToken(token: string, fieldName = "token"): ValidationResult {
  return ValidationUtils.validateValue(token, CommonSchemas.token, { fieldName });
}

// ============================================================================
// File and Media Validators
// ============================================================================

/**
 * Validate a filename
 */
export function validateFileName(fileName: string, fieldName = "fileName"): ValidationResult {
  return ValidationUtils.validateValue(fileName, CommonSchemas.filename, { fieldName });
}

/**
 * Validate a MIME type
 */
export function validateMimeType(mimeType: string, fieldName = "mimeType"): ValidationResult {
  return ValidationUtils.validateValue(mimeType, CommonSchemas.mimeType, { fieldName });
}

/**
 * Validate file size
 */
export function validateFileSize(
  fileSize: number,
  fieldName = "fileSize",
  maxSize = 100 * 1024 * 1024 // 100MB default
): ValidationResult {
  return ValidationUtils.validateValue(
    fileSize,
    {
      type: "number",
      required: true,
      min: 0,
      max: maxSize,
      errorMessage: `File size must be between 0 and ${Math.round(maxSize / 1024 / 1024)}MB`,
    },
    { fieldName }
  );
}

// ============================================================================
// Configuration Validators
// ============================================================================

/**
 * Validate a port number
 */
export function validatePort(port: number, fieldName = "port"): ValidationResult {
  return ValidationUtils.validateValue(port, CommonSchemas.port, { fieldName });
}

/**
 * Validate a timeout value
 */
export function validateTimeout(timeout: number, fieldName = "timeout"): ValidationResult {
  return ValidationUtils.validateValue(timeout, CommonSchemas.timeout, { fieldName });
}

/**
 * Validate retry count
 */
export function validateRetryCount(retryCount: number, fieldName = "retryCount"): ValidationResult {
  return ValidationUtils.validateValue(
    retryCount,
    {
      type: "number",
      required: true,
      min: 0,
      max: 10,
      errorMessage: "Retry count must be between 0 and 10",
    },
    { fieldName }
  );
}

// ============================================================================
// AI/ML Validators
// ============================================================================

/**
 * Validate a model name
 */
export function validateModelName(modelName: string, fieldName = "modelName"): ValidationResult {
  return ValidationUtils.validateValue(modelName, CommonSchemas.modelName, { fieldName });
}

/**
 * Validate a prompt
 */
export function validatePrompt(prompt: string, fieldName = "prompt"): ValidationResult {
  return ValidationUtils.validateValue(prompt, CommonSchemas.prompt, { fieldName });
}

/**
 * Validate temperature parameter
 */
export function validateTemperature(temperature: number, fieldName = "temperature"): ValidationResult {
  return ValidationUtils.validateValue(temperature, CommonSchemas.temperature, { fieldName });
}

/**
 * Validate max tokens parameter
 */
export function validateMaxTokens(maxTokens: number, fieldName = "maxTokens"): ValidationResult {
  return ValidationUtils.validateValue(maxTokens, CommonSchemas.maxTokens, { fieldName });
}

// ============================================================================
// UI/UX Validators
// ============================================================================

/**
 * Validate a theme
 */
export function validateTheme(theme: string, fieldName = "theme"): ValidationResult {
  return ValidationUtils.validateValue(theme, CommonSchemas.theme, { fieldName });
}

/**
 * Validate a language code
 */
export function validateLanguage(language: string, fieldName = "language"): ValidationResult {
  return ValidationUtils.validateValue(language, CommonSchemas.language, { fieldName });
}

/**
 * Validate a color value
 */
export function validateColor(color: string, fieldName = "color"): ValidationResult {
  return ValidationUtils.validateValue(color, CommonSchemas.color, { fieldName });
}

// ============================================================================
// Utility Validators
// ============================================================================

/**
 * Validate that a value is not empty
 */
export function validateNotEmpty(value: unknown, fieldName = "field"): ValidationResult {
  if (value === null || value === undefined || value === "") {
    return {
      isValid: false,
      error: `${fieldName} cannot be empty`,
      field: fieldName,
      value,
    };
  }
  return { isValid: true, field: fieldName, value };
}

/**
 * Validate that a value is a positive number
 */
export function validatePositive(value: number, fieldName = "field"): ValidationResult {
  if (typeof value !== "number" || value <= 0) {
    return {
      isValid: false,
      error: `${fieldName} must be a positive number`,
      field: fieldName,
      value,
    };
  }
  return { isValid: true, field: fieldName, value };
}

/**
 * Validate that a value is within a range
 */
export function validateRange(value: number, min: number, max: number, fieldName = "field"): ValidationResult {
  if (typeof value !== "number" || value < min || value > max) {
    return {
      isValid: false,
      error: `${fieldName} must be between ${min} and ${max}`,
      field: fieldName,
      value,
    };
  }
  return { isValid: true, field: fieldName, value };
}

// ============================================================================
// Advanced Password Validation
// ============================================================================

/**
 * Validate password strength with enhanced feedback
 */
export function validatePasswordStrength(
  password: string,
  rules: ValidationRules = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
  }
): PasswordStrength {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (rules.minLength && password.length < rules.minLength) {
    errors.push(`Password must be at least ${rules.minLength} characters long`);
  } else if (rules.minLength && password.length >= rules.minLength) {
    score += 1;
  }

  // Uppercase check
  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else if (rules.requireUppercase && /[A-Z]/.test(password)) {
    score += 1;
  }

  // Lowercase check
  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else if (rules.requireLowercase && /[a-z]/.test(password)) {
    score += 1;
  }

  // Number check
  if (rules.requireNumber && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  } else if (rules.requireNumber && /\d/.test(password)) {
    score += 1;
  }

  // Special character check
  if (rules.requireSpecialChar && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  } else if (rules.requireSpecialChar && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score += 1;
  }

  // Determine strength level
  let strength: "weak" | "medium" | "strong" | "very-strong";
  if (score <= 2) strength = "weak";
  else if (score <= 3) strength = "medium";
  else if (score <= 4) strength = "strong";
  else strength = "very-strong";

  return {
    isValid: errors.length === 0,
    score,
    feedback: strength,
    suggestions: errors,
  };
}

// ============================================================================
// URL Validation with Security
// ============================================================================

/**
 * Validate URL for security
 */
export function validateUrlSecurity(url: string): {
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

    // Reject localhost and private IP addresses
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.")
    ) {
      return { isValid: false };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [/javascript:/i, /data:/i, /vbscript:/i, /file:/i, /ftp:/i];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        return { isValid: false };
      }
    }

    // Add trailing slash if missing
    let sanitized = url;
    if (!sanitized.endsWith("/") && !sanitized.includes("?")) {
      sanitized += "/";
    }

    return { isValid: true, sanitized };
  } catch {
    return { isValid: false };
  }
}
