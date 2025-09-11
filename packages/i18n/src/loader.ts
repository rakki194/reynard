/**
 * Enhanced translation loading system with namespace support and caching
 * Barrel export for modular translation loading functionality
 */

// Re-export all translation loading functionality
export { 
  loadTranslationsWithCache, 
  preloadTranslations,
  fullTranslations 
} from "./translation-loader";

export { 
  createNamespaceLoader, 
  loadNamespace 
} from "./namespace-loader";

export { 
  clearTranslationCache, 
  getCacheStats 
} from "./cache";

export { 
  createOptimizedLoader 
} from "./optimized-loader";
