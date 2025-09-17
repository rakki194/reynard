/**
 * 🦊 Reynard Project Architecture Core Tests
 *
 * Core tests for the project architecture system.
 */

import { describe, it, expect } from "vitest";
import { 
  REYNARD_ARCHITECTURE,
  getWatchableDirectories,
  getBuildableDirectories,
  getTestableDirectories,
  getLintableDirectories,
  getDocumentableDirectories,
  getGlobalExcludePatterns,
  getGlobalIncludePatterns
} from "../architecture.js";

describe("Project Architecture Core", () => {
  it("should have a valid architecture definition", () => {
    expect(REYNARD_ARCHITECTURE).toBeDefined();
    expect(REYNARD_ARCHITECTURE.name).toBe("Reynard");
    expect(REYNARD_ARCHITECTURE.directories).toBeInstanceOf(Array);
    expect(REYNARD_ARCHITECTURE.directories.length).toBeGreaterThan(0);
  });

  it("should have watchable directories", () => {
    const watchable = getWatchableDirectories();
    expect(watchable).toBeInstanceOf(Array);
    expect(watchable.length).toBeGreaterThan(0);
    expect(watchable).toContain("packages");
    expect(watchable).toContain("backend");
    expect(watchable).toContain("docs");
  });

  it("should have buildable directories", () => {
    const buildable = getBuildableDirectories();
    expect(buildable).toBeInstanceOf(Array);
    expect(buildable.length).toBeGreaterThan(0);
    expect(buildable).toContain("packages");
    expect(buildable).toContain("backend");
  });

  it("should have testable directories", () => {
    const testable = getTestableDirectories();
    expect(testable).toBeInstanceOf(Array);
    expect(testable.length).toBeGreaterThan(0);
    expect(testable).toContain("packages");
    expect(testable).toContain("backend");
  });

  it("should have lintable directories", () => {
    const lintable = getLintableDirectories();
    expect(lintable).toBeInstanceOf(Array);
    expect(lintable.length).toBeGreaterThan(0);
    expect(lintable).toContain("packages");
    expect(lintable).toContain("backend");
  });

  it("should have documentable directories", () => {
    const documentable = getDocumentableDirectories();
    expect(documentable).toBeInstanceOf(Array);
    expect(documentable.length).toBeGreaterThan(0);
    expect(documentable).toContain("packages");
    expect(documentable).toContain("docs");
  });

  it("should have global exclude patterns", () => {
    const excludePatterns = getGlobalExcludePatterns();
    expect(excludePatterns).toBeInstanceOf(Array);
    expect(excludePatterns.length).toBeGreaterThan(0);
    expect(excludePatterns).toContain("**/node_modules/**");
    expect(excludePatterns).toContain("**/dist/**");
  });

  it("should have global include patterns", () => {
    const includePatterns = getGlobalIncludePatterns();
    expect(includePatterns).toBeInstanceOf(Array);
    expect(includePatterns.length).toBeGreaterThan(0);
    expect(includePatterns).toContain("**/*.ts");
    expect(includePatterns).toContain("**/*.py");
  });
});
