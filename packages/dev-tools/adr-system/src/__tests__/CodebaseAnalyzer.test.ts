/**
 * Tests for CodebaseAnalyzer class
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { CodebaseAnalyzer } from "../CodebaseAnalyzer";
import { createTestEnvironment, createSampleSourceFiles } from "./test-utils";

describe("CodebaseAnalyzer", () => {
  let testEnv: Awaited<ReturnType<typeof createTestEnvironment>>;
  let analyzer: CodebaseAnalyzer;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
    await createSampleSourceFiles(testEnv.rootPath);
    analyzer = new CodebaseAnalyzer(testEnv.rootPath);
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe("constructor", () => {
    it("should initialize with root path", () => {
      const analyzer = new CodebaseAnalyzer("/test/path");
      expect(analyzer).toBeInstanceOf(CodebaseAnalyzer);
    });
  });

  describe("analyzeCodebase", () => {
    it("should perform comprehensive codebase analysis", async () => {
      const result = await analyzer.analyzeCodebase();

      expect(result).toHaveProperty("metrics");
      expect(result).toHaveProperty("dependencies");
      expect(result).toHaveProperty("patterns");
      expect(result).toHaveProperty("quality");
      expect(result).toHaveProperty("suggestions");

      // Check metrics structure
      expect(result.metrics).toHaveProperty("totalFiles");
      expect(result.metrics).toHaveProperty("totalLines");
      expect(result.metrics).toHaveProperty("fileTypes");
      expect(result.metrics).toHaveProperty("averageFileSize");
      expect(result.metrics).toHaveProperty("largestFiles");
      expect(result.metrics).toHaveProperty("complexityScore");

      // Check dependencies structure
      expect(result.dependencies).toHaveProperty("internalDependencies");
      expect(result.dependencies).toHaveProperty("externalDependencies");
      expect(result.dependencies).toHaveProperty("circularDependencies");
      expect(result.dependencies).toHaveProperty("dependencyDepth");
      expect(result.dependencies).toHaveProperty("criticalDependencies");

      // Check patterns structure
      expect(Array.isArray(result.patterns)).toBe(true);

      // Check quality structure
      expect(result.quality).toHaveProperty("testCoverage");
      expect(result.quality).toHaveProperty("documentationCoverage");
      expect(result.quality).toHaveProperty("complexityMetrics");
      expect(result.quality).toHaveProperty("codeSmells");

      // Check suggestions structure
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it("should discover source files correctly", async () => {
      const result = await analyzer.analyzeCodebase();

      expect(result.metrics.totalFiles).toBeGreaterThan(0);
      expect(result.metrics.fileTypes[".ts"]).toBeGreaterThan(0);
    });

    it("should calculate metrics correctly", async () => {
      const result = await analyzer.analyzeCodebase();

      expect(result.metrics.totalLines).toBeGreaterThan(0);
      expect(result.metrics.averageFileSize).toBeGreaterThan(0);
      expect(result.metrics.complexityScore).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.metrics.largestFiles)).toBe(true);
    });

    it("should analyze dependencies", async () => {
      const result = await analyzer.analyzeCodebase();

      expect(result.dependencies.internalDependencies).toBeInstanceOf(Map);
      expect(result.dependencies.externalDependencies).toBeInstanceOf(Map);
      expect(Array.isArray(result.dependencies.circularDependencies)).toBe(true);
      expect(result.dependencies.dependencyDepth).toBeInstanceOf(Map);
      expect(Array.isArray(result.dependencies.criticalDependencies)).toBe(true);
    });

    it("should identify architecture patterns", async () => {
      const result = await analyzer.analyzeCodebase();

      expect(Array.isArray(result.patterns)).toBe(true);
      
      // Check pattern structure if patterns exist
      if (result.patterns.length > 0) {
        const pattern = result.patterns[0];
        expect(pattern).toHaveProperty("type");
        expect(pattern).toHaveProperty("confidence");
        expect(pattern).toHaveProperty("evidence");
        expect(pattern).toHaveProperty("recommendations");
        expect(typeof pattern.confidence).toBe("number");
        expect(Array.isArray(pattern.evidence)).toBe(true);
        expect(Array.isArray(pattern.recommendations)).toBe(true);
      }
    });

    it("should assess code quality", async () => {
      const result = await analyzer.analyzeCodebase();

      expect(typeof result.quality.testCoverage).toBe("number");
      expect(typeof result.quality.documentationCoverage).toBe("number");
      expect(result.quality.complexityMetrics).toHaveProperty("cyclomaticComplexity");
      expect(result.quality.complexityMetrics).toHaveProperty("cognitiveComplexity");
      expect(result.quality.complexityMetrics).toHaveProperty("maintainabilityIndex");
      expect(Array.isArray(result.quality.codeSmells)).toBe(true);
    });

    it("should generate ADR suggestions", async () => {
      const result = await analyzer.analyzeCodebase();

      expect(Array.isArray(result.suggestions)).toBe(true);

      // Check suggestion structure if suggestions exist
      if (result.suggestions.length > 0) {
        const suggestion = result.suggestions[0];
        expect(suggestion).toHaveProperty("id");
        expect(suggestion).toHaveProperty("title");
        expect(suggestion).toHaveProperty("priority");
        expect(suggestion).toHaveProperty("category");
        expect(suggestion).toHaveProperty("reasoning");
        expect(suggestion).toHaveProperty("evidence");
        expect(suggestion).toHaveProperty("template");
        expect(suggestion).toHaveProperty("estimatedImpact");
        expect(suggestion).toHaveProperty("stakeholders");

        expect(typeof suggestion.id).toBe("string");
        expect(typeof suggestion.title).toBe("string");
        expect(["low", "medium", "high", "critical"]).toContain(suggestion.priority);
        expect(["security", "performance", "scalability", "integration", "maintainability"]).toContain(suggestion.category);
        expect(Array.isArray(suggestion.reasoning)).toBe(true);
        expect(Array.isArray(suggestion.evidence)).toBe(true);
        expect(typeof suggestion.template).toBe("string");
        expect(["low", "medium", "high"]).toContain(suggestion.estimatedImpact);
        expect(Array.isArray(suggestion.stakeholders)).toBe(true);
      }
    });
  });

  describe("error handling", () => {
    it("should handle file read errors gracefully", async () => {
      const problematicAnalyzer = new CodebaseAnalyzer("/nonexistent/path");
      
      const result = await problematicAnalyzer.analyzeCodebase();
      expect(result.metrics.totalFiles).toBe(0);
    });

    it("should handle directory scan errors gracefully", async () => {
      const mockAnalyzer = new CodebaseAnalyzer("/invalid/path");
      const result = await mockAnalyzer.analyzeCodebase();
      
      expect(result).toBeDefined();
      expect(result.metrics.totalFiles).toBe(0);
    });
  });
});