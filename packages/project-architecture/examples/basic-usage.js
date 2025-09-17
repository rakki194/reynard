#!/usr/bin/env node

/**
 * 🦊 Reynard Project Architecture - Basic Usage Example
 *
 * This script demonstrates the core capabilities of the project-architecture package.
 */

import {
  REYNARD_ARCHITECTURE,
  getWatchableDirectories,
  getBuildableDirectories,
  getTestableDirectories,
  queryDirectories,
  shouldIncludeFile,
  getDirectoryDefinition,
  validateProjectStructure,
} from "../dist/index.js";

console.log("🦊 Reynard Project Architecture - Basic Usage Example\n");

// 1. Basic architecture information
console.log("=== 1. Basic Architecture Information ===");
console.log(`Project: ${REYNARD_ARCHITECTURE.name}`);
console.log(`Root Path: ${REYNARD_ARCHITECTURE.rootPath}`);
console.log(`Total Directories: ${REYNARD_ARCHITECTURE.directories.length}`);
console.log();

// 2. Get watchable directories for file watchers
console.log("=== 2. Watchable Directories ===");
const watchableDirs = getWatchableDirectories();
console.log(`Found ${watchableDirs.length} watchable directories:`);
watchableDirs.forEach(dir => console.log(`  - ${dir}`));
console.log();

// 3. Get buildable directories
console.log("=== 3. Buildable Directories ===");
const buildableDirs = getBuildableDirectories();
console.log(`Found ${buildableDirs.length} buildable directories:`);
buildableDirs.forEach(dir => console.log(`  - ${dir}`));
console.log();

// 4. Get testable directories
console.log("=== 4. Testable Directories ===");
const testableDirs = getTestableDirectories();
console.log(`Found ${testableDirs.length} testable directories:`);
testableDirs.forEach(dir => console.log(`  - ${dir}`));
console.log();

// 5. Query critical source directories
console.log("=== 5. Critical Source Directories ===");
const criticalSource = queryDirectories({
  category: "source",
  importance: "critical",
});
console.log(`Found ${criticalSource.directories.length} critical source directories:`);
criticalSource.directories.forEach(dir => {
  console.log(`  - ${dir.name}: ${dir.description}`);
});
console.log();

// 6. Check file patterns
console.log("=== 6. File Pattern Matching ===");
const testFiles = [
  "packages/components/src/Button.tsx",
  "node_modules/react/index.js",
  "dist/build.js",
  "docs/README.md",
  "backend/app/main.py",
];

testFiles.forEach(file => {
  const shouldInclude = shouldIncludeFile(file);
  console.log(`${file}: ${shouldInclude ? "✅ Include" : "❌ Exclude"}`);
});
console.log();

// 7. Get directory information
console.log("=== 7. Directory Information ===");
const packages = getDirectoryDefinition("packages");
if (packages) {
  console.log(`Packages Directory:`);
  console.log(`  Description: ${packages.description}`);
  console.log(`  Category: ${packages.category}`);
  console.log(`  Importance: ${packages.importance}`);
  console.log(`  File Types: ${packages.fileTypes.join(", ")}`);
  console.log(`  Relationships: ${packages.relationships.length}`);
  packages.relationships.forEach(rel => {
    console.log(`    - ${rel.directory} (${rel.type}): ${rel.description}`);
  });
}
console.log();

// 8. Validate project structure
console.log("=== 8. Project Structure Validation ===");
const validation = validateProjectStructure();
console.log(`Project Structure Valid: ${validation.valid ? "✅" : "❌"}`);
if (!validation.valid) {
  console.log("Issues found:");
  validation.errors.forEach(error => console.log(`  - ${error}`));
}
console.log();

console.log("🦊 Basic usage example completed!");
