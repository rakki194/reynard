import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";

describe("CLI", () => {
  const testDir = join(process.cwd(), ".test-temp-cli");
  const testFile = join(testDir, "test.md");

  beforeEach(() => {
    // Create test directory
    if (!existsSync(testDir)) {
      execSync(`mkdir -p ${testDir}`);
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      execSync(`rm -rf ${testDir}`);
    }
  });

  it("should show help when no arguments provided", () => {
    try {
      execSync("node dist/cli.js", { cwd: process.cwd() });
    } catch (error: any) {
      expect(error.stdout?.toString()).toContain("Usage:");
    }
  });

  it("should show help with --help flag", () => {
    try {
      const output = execSync("node dist/cli.js --help", { cwd: process.cwd() });
      expect(output.toString()).toContain("Usage:");
    } catch (error: any) {
      expect(error.stdout?.toString()).toContain("Usage:");
    }
  });

  it("should validate ToC for a valid file", () => {
    const content = `# Test

## Table of Contents

- [Section 1](#section-1)

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const output = execSync(`node dist/cli.js toc "${testFile}"`, { cwd: process.cwd() });
    expect(output.toString()).toContain("✅ ToC validation passed");
  });

  it("should detect ToC conflicts", () => {
    const content = `# Test

## Table of Contents

- [Section 1](#section-1)

## Table of Contents

- [Section 2](#section-2)

## Section 1

Content here.

## Section 2

More content.`;

    writeFileSync(testFile, content);

    try {
      execSync(`node dist/cli.js toc "${testFile}"`, { cwd: process.cwd() });
    } catch (error: any) {
      expect(error.stdout?.toString()).toContain("❌ ToC validation failed");
    }
  });

  it("should fix ToC conflicts with --fix flag", () => {
    const content = `# Test

## Table of Contents

- [Section 1](#section-1)

## Table of Contents

- [Section 2](#section-2)

## Section 1

Content here.

## Section 2

More content.`;

    writeFileSync(testFile, content);

    const output = execSync(`node dist/cli.js toc --fix "${testFile}"`, { cwd: process.cwd() });
    expect(output.toString()).toContain("🔧 Fixes applied");

    const fixedContent = execSync(`cat "${testFile}"`, { encoding: "utf8" });
    expect(fixedContent).not.toContain("## Table of Contents\n\n- [Section 2](#section-2)");
  });

  it("should validate links", () => {
    const content = `# Test

[Link to section](#section-1)
[External link](https://example.com)

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const output = execSync(`node dist/cli.js links "${testFile}"`, { cwd: process.cwd() });
    expect(output.toString()).toContain("✅ Link validation passed");
  });

  it("should validate sentence length", () => {
    const content = `# Test

This is a short sentence.

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const output = execSync(`node dist/cli.js sentence-length "${testFile}"`, { cwd: process.cwd() });
    expect(output.toString()).toContain("✅ Sentence length validation passed");
  });

  it("should detect long sentences", () => {
    const content = `# Test

This is a very long sentence that exceeds the maximum length and should be detected as problematic because it goes on and on without proper breaks.

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    try {
      execSync(`node dist/cli.js sentence-length "${testFile}" --max-length 50`, { cwd: process.cwd() });
    } catch (error: any) {
      expect(error.stdout?.toString()).toContain("❌ Sentence length validation failed");
    }
  });

  it("should fix long sentences with --fix flag", () => {
    const content = `# Test

This is a very long sentence that exceeds the maximum length and should be automatically fixed by the sentence length validator when using the fix flag.

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const output = execSync(`node dist/cli.js sentence-length --fix "${testFile}" --max-length 50`, {
      cwd: process.cwd(),
    });
    expect(output.toString()).toContain("🔧 Fixes applied");

    const fixedContent = execSync(`cat "${testFile}"`, { encoding: "utf8" });
    expect(fixedContent).not.toContain(
      "This is a very long sentence that exceeds the maximum length and should be automatically fixed by the sentence length validator when using the fix flag."
    );
  });

  it("should run test-conflict command", () => {
    const output = execSync("node dist/cli.js test-conflict", { cwd: process.cwd() });
    expect(output.toString()).toContain("🦊 Running ToC conflict detection test");
  });

  it("should handle file not found error", () => {
    try {
      execSync('node dist/cli.js toc "nonexistent.md"', { cwd: process.cwd() });
    } catch (error: any) {
      expect(error.stdout?.toString()).toContain("❌ File not found");
    }
  });

  it("should handle invalid command", () => {
    try {
      execSync("node dist/cli.js invalid-command", { cwd: process.cwd() });
    } catch (error: any) {
      expect(error.stdout?.toString()).toContain("❌ Unknown command");
    }
  });

  it("should handle verbose output", () => {
    const content = `# Test

## Table of Contents

- [Section 1](#section-1)

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const output = execSync(`node dist/cli.js toc --verbose "${testFile}"`, { cwd: process.cwd() });
    expect(output.toString()).toContain("✅ ToC validation passed");
  });

  it("should handle links with no-external flag", () => {
    const content = `# Test

[Link to section](#section-1)
[External link](https://example.com)

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const output = execSync(`node dist/cli.js links --no-external "${testFile}"`, { cwd: process.cwd() });
    expect(output.toString()).toContain("✅ Link validation passed");
  });

  it("should handle links with no-internal flag", () => {
    const content = `# Test

[Link to section](#section-1)
[External link](https://example.com)

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const output = execSync(`node dist/cli.js links --no-internal "${testFile}"`, { cwd: process.cwd() });
    expect(output.toString()).toContain("✅ Link validation passed");
  });

  it("should handle sentence length with custom max-length", () => {
    const content = `# Test

Short sentence.

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const output = execSync(`node dist/cli.js sentence-length "${testFile}" --max-length 20`, { cwd: process.cwd() });
    expect(output.toString()).toContain("✅ Sentence length validation passed");
  });

  it("should handle sentence length with verbose output", () => {
    const content = `# Test

This is a short sentence.

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const output = execSync(`node dist/cli.js sentence-length --verbose "${testFile}"`, { cwd: process.cwd() });
    expect(output.toString()).toContain("✅ Sentence length validation passed");
  });

  it("should handle ToC with verbose output", () => {
    const content = `# Test

## Table of Contents

- [Section 1](#section-1)

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const output = execSync(`node dist/cli.js toc --verbose "${testFile}"`, { cwd: process.cwd() });
    expect(output.toString()).toContain("✅ ToC validation passed");
  });

  it("should handle ToC with strict mode", () => {
    const content = `# Test

## Table of Contents

- [Section 1](#section-1)

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const output = execSync(`node dist/cli.js toc "${testFile}"`, { cwd: process.cwd() });
    expect(output.toString()).toContain("✅ ToC validation passed");
  });
});
