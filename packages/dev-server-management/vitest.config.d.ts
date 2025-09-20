/**
 * 🦊 Vitest Configuration for Dev Server Management
 *
 * Comprehensive test configuration for the development server management system.
 * Includes coverage, environment setup, and test utilities.
 */
declare const _default: import("vite").UserConfig & Promise<import("vite").UserConfig> & (import("vitest/config.js").UserConfigFnObject & import("vitest/config.js").UserConfigExport);
export default _default;
