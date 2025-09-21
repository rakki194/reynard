/**
 * Integration tests for the ADR System
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { CodebaseAnalyzer } from "../CodebaseAnalyzer";
import { ADRGenerator } from "../ADRGenerator";
import { ADRValidator } from "../ADRValidator";
import { ADRRelationshipMapper } from "../ADRRelationshipMapper";
import { createTestEnvironment, createEmptyTestEnvironment, createSampleSourceFiles, createSampleADRFiles } from "./test-utils";

describe("ADR System Integration", () => {
  let testEnv: Awaited<ReturnType<typeof createTestEnvironment>>;
  let analyzer: CodebaseAnalyzer;
  let generator: ADRGenerator;
  let validator: ADRValidator;
  let mapper: ADRRelationshipMapper;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
    await createSampleSourceFiles(testEnv.rootPath);
    await createSampleADRFiles(testEnv.adrDirectory);
    
    analyzer = new CodebaseAnalyzer(testEnv.rootPath);
    generator = new ADRGenerator(testEnv.adrDirectory, testEnv.templateDirectory);
    validator = new ADRValidator(testEnv.adrDirectory);
    mapper = new ADRRelationshipMapper(testEnv.adrDirectory);
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe("End-to-end workflow", () => {
    it("should perform complete ADR workflow", async () => {
      // Step 1: Analyze codebase
      const analysis = await analyzer.analyzeCodebase();
      
      expect(analysis.metrics.totalFiles).toBeGreaterThan(0);
      expect(analysis.suggestions.length).toBeGreaterThanOrEqual(0);
      
      // Step 2: Generate ADRs from suggestions
      if (analysis.suggestions.length > 0) {
        const generatedFiles = await generator.generateMultipleADRs(analysis.suggestions);
        
        expect(generatedFiles.length).toBeGreaterThan(0);
        expect(generatedFiles.every(file => typeof file === "string")).toBe(true);
        
        // Step 3: Validate generated ADRs
        const validationResults = await validator.validateAllADRs();
        
        expect(validationResults.size).toBeGreaterThan(0);
        
        // Check that generated ADRs are valid
        for (const [filename, result] of validationResults) {
          if (generatedFiles.some(file => file.includes(filename))) {
            // Generated ADRs should be structurally valid (no errors)
            expect(result.errors.length).toBe(0);
          }
        }
        
        // Step 4: Analyze relationships
        const relationships = await mapper.analyzeRelationships();
        
        expect(Array.isArray(relationships)).toBe(true);
        
        // Step 5: Get relationship graph
        const graph = mapper.getRelationshipGraph();
        
        expect(graph).toBeInstanceOf(Map);
      }
    });

    it("should handle empty codebase gracefully", async () => {
      await testEnv.cleanup();
      testEnv = await createTestEnvironment();
      
      const emptyAnalyzer = new CodebaseAnalyzer(testEnv.rootPath);
      const analysis = await emptyAnalyzer.analyzeCodebase();
      
      expect(analysis.metrics.totalFiles).toBe(0);
      expect(analysis.suggestions.length).toBe(0);
    });

    it("should handle empty ADR directory gracefully", async () => {
      await testEnv.cleanup();
      const emptyTestEnv = await createEmptyTestEnvironment();
      
      const emptyValidator = new ADRValidator(emptyTestEnv.adrDirectory);
      const emptyMapper = new ADRRelationshipMapper(emptyTestEnv.adrDirectory);
      
      const validationResults = await emptyValidator.validateAllADRs();
      const relationships = await emptyMapper.analyzeRelationships();
      
      expect(validationResults.size).toBe(0);
      expect(relationships.length).toBe(0);
      
      // Clean up the empty test environment
      await emptyTestEnv.cleanup();
    });
  });

  describe("Component interaction", () => {
    it("should use analyzer results in generator", async () => {
      const analysis = await analyzer.analyzeCodebase();
      
      if (analysis.suggestions.length > 0) {
        const suggestion = analysis.suggestions[0];
        
        // Generate ADR from suggestion
        const filePath = await generator.generateADRFromSuggestion(suggestion);
        
        expect(typeof filePath).toBe("string");
        expect(filePath).toContain(testEnv.adrDirectory);
        
        // Validate the generated ADR
        const validationResult = await validator.validateADR(filePath);
        
        expect(validationResult).toHaveProperty("isValid");
        expect(validationResult).toHaveProperty("errors");
        expect(validationResult).toHaveProperty("warnings");
        expect(validationResult).toHaveProperty("suggestions");
      }
    });

    it("should use generator output in validator", async () => {
      const analysis = await analyzer.analyzeCodebase();
      
      if (analysis.suggestions.length > 0) {
        const suggestion = analysis.suggestions[0];
        const filePath = await generator.generateADRFromSuggestion(suggestion);
        
        // Validate the generated file
        const validationResult = await validator.validateADR(filePath);
        
        // For template ADRs, we expect warnings about placeholder text but no critical errors
        // The ADR should be structurally valid even if it contains placeholders
        expect(validationResult.errors.length).toBe(0);
        
        // We expect warnings about placeholder text in template ADRs
        expect(validationResult.warnings.length).toBeGreaterThan(0);
      }
    });

    it("should use validator output in relationship mapper", async () => {
      const validationResults = await validator.validateAllADRs();
      const relationships = await mapper.analyzeRelationships();
      
      expect(validationResults.size).toBeGreaterThan(0);
      expect(Array.isArray(relationships)).toBe(true);
    });
  });

  describe("Data consistency", () => {
    it("should maintain consistent data across components", async () => {
      const analysis = await analyzer.analyzeCodebase();
      
      if (analysis.suggestions.length > 0) {
        const suggestion = analysis.suggestions[0];
        const filePath = await generator.generateADRFromSuggestion(suggestion);
        
        // Read the generated file
        const content = await require("fs/promises").readFile(filePath, "utf-8");
        
        // Verify content matches suggestion
        expect(content).toContain(suggestion.title);
        expect(content).toContain(suggestion.priority.toUpperCase());
        expect(content).toContain(suggestion.category.toUpperCase());
        expect(content).toContain(suggestion.stakeholders.join(", "));
        
        // Verify reasoning is included
        suggestion.reasoning.forEach(reason => {
          expect(content).toContain(reason);
        });
        
        // Verify evidence is included
        if (suggestion.evidence.length > 0) {
          expect(content).toContain("### Evidence");
          suggestion.evidence.forEach(evidence => {
            expect(content).toContain(evidence);
          });
        }
      }
    });

    it("should maintain consistent ADR structure", async () => {
      const analysis = await analyzer.analyzeCodebase();
      
      if (analysis.suggestions.length > 0) {
        const suggestion = analysis.suggestions[0];
        const filePath = await generator.generateADRFromSuggestion(suggestion);
        
        // Validate structure
        const validationResult = await validator.validateADR(filePath);
        
        // Template ADRs should be structurally valid (no errors)
        expect(validationResult.errors.length).toBe(0);
        
        // Check for required sections
        const content = await require("fs/promises").readFile(filePath, "utf-8");
        
        expect(content).toContain("## Status");
        expect(content).toContain("## Context");
        expect(content).toContain("## Decision");
        expect(content).toContain("## Consequences");
        expect(content).toContain("## Implementation Plan");
        expect(content).toContain("## Metrics and Monitoring");
        expect(content).toContain("## Review and Updates");
        expect(content).toContain("## References");
      }
    });
  });

  describe("Error handling across components", () => {
    it("should handle errors gracefully in workflow", async () => {
      // Create a problematic suggestion
      const problematicSuggestion = {
        id: "problematic",
        title: "Problematic ADR",
        priority: "high" as const,
        category: "performance" as const,
        reasoning: ["This will cause issues"],
        evidence: [],
        template: "invalid-template", // This will cause an error
        estimatedImpact: "high" as const,
        stakeholders: ["Team"],
      };
      
      // Should handle the error gracefully
      try {
        await generator.generateADRFromSuggestion(problematicSuggestion);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("Template not found");
      }
    });

    it("should continue processing after individual failures", async () => {
      const analysis = await analyzer.analyzeCodebase();
      
      if (analysis.suggestions.length > 0) {
        // Create a mix of valid and invalid suggestions
        const mixedSuggestions = [
          analysis.suggestions[0], // Valid
          {
            ...analysis.suggestions[0],
            id: "invalid",
            template: "invalid-template", // Invalid
          },
        ];
        
        const generatedFiles = await generator.generateMultipleADRs(mixedSuggestions);
        
        // Should generate at least one file (the valid one)
        expect(generatedFiles.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Performance and scalability", () => {
    it("should handle multiple ADR generations efficiently", async () => {
      const analysis = await analyzer.analyzeCodebase();
      
      if (analysis.suggestions.length > 0) {
        const startTime = Date.now();
        
        const generatedFiles = await generator.generateMultipleADRs(analysis.suggestions);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        expect(generatedFiles.length).toBeGreaterThan(0);
        expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      }
    });

    it("should handle large number of ADR validations efficiently", async () => {
      const startTime = Date.now();
      
      const validationResults = await validator.validateAllADRs();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(validationResults.size).toBeGreaterThan(0);
      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
    });

    it("should handle relationship analysis efficiently", async () => {
      const startTime = Date.now();
      
      const relationships = await mapper.analyzeRelationships();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(Array.isArray(relationships)).toBe(true);
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});
