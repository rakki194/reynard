/**
 * Reynard AI Shared Package
 * 
 * This package provides shared utilities, base classes, and types for all
 * AI/ML packages in the Reynard framework. It serves as the foundation for
 * building consistent, interoperable AI/ML services.
 * 
 * @package reynard-ai-shared
 * @version 0.1.0
 */

// Export all types
export * from './types/index.js'

// Export all services
export * from './services/index.js'

// Export all models
export * from './models/index.js'

// Export all utilities
export * from './utils/index.js'

// Re-export commonly used items for convenience
export {
  // Base classes
  BaseAIService,
  
  // Registries
  ServiceRegistry,
  getServiceRegistry
} from './services/index.js'

export {
  // Base classes
  BaseModel,
  
  // Registries
  ModelRegistry,
  getModelRegistry
} from './models/index.js'

export {
  // Utilities
  ValidationUtils,
  PerformanceMonitor,
  ErrorUtils,
  DataUtils,
  ProgressTracker
} from './utils/index.js'

// All types are already exported via the wildcard export above
