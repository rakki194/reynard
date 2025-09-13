/**
 * Debug Statistics Management
 *
 * Tracks and manages debugging statistics for i18n operations.
 */

// Track used translation keys for debugging
export const usedKeys = new Set<string>();
export const missingKeys = new Set<string>();

export interface DebugStats {
  totalKeys: number;
  usedKeys: number;
  missingKeys: number;
  unusedKeys: number;
  cacheHits: number;
  cacheMisses: number;
}

export function createDebugStats(): DebugStats {
  return {
    totalKeys: 0,
    usedKeys: usedKeys.size,
    missingKeys: missingKeys.size,
    unusedKeys: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };
}

// Export getDebugStats as an alias for createDebugStats
export const getDebugStats = createDebugStats;
