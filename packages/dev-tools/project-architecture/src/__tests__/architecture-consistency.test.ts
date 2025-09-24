/**
 * 🦊 Reynard Project Architecture Consistency Tests
 *
 * Tests for architecture validation and consistency checks.
 */

import { describe, it, expect } from "vitest";
import { REYNARD_ARCHITECTURE } from "../architecture.js";

describe("Architecture Consistency", () => {
  it("should have consistent directory definitions", () => {
    for (const directory of REYNARD_ARCHITECTURE.directories) {
      expect(directory.name).toBeTruthy();
      expect(directory.path).toBeTruthy();
      expect(directory.category).toBeTruthy();
      expect(directory.importance).toBeTruthy();
      expect(directory.description).toBeTruthy();
      expect(typeof directory.watchable).toBe("boolean");
      expect(typeof directory.buildable).toBe("boolean");
      expect(typeof directory.testable).toBe("boolean");
      expect(typeof directory.lintable).toBe("boolean");
      expect(typeof directory.documentable).toBe("boolean");
      expect(Array.isArray(directory.fileTypes)).toBe(true);
      expect(Array.isArray(directory.relationships)).toBe(true);
      expect(Array.isArray(directory.excludePatterns)).toBe(true);
      expect(Array.isArray(directory.includePatterns)).toBe(true);
    }
  });

  it("should have unique directory names", () => {
    const names = REYNARD_ARCHITECTURE.directories.map(dir => dir.name);
    const uniqueNames = new Set(names);
    expect(names.length).toBe(uniqueNames.size);
    expect(names.length).toBe(96); // Current architecture has 96 directories
  });

  it("should have unique directory paths", () => {
    const paths = REYNARD_ARCHITECTURE.directories.map(dir => dir.path);
    const uniquePaths = new Set(paths);
    expect(paths.length).toBe(uniquePaths.size);
    expect(paths.length).toBe(96); // Current architecture has 96 directories
  });
});
