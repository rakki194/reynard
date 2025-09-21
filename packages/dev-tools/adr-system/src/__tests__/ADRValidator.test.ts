/**
 * Tests for ADRValidator class
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ADRValidator } from "../ADRValidator";
import { createTestEnvironment, createSampleADRFiles } from "./test-utils";

describe("ADRValidator", () => {
  let testEnv: Awaited<ReturnType<typeof createTestEnvironment>>;
  let validator: ADRValidator;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
    await createSampleADRFiles(testEnv.adrDirectory);
    validator = new ADRValidator(testEnv.adrDirectory);
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe("constructor", () => {
    it("should initialize with ADR directory", () => {
      const validator = new ADRValidator("/test/adr");
      expect(validator).toBeInstanceOf(ADRValidator);
    });
  });

  describe("validateADR", () => {
    it("should validate a valid ADR file", async () => {
      const filePath = `${testEnv.adrDirectory}/001-sample-adr.md`;
      const result = await validator.validateADR(filePath);

      expect(result).toHaveProperty("isValid");
      expect(result).toHaveProperty("errors");
      expect(result).toHaveProperty("warnings");
      expect(result).toHaveProperty("suggestions");

      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it("should handle file read errors", async () => {
      const result = await validator.validateADR("/nonexistent/file.md");

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("Failed to read or parse ADR file");
    });

    it("should validate required sections", async () => {
      const filePath = `${testEnv.adrDirectory}/001-sample-adr.md`;
      const result = await validator.validateADR(filePath);

      // Should not have errors for missing required sections since the sample ADR has them
      const missingSectionErrors = result.errors.filter(error => error.includes("Missing required section"));
      expect(missingSectionErrors.length).toBe(0);
    });

    it("should detect missing required sections", async () => {
      // Create an ADR with missing sections
      const incompleteADR = `# ADR-999: Incomplete ADR

## Status
**Proposed** - 2024-01-01

## Context
This ADR is missing required sections.
`;

      const filePath = `${testEnv.adrDirectory}/999-incomplete-adr.md`;
      await require("fs/promises").writeFile(filePath, incompleteADR);

      const result = await validator.validateADR(filePath);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes("Missing required section: decision"))).toBe(true);
      expect(result.errors.some(error => error.includes("Missing required section: consequences"))).toBe(true);
    });

    it("should detect placeholder text", async () => {
      const filePath = `${testEnv.adrDirectory}/002-another-adr.md`;
      const result = await validator.validateADR(filePath);

      const placeholderWarnings = result.warnings.filter(warning => warning.includes("placeholder text"));
      expect(placeholderWarnings.length).toBeGreaterThan(0);
    });

    it("should detect short content", async () => {
      const shortADR = `# ADR-998: Short ADR

## Status
**Proposed**

## Context
Short.

## Decision
Short.

## Consequences
Short.
`;

      const filePath = `${testEnv.adrDirectory}/998-short-adr.md`;
      await require("fs/promises").writeFile(filePath, shortADR);

      const result = await validator.validateADR(filePath);

      const shortWarnings = result.warnings.filter(warning => warning.includes("too short"));
      expect(shortWarnings.length).toBeGreaterThan(0);
    });

    it("should detect TODO items", async () => {
      const todoADR = `# ADR-997: TODO ADR

## Status
**Proposed** - 2024-01-01

## Context
This ADR has TODO items.

## Decision
We will implement this.

## Consequences
### Positive
- [ ] Benefit 1
- [ ] Benefit 2

### Negative
- [ ] Drawback 1
`;

      const filePath = `${testEnv.adrDirectory}/997-todo-adr.md`;
      await require("fs/promises").writeFile(filePath, todoADR);

      const result = await validator.validateADR(filePath);

      const todoSuggestions = result.suggestions.filter(suggestion => suggestion.includes("TODO items"));
      expect(todoSuggestions.length).toBeGreaterThan(0);
    });

    it("should validate decision section", async () => {
      const filePath = `${testEnv.adrDirectory}/001-sample-adr.md`;
      const result = await validator.validateADR(filePath);

      // The sample ADR has a proper decision section
      const decisionErrors = result.errors.filter(error => error.includes("Decision section"));
      expect(decisionErrors.length).toBe(0);
    });

    it("should detect brief decision section", async () => {
      const briefDecisionADR = `# ADR-996: Brief Decision ADR

## Status
**Proposed** - 2024-01-01

## Context
This ADR has a brief decision.

## Decision
Yes.

## Consequences
### Positive
- Good

### Negative
- Bad
`;

      // Ensure the ADR directory exists
      await require("fs/promises").mkdir(testEnv.adrDirectory, { recursive: true });

      const filePath = `${testEnv.adrDirectory}/996-brief-decision-adr.md`;
      await require("fs/promises").writeFile(filePath, briefDecisionADR);

      const result = await validator.validateADR(filePath);

      const briefWarnings = result.warnings.filter(warning =>
        warning.includes("Decision section appears to be too brief")
      );
      expect(briefWarnings.length).toBeGreaterThan(0);
    });

    it("should validate consequences section", async () => {
      const filePath = `${testEnv.adrDirectory}/001-sample-adr.md`;
      const result = await validator.validateADR(filePath);

      // The sample ADR has proper consequences section
      const consequencesErrors = result.errors.filter(error =>
        error.includes("Consequences section must include both positive and negative outcomes")
      );
      expect(consequencesErrors.length).toBe(0);
    });

    it("should detect missing consequences subsections", async () => {
      const incompleteConsequencesADR = `# ADR-995: Incomplete Consequences ADR

## Status
**Proposed** - 2024-01-01

## Context
This ADR has incomplete consequences.

## Decision
We will do this.

## Consequences
Only positive outcomes listed.
`;

      const filePath = `${testEnv.adrDirectory}/995-incomplete-consequences-adr.md`;
      await require("fs/promises").writeFile(filePath, incompleteConsequencesADR);

      const result = await validator.validateADR(filePath);

      const consequencesErrors = result.errors.filter(error =>
        error.includes("Consequences section must include both positive and negative outcomes")
      );
      expect(consequencesErrors.length).toBeGreaterThan(0);
    });

    it("should suggest implementation plan section", async () => {
      const noImplementationADR = `# ADR-994: No Implementation ADR

## Status
**Proposed** - 2024-01-01

## Context
This ADR has no implementation plan.

## Decision
We will do this.

## Consequences
### Positive
- Good

### Negative
- Bad
`;

      const filePath = `${testEnv.adrDirectory}/994-no-implementation-adr.md`;
      await require("fs/promises").writeFile(filePath, noImplementationADR);

      const result = await validator.validateADR(filePath);

      const implementationWarnings = result.warnings.filter(warning =>
        warning.includes("Consider adding an implementation plan section")
      );
      expect(implementationWarnings.length).toBeGreaterThan(0);
    });

    it("should suggest review section", async () => {
      const noReviewADR = `# ADR-993: No Review ADR

## Status
**Proposed** - 2024-01-01

## Context
This ADR has no review section.

## Decision
We will do this.

## Consequences
### Positive
- Good

### Negative
- Bad
`;

      const filePath = `${testEnv.adrDirectory}/993-no-review-adr.md`;
      await require("fs/promises").writeFile(filePath, noReviewADR);

      const result = await validator.validateADR(filePath);

      const reviewWarnings = result.warnings.filter(warning =>
        warning.includes("Consider adding a review and updates section")
      );
      expect(reviewWarnings.length).toBeGreaterThan(0);
    });
  });

  describe("validateAllADRs", () => {
    it("should validate all ADR files in directory", async () => {
      const results = await validator.validateAllADRs();

      expect(results).toBeInstanceOf(Map);
      expect(results.size).toBeGreaterThan(0);

      for (const [filename, result] of results) {
        expect(typeof filename).toBe("string");
        expect(result).toHaveProperty("isValid");
        expect(result).toHaveProperty("errors");
        expect(result).toHaveProperty("warnings");
        expect(result).toHaveProperty("suggestions");
      }
    });

    it("should handle empty directory", async () => {
      await testEnv.cleanup();
      testEnv = await createTestEnvironment();
      const emptyValidator = new ADRValidator(testEnv.adrDirectory);

      const results = await emptyValidator.validateAllADRs();

      expect(results.size).toBe(0);
    });

    it("should handle directory read errors", async () => {
      const invalidValidator = new ADRValidator("/nonexistent/directory");

      const results = await invalidValidator.validateAllADRs();

      expect(results.size).toBe(0);
    });
  });

  describe("ADR parsing", () => {
    it("should parse ADR content correctly", async () => {
      const filePath = `${testEnv.adrDirectory}/001-sample-adr.md`;
      const result = await validator.validateADR(filePath);

      // Should not have parsing errors
      const parsingErrors = result.errors.filter(error => error.includes("Failed to read or parse ADR file"));
      expect(parsingErrors.length).toBe(0);
    });

    it("should extract status correctly", async () => {
      const filePath = `${testEnv.adrDirectory}/001-sample-adr.md`;
      const result = await validator.validateADR(filePath);

      // The sample ADR has "Accepted" status
      expect(result.isValid).toBe(true);
    });

    it("should handle malformed ADR content", async () => {
      const malformedADR = `# ADR-992: Malformed ADR

This is not a properly formatted ADR.
It's missing proper section headers.
`;

      const filePath = `${testEnv.adrDirectory}/992-malformed-adr.md`;
      await require("fs/promises").writeFile(filePath, malformedADR);

      const result = await validator.validateADR(filePath);

      // Should detect missing required sections
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
