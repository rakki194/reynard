/**
 * ADR Validator - Automated ADR Validation and Quality Assurance
 *
 * This module provides comprehensive validation of ADR documents to ensure
 * they meet quality standards and follow best practices.
 */

import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { ADRDocument, ADRValidationResult, ADRStatus } from "./types";

export class ADRValidator {
  private readonly adrDirectory: string;
  private readonly validationRules: ValidationRule[] = [];

  constructor(adrDirectory: string) {
    this.adrDirectory = adrDirectory;
    this.initializeValidationRules();
  }

  /**
   * Validate a single ADR file
   */
  async validateADR(filePath: string): Promise<ADRValidationResult> {
    try {
      const content = await readFile(filePath, "utf-8");
      const adr = this.parseADR(content);

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Run all validation rules
      for (const rule of this.validationRules) {
        const result = rule.validate(adr, content);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
        suggestions.push(...result.suggestions);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Failed to read or parse ADR file: ${error}`],
        warnings: [],
        suggestions: [],
      };
    }
  }

  /**
   * Validate all ADRs in the directory
   */
  async validateAllADRs(): Promise<Map<string, ADRValidationResult>> {
    const results = new Map<string, ADRValidationResult>();

    try {
      const files = await readdir(this.adrDirectory);
      const adrFiles = files.filter(file => file.endsWith(".md") && file.match(/^\d{3}-/));

      for (const file of adrFiles) {
        const filePath = join(this.adrDirectory, file);
        const result = await this.validateADR(filePath);
        results.set(file, result);
      }
    } catch (error) {
      console.error("Failed to validate ADRs:", error);
    }

    return results;
  }

  /**
   * Parse ADR content into structured format
   */
  private parseADR(content: string): Partial<ADRDocument> {
    const lines = content.split("\n");
    const adr: Partial<ADRDocument> = {};

    let currentSection = "";
    let sectionContent: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Detect section headers
      if (trimmedLine.startsWith("## ")) {
        // Save previous section
        if (currentSection && sectionContent.length > 0) {
          this.setSectionContent(adr, currentSection, sectionContent.join("\n"));
        }

        currentSection = trimmedLine.substring(3).toLowerCase();
        sectionContent = [];
      } else if (trimmedLine && !trimmedLine.startsWith("#")) {
        sectionContent.push(line);
      }
    }

    // Save last section
    if (currentSection && sectionContent.length > 0) {
      this.setSectionContent(adr, currentSection, sectionContent.join("\n"));
    }

    return adr;
  }

  /**
   * Set section content in ADR object
   */
  private setSectionContent(adr: Partial<ADRDocument>, section: string, content: string): void {
    switch (section) {
      case "status":
        adr.status = this.extractStatus(content);
        break;
      case "context":
        adr.context = content;
        break;
      case "decision":
        adr.decision = content;
        break;
      case "consequences":
        adr.consequences = this.parseConsequences(content);
        break;
      case "compliance":
        adr.compliance = content;
        break;
    }
  }

  /**
   * Extract status from content
   */
  private extractStatus(content: string): ADRStatus {
    const statusMatch = content.match(/\*\*(.*?)\*\*/);
    if (statusMatch) {
      const status = statusMatch[1].toLowerCase();
      if (["proposed", "accepted", "rejected", "superseded", "deprecated"].includes(status)) {
        return status as ADRStatus;
      }
    }
    return "proposed";
  }

  /**
   * Parse consequences section
   */
  private parseConsequences(content: string): {
    positive: string[];
    negative: string[];
    risks: string[];
  } {
    // Simplified parsing - in a real implementation, this would be more sophisticated
    return {
      positive: [],
      negative: [],
      risks: [],
    };
  }

  /**
   * Initialize validation rules
   */
  private initializeValidationRules(): void {
    // Required sections rule
    this.validationRules.push({
      name: "Required Sections",
      validate: (adr, content) => {
        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        const requiredSections = ["status", "context", "decision", "consequences"];

        for (const section of requiredSections) {
          if (!content.toLowerCase().includes(`## ${section.toLowerCase()}`)) {
            errors.push(`Missing required section: ${section}`);
          }
        }

        return { errors, warnings, suggestions };
      },
    });

    // Status validation rule
    this.validationRules.push({
      name: "Status Validation",
      validate: (adr, content) => {
        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        if (!adr.status) {
          errors.push("ADR must have a status");
        } else if (adr.status === "proposed" && content.includes("[To be filled")) {
          warnings.push("Proposed ADR contains placeholder text");
        }

        return { errors, warnings, suggestions };
      },
    });

    // Content quality rule
    this.validationRules.push({
      name: "Content Quality",
      validate: (adr, content) => {
        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        // Check for placeholder text
        if (content.includes("[To be filled") || content.includes("[To be defined")) {
          warnings.push("ADR contains placeholder text that should be completed");
        }

        // Check for minimum content length
        if (content.length < 500) {
          warnings.push("ADR appears to be too short - consider adding more detail");
        }

        // Check for TODO items
        if (content.includes("- [ ]")) {
          suggestions.push("ADR contains TODO items - consider completing them");
        }

        return { errors, warnings, suggestions };
      },
    });

    // Decision clarity rule
    this.validationRules.push({
      name: "Decision Clarity",
      validate: (adr, content) => {
        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        if (adr.decision && adr.decision.length < 50) {
          warnings.push("Decision section appears to be too brief");
        }

        if (adr.decision && adr.decision.includes("[To be filled")) {
          warnings.push("Decision section contains placeholder text");
        }

        return { errors, warnings, suggestions };
      },
    });

    // Consequences completeness rule
    this.validationRules.push({
      name: "Consequences Completeness",
      validate: (adr, content) => {
        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        if (!content.includes("### Positive") || !content.includes("### Negative")) {
          errors.push("Consequences section must include both positive and negative outcomes");
        }

        if (!content.includes("### Risks and Mitigations")) {
          warnings.push("Consider adding risks and mitigations section");
        }

        return { errors, warnings, suggestions };
      },
    });

    // Implementation plan rule
    this.validationRules.push({
      name: "Implementation Plan",
      validate: (adr, content) => {
        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        if (!content.includes("## Implementation Plan")) {
          warnings.push("Consider adding an implementation plan section");
        }

        if (content.includes("## Implementation Plan") && !content.includes("- [ ]")) {
          suggestions.push("Implementation plan should include specific tasks");
        }

        return { errors, warnings, suggestions };
      },
    });

    // Review and updates rule
    this.validationRules.push({
      name: "Review and Updates",
      validate: (adr, content) => {
        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        if (!content.includes("## Review and Updates")) {
          warnings.push("Consider adding a review and updates section");
        }

        if (content.includes("## Review and Updates") && !content.includes("**Review Date**")) {
          suggestions.push("Review section should include a specific review date");
        }

        return { errors, warnings, suggestions };
      },
    });
  }
}

interface ValidationRule {
  name: string;
  validate: (
    adr: Partial<ADRDocument>,
    content: string
  ) => {
    errors: string[];
    warnings: string[];
    suggestions: string[];
  };
}
