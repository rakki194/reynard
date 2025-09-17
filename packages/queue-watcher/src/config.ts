/**
 * 🦊 Reynard Queue Watcher Configuration
 *
 * Centralized configuration for the queue watcher system.
 * Now uses the project architecture system for consistency.
 */

import { 
  getWatchableDirectories, 
  getGlobalExcludePatterns 
} from "reynard-project-architecture";

// Get watchable directories from project architecture
export const WATCH_DIRECTORIES: string[] = getWatchableDirectories();

// Convert string patterns to RegExp patterns
export const EXCLUDE_PATTERNS: RegExp[] = getGlobalExcludePatterns().map(pattern => {
  // Convert glob pattern to regex
  // Use a more sophisticated approach to handle ** and * correctly
  let regexPattern = pattern
    .replace(/\./g, '\\.')  // Escape dots first
    .replace(/\*\*/g, 'DOUBLE_STAR_PLACEHOLDER')  // Temporarily replace **
    .replace(/\*/g, '[^/]*') // Replace single * with non-slash matcher
    .replace(/DOUBLE_STAR_PLACEHOLDER/g, '.*'); // Replace placeholder with .*
  
  // For patterns that start with **/, we want to match anywhere in the path
  // For other patterns, we still want to match the full path
  if (pattern.startsWith('**/')) {
    return new RegExp(regexPattern);
  } else {
    return new RegExp(`^${regexPattern}$`);
  }
});

// Default configuration values
export const DEFAULT_CONFIG = {
  watchDirectories: WATCH_DIRECTORIES,
  excludePatterns: EXCLUDE_PATTERNS,
  processingCooldown: 2000, // 2 seconds
  statusReportInterval: 10000, // 10 seconds
};
