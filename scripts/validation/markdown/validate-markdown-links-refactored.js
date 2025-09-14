#!/usr/bin/env node
/**
 * Markdown Link Validation Script for Reynard Framework
 *
 * This script validates all markdown links in the project, including:
 * - Internal document links (relative paths)
 * - External URLs (HTTP/HTTPS)
 * - Anchor links within documents
 * - Image references
 * - Cross-references between documentation files
 *
 * 🦊 Reynard Coding Standards: Cunning agile development with feral tenacity
 */

import fs from "fs";
import path from "path";
import {
  BaseValidator,
  Colors,
  FileValidationResult,
  ValidationResult,
  createError,
  findProjectRoot,
  getStagedMarkdownFiles,
  handleExit,
  parseCommonArgs,
  printColored,
  printError,
  printHeader,
  printSuccess,
  safeReadFile,
  showHelp,
} from "../shared/index.js";

/**
 * Configuration for link validation
 */
const Config = {
  // Directories to scan for markdown files
  scanDirectories: [
    "docs/",
    "packages/",
    "examples/",
    "templates/",
    "backend/",
    "e2e/",
    "scripts/",
    "libraries/",
    "blackhat/",
    "todos/",
  ],

  // File extensions to scan
  markdownExtensions: [".md", ".markdown", ".mdown", ".mkdn", ".mkd"],

  // Maximum line length for error reporting
  maxErrorLineLength: 100,

  // Timeout for HTTP requests (in milliseconds)
  httpTimeout: 5000,

  // User agent for HTTP requests
  userAgent: "Reynard-Markdown-Link-Validator/1.0",
};

/**
 * Link validation result extending base validation result
 */
class LinkValidationResult extends ValidationResult {
  constructor(file, line, column, link, type, status, message, suggestion = null) {
    super(file, line, column, message, type, status);
    this.link = link;
    this.suggestion = suggestion;
  }
}

/**
 * Main validation class extending base validator
 */
class MarkdownLinkValidator extends BaseValidator {
  constructor() {
    super();
    this.projectRoot = findProjectRoot();
    this.markdownFiles = new Map(); // file path -> content
    this.anchorCache = new Map(); // file path -> Set of anchors
  }

  /**
   * Check if a directory should be excluded
   */
  shouldExcludeDirectory(dirPath) {
    const relativePath = path.relative(this.projectRoot, dirPath);
    const excludeDirectories = [
      "node_modules/",
      "third_party/",
      ".git/",
      "dist/",
      "build/",
      "coverage/",
      "htmlcov/",
      "__pycache__/",
      ".venv/",
      "venv/",
      ".husky/node_modules/",
    ];

    return excludeDirectories.some(
      excludeDir =>
        relativePath.startsWith(excludeDir) ||
        relativePath.includes("/" + excludeDir) ||
        relativePath.includes("\\" + excludeDir)
    );
  }

  /**
   * Find all markdown files in the project
   */
  findMarkdownFiles() {
    const markdownFiles = [];

    for (const scanDir of Config.scanDirectories) {
      const fullPath = path.join(this.projectRoot, scanDir);

      if (!fs.existsSync(fullPath)) {
        continue;
      }

      this.scanDirectory(fullPath, markdownFiles);
    }

    return markdownFiles;
  }

  /**
   * Recursively scan a directory for markdown files
   */
  scanDirectory(dirPath, markdownFiles) {
    if (this.shouldExcludeDirectory(dirPath)) {
      return;
    }

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          this.scanDirectory(fullPath, markdownFiles);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (Config.markdownExtensions.includes(ext)) {
            markdownFiles.push(fullPath);
          }
        }
      }
    } catch (error) {
      printColored(`⚠️  Warning: Could not scan directory ${dirPath}: ${error.message}`, Colors.YELLOW);
    }
  }

  /**
   * Load and cache markdown file content
   */
  loadMarkdownFile(filePath) {
    if (this.markdownFiles.has(filePath)) {
      return this.markdownFiles.get(filePath);
    }

    const content = safeReadFile(filePath);
    if (content) {
      this.markdownFiles.set(filePath, content);
    }
    return content;
  }

  /**
   * Extract all links from markdown content
   */
  extractLinks(content, filePath) {
    const links = [];
    const lines = content.split("\n");

    // Patterns for different types of links
    const patterns = {
      // Markdown links: [text](url)
      markdownLink: /\[([^\]]*)\]\(([^)]+)\)/g,

      // Markdown images: ![alt](url)
      markdownImage: /!\[([^\]]*)\]\(([^)]+)\)/g,

      // Reference links: [text][ref] and [ref]: url
      referenceLink: /\[([^\]]*)\]\[([^\]]*)\]/g,
      referenceDefinition: /^\[([^\]]+)\]:\s*(.+)$/gm,

      // Auto-links: <url> (only match URLs, not generic angle brackets)
      autoLink: /<(https?:\/\/[^>]+)>/g,

      // Bare URLs (basic pattern)
      bareUrl: /(https?:\/\/[^\s<>"{}|\\^`\[\])]+)/g,
    };

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNumber = lineIndex + 1;

      // Skip code blocks
      if (this.isInCodeBlock(lines, lineIndex)) {
        continue;
      }

      // Extract markdown links
      let match;
      while ((match = patterns.markdownLink.exec(line)) !== null) {
        const [fullMatch, text, url] = match;
        const column = match.index + 1;

        links.push({
          type: "markdown",
          text: text.trim(),
          url: url.trim(),
          line: lineNumber,
          column: column,
          fullMatch: fullMatch,
          isImage: false,
        });
      }

      // Extract markdown images
      patterns.markdownImage.lastIndex = 0;
      while ((match = patterns.markdownImage.exec(line)) !== null) {
        const [fullMatch, alt, url] = match;
        const column = match.index + 1;

        links.push({
          type: "image",
          text: alt.trim(),
          url: url.trim(),
          line: lineNumber,
          column: column,
          fullMatch: fullMatch,
          isImage: true,
        });
      }

      // Extract auto-links
      patterns.autoLink.lastIndex = 0;
      while ((match = patterns.autoLink.exec(line)) !== null) {
        const [fullMatch, url] = match;
        const column = match.index + 1;

        links.push({
          type: "auto",
          text: url.trim(),
          url: url.trim(),
          line: lineNumber,
          column: column,
          fullMatch: fullMatch,
          isImage: false,
        });
      }
    }

    return links;
  }

  /**
   * Check if a line is inside a code block
   */
  isInCodeBlock(lines, lineIndex) {
    let inCodeBlock = false;

    for (let i = 0; i < lineIndex; i++) {
      const line = lines[i].trim();
      if (line.startsWith("```") || line.startsWith("~~~")) {
        inCodeBlock = !inCodeBlock;
      }
    }

    return inCodeBlock;
  }

  /**
   * Extract anchors from markdown content
   */
  extractAnchors(content) {
    const anchors = new Set();
    const lines = content.split("\n");

    for (const line of lines) {
      // Extract headings and generate anchor IDs
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();

        // Generate anchor ID (GitHub-style)
        const anchor = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "") // Remove special characters
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/-+/g, "-") // Replace multiple hyphens with single
          .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

        if (anchor) {
          anchors.add(anchor);
        }
      }
    }

    return anchors;
  }

  /**
   * Validate a single link
   */
  async validateLink(link, filePath, fileResult) {
    const { url, line, column, type, isImage } = link;

    try {
      // Parse the URL
      const urlInfo = this.parseUrl(url, filePath);

      if (urlInfo.type === "external") {
        return await this.validateExternalLink(urlInfo, link, fileResult);
      } else if (urlInfo.type === "internal") {
        return this.validateInternalLink(urlInfo, link, fileResult);
      } else if (urlInfo.type === "anchor") {
        return this.validateAnchorLink(urlInfo, link, fileResult);
      } else {
        return new LinkValidationResult(
          filePath,
          line,
          column,
          url,
          "unknown",
          "error",
          `Unknown link type: ${urlInfo.type}`
        );
      }
    } catch (error) {
      return new LinkValidationResult(
        filePath,
        line,
        column,
        url,
        "unknown",
        "error",
        `Validation error: ${error.message}`
      );
    }
  }

  /**
   * Parse and classify a URL
   */
  parseUrl(url, currentFilePath) {
    // Remove any URL fragments for initial parsing
    const [baseUrl, fragment] = url.split("#");

    // Check if it's an external URL
    if (baseUrl.match(/^https?:\/\//)) {
      return {
        type: "external",
        url: url,
        baseUrl: baseUrl,
        fragment: fragment || null,
        original: url,
      };
    }

    // Check if it's a mailto link
    if (baseUrl.startsWith("mailto:")) {
      return {
        type: "external",
        url: url,
        baseUrl: baseUrl,
        fragment: fragment || null,
        original: url,
      };
    }

    // Check if it's a tel link
    if (baseUrl.startsWith("tel:")) {
      return {
        type: "external",
        url: url,
        baseUrl: baseUrl,
        fragment: fragment || null,
        original: url,
      };
    }

    // Check if it's just an anchor (starts with #)
    if (url.startsWith("#")) {
      return {
        type: "anchor",
        anchor: url.substring(1),
        original: url,
      };
    }

    // It's an internal file reference
    const currentDir = path.dirname(currentFilePath);
    const targetPath = path.resolve(currentDir, baseUrl);

    return {
      type: "internal",
      path: targetPath,
      fragment: fragment || null,
      original: url,
      relativePath: baseUrl,
    };
  }

  /**
   * Validate external links (HTTP/HTTPS)
   */
  async validateExternalLink(urlInfo, link, fileResult) {
    const { url, baseUrl, fragment } = urlInfo;

    // For now, we'll do basic URL validation
    // In a full implementation, you might want to make HTTP requests
    try {
      const urlObj = new URL(baseUrl);

      // Basic validation
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        return new LinkValidationResult(
          fileResult.file,
          link.line,
          link.column,
          url,
          "external",
          "warning",
          `Unsupported protocol: ${urlObj.protocol}`,
          "Consider using HTTPS for external links"
        );
      }

      // Check for common issues
      if (urlObj.hostname === "localhost" || urlObj.hostname === "127.0.0.1") {
        return new LinkValidationResult(
          fileResult.file,
          link.line,
          link.column,
          url,
          "external",
          "warning",
          "Link points to localhost",
          "This link may not work for other users"
        );
      }

      return new LinkValidationResult(
        fileResult.file,
        link.line,
        link.column,
        url,
        "external",
        "valid",
        "External link appears valid"
      );
    } catch (error) {
      return new LinkValidationResult(
        fileResult.file,
        link.line,
        link.column,
        url,
        "external",
        "error",
        `Invalid URL: ${error.message}`,
        "Check the URL format and try again"
      );
    }
  }

  /**
   * Validate internal file links
   */
  validateInternalLink(urlInfo, link, fileResult) {
    const { path: targetPath, fragment, relativePath } = urlInfo;

    // Check if the target file exists
    if (!fs.existsSync(targetPath)) {
      return new LinkValidationResult(
        fileResult.file,
        link.line,
        link.column,
        urlInfo.original,
        "internal",
        "broken",
        `Target file does not exist: ${relativePath}`,
        `Check if the file exists at: ${targetPath}`
      );
    }

    // Check if it's a markdown file and validate fragment
    if (targetPath.endsWith(".md") && fragment) {
      const content = this.loadMarkdownFile(targetPath);
      if (content) {
        const anchors = this.extractAnchors(content);
        if (!anchors.has(fragment)) {
          return new LinkValidationResult(
            fileResult.file,
            link.line,
            link.column,
            urlInfo.original,
            "internal",
            "broken",
            `Anchor not found: #${fragment}`,
            `Available anchors: ${Array.from(anchors).slice(0, 5).join(", ")}${anchors.size > 5 ? "..." : ""}`
          );
        }
      }
    }

    return new LinkValidationResult(
      fileResult.file,
      link.line,
      link.column,
      urlInfo.original,
      "internal",
      "valid",
      "Internal link is valid"
    );
  }

  /**
   * Validate anchor links within the same document
   */
  validateAnchorLink(urlInfo, link, fileResult) {
    const { anchor } = urlInfo;

    // Get anchors for the current file
    const content = this.loadMarkdownFile(fileResult.file);
    if (!content) {
      return new LinkValidationResult(
        fileResult.file,
        link.line,
        link.column,
        urlInfo.original,
        "anchor",
        "error",
        "Could not read file to validate anchor"
      );
    }

    const anchors = this.extractAnchors(content);

    if (!anchors.has(anchor)) {
      return new LinkValidationResult(
        fileResult.file,
        link.line,
        link.column,
        urlInfo.original,
        "anchor",
        "broken",
        `Anchor not found: #${anchor}`,
        `Available anchors: ${Array.from(anchors).slice(0, 5).join(", ")}${anchors.size > 5 ? "..." : ""}`
      );
    }

    return new LinkValidationResult(
      fileResult.file,
      link.line,
      link.column,
      urlInfo.original,
      "anchor",
      "valid",
      "Anchor link is valid"
    );
  }

  /**
   * Validate a single file (implements BaseValidator interface)
   */
  async validateFile(filePath) {
    const fileResult = new FileValidationResult(filePath);
    const content = this.loadMarkdownFile(filePath);

    if (!content) {
      fileResult.addResult(createError(filePath, 0, "Could not read file"));
      return fileResult;
    }

    const links = this.extractLinks(content, filePath);

    if (links.length === 0) {
      return fileResult;
    }

    // Validate each link
    for (const link of links) {
      const linkResult = await this.validateLink(link, filePath, fileResult);
      fileResult.addResult(linkResult);
    }

    return fileResult;
  }

  /**
   * Validate all markdown files
   */
  async validateAll() {
    printHeader("Reynard Markdown Link Validator");
    printColored("=".repeat(50), Colors.CYAN);

    const markdownFiles = this.findMarkdownFiles();
    this.stats.totalFiles = markdownFiles.length;

    if (markdownFiles.length === 0) {
      printSuccess("No markdown files found to validate");
      return true;
    }

    printColored(`📁 Found ${markdownFiles.length} markdown files to validate`, Colors.BLUE);
    printColored("", Colors.NC);

    const results = await this.validateFiles(markdownFiles);
    this.printSummary();

    return !this.hasErrors();
  }

  /**
   * Get staged markdown files for pre-commit validation
   */
  getStagedMarkdownFiles() {
    return getStagedMarkdownFiles();
  }

  /**
   * Validate only staged files (for pre-commit hook)
   */
  async validateStaged() {
    const stagedFiles = this.getStagedMarkdownFiles();

    if (stagedFiles.length === 0) {
      printSuccess("No markdown files staged for commit");
      return true;
    }

    printColored(`🦊 Validating ${stagedFiles.length} staged markdown file(s):`, Colors.PURPLE);
    for (const file of stagedFiles) {
      printColored(`  - ${file}`, Colors.CYAN);
    }
    printColored("", Colors.NC);

    const fullPaths = stagedFiles.map(file => path.join(this.projectRoot, file));
    const results = await this.validateFiles(fullPaths);

    return !this.hasErrors();
  }
}

// CLI interface
async function main() {
  const args = parseCommonArgs();

  if (args.help) {
    showHelp(
      "Reynard Markdown Link Validator",
      "Validates all markdown links in the project, including internal links, external URLs, and anchor references.",
      {
        examples: ["node validate-markdown-links.js --staged", "node validate-markdown-links.js --all"],
        notes: [
          "This script validates internal document links, external URLs, anchor links, and image references.",
          "It provides detailed error messages and suggestions for fixing broken links.",
        ],
      }
    );
  }

  const validator = new MarkdownLinkValidator();

  try {
    if (args.staged) {
      const success = await validator.validateStaged();
      handleExit(success, args.strict, 0);
    } else if (args.all) {
      const success = await validator.validateAll();
      handleExit(success, args.strict, 0);
    } else {
      // Default: validate staged files
      const success = await validator.validateStaged();
      handleExit(success, args.strict, 0);
    }
  } catch (error) {
    printError(`Validation failed: ${error.message}`);
    handleExit(false, args.strict, 0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(await main());
}

export { FileValidationResult, LinkValidationResult, MarkdownLinkValidator };
