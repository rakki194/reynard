/**
 * 🦊 ToC Conflict Detection and Validation
 *
 * Detects conflicts between multiple ToC validators and ensures
 * proper Table of Contents structure in markdown files.
 */

import fs from "fs";
import path from "path";
import type { ToCAnalysis, ToCValidationOptions, ValidationResult, MarkdownFile } from "./types.js";

export class ToCValidator {
  private readonly defaultTocHeaderPattern = /^##\s+Table\s+of\s+Contents?$/i;
  private readonly tocEntryPattern = /^-\s+\[([^\]]+)\]\(#([^)]+)\)/;

  /**
   * Analyze ToC structure in markdown content
   */
  analyzeToC(content: string, options: ToCValidationOptions = {}): ToCAnalysis {
    const tocHeaderPattern = options.tocHeaderPattern || this.defaultTocHeaderPattern;
    const lines = content.split("\n");

    // Find all ToC sections
    const tocSections = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => tocHeaderPattern.test(line.trim()));

    // Find all ToC entries
    const tocEntries = lines.filter(line => this.tocEntryPattern.test(line.trim())).map(line => line.trim());

    // Check for duplicates
    const uniqueEntries = new Set(tocEntries);
    const duplicates = tocEntries.filter((entry, index) => tocEntries.indexOf(entry) !== index);

    // Detect conflicts
    const hasConflict = tocSections.length > 1 || duplicates.length > 0;
    const conflictDetails = this.generateConflictDetails(tocSections, duplicates);

    return {
      tocCount: tocSections.length,
      entryCount: tocEntries.length,
      hasDuplicates: duplicates.length > 0,
      duplicates: [...new Set(duplicates)],
      entries: tocEntries,
      hasConflict,
      conflictDetails,
    };
  }

  /**
   * Validate ToC in a markdown file
   */
  async validateFile(filePath: string, options: ToCValidationOptions = {}): Promise<ValidationResult> {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const analysis = this.analyzeToC(content, options);

      if (analysis.hasConflict) {
        const error = `ToC conflict detected: ${analysis.conflictDetails}`;

        if (options.fix) {
          const fixedContent = this.fixToCConflicts(content, analysis, options);
          fs.writeFileSync(filePath, fixedContent, "utf8");

          return {
            success: true,
            fixes: [`Fixed ToC conflicts: ${analysis.conflictDetails}`],
          };
        }

        return {
          success: false,
          error,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to validate file: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Fix ToC conflicts in content
   */
  private fixToCConflicts(content: string, analysis: ToCAnalysis, options: ToCValidationOptions): string {
    let fixedContent = content;

    // Remove duplicate ToC sections (keep the first one)
    if (analysis.tocCount > 1) {
      const tocHeaderPattern = options.tocHeaderPattern || this.defaultTocHeaderPattern;
      const lines = fixedContent.split("\n");
      let tocSectionCount = 0;

      fixedContent = lines
        .map(line => {
          if (tocHeaderPattern.test(line.trim())) {
            tocSectionCount++;
            if (tocSectionCount === 1) {
              return line; // Keep first ToC section
            } else {
              return ""; // Remove subsequent ToC sections
            }
          }
          return line;
        })
        .join("\n");
    }

    // Remove duplicate ToC entries
    if (analysis.hasDuplicates) {
      const lines = fixedContent.split("\n");
      const seenEntries = new Set<string>();

      fixedContent = lines
        .map(line => {
          if (this.tocEntryPattern.test(line.trim())) {
            const entry = line.trim();
            if (seenEntries.has(entry)) {
              return ""; // Remove duplicate entry
            } else {
              seenEntries.add(entry);
              return line;
            }
          }
          return line;
        })
        .join("\n");
    }

    // Clean up empty lines
    fixedContent = fixedContent
      .split("\n")
      .filter((line, index, array) => {
        // Don't remove empty lines that are part of structure
        if (line.trim() === "") {
          const prevLine = array[index - 1];
          const nextLine = array[index + 1];

          // Keep empty lines between sections
          if (prevLine && nextLine && (prevLine.startsWith("#") || nextLine.startsWith("#"))) {
            return true;
          }

          // Keep single empty lines
          return !(prevLine && prevLine.trim() === "");
        }
        return true;
      })
      .join("\n");

    return fixedContent;
  }

  /**
   * Generate conflict details for analysis
   */
  private generateConflictDetails(tocSections: Array<{ line: string; index: number }>, duplicates: string[]): string {
    const details: string[] = [];

    if (tocSections.length > 1) {
      details.push(`${tocSections.length} ToC sections found (expected 1)`);
    }

    if (duplicates.length > 0) {
      details.push(`${duplicates.length} duplicate ToC entries found`);
    }

    return details.join(", ");
  }

  /**
   * Create a test markdown file for conflict detection
   */
  createTestFile(filePath: string): void {
    const testContent = `# Test ToC Conflict

## Section 1

Some content here.

## Section 2

More content here.

## Section 3

Final content here.
`;

    fs.writeFileSync(filePath, testContent, "utf8");
  }

  /**
   * Run comprehensive ToC conflict test
   */
  async runConflictTest(testFilePath: string, options: ToCValidationOptions = {}): Promise<void> {
    console.log("🦊 Creating test markdown file for ToC conflict detection...");
    this.createTestFile(testFilePath);
    console.log(`✅ Created test file: ${testFilePath}`);

    console.log("\n🦊 Testing ToC conflict detection...");

    try {
      // Run validation
      const result = await this.validateFile(testFilePath, { ...options, fix: true });

      if (result.success) {
        console.log("✅ ToC validation completed successfully");
        if (result.fixes && result.fixes.length > 0) {
          console.log("🔧 Fixes applied:");
          result.fixes.forEach(fix => console.log(`  - ${fix}`));
        }
      } else {
        console.log(`❌ ToC validation failed: ${result.error}`);
      }

      // Read and analyze the file after validation
      const content = fs.readFileSync(testFilePath, "utf8");
      const analysis = this.analyzeToC(content, options);

      console.log("\n📄 Content after ToC validation:");
      console.log("=".repeat(50));
      console.log(content);
      console.log("=".repeat(50));

      console.log(`\n🔍 ToC Analysis:`);
      console.log(`📚 Number of ToC sections: ${analysis.tocCount}`);
      console.log(`📝 Number of ToC entries: ${analysis.entryCount}`);

      if (analysis.hasConflict) {
        console.log(`❌ Conflict detected: ${analysis.conflictDetails}`);
      } else {
        console.log("✅ No conflicts detected");
      }

      if (analysis.entries.length > 0) {
        console.log("\n📋 ToC Entries:");
        analysis.entries.forEach((entry, index) => {
          console.log(`  ${index + 1}. ${entry}`);
        });
      }
    } catch (error) {
      console.error("❌ ToC conflict test failed:", error instanceof Error ? error.message : String(error));
    } finally {
      // Clean up test file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
        console.log(`\n🧹 Cleaned up test file: ${testFilePath}`);
      }
    }
  }
}
