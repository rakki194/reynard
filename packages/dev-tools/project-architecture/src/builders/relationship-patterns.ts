/**
 * 🦊 Relationship Patterns
 * ========================
 *
 * Common relationship patterns for the Reynard project architecture.
 * Provides reusable patterns for defining relationships between directories.
 */

import { createDependency, createSibling, createDocuments, createTests } from "./relationship-builder.js";

/**
 * Common relationship patterns
 */
export const COMMON_RELATIONSHIPS = {
  // Core package relationships
  CORE_DEPENDENCY: createDependency("packages/core/core", "Uses core utilities"),
  VALIDATION_DEPENDENCY: createDependency("packages/core/validation", "Uses validation utilities"),
  HTTP_CLIENT_DEPENDENCY: createDependency("packages/core/http-client", "Uses HTTP client"),
  I18N_DEPENDENCY: createDependency("packages/core/i18n", "Uses internationalization"),
  CONNECTION_DEPENDENCY: createDependency("packages/core/connection", "Uses connection utilities"),
  COMPOSABLES_DEPENDENCY: createDependency("packages/core/composables", "Uses composables"),
  CONFIG_DEPENDENCY: createDependency("packages/core/config", "Uses configuration"),
  FEATURES_DEPENDENCY: createDependency("packages/core/features", "Uses feature flags"),
  SETTINGS_DEPENDENCY: createDependency("packages/core/settings", "Uses settings"),
  TESTING_DEPENDENCY: createDependency("packages/core/testing", "Uses testing utilities"),
  ALGORITHMS_DEPENDENCY: createDependency("packages/core/algorithms", "Uses algorithms"),
  AUTH_COMPOSABLES_DEPENDENCY: createDependency("packages/core/auth-composables", "Uses auth composables"),
  AUTH_CORE_DEPENDENCY: createDependency("packages/core/auth-core", "Uses auth core"),
  COLLABORATION_DEPENDENCY: createDependency("packages/core/collaboration", "Uses collaboration"),
  DYNAMIC_ENUM_DEPENDENCY: createDependency("packages/core/dynamic-enum", "Uses dynamic enums"),

  // AI package relationships
  AI_SHARED_DEPENDENCY: createDependency("packages/ai/ai-shared", "Uses AI shared utilities"),
  ANNOTATING_CORE_DEPENDENCY: createDependency("packages/ai/annotating-core", "Uses core annotation system"),
  ANNOTATING_FLORENCE2_DEPENDENCY: createDependency("packages/ai/annotating-florence2", "Uses Florence2 annotation"),
  ANNOTATING_JOY_DEPENDENCY: createDependency("packages/ai/annotating-joy", "Uses Joy annotation"),
  ANNOTATING_JTP2_DEPENDENCY: createDependency("packages/ai/annotating-jtp2", "Uses JTP2 annotation"),
  ANNOTATING_WDV3_DEPENDENCY: createDependency("packages/ai/annotating-wdv3", "Uses WDV3 annotation"),
  ANNOTATING_UI_DEPENDENCY: createDependency("packages/ai/annotating-ui", "Uses annotation UI"),
  CAPTION_DEPENDENCY: createDependency("packages/ai/caption", "Uses caption system"),
  CAPTION_CORE_DEPENDENCY: createDependency("packages/ai/caption-core", "Uses core caption system"),
  CAPTION_MULTIMODAL_DEPENDENCY: createDependency("packages/ai/caption-multimodal", "Uses multimodal captions"),
  CAPTION_UI_DEPENDENCY: createDependency("packages/ai/caption-ui", "Uses caption UI"),
  COMFY_DEPENDENCY: createDependency("packages/ai/comfy", "Uses ComfyUI integration"),
  MODEL_MANAGEMENT_DEPENDENCY: createDependency("packages/ai/model-management", "Uses model management"),
  MULTIMODAL_DEPENDENCY: createDependency("packages/ai/multimodal", "Uses multimodal AI"),
  NLWEB_DEPENDENCY: createDependency("packages/ai/nlweb", "Uses natural language web"),
  RAG_DEPENDENCY: createDependency("packages/ai/rag", "Uses RAG system"),
  TOOL_CALLING_DEPENDENCY: createDependency("packages/ai/tool-calling", "Uses tool calling"),

  // UI package relationships
  PRIMITIVES_DEPENDENCY: createDependency("packages/ui/primitives", "Uses primitive UI components"),
  UI_COMPONENTS_DEPENDENCY: createDependency("packages/ui/components-core", "Uses UI components"),
  UI_COMPONENTS_CHARTS_DEPENDENCY: createDependency("packages/ui/components-charts", "Uses chart components"),
  UI_COMPONENTS_DASHBOARD_DEPENDENCY: createDependency("packages/ui/components-dashboard", "Uses dashboard components"),
  UI_COMPONENTS_DIFFUSION_PIPE_DEPENDENCY: createDependency(
    "packages/ui/components-diffusion-pipe",
    "Uses diffusion pipe components"
  ),
  UI_COMPONENTS_THEMES_DEPENDENCY: createDependency("packages/ui/components-themes", "Uses theme components"),
  UI_COMPONENTS_UTILS_DEPENDENCY: createDependency("packages/ui/components-utils", "Uses utility components"),
  FLUENT_ICONS_DEPENDENCY: createDependency("packages/ui/fluent-icons", "Uses fluent icons"),
  THEMES_DEPENDENCY: createDependency("packages/ui/themes", "Uses themes"),
  COLORS_DEPENDENCY: createDependency("packages/ui/colors", "Uses colors"),
  ANIMATION_DEPENDENCY: createDependency("packages/ui/animation", "Uses animation system"),
  CHARTS_DEPENDENCY: createDependency("packages/ui/charts", "Uses chart components"),
  DASHBOARD_DEPENDENCY: createDependency("packages/ui/dashboard", "Uses dashboard layout"),
  ERROR_BOUNDARIES_DEPENDENCY: createDependency("packages/ui/error-boundaries", "Uses error boundaries"),
  FLOATING_PANEL_DEPENDENCY: createDependency("packages/ui/floating-panel", "Uses floating panels"),
  GAMES_DEPENDENCY: createDependency("packages/ui/games", "Uses game components"),
  MONACO_DEPENDENCY: createDependency("packages/ui/monaco", "Uses Monaco editor"),
  UI_DEPENDENCY: createDependency("packages/ui/ui", "Uses UI utilities"),

  // Service package relationships
  API_CLIENT_DEPENDENCY: createDependency("packages/services/api-client", "Uses API client"),
  AUTH_DEPENDENCY: createDependency("packages/services/auth", "Uses auth service"),
  CHAT_DEPENDENCY: createDependency("packages/services/chat", "Uses chat functionality"),
  DIFFUSION_PIPE_DEPENDENCY: createDependency("packages/services/diffusion-pipe", "Uses diffusion pipeline"),
  EMAIL_DEPENDENCY: createDependency("packages/services/email", "Uses email services"),
  SERVICE_MANAGER_DEPENDENCY: createDependency("packages/services/service-manager", "Uses service management"),

  // Data package relationships
  REPOSITORY_CORE_DEPENDENCY: createDependency("packages/data/repository-core", "Uses repository system"),
  REPOSITORY_MULTIMODAL_DEPENDENCY: createDependency(
    "packages/data/repository-multimodal",
    "Uses multimodal repository"
  ),
  REPOSITORY_SEARCH_DEPENDENCY: createDependency("packages/data/repository-search", "Uses search repository"),
  REPOSITORY_STORAGE_DEPENDENCY: createDependency("packages/data/repository-storage", "Uses storage repository"),
  FILE_PROCESSING_DEPENDENCY: createDependency("packages/data/file-processing", "Uses file processing"),
  SCRAPING_DEPENDENCY: createDependency("packages/data/scraping", "Uses web scraping"),
  UNIFIED_REPOSITORY_DEPENDENCY: createDependency("packages/data/unified-repository", "Uses unified repository"),

  // Media package relationships
  IMAGE_DEPENDENCY: createDependency("packages/media/image", "Uses image processing"),
  VIDEO_DEPENDENCY: createDependency("packages/media/video", "Uses video processing"),
  AUDIO_DEPENDENCY: createDependency("packages/media/audio", "Uses audio processing"),
  MEDIA_3D_DEPENDENCY: createDependency("packages/media/3d", "Uses 3D rendering"),
  BOUNDINGBOX_DEPENDENCY: createDependency("packages/media/boundingbox", "Uses bounding box utilities"),
  GALLERY_DEPENDENCY: createDependency("packages/media/gallery", "Uses gallery components"),
  GALLERY_AI_DEPENDENCY: createDependency("packages/media/gallery-ai", "Uses AI-powered gallery"),
  GALLERY_DL_DEPENDENCY: createDependency("packages/media/gallery-dl", "Uses gallery downloader"),
  SEGMENTATION_DEPENDENCY: createDependency("packages/media/segmentation", "Uses image segmentation"),

  // Dev tools relationships
  ADR_SYSTEM_DEPENDENCY: createDependency("packages/dev-tools/adr-system", "Uses ADR system"),
  CATALYST_DEPENDENCY: createDependency("packages/dev-tools/catalyst", "Uses development catalyst"),
  CODE_QUALITY_DEPENDENCY: createDependency("packages/dev-tools/code-quality", "Uses code quality tools"),
  DEV_SERVER_MANAGEMENT_DEPENDENCY: createDependency(
    "packages/dev-tools/dev-server-management",
    "Uses dev server management"
  ),
  GIT_AUTOMATION_DEPENDENCY: createDependency("packages/dev-tools/git-automation", "Uses git automation"),
  HUMILITY_PARSER_DEPENDENCY: createDependency("packages/dev-tools/humility-parser", "Uses humility parser"),
  INCREMENTAL_LINTING_DEPENDENCY: createDependency(
    "packages/dev-tools/incremental-linting",
    "Uses incremental linting"
  ),
  PROJECT_ARCHITECTURE_DEPENDENCY: createDependency(
    "packages/dev-tools/project-architecture",
    "Uses project architecture tools"
  ),
  QUEUE_WATCHER_DEPENDENCY: createDependency("packages/dev-tools/queue-watcher", "Uses queue watcher"),
  TSCONFIG_GENERATOR_DEPENDENCY: createDependency(
    "packages/dev-tools/tsconfig-generator",
    "Uses TypeScript config generator"
  ),
  VALIDATION_TOOLS_DEPENDENCY: createDependency("packages/dev-tools/validation", "Uses validation tools"),
  VITEST_CONFIG_GENERATOR_DEPENDENCY: createDependency(
    "packages/dev-tools/vitest-config-generator",
    "Uses Vitest config generator"
  ),
  VSCODE_LINTING_DEPENDENCY: createDependency("packages/dev-tools/vscode-linting", "Uses VS Code linting"),
  SCRIPTS_SIBLING: createSibling("scripts", "Related automation scripts"),

  // Documentation relationships
  DIAGRAM_GENERATOR_DEPENDENCY: createDependency("packages/docs/diagram-generator", "Uses diagram generation"),
  DOCS_COMPONENTS_DEPENDENCY: createDependency("packages/docs/docs-components", "Uses documentation components"),
  DOCS_CORE_DEPENDENCY: createDependency("packages/docs/docs-core", "Uses core documentation"),
  DOCS_GENERATOR_DEPENDENCY: createDependency("packages/docs/docs-generator", "Uses documentation generator"),
  DOCS_SITE_DEPENDENCY: createDependency("packages/docs/docs-site", "Uses documentation site"),
  DOCS_DOCUMENTS: createDocuments("docs", "Generates documentation"),

  // Backend relationships
  BACKEND_SIBLING: createSibling("backend", "Related backend services"),

  // Examples and templates relationships
  PACKAGES_DEPENDENCY: createDependency("packages", "Uses packages"),
  EXAMPLES_SIBLING: createSibling("examples", "Related examples"),
  TEMPLATES_SIBLING: createSibling("templates", "Related templates"),

  // Testing relationships
  PACKAGES_TESTS: createTests("packages", "Tests packages"),
  EXAMPLES_TESTS: createTests("examples", "Tests examples"),
} as const;
