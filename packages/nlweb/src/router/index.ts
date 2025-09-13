/**
 * Router Module Exports
 *
 * Barrel exports for all router-related functionality.
 */

export { NLWebToolRegistry } from "./NLWebToolRegistry.js";
export { validateTool } from "./tool-validator.js";
export {
  isToolSuitableForContext,
  getContextualTools,
} from "./context-matcher.js";
export {
  searchTools,
  getToolsByTags,
  getToolsByCategory,
} from "./tool-searcher.js";
export { calculateToolStats } from "./tool-stats.js";
export {
  addToCategoryIndex,
  addToTagIndex,
  removeFromCategoryIndex,
  removeFromTagIndex,
} from "./tool-index.js";
