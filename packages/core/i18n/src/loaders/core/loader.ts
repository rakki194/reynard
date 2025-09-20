/**
 * Enhanced translation loading system with namespace support and caching
 * Barrel export for modular translation loading functionality
 */

// Re-export all translation loading functionality
export { loadTranslationModuleCore, isTestEnvironment } from "./LoaderCore";

export { createNamespaceLoader, loadNamespace } from "../namespace/namespace-loader";

export { clearTranslationCache, getCacheStats } from "../cache/cache";

export { createOptimizedLoader } from "./optimized-loader";
