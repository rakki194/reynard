/**
 * Core validation types and interfaces for the Reynard validation system
 */

// ============================================================================
// Core Types
// ============================================================================

export type ValidationResult = {
  isValid: boolean;
  error?: string;
  field?: string;
  value?: unknown;
  errors?: string[];
};

export type MultiValidationResult = {
  isValid: boolean;
  errors: Record<string, string[]>;
  validFields: string[];
  invalidFields: string[];
};

export type ValidationSchema = {
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
  customValidator?: (value: unknown) => ValidationResult;
};

export type FieldValidationOptions = {
  fieldName?: string;
  context?: ValidationErrorContext;
  strict?: boolean;
  allowEmpty?: boolean;
};

export type ValidationErrorContext = {
  field: string;
  value: unknown;
  constraint: string;
  timestamp?: string;
  source?: string;
};

// ============================================================================
// Password Validation Types
// ============================================================================

export type PasswordStrength = {
  isValid: boolean;
  score: number;
  feedback: "weak" | "medium" | "strong" | "very-strong";
  suggestions: string[];
  crackTime?: string;
};

export type ValidationRules = {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
  emailPattern?: RegExp;
};

// ============================================================================
// URL Validation Types
// ============================================================================

export type URLValidationResult = {
  isValid: boolean;
  sanitized?: string;
  protocol?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
};

// ============================================================================
// File Validation Types
// ============================================================================

export type FileValidationOptions = {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  requireExtension?: boolean;
};

export type FileValidationResult = {
  isValid: boolean;
  errors: string[];
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    extension: string;
  };
};

// ============================================================================
// Form Validation Types
// ============================================================================

export type FormValidationResult = {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  validFields: string[];
  invalidFields: string[];
  warningFields: string[];
};

export type FormValidationOptions = {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showWarnings?: boolean;
  stopOnFirstError?: boolean;
};

// ============================================================================
// Validation Error Class
// ============================================================================

export class ValidationError extends Error {
  public readonly context: ValidationErrorContext;
  public readonly field: string;
  public readonly value: unknown;
  public readonly constraint: string;

  constructor(message: string, context: ValidationErrorContext) {
    super(message);
    this.name = "ValidationError";
    this.context = context;
    this.field = context.field;
    this.value = context.value;
    this.constraint = context.constraint;
  }
}
