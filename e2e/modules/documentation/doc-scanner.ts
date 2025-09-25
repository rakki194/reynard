/**
 * Documentation Scanner for E2E Testing
 *
 * Main entry point for documentation scanning functionality.
 * Combines core scanning with pattern-based discovery.
 */

import { DocumentationScannerPatterns } from "./doc-scanner-patterns.js";

/**
 * Main Documentation Scanner Class
 */
export class DocumentationScanner extends DocumentationScannerPatterns {
  constructor(projectRoot: string) {
    super(projectRoot);
  }
}

// Re-export types for convenience
export type { ICodeExample, ValidationRule } from "./doc-scanner-core.js";
