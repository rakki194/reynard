/**
 * 🦊 Links Validation for Markdown
 *
 * Validates internal and external links in markdown files
 */

import fs from "fs";
import path from "path";
import type { LinkValidationOptions, ValidationResult, MarkdownFile } from "./types.js";
import type { ReynardLogger } from "reynard-dev-tools-catalyst";

export class LinksValidator {
  private readonly internalLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  private readonly externalLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  private readonly anchorLinkPattern = /\[([^\]]+)\]\(#([^)]+)\)/g;
  private logger?: ReynardLogger;

  constructor(logger?: ReynardLogger) {
    this.logger = logger;
  }

  /**
   * Validate links in markdown content
   */
  async validateContent(
    content: string,
    filePath: string,
    options: LinkValidationOptions = {}
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fixes: string[] = [];

    try {
      // Extract all links
      const allLinks = this.extractLinks(content);

      if (options.checkInternal !== false) {
        const internalResult = await this.validateInternalLinks(allLinks, filePath, content);
        errors.push(...internalResult.errors);
        warnings.push(...internalResult.warnings);
        fixes.push(...internalResult.fixes);
      }

      if (options.checkExternal !== false) {
        const externalResult = await this.validateExternalLinks(allLinks, options);
        errors.push(...externalResult.errors);
        warnings.push(...externalResult.warnings);
        fixes.push(...externalResult.fixes);
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
        error: `Failed to validate links: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Validate links in a markdown file
   */
  async validateFile(filePath: string, options: LinkValidationOptions = {}): Promise<ValidationResult> {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      return await this.validateContent(content, filePath, options);
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Extract all links from markdown content
   */
  private extractLinks(content: string): Array<{ text: string; url: string; isExternal: boolean; isAnchor: boolean }> {
    const links: Array<{ text: string; url: string; isExternal: boolean; isAnchor: boolean }> = [];

    // Extract all markdown links
    const linkMatches = content.matchAll(this.internalLinkPattern);

    for (const match of linkMatches) {
      const text = match[1];
      const url = match[2];
      const isExternal = url.startsWith("http://") || url.startsWith("https://");
      const isAnchor = url.startsWith("#");

      links.push({ text, url, isExternal, isAnchor });
    }

    return links;
  }

  /**
   * Validate internal links (file references and anchors)
   */
  private async validateInternalLinks(
    links: Array<{ text: string; url: string; isExternal: boolean; isAnchor: boolean }>,
    filePath: string,
    content: string
  ): Promise<{ errors: string[]; warnings: string[]; fixes: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fixes: string[] = [];

    const internalLinks = links.filter(link => !link.isExternal);
    const baseDir = path.dirname(filePath);

    for (const link of internalLinks) {
      if (link.isAnchor) {
        // Validate anchor links
        const anchorResult = this.validateAnchorLink(link.url, content);
        if (!anchorResult.valid) {
          errors.push(`Invalid anchor link: ${link.url} - ${anchorResult.reason}`);
        }
      } else {
        // Validate file links
        const fileResult = this.validateFileLink(link.url, baseDir);
        if (!fileResult.valid) {
          errors.push(`Invalid file link: ${link.url} - ${fileResult.reason}`);
        }
      }
    }

    return { errors, warnings, fixes };
  }

  /**
   * Validate external links
   */
  private async validateExternalLinks(
    links: Array<{ text: string; url: string; isExternal: boolean; isAnchor: boolean }>,
    options: LinkValidationOptions
  ): Promise<{ errors: string[]; warnings: string[]; fixes: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fixes: string[] = [];

    const externalLinks = links.filter(link => link.isExternal);

    // For now, we'll just validate URL format
    // In a full implementation, you'd make HTTP requests to check if links are accessible
    for (const link of externalLinks) {
      if (!this.isValidUrl(link.url)) {
        errors.push(`Invalid URL format: ${link.url}`);
      }
    }

    return { errors, warnings, fixes };
  }

  /**
   * Validate anchor link exists in content
   */
  private validateAnchorLink(anchor: string, content: string): { valid: boolean; reason?: string } {
    // Remove the # prefix
    const anchorId = anchor.substring(1);

    // Look for headers that would create this anchor
    const headerPattern = new RegExp(`^#{1,6}\\s+(.+)$`, "gm");
    const headers = content.matchAll(headerPattern);

    for (const header of headers) {
      const headerText = header[1];
      const generatedId = this.generateAnchorId(headerText);

      if (generatedId === anchorId) {
        return { valid: true };
      }
    }

    return { valid: false, reason: "Anchor target not found" };
  }

  /**
   * Validate file link exists
   */
  private validateFileLink(filePath: string, baseDir: string): { valid: boolean; reason?: string } {
    try {
      const fullPath = path.resolve(baseDir, filePath);

      if (!fs.existsSync(fullPath)) {
        return { valid: false, reason: "File not found" };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, reason: "Invalid file path" };
    }
  }

  /**
   * Generate anchor ID from header text (GitHub-style)
   */
  private generateAnchorId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
  }

  /**
   * Check if URL has valid format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get link statistics from content
   */
  getLinkStats(content: string): {
    total: number;
    internal: number;
    external: number;
    anchors: number;
  } {
    const links = this.extractLinks(content);

    return {
      total: links.length,
      internal: links.filter(l => !l.isExternal).length,
      external: links.filter(l => l.isExternal).length,
      anchors: links.filter(l => l.isAnchor).length,
    };
  }
}
