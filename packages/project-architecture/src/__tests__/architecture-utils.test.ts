/**
 * 🦊 Reynard Project Architecture Utils Tests
 *
 * Tests for directory utility functions.
 */

import { describe, it, expect } from "vitest";
import {
  getDirectoryDefinition,
  getDirectoryDefinitionByPath,
  queryDirectories,
  getDirectoryPaths,
  getDirectoriesByCategory,
  getDirectoriesByImportance,
  getRelatedDirectories,
  getFileTypeFromExtension,
  getDirectoryForFilePath,
  validateProjectStructure,
  generateProjectStructureReport
} from "../utils.js";

describe("Directory Utilities", () => {
  it("should get directory definition by name", () => {
    const packages = getDirectoryDefinition("packages");
    expect(packages).toBeDefined();
    expect(packages?.name).toBe("packages");
    expect(packages?.category).toBe("source");
    expect(packages?.importance).toBe("critical");
  });

  it("should get directory definition by path", () => {
    const packages = getDirectoryDefinitionByPath("packages");
    expect(packages).toBeDefined();
    expect(packages?.name).toBe("packages");
  });

  it("should query directories with filters", () => {
    const sourceDirs = queryDirectories({ category: "source" });
    expect(sourceDirs.directories.length).toBeGreaterThan(0);
    expect(sourceDirs.directories.every(dir => dir.category === "source")).toBe(true);
  });

  it("should get directory paths with options", () => {
    const watchablePaths = getDirectoryPaths({ watchable: true });
    expect(watchablePaths).toBeInstanceOf(Array);
    expect(watchablePaths.length).toBeGreaterThan(0);
  });

  it("should get directories by category", () => {
    const sourceDirs = getDirectoriesByCategory("source");
    expect(sourceDirs).toBeInstanceOf(Array);
    expect(sourceDirs.every(dir => dir.category === "source")).toBe(true);
  });

  it("should get directories by importance", () => {
    const criticalDirs = getDirectoriesByImportance("critical");
    expect(criticalDirs).toBeInstanceOf(Array);
    expect(criticalDirs.every(dir => dir.importance === "critical")).toBe(true);
  });

  it("should get related directories", () => {
    const relatedToPackages = getRelatedDirectories("packages");
    expect(relatedToPackages).toBeInstanceOf(Array);
    expect(relatedToPackages.length).toBeGreaterThan(0);
    
    const examplesRelated = relatedToPackages.find(dir => dir.name === "examples");
    expect(examplesRelated).toBeDefined();
  });

  it("should get file type from extension", () => {
    expect(getFileTypeFromExtension("index.ts")).toBe("typescript");
    expect(getFileTypeFromExtension("component.tsx")).toBe("typescript");
    expect(getFileTypeFromExtension("script.js")).toBe("javascript");
    expect(getFileTypeFromExtension("app.py")).toBe("python");
    expect(getFileTypeFromExtension("README.md")).toBe("markdown");
    expect(getFileTypeFromExtension("config.json")).toBe("json");
    expect(getFileTypeFromExtension("unknown.xyz")).toBe("other");
  });

  it("should get directory for file path", () => {
    const packagesDir = getDirectoryForFilePath("packages/components/src/index.ts");
    expect(packagesDir).toBeDefined();
    expect(packagesDir?.name).toBe("packages");
    
    const backendDir = getDirectoryForFilePath("backend/app/main.py");
    expect(backendDir).toBeDefined();
    expect(backendDir?.name).toBe("backend");
    
    const docsDir = getDirectoryForFilePath("docs/README.md");
    expect(docsDir).toBeDefined();
    expect(docsDir?.name).toBe("docs");
  });

  it("should validate project structure", () => {
    const validation = validateProjectStructure();
    expect(validation).toHaveProperty("valid");
    expect(validation).toHaveProperty("errors");
    expect(Array.isArray(validation.errors)).toBe(true);
  });

  it("should generate project structure report", () => {
    const report = generateProjectStructureReport();
    expect(report).toBeDefined();
    expect(typeof report).toBe("string");
    expect(report).toContain("# 🦊 Reynard Project Structure Report");
    expect(report).toContain("## Directory Summary");
    expect(report).toContain("## Quick Access");
  });
});

describe("Directory Categories and Relationships", () => {
  it("should have proper directory categories", () => {
    const sourceDirs = getDirectoriesByCategory("source");
    const docDirs = getDirectoriesByCategory("documentation");
    const configDirs = getDirectoriesByCategory("configuration");
    
    expect(sourceDirs.length).toBeGreaterThan(0);
    expect(docDirs.length).toBeGreaterThan(0);
    expect(configDirs.length).toBeGreaterThan(0);
    
    expect(sourceDirs.every(dir => dir.category === "source")).toBe(true);
    expect(docDirs.every(dir => dir.category === "documentation")).toBe(true);
    expect(configDirs.every(dir => dir.category === "configuration")).toBe(true);
  });

  it("should have proper importance levels", () => {
    const criticalDirs = getDirectoriesByImportance("critical");
    const importantDirs = getDirectoriesByImportance("important");
    const optionalDirs = getDirectoriesByImportance("optional");
    
    expect(criticalDirs.length).toBeGreaterThan(0);
    expect(importantDirs.length).toBeGreaterThan(0);
    expect(optionalDirs.length).toBeGreaterThan(0);
    
    expect(criticalDirs.every(dir => dir.importance === "critical")).toBe(true);
    expect(importantDirs.every(dir => dir.importance === "important")).toBe(true);
    expect(optionalDirs.every(dir => dir.importance === "optional")).toBe(true);
  });

  it("should have proper directory relationships", () => {
    const packages = getDirectoryDefinition("packages");
    expect(packages).toBeDefined();
    expect(packages?.relationships).toBeInstanceOf(Array);
    expect(packages?.relationships.length).toBeGreaterThan(0);
    
    const examplesRel = packages?.relationships.find(rel => rel.directory === "examples");
    expect(examplesRel).toBeDefined();
    expect(examplesRel?.type).toBe("sibling");
  });
});
