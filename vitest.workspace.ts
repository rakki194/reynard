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
  "./packages/core/core",
  "./packages/core/composables",
  "./packages/core/config",
  "./packages/core/connection",
  "./packages/core/features",
  "./packages/core/http-client",
  "./packages/core/auth-core",
  "./packages/core/auth-composables",
  "./packages/core/i18n",
  "./packages/core/settings",
  "./packages/core/testing",
  "./packages/core/validation",

  // UI packages
  "./packages/ui/animation",
  "./packages/ui/charts",
  "./packages/ui/colors",
  "./packages/ui/components-charts",
  "./packages/ui/components-core",
  "./packages/ui/components-dashboard",
  "./packages/ui/components-themes",
  "./packages/ui/components-utils",
  "./packages/ui/dashboard",
  "./packages/ui/error-boundaries",
  "./packages/ui/floating-panel",
  "./packages/ui/fluent-icons",
  "./packages/ui/games",
  "./packages/ui/monaco",
  "./packages/ui/themes",
  "./packages/ui/ui",

  // AI packages
  "./packages/ai/ai-shared",
  "./packages/ai/annotating-core",
  "./packages/ai/annotating-florence2",
  "./packages/ai/annotating-joy",
  "./packages/ai/annotating-jtp2",
  "./packages/ai/annotating-ui",
  "./packages/ai/annotating-wdv3",
  "./packages/ai/caption",
  "./packages/ai/caption-core",
  "./packages/ai/caption-multimodal",
  "./packages/ai/caption-ui",
  "./packages/ai/comfy",
  "./packages/ai/model-management",
  "./packages/ai/multimodal",
  "./packages/ai/nlweb",
  "./packages/ai/rag",
  "./packages/ai/tool-calling",

  // Data packages
  "./packages/data/file-processing",
  "./packages/data/repository-core",
  "./packages/data/repository-multimodal",
  "./packages/data/repository-search",
  "./packages/data/repository-storage",
  "./packages/data/scraping",
  "./packages/data/unified-repository",

  // Media packages
  "./packages/media/3d",
  "./packages/media/audio",
  "./packages/media/boundingbox",
  "./packages/media/gallery",
  "./packages/media/gallery-ai",
  "./packages/media/gallery-dl",
  "./packages/media/image",
  "./packages/media/segmentation",
  "./packages/media/video",

  // Services packages
  "./packages/services/api-client",
  "./packages/services/auth",
  "./packages/services/chat",
  "./packages/services/email",
  "./packages/services/service-manager",

  // Dev tools packages
  "./packages/dev-tools/adr-system",
  "./packages/dev-tools/code-quality",
  "./packages/dev-tools/dev-server-management",
  "./packages/dev-tools/git-automation",
  "./packages/dev-tools/humility-parser",
  "./packages/dev-tools/project-architecture",
  "./packages/dev-tools/queue-watcher",
  "./packages/dev-tools/validation",
  "./packages/dev-tools/vitest-config-generator",

  // Docs packages
  "./packages/docs/diagram-generator",
  "./packages/docs/docs-components",
  "./packages/docs/docs-core",
  "./packages/docs/docs-generator",
  "./packages/docs/docs-site",

  // Examples and templates
  "./examples/comprehensive-dashboard",
  "./examples/test-app",
  "./templates/starter",
  "./scripts/testing",

  // E2E testing framework (for coverage integration)
  "./e2e",
];
