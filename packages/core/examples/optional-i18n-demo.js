#!/usr/bin/env node

/**
 * Demo script showing how Reynard Core works with optional i18n
 */

/* eslint-env node */
/* global console */

import { t, isI18nAvailable, getI18nModule } from "../dist/index.js";

console.log("🦊 Reynard Core Optional i18n Demo\n");

console.log("📦 Testing translation function...");
console.log("=====================================");

// Test basic translations
console.log("Basic translations:");
console.log(`  Generic error: "${t("core.errors.generic")}"`);
console.log(`  Network error: "${t("core.errors.network")}"`);
console.log(`  Test notification: "${t("core.test.notification")}"`);

// Test parameter substitution
console.log("\nParameter substitution:");
const exportError = t("core.errors.exportValidationFailed", {
  package: "demo-package",
  errors: "validation failed",
});
console.log(`  Export error: "${exportError}"`);

// Test missing translation
console.log("\nMissing translation:");
console.log(`  Missing key: "${t("core.nonexistent.key")}"`);

// Check i18n availability
console.log("\n📊 i18n Status:");
console.log("================");
console.log(`i18n available: ${isI18nAvailable()}`);
console.log(`i18n module: ${getI18nModule() ? "Available" : "Not available"}`);

console.log("\n🎯 Usage Examples:");
console.log("==================");
console.log("// Minimal installation");
console.log("pnpm install reynard-core solid-js");
console.log("// → Core works with fallback translations");
console.log("");
console.log("// Enhanced installation");
console.log("pnpm install reynard-core reynard-i18n solid-js");
console.log("// → Core works with full i18n support");
