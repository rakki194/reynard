/**
 * Error and Validation Types
 * 
 * Defines types for error handling, validation results, and custom
 * error classes within the Reynard framework.
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

export interface MultiValidationResult {
  isValid: boolean
  results: Record<string, ValidationResult>
  errors: string[]
  warnings: string[]
}

export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AIError'
  }
}

export class ModelError extends AIError {
  constructor(message: string, public modelName: string, context?: Record<string, any>) {
    super(message, 'MODEL_ERROR', { modelName, ...context })
    this.name = 'ModelError'
  }
}

export class ServiceError extends AIError {
  constructor(message: string, public serviceName: string, context?: Record<string, any>) {
    super(message, 'SERVICE_ERROR', { serviceName, ...context })
    this.name = 'ServiceError'
  }
}
