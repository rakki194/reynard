/**
 * Vitest Workspace Configuration for Reynard Monorepo
 *
 * This centralized configuration uses the projects pattern to manage
 * all Vitest configurations across the entire monorepo efficiently.
 *
 * This eliminates the need for individual vitest.config files in each package while maintaining full control over testing configurations!
 */

// Simple array format for Vitest workspace
export default [
  // Core packages
  "./packages/components",

  "./packages/components-core",
  "./packages/components-themes",
  "./packages/testing",
  "./packages/charts",
  "./packages/games",
  "./packages/core/i18n",
  "./packages/rag",
  "./packages/ai-shared",
  "./packages/segmentation",
  "./packages/video",
  "./packages/validation",
  "./packages/code-quality",
  "./packages/queue-watcher",
  "./packages/algorithms",
  "./packages/auth",
  "./packages/fluent-icons",
  "./packages/themes",
  "./packages/error-boundaries",
  "./examples/comprehensive-dashboard",
  "./examples/test-app",
  "./templates/starter",
  "./scripts/testing",
];
