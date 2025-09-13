#!/usr/bin/env node

/**
 * Test script to verify core works with and without i18n package
 */

/* eslint-env node */
/* global console, process */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🦊 Testing Reynard Core with optional i18n...\n");

// Test 1: Without i18n package
console.log("📦 Test 1: Core without i18n package");
console.log("=====================================");

try {
  // Temporarily remove i18n from package.json
  const packageJsonPath = path.join(__dirname, "../package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Store original optionalDependencies
  const originalOptionalDeps = packageJson.optionalDependencies;

  // Remove i18n from optionalDependencies
  if (packageJson.optionalDependencies) {
    delete packageJson.optionalDependencies["reynard-i18n"];
  }

  // Write modified package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Run tests
  console.log("Running tests without i18n...");
  execSync("pnpm vitest run src/__tests__/optional-i18n.test.ts", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  console.log("✅ Core works without i18n package!\n");

  // Restore original package.json
  packageJson.optionalDependencies = originalOptionalDeps;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
} catch (error) {
  console.error("❌ Core failed without i18n package:", error.message);
  process.exit(1);
}

// Test 2: With i18n package
console.log("📦 Test 2: Core with i18n package");
console.log("==================================");

try {
  // Ensure i18n is in optionalDependencies
  const packageJsonPath = path.join(__dirname, "../package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  if (!packageJson.optionalDependencies) {
    packageJson.optionalDependencies = {};
  }
  packageJson.optionalDependencies["reynard-i18n"] = "workspace:*";

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Run tests
  console.log("Running tests with i18n...");
  execSync("pnpm vitest run src/__tests__/optional-i18n.test.ts", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  console.log("✅ Core works with i18n package!\n");
} catch (error) {
  console.error("❌ Core failed with i18n package:", error.message);
  process.exit(1);
}

// Test 3: Build test
console.log("📦 Test 3: Build verification");
console.log("==============================");

try {
  console.log("Building core package...");
  execSync("pnpm build", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  // Check bundle size
  const distPath = path.join(__dirname, "../dist");
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    const mainFile = files.find(
      (f) => f.startsWith("index") && f.endsWith(".js"),
    );
    if (mainFile) {
      const stats = fs.statSync(path.join(distPath, mainFile));
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`📊 Bundle size: ${sizeKB}KB`);

      if (sizeKB < 50) {
        console.log(
          "✅ Bundle size is reasonable for standalone core package!",
        );
      } else {
        console.log("⚠️  Bundle size is larger than expected");
      }
    }
  }

  console.log("✅ Build successful!\n");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
