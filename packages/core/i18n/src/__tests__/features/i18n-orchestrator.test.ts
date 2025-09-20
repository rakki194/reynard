/**
 * I18n Test Suite Orchestrator
 *
 * This file coordinates all i18n test modules to provide comprehensive
 * test coverage while maintaining modular organization.
 *
 * Split from original 775-line monolithic test file into focused modules:
 * - i18n-core.test.ts: Basic translation, locale management, RTL support
 * - i18n-translations.test.ts: Parameter interpolation, function values
 * - i18n-pluralization.test.ts: Plural forms, count-based translations
 * - i18n-integration.test.ts: Translation loading, error handling, system integration
 */

// Import all test modules
import "./i18n-core.test";
import "./i18n-translations.test";
import "./i18n-pluralization.test";
import "../core/integration.test";
