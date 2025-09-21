/**
 * Tests for ADRGenerator class
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ADRGenerator } from "../ADRGenerator";
import { ADRSuggestion } from "../CodebaseAnalyzer";
import { createTestEnvironment, createEmptyTestEnvironment, createSampleADRFiles } from "./test-utils";

describe("ADRGenerator", () => {
  let testEnv: Awaited<ReturnType<typeof createTestEnvironment>>;
  let generator: ADRGenerator;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
    await createSampleADRFiles(testEnv.adrDirectory);
    generator = new ADRGenerator(testEnv.adrDirectory, testEnv.templateDirectory);
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe("constructor", () => {
    it("should initialize with ADR and template directories", () => {
      const generator = new ADRGenerator("/test/adr", "/test/templates");
      expect(generator).toBeInstanceOf(ADRGenerator);
    });

    it("should initialize templates", () => {
      const templates = generator.getAvailableTemplates();
      expect(templates.length).toBeGreaterThan(0);
      
      const templateNames = templates.map(t => t.name);
      expect(templateNames).toContain("Security ADR Template");
      expect(templateNames).toContain("Performance ADR Template");
      expect(templateNames).toContain("Scalability ADR Template");
      expect(templateNames).toContain("Integration ADR Template");
      expect(templateNames).toContain("General ADR Template");
    });
  });

  describe("generateADRFromSuggestion", () => {
    const sampleSuggestion: ADRSuggestion = {
      id: "test-suggestion",
      title: "Test Architecture Decision",
      priority: "high",
      category: "performance",
      reasoning: ["This is a test decision", "It needs to be documented"],
      evidence: ["Evidence 1", "Evidence 2"],
      template: "performance",
      estimatedImpact: "high",
      stakeholders: ["Development Team", "Architecture Team"],
    };

    it("should generate ADR from suggestion", async () => {
      const filePath = await generator.generateADRFromSuggestion(sampleSuggestion);
      
      expect(typeof filePath).toBe("string");
      expect(filePath).toContain("test-architecture-decision.md");
      expect(filePath).toContain(testEnv.adrDirectory);
    });

    it("should throw error for invalid template", async () => {
      const invalidSuggestion = { ...sampleSuggestion, template: "invalid-template" };
      
      await expect(generator.generateADRFromSuggestion(invalidSuggestion))
        .rejects.toThrow("Template not found: invalid-template");
    });

    it("should generate ADR with correct content structure", async () => {
      const filePath = await generator.generateADRFromSuggestion(sampleSuggestion);
      const content = await require("fs/promises").readFile(filePath, "utf-8");
      
      expect(content).toContain("# ADR-");
      expect(content).toContain("Test Architecture Decision");
      expect(content).toContain("## Status");
      expect(content).toContain("## Context");
      expect(content).toContain("## Decision");
      expect(content).toContain("## Consequences");
      expect(content).toContain("## Implementation Plan");
      expect(content).toContain("## Metrics and Monitoring");
      expect(content).toContain("## Review and Updates");
      expect(content).toContain("## References");
    });

    it("should include suggestion reasoning in context", async () => {
      const filePath = await generator.generateADRFromSuggestion(sampleSuggestion);
      const content = await require("fs/promises").readFile(filePath, "utf-8");
      
      expect(content).toContain("This is a test decision");
      expect(content).toContain("It needs to be documented");
    });

  it("should include evidence in context", async () => {
    // Create a fresh test environment to avoid ID conflicts
    const freshTestEnv = await createTestEnvironment();
    const freshGenerator = new ADRGenerator(freshTestEnv.adrDirectory, freshTestEnv.templateDirectory);

    const suggestionWithEvidence = {
      ...sampleSuggestion,
      evidence: ["Evidence 1", "Evidence 2"]
    };

    const filePath = await freshGenerator.generateADRFromSuggestion(suggestionWithEvidence);
    const content = await require("fs/promises").readFile(filePath, "utf-8");

    expect(content).toContain("### Evidence");
    expect(content).toContain("- Evidence 1");
    expect(content).toContain("- Evidence 2");

    // Clean up the fresh test environment
    await freshTestEnv.cleanup();
  });

    it("should include stakeholders in footer", async () => {
      const filePath = await generator.generateADRFromSuggestion(sampleSuggestion);
      const content = await require("fs/promises").readFile(filePath, "utf-8");
      
      expect(content).toContain("**Stakeholders**: Development Team, Architecture Team");
    });

    it("should include priority and category in footer", async () => {
      const filePath = await generator.generateADRFromSuggestion(sampleSuggestion);
      const content = await require("fs/promises").readFile(filePath, "utf-8");
      
      expect(content).toContain("**Priority**: HIGH");
      expect(content).toContain("**Category**: PERFORMANCE");
    });
  });

  describe("generateMultipleADRs", () => {
    const suggestions: ADRSuggestion[] = [
      {
        id: "suggestion-1",
        title: "First Decision",
        priority: "critical",
        category: "security",
        reasoning: ["Security concern"],
        evidence: ["Evidence 1"],
        template: "security",
        estimatedImpact: "high",
        stakeholders: ["Security Team"],
      },
      {
        id: "suggestion-2",
        title: "Second Decision",
        priority: "medium",
        category: "performance",
        reasoning: ["Performance concern"],
        evidence: ["Evidence 2"],
        template: "performance",
        estimatedImpact: "medium",
        stakeholders: ["Performance Team"],
      },
    ];

    it("should generate multiple ADRs", async () => {
      const filePaths = await generator.generateMultipleADRs(suggestions);
      
      expect(filePaths.length).toBe(2);
      expect(filePaths.every(path => typeof path === "string")).toBe(true);
    });

    it("should sort suggestions by priority", async () => {
      const filePaths = await generator.generateMultipleADRs(suggestions);
      
      // Critical priority should be generated first
      const firstContent = await require("fs/promises").readFile(filePaths[0], "utf-8");
      expect(firstContent).toContain("First Decision");
      expect(firstContent).toContain("**Priority**: CRITICAL");
    });

    it("should handle generation errors gracefully", async () => {
      const invalidSuggestions = [
        { ...suggestions[0], template: "invalid-template" },
        suggestions[1],
      ];
      
      const filePaths = await generator.generateMultipleADRs(invalidSuggestions);
      
      // Should only generate the valid suggestion
      expect(filePaths.length).toBe(1);
    });
  });

  describe("template management", () => {
    it("should get available templates", () => {
      const templates = generator.getAvailableTemplates();
      
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
      
      templates.forEach(template => {
        expect(template).toHaveProperty("name");
        expect(template).toHaveProperty("category");
        expect(template).toHaveProperty("sections");
        expect(template).toHaveProperty("requiredFields");
        expect(template).toHaveProperty("optionalFields");
      });
    });

    it("should get template by name", () => {
      const securityTemplate = generator.getTemplate("security");
      
      expect(securityTemplate).toBeDefined();
      expect(securityTemplate?.name).toBe("Security ADR Template");
      expect(securityTemplate?.category).toBe("security");
    });

    it("should return undefined for non-existent template", () => {
      const template = generator.getTemplate("non-existent");
      expect(template).toBeUndefined();
    });

    it("should add custom template", () => {
      const customTemplate = {
        name: "Custom Template",
        category: "general" as const,
        sections: ["Custom Section"],
        requiredFields: ["customField"],
        optionalFields: ["optionalField"],
      };
      
      generator.addTemplate(customTemplate);
      
      const retrievedTemplate = generator.getTemplate("custom-template");
      expect(retrievedTemplate).toBeDefined();
      expect(retrievedTemplate?.name).toBe("Custom Template");
    });
  });

  describe("ADR ID generation", () => {
    it("should generate sequential ADR IDs", async () => {
    // Create a completely fresh test environment without any existing ADRs
    const freshTestEnv = await createEmptyTestEnvironment();
    const freshGenerator = new ADRGenerator(freshTestEnv.adrDirectory, freshTestEnv.templateDirectory);
      
      const suggestion1: ADRSuggestion = {
        id: "test-1",
        title: "Test 1",
        priority: "low",
        category: "general",
        reasoning: ["Test"],
        evidence: [],
        template: "general",
        estimatedImpact: "low",
        stakeholders: ["Team"],
      };
      
      const suggestion2: ADRSuggestion = {
        id: "test-2",
        title: "Test 2",
        priority: "low",
        category: "general",
        reasoning: ["Test"],
        evidence: [],
        template: "general",
        estimatedImpact: "low",
        stakeholders: ["Team"],
      };
      
      const filePath1 = await freshGenerator.generateADRFromSuggestion(suggestion1);
      const filePath2 = await freshGenerator.generateADRFromSuggestion(suggestion2);
      
      expect(filePath1).toContain("001-");
      expect(filePath2).toContain("002-");
      
      // Clean up the fresh test environment
      await freshTestEnv.cleanup();
    });

    it("should handle existing ADR files", async () => {
      // Create existing ADR files
      await createSampleADRFiles(testEnv.adrDirectory);
      
      const suggestion: ADRSuggestion = {
        id: "test-new",
        title: "New Test",
        priority: "low",
        category: "general",
        reasoning: ["Test"],
        evidence: [],
        template: "general",
        estimatedImpact: "low",
        stakeholders: ["Team"],
      };
      
      const filePath = await generator.generateADRFromSuggestion(suggestion);
      
      // Should generate ID after existing files
      expect(filePath).toContain("003-");
    });
  });

  describe("title sanitization", () => {
    it("should sanitize title for filename", async () => {
      const suggestion: ADRSuggestion = {
        id: "test-sanitize",
        title: "Test: Special Characters & Symbols!",
        priority: "low",
        category: "general",
        reasoning: ["Test"],
        evidence: [],
        template: "general",
        estimatedImpact: "low",
        stakeholders: ["Team"],
      };
      
      const filePath = await generator.generateADRFromSuggestion(suggestion);
      
      expect(filePath).toContain("test-special-characters-symbols.md");
    });
  });
});
