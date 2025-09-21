/**
 * 🦊 Sentence Length Validation for Markdown
 *
 * Validates and fixes sentence length in markdown files
 */

import fs from "fs";
import type { SentenceLengthOptions, ValidationResult } from "./types.js";

export class SentenceLengthValidator {
  private readonly defaultMaxLength = 100;
  private readonly sentenceEndPattern = /[.!?]+/g;
  private readonly markdownLinkPattern = /\[([^\]]+)\]\([^)]+\)/g;
  private readonly codeBlockPattern = /```[\s\S]*?```/g;
  private readonly inlineCodePattern = /`[^`]+`/g;

  /**
   * Validate sentence length in markdown content
   */
  async validateContent(content: string, options: SentenceLengthOptions = {}): Promise<ValidationResult> {
    const maxLength = options.maxLength || this.defaultMaxLength;
    const errors: string[] = [];
    const warnings: string[] = [];
    const fixes: string[] = [];

    try {
      // Extract sentences from content
      const sentences = this.extractSentences(content);

      // Check each sentence
      for (const sentence of sentences) {
        if (sentence.text.length > maxLength) {
          const error = `Sentence too long (${sentence.text.length} chars): "${sentence.text.substring(0, 50)}..."`;

          if (options.fix) {
            const fixedSentence = this.fixLongSentence(sentence.text, maxLength);
            if (fixedSentence !== sentence.text) {
              fixes.push(
                `Fixed long sentence at line ${sentence.line}: ${sentence.text.length} → ${fixedSentence.length} chars`
              );
            }
          } else {
            errors.push(error);
          }
        }
      }

      return {
        success: errors.length === 0,
        error: errors.length > 0 ? errors.join("; ") : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        fixes: fixes.length > 0 ? fixes : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to validate sentence length: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Validate sentence length in a markdown file
   */
  async validateFile(filePath: string, options: SentenceLengthOptions = {}): Promise<ValidationResult> {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const result = await this.validateContent(content, options);

      // If fixing is enabled and there were fixes, write the fixed content back
      if (options.fix && result.fixes && result.fixes.length > 0) {
        const fixedContent = this.applyFixes(content, options);
        fs.writeFileSync(filePath, fixedContent, "utf8");
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Extract sentences from markdown content
   */
  private extractSentences(content: string): Array<{ text: string; line: number; start: number; end: number }> {
    const sentences: Array<{ text: string; line: number; start: number; end: number }> = [];

    // Remove code blocks and inline code to avoid splitting them
    const cleanContent = content.replace(this.codeBlockPattern, "").replace(this.inlineCodePattern, "");

    const lines = cleanContent.split("\n");

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Skip markdown headers, lists, and other structural elements
      if (this.shouldSkipLine(line)) {
        continue;
      }

      // Extract sentences from the line
      const lineSentences = this.extractSentencesFromLine(line, lineIndex);
      sentences.push(...lineSentences);
    }

    return sentences;
  }

  /**
   * Extract sentences from a single line
   */
  private extractSentencesFromLine(
    line: string,
    lineNumber: number
  ): Array<{ text: string; line: number; start: number; end: number }> {
    const sentences: Array<{ text: string; line: number; start: number; end: number }> = [];

    // Remove markdown links but keep the text
    const cleanLine = line.replace(this.markdownLinkPattern, "$1");

    // Split by sentence endings
    const parts = cleanLine.split(this.sentenceEndPattern);
    let currentPos = 0;

    for (let i = 0; i < parts.length - 1; i++) {
      const sentenceText = parts[i].trim();

      if (sentenceText.length > 0) {
        sentences.push({
          text: sentenceText,
          line: lineNumber + 1,
          start: currentPos,
          end: currentPos + sentenceText.length,
        });
      }

      currentPos += parts[i].length + 1; // +1 for the sentence ending
    }

    return sentences;
  }

  /**
   * Check if a line should be skipped for sentence analysis
   */
  private shouldSkipLine(line: string): boolean {
    const trimmed = line.trim();

    // Skip empty lines
    if (trimmed.length === 0) return true;

    // Skip markdown headers
    if (trimmed.startsWith("#")) return true;

    // Skip list items
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("+ ")) return true;
    if (/^\d+\.\s/.test(trimmed)) return true;

    // Skip code blocks
    if (trimmed.startsWith("```")) return true;

    // Skip horizontal rules
    if (trimmed.startsWith("---") || trimmed.startsWith("***") || trimmed.startsWith("___")) return true;

    // Skip blockquotes
    if (trimmed.startsWith(">")) return true;

    return false;
  }

  /**
   * Fix a long sentence by breaking it at appropriate points
   */
  private fixLongSentence(sentence: string, maxLength: number): string {
    if (sentence.length <= maxLength) {
      return sentence;
    }

    // Try to break at natural points
    const breakPoints = [
      /,\s+/g, // Commas
      /;\s+/g, // Semicolons
      /:\s+/g, // Colons
      /\s+and\s+/gi, // "and"
      /\s+or\s+/gi, // "or"
      /\s+but\s+/gi, // "but"
      /\s+however\s+/gi, // "however"
      /\s+therefore\s+/gi, // "therefore"
      /\s+thus\s+/gi, // "thus"
      /\s+so\s+/gi, // "so"
    ];

    for (const pattern of breakPoints) {
      const matches = [...sentence.matchAll(pattern)];

      for (const match of matches) {
        const breakPoint = match.index! + match[0].length;

        if (breakPoint > maxLength * 0.3 && breakPoint < maxLength * 0.8) {
          // Found a good break point
          const firstPart = sentence.substring(0, breakPoint).trim();
          const secondPart = sentence.substring(breakPoint).trim();

          return `${firstPart}. ${secondPart}`;
        }
      }
    }

    // If no good break point found, break at the max length
    const breakPoint = maxLength;
    const firstPart = sentence.substring(0, breakPoint).trim();
    const secondPart = sentence.substring(breakPoint).trim();

    return `${firstPart}. ${secondPart}`;
  }

  /**
   * Apply fixes to content
   */
  private applyFixes(content: string, options: SentenceLengthOptions): string {
    const maxLength = options.maxLength || this.defaultMaxLength;
    const sentences = this.extractSentences(content);

    let fixedContent = content;

    // Apply fixes in reverse order to maintain positions
    for (let i = sentences.length - 1; i >= 0; i--) {
      const sentence = sentences[i];

      if (sentence.text.length > maxLength) {
        const fixedSentence = this.fixLongSentence(sentence.text, maxLength);

        // Replace the sentence in the content
        // This is a simplified approach - in practice, you'd want more sophisticated replacement
        fixedContent = fixedContent.replace(sentence.text, fixedSentence);
      }
    }

    return fixedContent;
  }

  /**
   * Get sentence length statistics
   */
  getSentenceStats(content: string): {
    total: number;
    averageLength: number;
    maxLength: number;
    longSentences: number;
    longSentenceThreshold: number;
  } {
    const sentences = this.extractSentences(content);
    const lengths = sentences.map(s => s.text.length);

    const total = sentences.length;
    const averageLength = total > 0 ? lengths.reduce((a, b) => a + b, 0) / total : 0;
    const maxLength = lengths.length > 0 ? Math.max(...lengths) : 0;
    const longSentences = lengths.filter(l => l > this.defaultMaxLength).length;

    return {
      total,
      averageLength: Math.round(averageLength * 100) / 100,
      maxLength,
      longSentences,
      longSentenceThreshold: this.defaultMaxLength,
    };
  }
}
