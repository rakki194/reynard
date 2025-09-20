/**
 * Common validation schemas for the Reynard framework
 */

import type { ValidationSchema } from "./types.js";

// ============================================================================
// Common Validation Schemas
// ============================================================================

export const CommonSchemas = {
  email: {
    type: "email" as const,
    required: true,
    errorMessage: "Please enter a valid email address",
  },

  password: {
    type: "password" as const,
    required: true,
    minLength: 8,
    maxLength: 128,
    errorMessage: "Password must be 8-128 characters with uppercase, lowercase, number, and special character",
  },

  username: {
    type: "username" as const,
    required: true,
    minLength: 3,
    maxLength: 30,
    errorMessage: "Username must be 3-30 characters with only letters, numbers, hyphens, and underscores",
  },

  url: {
    type: "url" as const,
    required: true,
    errorMessage: "Please enter a valid URL",
  },

  positiveNumber: {
    type: "number" as const,
    required: true,
    min: 0,
    errorMessage: "Must be a positive number",
  },

  nonEmptyString: {
    type: "string" as const,
    required: true,
    minLength: 1,
    errorMessage: "This field cannot be empty",
  },

  apiKey: {
    type: "api-key" as const,
    required: true,
    minLength: 10,
    maxLength: 256,
    errorMessage: "API key must be 10-256 characters with only letters, numbers, underscores, and hyphens",
  },

  token: {
    type: "token" as const,
    required: true,
    minLength: 20,
    maxLength: 512,
    errorMessage: "Token must be 20-512 characters",
  },

  filename: {
    type: "filename" as const,
    required: true,
    minLength: 1,
    maxLength: 255,
    errorMessage: "Filename cannot contain invalid characters",
  },

  mimeType: {
    type: "mime-type" as const,
    required: true,
    errorMessage: "Must be a valid MIME type",
  },

  port: {
    type: "port" as const,
    required: true,
    min: 1,
    max: 65535,
    errorMessage: "Port must be between 1 and 65535",
  },

  timeout: {
    type: "timeout" as const,
    required: true,
    min: 1000,
    max: 300000,
    errorMessage: "Timeout must be between 1 second and 5 minutes",
  },

  modelName: {
    type: "model-name" as const,
    required: true,
    minLength: 1,
    maxLength: 100,
    errorMessage: "Model name must be 1-100 characters with only letters, numbers, dots, underscores, and hyphens",
  },

  prompt: {
    type: "prompt" as const,
    required: true,
    minLength: 1,
    maxLength: 10000,
    errorMessage: "Prompt must be 1-10000 characters",
  },

  temperature: {
    type: "temperature" as const,
    required: true,
    min: 0,
    max: 2,
    errorMessage: "Temperature must be between 0 and 2",
  },

  maxTokens: {
    type: "max-tokens" as const,
    required: true,
    min: 1,
    max: 100000,
    errorMessage: "Max tokens must be between 1 and 100000",
  },

  theme: {
    type: "theme" as const,
    required: true,
    enum: ["light", "dark", "auto"],
    errorMessage: "Theme must be light, dark, or auto",
  },

  language: {
    type: "language" as const,
    required: true,
    minLength: 2,
    maxLength: 5,
    errorMessage: "Language must be a valid locale code (e.g., 'en' or 'en-US')",
  },

  color: {
    type: "color" as const,
    required: true,
    errorMessage: "Color must be a valid hex, RGB, or HSL color",
  },

  phone: {
    type: "phone" as const,
    required: true,
    errorMessage: "Must be a valid phone number",
  },

  ip: {
    type: "ip" as const,
    required: true,
    errorMessage: "Must be a valid IP address",
  },

  hexColor: {
    type: "hex-color" as const,
    required: true,
    errorMessage: "Must be a valid hex color",
  },
} as const satisfies Record<string, ValidationSchema>;

// ============================================================================
// Form Validation Schemas
// ============================================================================

export const FormSchemas = {
  login: {
    email: CommonSchemas.email,
    password: CommonSchemas.password,
  },

  registration: {
    email: CommonSchemas.email,
    username: CommonSchemas.username,
    password: CommonSchemas.password,
  },

  profile: {
    username: CommonSchemas.username,
    email: CommonSchemas.email,
  },

  settings: {
    theme: CommonSchemas.theme,
    language: CommonSchemas.language,
  },

  api: {
    apiKey: CommonSchemas.apiKey,
    modelName: CommonSchemas.modelName,
    temperature: CommonSchemas.temperature,
    maxTokens: CommonSchemas.maxTokens,
  },

  file: {
    filename: CommonSchemas.filename,
    mimeType: CommonSchemas.mimeType,
  },

  network: {
    url: CommonSchemas.url,
    port: CommonSchemas.port,
    timeout: CommonSchemas.timeout,
  },
} as const;

// ============================================================================
// Validation Schema Builders
// ============================================================================

export function createStringSchema(options: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  errorMessage?: string;
}): ValidationSchema {
  return {
    type: "string",
    required: options.required ?? true,
    minLength: options.minLength,
    maxLength: options.maxLength,
    pattern: options.pattern,
    errorMessage: options.errorMessage,
  };
}

export function createNumberSchema(options: {
  required?: boolean;
  min?: number;
  max?: number;
  errorMessage?: string;
}): ValidationSchema {
  return {
    type: "number",
    required: options.required ?? true,
    min: options.min,
    max: options.max,
    errorMessage: options.errorMessage,
  };
}

export function createEnumSchema<T>(
  values: T[],
  options: {
    required?: boolean;
    errorMessage?: string;
  } = {}
): ValidationSchema {
  return {
    type: "string",
    required: options.required ?? true,
    enum: values,
    errorMessage: options.errorMessage || `Must be one of: ${values.join(", ")}`,
  };
}

export function createCustomSchema<T>(
  validator: (value: unknown) => { isValid: boolean; error?: string },
  options: {
    required?: boolean;
    errorMessage?: string;
  } = {}
): ValidationSchema {
  return {
    type: "string",
    required: options.required ?? true,
    customValidator: validator,
    errorMessage: options.errorMessage,
  };
}
