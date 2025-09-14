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

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for terminal output (matching Reynard style)
const Colors = {
  RED: "\u001b[0;31m",
  GREEN: "\u001b[0;32m",
  YELLOW: "\u001b[1;33m",
  BLUE: "\u001b[0;34m",
  PURPLE: "\u001b[0;35m",
  CYAN: "\u001b[0;36m",
  WHITE: "\u001b[1;37m",
  NC: "\u001b[0m", // No Color
};

function printColored(message, color = Colors.NC) {
  console.log(`${color}${message}${Colors.NC}`);
}

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

  // Directories to exclude from scanning
  excludeDirectories: [
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
 * Link validation result
 */
class LinkValidationResult {
  constructor(file, line, column, link, type, status, message, suggestion = null) {
    this.file = file;
    this.line = line;
    this.column = column;
    this.link = link;
    this.type = type; // 'internal', 'external', 'anchor', 'image'
    this.status = status; // 'valid', 'broken', 'warning', 'error'
    this.message = message;
    this.suggestion = suggestion;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * File validation result
 */
class FileValidationResult {
  constructor(file) {
    this.file = file;
    this.links = [];
    this.errors = [];
    this.warnings = [];
    this.valid = true;
  }

  addLink(linkResult) {
    this.links.push(linkResult);

    if (linkResult.status === "error" || linkResult.status === "broken") {
      this.errors.push(linkResult);
      this.valid = false;
    } else if (linkResult.status === "warning") {
      this.warnings.push(linkResult);
    }
  }
}

/**
 * Main validation class
 */
class MarkdownLinkValidator {
  constructor() {
    this.projectRoot = this.findProjectRoot();
    this.markdownFiles = new Map(); // file path -> content
    this.anchorCache = new Map(); // file path -> Set of anchors
    this.results = [];
    this.stats = {
      totalFiles: 0,
      totalLinks: 0,
      validLinks: 0,
      brokenLinks: 0,
      warnings: 0,
      errors: 0,
    };
  }

  /**
   * Find the project root directory
   */
  findProjectRoot() {
    let currentDir = path.dirname(__filename);

    while (currentDir !== path.dirname(currentDir)) {
      if (fs.existsSync(path.join(currentDir, "package.json"))) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }

    return process.cwd();
  }

  /**
   * Check if a directory should be excluded
   */
  shouldExcludeDirectory(dirPath) {
    const relativePath = path.relative(this.projectRoot, dirPath);

    return Config.excludeDirectories.some(
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

    try {
      const content = fs.readFileSync(filePath, "utf8");
      this.markdownFiles.set(filePath, content);
      return content;
    } catch (error) {
      printColored(`❌ Error reading file ${filePath}: ${error.message}`, Colors.RED);
      return null;
    }
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
   * Validate all markdown files
   */
  async validateAll() {
    printColored("🦊 Reynard Markdown Link Validator", Colors.PURPLE);
    printColored("=".repeat(50), Colors.CYAN);

    const markdownFiles = this.findMarkdownFiles();
    this.stats.totalFiles = markdownFiles.length;

    if (markdownFiles.length === 0) {
      printColored("✅ No markdown files found to validate", Colors.GREEN);
      return true;
    }

    printColored(`📁 Found ${markdownFiles.length} markdown files to validate`, Colors.BLUE);
    printColored("", Colors.NC);

    let allValid = true;

    for (const filePath of markdownFiles) {
      const relativePath = path.relative(this.projectRoot, filePath);
      printColored(`🔍 Validating: ${relativePath}`, Colors.CYAN);

      const fileResult = new FileValidationResult(filePath);
      const content = this.loadMarkdownFile(filePath);

      if (!content) {
        continue;
      }

      const links = this.extractLinks(content, filePath);
      this.stats.totalLinks += links.length;

      if (links.length === 0) {
        printColored(`  ✅ No links found`, Colors.GREEN);
        continue;
      }

      printColored(`  📎 Found ${links.length} links`, Colors.BLUE);

      // Validate each link
      for (const link of links) {
        const linkResult = await this.validateLink(link, filePath, fileResult);
        fileResult.addLink(linkResult);

        // Update stats
        if (linkResult.status === "valid") {
          this.stats.validLinks++;
        } else if (linkResult.status === "broken" || linkResult.status === "error") {
          this.stats.brokenLinks++;
        } else if (linkResult.status === "warning") {
          this.stats.warnings++;
        }
      }

      // Report results for this file
      if (fileResult.valid) {
        printColored(`  ✅ All links valid`, Colors.GREEN);
      } else {
        allValid = false;
        printColored(`  ❌ ${fileResult.errors.length} broken links found`, Colors.RED);

        for (const error of fileResult.errors) {
          printColored(`    Line ${error.line}: ${error.message}`, Colors.RED);
          if (error.suggestion) {
            printColored(`    💡 ${error.suggestion}`, Colors.YELLOW);
          }
        }
      }

      if (fileResult.warnings.length > 0) {
        printColored(`  ⚠️  ${fileResult.warnings.length} warnings`, Colors.YELLOW);

        for (const warning of fileResult.warnings) {
          printColored(`    Line ${warning.line}: ${warning.message}`, Colors.YELLOW);
          if (warning.suggestion) {
            printColored(`    💡 ${warning.suggestion}`, Colors.YELLOW);
          }
        }
      }

      this.results.push(fileResult);
    }

    // Print summary
    this.printSummary();

    return allValid;
  }

  /**
   * Print validation summary
   */
  printSummary() {
    printColored("", Colors.NC);
    printColored("📊 Validation Summary", Colors.PURPLE);
    printColored("=".repeat(30), Colors.CYAN);
    printColored(`📁 Files scanned: ${this.stats.totalFiles}`, Colors.BLUE);
    printColored(`📎 Total links: ${this.stats.totalLinks}`, Colors.BLUE);
    printColored(`✅ Valid links: ${this.stats.validLinks}`, Colors.GREEN);
    printColored(`❌ Broken links: ${this.stats.brokenLinks}`, Colors.RED);
    printColored(`⚠️  Warnings: ${this.stats.warnings}`, Colors.YELLOW);

    if (this.stats.brokenLinks > 0) {
      printColored("", Colors.NC);
      printColored("💡 Tips for fixing broken links:", Colors.YELLOW);
      printColored("  - Check file paths and ensure files exist", Colors.YELLOW);
      printColored("  - Verify anchor names match heading text", Colors.YELLOW);
      printColored("  - Use relative paths for internal links", Colors.YELLOW);
      printColored("  - Test external URLs in a browser", Colors.YELLOW);
      printColored(
        '  - Run "node scripts/validation/markdown/validate-markdown-links.js --fix" to auto-fix some issues',
        Colors.YELLOW
      );
    }
  }

  /**
   * Get staged markdown files for pre-commit validation
   */
  getStagedMarkdownFiles() {
    try {
      const stagedFiles = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf8" });
      const allFiles = stagedFiles
        .trim()
        .split("\n")
        .filter(f => f);

      return allFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return Config.markdownExtensions.includes(ext);
      });
    } catch (error) {
      printColored(`❌ Failed to get staged files: ${error.message}`, Colors.RED);
      return [];
    }
  }

  /**
   * Validate only staged files (for pre-commit hook)
   */
  async validateStaged() {
    const stagedFiles = this.getStagedMarkdownFiles();

    if (stagedFiles.length === 0) {
      printColored("✅ No markdown files staged for commit", Colors.GREEN);
      return true;
    }

    printColored(`🦊 Validating ${stagedFiles.length} staged markdown file(s):`, Colors.PURPLE);
    for (const file of stagedFiles) {
      printColored(`  - ${file}`, Colors.CYAN);
    }
    printColored("", Colors.NC);

    let allValid = true;

    for (const file of stagedFiles) {
      const fullPath = path.join(this.projectRoot, file);

      if (!fs.existsSync(fullPath)) {
        printColored(`❌ Staged file not found: ${file}`, Colors.RED);
        allValid = false;
        continue;
      }

      const fileResult = new FileValidationResult(fullPath);
      const content = this.loadMarkdownFile(fullPath);

      if (!content) {
        allValid = false;
        continue;
      }

      const links = this.extractLinks(content, fullPath);

      for (const link of links) {
        const linkResult = await this.validateLink(link, fullPath, fileResult);
        fileResult.addLink(linkResult);
      }

      if (!fileResult.valid) {
        allValid = false;
        printColored(`❌ ${file}: ${fileResult.errors.length} broken links found`, Colors.RED);

        for (const error of fileResult.errors) {
          printColored(`   Line ${error.line}: ${error.message}`, Colors.RED);
          if (error.suggestion) {
            printColored(`   💡 ${error.suggestion}`, Colors.YELLOW);
          }
        }
      } else {
        printColored(`✅ ${file}: All links valid`, Colors.GREEN);
      }
    }

    return allValid;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printColored("🦊 Reynard Markdown Link Validator", Colors.WHITE);
    printColored("=".repeat(50), Colors.CYAN);
    printColored("Usage:", Colors.BLUE);
    printColored("  node validate-markdown-links.js [options]", Colors.CYAN);
    printColored("", Colors.NC);
    printColored("Options:", Colors.BLUE);
    printColored("  --staged     Validate only staged files (for pre-commit)", Colors.CYAN);
    printColored("  --all        Validate all markdown files in project", Colors.CYAN);
    printColored("  --help, -h   Show this help message", Colors.CYAN);
    printColored("", Colors.NC);
    printColored("Examples:", Colors.BLUE);
    printColored("  node validate-markdown-links.js --staged", Colors.CYAN);
    printColored("  node validate-markdown-links.js --all", Colors.CYAN);
    return 0;
  }

  const validator = new MarkdownLinkValidator();

  try {
    if (args.includes("--staged")) {
      const success = await validator.validateStaged();
      return success ? 0 : 1;
    } else if (args.includes("--all")) {
      const success = await validator.validateAll();
      return success ? 0 : 1;
    } else {
      // Default: validate staged files
      const success = await validator.validateStaged();
      return success ? 0 : 1;
    }
  } catch (error) {
    printColored(`❌ Validation failed: ${error.message}`, Colors.RED);
    return 1;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(await main());
}

export { FileValidationResult, LinkValidationResult, MarkdownLinkValidator };
