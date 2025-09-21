/**
 * Test utilities for ADR System tests
 */

import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export interface TestEnvironment {
  rootPath: string;
  adrDirectory: string;
  templateDirectory: string;
  cleanup: () => Promise<void>;
}

/**
 * Create a temporary test environment with directories and files
 */
export async function createTestEnvironment(): Promise<TestEnvironment> {
  // Add a small delay to ensure unique timestamps
  await new Promise(resolve => setTimeout(resolve, 1));
  const rootPath = join(tmpdir(), `adr-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const adrDirectory = join(rootPath, "docs", "architecture", "decisions");
  const templateDirectory = join(rootPath, "templates");

  // Create directories with error handling
  try {
    await mkdir(rootPath, { recursive: true });
    await mkdir(adrDirectory, { recursive: true });
    await mkdir(templateDirectory, { recursive: true });
  } catch (error) {
    console.error(`Failed to create test environment at ${rootPath}:`, error);
    throw error;
  }

  const cleanup = async () => {
    try {
      await rm(rootPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  };

  return { rootPath, adrDirectory, templateDirectory, cleanup };
}

/**
 * Create sample source files for testing
 */
export async function createSampleSourceFiles(rootPath: string): Promise<void> {
  // Ensure root path exists first
  await mkdir(rootPath, { recursive: true });
  const srcDir = join(rootPath, "src");
  await mkdir(srcDir, { recursive: true });

  // Create sample TypeScript files
  await writeFile(
    join(srcDir, "index.ts"),
    `/**
 * Main entry point
 */
export { CodebaseAnalyzer } from "./CodebaseAnalyzer";
export { ADRGenerator } from "./ADRGenerator";
`
  );

  await writeFile(
    join(srcDir, "CodebaseAnalyzer.ts"),
    `import { readFile } from "fs/promises";

export class CodebaseAnalyzer {
  constructor(private rootPath: string) {}

  async analyzeCodebase() {
    // Implementation here
  }
}
`
  );

  await writeFile(
    join(srcDir, "ADRGenerator.ts"),
    `import { writeFile } from "fs/promises";

export class ADRGenerator {
  constructor(private adrDirectory: string) {}

  async generateADR() {
    // Implementation here
  }
}
`
  );

  // Create test files
  const testDir = join(srcDir, "__tests__");
  await mkdir(testDir, { recursive: true });

  await writeFile(
    join(testDir, "CodebaseAnalyzer.test.ts"),
    `import { describe, it, expect } from "vitest";

describe("CodebaseAnalyzer", () => {
  it("should work", () => {
    expect(true).toBe(true);
  });
});
`
  );

  // Create package.json
  await writeFile(
    join(rootPath, "package.json"),
    JSON.stringify({
      name: "test-project",
      version: "1.0.0",
      dependencies: {
        typescript: "5.9.2",
        "fs-extra": "11.3.1",
      },
    }, null, 2)
  );

  // Create tsconfig.json
  await writeFile(
    join(rootPath, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
      },
    }, null, 2)
  );
}

/**
 * Create sample ADR files for testing
 */
export async function createSampleADRFiles(adrDirectory: string): Promise<void> {
  // Ensure all parent directories exist
  await mkdir(adrDirectory, { recursive: true });
  
  await writeFile(
    join(adrDirectory, "001-sample-adr.md"),
    `# ADR-001: Sample Architecture Decision

## Status

**Accepted** - 2024-01-01

## Context

This is a sample ADR for testing purposes.

## Decision

We will use TypeScript for our project.

## Consequences

### Positive

- Better type safety
- Improved developer experience

### Negative

- Additional build step required
- Learning curve for team

### Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Type complexity | Medium | Low | Provide training and documentation |

## Implementation Plan

### Phase 1: Setup (Weeks 1-2)

- [ ] Install TypeScript
- [ ] Configure build process
- [ ] Set up linting

## Metrics and Monitoring

### Key Performance Indicators

- Build time
- Type coverage percentage

## Review and Updates

This ADR will be reviewed:

- **Monthly**: Architecture review
- **On Changes**: When TypeScript version changes

## References

- [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Decision Makers**: Architecture Team
**Stakeholders**: Development Team
**Review Date**: 2024-02-01
**Priority**: HIGH
**Category**: PERFORMANCE
`
  );

  await writeFile(
    join(adrDirectory, "002-another-adr.md"),
    `# ADR-002: Another Sample Decision

## Status

**Proposed** - 2024-01-15

## Context

This ADR depends on ADR-001.

## Decision

[To be filled by architecture team]

## Consequences

### Positive

[To be filled by architecture team]

### Negative

[To be filled by architecture team]

## References

- [ADR-001](./001-sample-adr.md)

---

**Decision Makers**: Architecture Team
**Stakeholders**: Development Team
**Review Date**: [Next Review Date]
**Priority**: MEDIUM
**Category**: INTEGRATION
`
  );
}

/**
 * Create sample template files
 */
export async function createSampleTemplates(templateDirectory: string): Promise<void> {
  await writeFile(
    join(templateDirectory, "security.md"),
    `# Security ADR Template

## Security Requirements
[Define security requirements]

## Threat Model
[Describe threat model]

## Security Controls
[List security controls]

## Implementation Details
[Implementation specifics]

## Security Testing
[Testing approach]

## Monitoring and Incident Response
[Monitoring and response procedures]
`
  );

  await writeFile(
    join(templateDirectory, "performance.md"),
    `# Performance ADR Template

## Performance Requirements
[Define performance requirements]

## Current Performance Baseline
[Current performance metrics]

## Performance Strategy
[Performance optimization strategy]

## Implementation Details
[Implementation specifics]

## Performance Testing
[Testing approach]

## Monitoring and Alerting
[Monitoring setup]
`
  );
}

/**
 * Mock file system operations for testing
 */
export class MockFileSystem {
  private files: Map<string, string> = new Map();
  private directories: Set<string> = new Set();

  constructor() {
    this.directories.add("/");
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (content === undefined) {
      throw new Error(`File not found: ${path}`);
    }
    return content;
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
    // Ensure parent directory exists
    const parentDir = path.substring(0, path.lastIndexOf("/"));
    if (parentDir) {
      this.directories.add(parentDir);
    }
  }

  async readdir(path: string): Promise<string[]> {
    const files: string[] = [];
    for (const filePath of this.files.keys()) {
      if (filePath.startsWith(path + "/") && !filePath.substring(path.length + 1).includes("/")) {
        files.push(filePath.substring(path.length + 1));
      }
    }
    return files;
  }

  async stat(path: string): Promise<{ isFile: () => boolean; isDirectory: () => boolean }> {
    if (this.files.has(path)) {
      return { isFile: () => true, isDirectory: () => false };
    }
    if (this.directories.has(path)) {
      return { isFile: () => false, isDirectory: () => true };
    }
    throw new Error(`Path not found: ${path}`);
  }

  reset(): void {
    this.files.clear();
    this.directories.clear();
    this.directories.add("/");
  }
}

/**
 * Create a temporary test environment with directories but no sample files
 */
export async function createEmptyTestEnvironment(): Promise<TestEnvironment> {
  // Add a small delay to ensure unique timestamps
  await new Promise(resolve => setTimeout(resolve, 1));
  const rootPath = join(tmpdir(), `adr-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const adrDirectory = join(rootPath, "docs", "architecture", "decisions");
  const templateDirectory = join(rootPath, "templates");

  // Create directories
  await mkdir(rootPath, { recursive: true });
  await mkdir(adrDirectory, { recursive: true });
  await mkdir(templateDirectory, { recursive: true });

  const cleanup = async () => {
    try {
      await rm(rootPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  };

  return {
    rootPath,
    adrDirectory,
    templateDirectory,
    cleanup
  };
}
