/**
 * 🦊 Reynard Project Architecture Pattern Tests
 *
 * Tests for file pattern matching and filtering.
 */

import { describe, it, expect } from "vitest";
import { shouldExcludeFile, shouldIncludeFile, queryDirectories } from "../utils.js";

describe("Pattern Matching", () => {
  it("should exclude files correctly", () => {
    expect(shouldExcludeFile("node_modules/package/index.js")).toBe(true);
    expect(shouldExcludeFile("dist/build.js")).toBe(true);
    expect(shouldExcludeFile("src/index.ts")).toBe(false);
  });

  it("should include files correctly", () => {
    expect(shouldIncludeFile("src/index.ts")).toBe(true);
    expect(shouldIncludeFile("docs/README.md")).toBe(true);
    expect(shouldIncludeFile("node_modules/package/index.js")).toBe(false);
  });

  it("should handle complex file paths", () => {
    expect(shouldExcludeFile("packages/components/node_modules/react/index.js")).toBe(true);
    expect(shouldExcludeFile("backend/app/__pycache__/main.pyc")).toBe(true);
    expect(shouldExcludeFile("dist/build/static/js/main.js")).toBe(true);
    expect(shouldExcludeFile("coverage/lcov-report/index.html")).toBe(true);
  });

  it("should handle nested directory structures", () => {
    expect(shouldIncludeFile("packages/components/src/Button.tsx")).toBe(true);
    expect(shouldIncludeFile("backend/app/models/user.py")).toBe(true);
    expect(shouldIncludeFile("docs/api/endpoints.md")).toBe(true);
    expect(shouldIncludeFile("examples/dashboard/src/App.tsx")).toBe(true);
  });

  it("should handle special characters in paths", () => {
    expect(shouldExcludeFile("packages/my-component/dist/index.js")).toBe(true);
    expect(shouldIncludeFile("packages/my-component/src/index.ts")).toBe(true);
    expect(shouldExcludeFile("backend/app/.env.local")).toBe(true);
  });
});

describe("Query System", () => {
  it("should query directories with multiple filters", () => {
    const result = queryDirectories({
      category: "source",
      importance: "critical",
      watchable: true,
    });

    expect(result.directories.length).toBeGreaterThan(0);
    expect(
      result.directories.every(
        dir => dir.category === "source" && dir.importance === "critical" && dir.watchable === true
      )
    ).toBe(true);
  });

  it("should handle empty query results", () => {
    const result = queryDirectories({
      category: "cache" as any, // Use invalid category for testing
      importance: "critical",
    });

    expect(result.directories.length).toBe(0);
    expect(result.count).toBe(0);
  });

  it("should provide execution time", () => {
    const result = queryDirectories({ watchable: true });
    expect(result.executionTime).toBeGreaterThanOrEqual(0);
    expect(typeof result.executionTime).toBe("number");
  });
});
