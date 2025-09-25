/**
 * 🦊 Global Pattern Definitions
 * ============================
 *
 * Global include and exclude patterns for the Reynard project architecture system.
 * Provides standardized patterns for file filtering across all project directories.
 */

/**
 * Global exclude patterns for all directories
 */
export const GLOBAL_EXCLUDE_PATTERNS = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
  "**/.nyc_output/**",
  "**/.cache/**",
  "**/tmp/**",
  "**/venv/**",
  "**/__pycache__/**",
  "**/.pytest_cache/**",
  "**/.mypy_cache/**",
  "**/.tox/**",
  "**/.coverage/**",
  "**/.eggs/**",
  "**/.eggs-info/**",
  "**/reynard.*.egg-info/**",
  "**/test-results/**",
  "**/playwright-report/**",
  "**/dombench-results/**",
  "**/results/**",
  "**/.tsbuildinfo",
  "**/pnpm-lock.yaml",
  "**/package-lock.json",
  "**/yarn.lock",
  "**/.DS_Store",
  "**/Thumbs.db",
  "**/.env",
  "**/.env.*",
  "**/.git/**",
  "**/.vscode/**",
] as const;

/**
 * Global include patterns for all directories
 */
export const GLOBAL_INCLUDE_PATTERNS = [
  "**/*.ts",
  "**/*.tsx",
  "**/*.js",
  "**/*.jsx",
  "**/*.py",
  "**/*.md",
  "**/*.mdx",
  "**/*.json",
  "**/*.yaml",
  "**/*.yml",
  "**/*.css",
  "**/*.html",
  "**/*.htm",
  "**/*.sh",
  "**/*.sql",
  "**/*.conf",
  "**/*.toml",
] as const;

/**
 * Package-specific exclude patterns
 */
export const PACKAGE_EXCLUDE_PATTERNS = ["**/node_modules/**", "**/dist/**", "**/build/**"] as const;

/**
 * Package-specific include patterns
 */
export const PACKAGE_INCLUDE_PATTERNS = ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.json", "**/*.md"] as const;

/**
 * Service-specific exclude patterns
 */
export const SERVICE_EXCLUDE_PATTERNS = ["**/__pycache__/**", "**/htmlcov/**", "**/*.egg-info/**"] as const;

/**
 * Service-specific include patterns
 */
export const SERVICE_INCLUDE_PATTERNS = ["**/*.py", "**/*.json", "**/*.md", "**/*.toml"] as const;

/**
 * Documentation-specific include patterns
 */
export const DOCS_INCLUDE_PATTERNS = [
  "**/*.md",
  "**/*.mdx",
  "**/*.yaml",
  "**/*.yml",
  "**/*.json",
  "**/*.html",
] as const;

/**
 * UI-specific include patterns
 */
export const UI_INCLUDE_PATTERNS = [
  "**/*.ts",
  "**/*.tsx",
  "**/*.js",
  "**/*.jsx",
  "**/*.json",
  "**/*.md",
  "**/*.css",
] as const;
