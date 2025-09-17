#!/usr/bin/env node

/**
 * 🦊 Reynard Project Architecture - Example Usage
 * 
 * This script demonstrates the various capabilities of the project-architecture package.
 */

import { 
  REYNARD_ARCHITECTURE,
  getWatchableDirectories,
  getBuildableDirectories,
  getTestableDirectories,
  getLintableDirectories,
  getDocumentableDirectories,
  getGlobalExcludePatterns,
  getGlobalIncludePatterns
} from "./dist/index.js";

import {
  getDirectoryDefinition,
  getDirectoryDefinitionByPath,
  queryDirectories,
  getDirectoryPaths,
  getDirectoriesByCategory,
  getDirectoriesByImportance,
  getRelatedDirectories,
  shouldExcludeFile,
  shouldIncludeFile,
  getFileTypeFromExtension,
  getDirectoryForFilePath,
  validateProjectStructure,
  generateProjectStructureReport
} from "./dist/index.js";

console.log("🦊 Reynard Project Architecture - Example Usage\n");

// 1. Basic Architecture Information
console.log("=== 1. Basic Architecture Information ===");
console.log(`Project Name: ${REYNARD_ARCHITECTURE.name}`);
console.log(`Root Path: ${REYNARD_ARCHITECTURE.rootPath}`);
console.log(`Total Directories: ${REYNARD_ARCHITECTURE.directories.length}`);
console.log();

// 2. Directory Categories
console.log("=== 2. Directory Categories ===");
const categories = [...new Set(REYNARD_ARCHITECTURE.directories.map(d => d.category))];
categories.forEach(category => {
  const dirs = getDirectoriesByCategory(category);
  console.log(`${category}: ${dirs.length} directories`);
  dirs.forEach(dir => console.log(`  - ${dir.name} (${dir.importance})`));
});
console.log();

// 3. Watchable Directories
console.log("=== 3. Watchable Directories ===");
const watchable = getWatchableDirectories();
console.log(`Found ${watchable.length} watchable directories:`);
watchable.forEach(dir => console.log(`  - ${dir}`));
console.log();

// 4. Buildable Directories
console.log("=== 4. Buildable Directories ===");
const buildable = getBuildableDirectories();
console.log(`Found ${buildable.length} buildable directories:`);
buildable.forEach(dir => console.log(`  - ${dir}`));
console.log();

// 5. Testable Directories
console.log("=== 5. Testable Directories ===");
const testable = getTestableDirectories();
console.log(`Found ${testable.length} testable directories:`);
testable.forEach(dir => console.log(`  - ${dir}`));
console.log();

// 6. Directory Queries
console.log("=== 6. Directory Queries ===");
console.log("Critical source directories:");
const criticalSource = queryDirectories({ 
  category: "source", 
  importance: "critical" 
});
criticalSource.directories.forEach(dir => {
  console.log(`  - ${dir.name}: ${dir.description}`);
});
console.log();

// 7. File Pattern Matching
console.log("=== 7. File Pattern Matching ===");
const testFiles = [
  "packages/components/src/Button.tsx",
  "node_modules/react/index.js",
  "dist/build.js",
  "docs/README.md",
  "backend/app/main.py",
  "coverage/lcov-report/index.html"
];

testFiles.forEach(file => {
  const shouldExclude = shouldExcludeFile(file);
  const shouldInclude = shouldIncludeFile(file);
  const fileType = getFileTypeFromExtension(file);
  const directory = getDirectoryForFilePath(file);
  
  console.log(`File: ${file}`);
  console.log(`  Type: ${fileType}`);
  console.log(`  Directory: ${directory?.name || 'Unknown'}`);
  console.log(`  Should Exclude: ${shouldExclude}`);
  console.log(`  Should Include: ${shouldInclude}`);
  console.log();
});

// 8. Directory Relationships
console.log("=== 8. Directory Relationships ===");
const packages = getDirectoryDefinition("packages");
if (packages) {
  console.log(`Relationships for '${packages.name}':`);
  packages.relationships.forEach(rel => {
    console.log(`  - ${rel.directory} (${rel.type}): ${rel.description}`);
  });
}
console.log();

// 9. Project Structure Validation
console.log("=== 9. Project Structure Validation ===");
const validation = validateProjectStructure();
console.log(`Project Structure Valid: ${validation.valid}`);
if (!validation.valid) {
  console.log("Issues found:");
  validation.errors.forEach(error => console.log(`  - ${error}`));
}
console.log();

// 10. Global Patterns
console.log("=== 10. Global Patterns ===");
console.log(`Global Exclude Patterns: ${getGlobalExcludePatterns().length}`);
console.log(`Global Include Patterns: ${getGlobalIncludePatterns().length}`);
console.log();

// 11. Generate Report
console.log("=== 11. Project Structure Report ===");
const report = generateProjectStructureReport();
console.log("Generated report (first 500 characters):");
console.log(report.substring(0, 500) + "...");
console.log();

console.log("🦊 Example usage completed!");