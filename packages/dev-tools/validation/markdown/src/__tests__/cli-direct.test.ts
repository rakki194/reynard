import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import {
  colorize,
  printColored,
  showHelp,
  handleToCCommand,
  handleLinksCommand,
  handleSentenceLengthCommand,
  handleTestConflictCommand,
} from "../cli.js";
import main from "../cli.js";

describe("CLI Direct Tests", () => {
  const testDir = join(process.cwd(), ".test-temp-direct");
  const testFile = join(testDir, "test.md");

  beforeEach(() => {
    // Create test directory
    if (!existsSync(testDir)) {
      require("child_process").execSync(`mkdir -p ${testDir}`);
    }

    // Mock console and process
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      require("child_process").execSync(`rm -rf ${testDir}`);
    }

    // Restore mocks
    vi.restoreAllMocks();
  });

  it("should test colorize function", () => {
    const result = colorize("test", "\x1b[32m");
    expect(result).toBe("\x1b[32mtest\x1b[0m");
  });

  it("should test printColored function", () => {
    const consoleSpy = vi.spyOn(console, "log");
    printColored("test message", "\x1b[32m");
    expect(consoleSpy).toHaveBeenCalledWith("\x1b[32mtest message\x1b[0m");
  });

  it("should test showHelp function", () => {
    const consoleSpy = vi.spyOn(console, "log");
    showHelp();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("should test handleToCCommand with valid file", async () => {
    const content = `# Test

## Table of Contents

- [Section 1](#section-1)

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleToCCommand([testFile]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✅ ToC validation passed"));
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("should test handleToCCommand with missing file", async () => {
    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleToCCommand([]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("❌ File path required"));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should test handleToCCommand with nonexistent file", async () => {
    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleToCCommand(["nonexistent.md"]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("❌ File not found"));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should test handleLinksCommand with valid file", async () => {
    const content = `# Test

[Link to section](#section-1)
[External link](https://example.com)

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleLinksCommand([testFile]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✅ Link validation passed"));
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("should test handleSentenceLengthCommand with valid file", async () => {
    const content = `# Test

This is a short sentence.

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleSentenceLengthCommand([testFile]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✅ Sentence length validation passed"));
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("should test handleTestConflictCommand", async () => {
    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleTestConflictCommand([]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("🦊 Running ToC conflict detection test"));
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("should test argument parsing with options", async () => {
    const content = `# Test

## Table of Contents

- [Section 1](#section-1)

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const consoleSpy = vi.spyOn(console, "log");

    // Test with --fix option
    await handleToCCommand(["--fix", testFile]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✅ ToC validation passed"));

    // Test with --verbose option
    await handleToCCommand(["--verbose", testFile]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✅ ToC validation passed"));
  });

  it("should test sentence length with custom max-length", async () => {
    const content = `# Test

Short sentence.

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const consoleSpy = vi.spyOn(console, "log");

    await handleSentenceLengthCommand([testFile, "--max-length", "20"]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✅ Sentence length validation passed"));
  });

  it("should test links with no-external option", async () => {
    const content = `# Test

[Link to section](#section-1)
[External link](https://example.com)

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const consoleSpy = vi.spyOn(console, "log");

    await handleLinksCommand(["--no-external", testFile]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✅ Link validation passed"));
  });

  it("should test links with no-internal option", async () => {
    const content = `# Test

[Link to section](#section-1)
[External link](https://example.com)

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const consoleSpy = vi.spyOn(console, "log");

    await handleLinksCommand(["--no-internal", testFile]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✅ Link validation passed"));
  });

  it("should test handleToCCommand with conflicts and fix", async () => {
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

    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleToCCommand(["--fix", testFile]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✅ ToC validation passed"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("🔧 Fixes applied"));
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("should test handleSentenceLengthCommand with long sentences and fix", async () => {
    const content = `# Test

This is a very long sentence that exceeds the maximum length and should be automatically fixed by the sentence length validator when using the fix flag.

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleSentenceLengthCommand(["--fix", testFile, "--max-length", "50"]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✅ Sentence length validation passed"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("🔧 Fixes applied"));
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("should test handleToCCommand with conflicts without fix", async () => {
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

    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleToCCommand([testFile]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("❌ ToC validation failed"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("💡 Use --fix flag"));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should test handleSentenceLengthCommand with long sentences without fix", async () => {
    const content = `# Test

This is a very long sentence that exceeds the maximum length and should be detected as problematic because it goes on and on without proper breaks.

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleSentenceLengthCommand([testFile, "--max-length", "50"]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("❌ Sentence length validation failed"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("💡 Use --fix flag"));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should test handleToCCommand with successful validation and fixes", async () => {
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

    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleToCCommand(["--fix", testFile]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✅ ToC validation passed"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("🔧 Fixes applied:"));
    expect(exitSpy).not.toHaveBeenCalledWith(1);
  });

  it("should test handleSentenceLengthCommand with successful validation and fixes", async () => {
    const content = `# Test

This is a very long sentence that exceeds the maximum length and should be detected as problematic because it goes on and on without proper breaks.

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleSentenceLengthCommand(["--fix", testFile, "--max-length", "50"]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✅ Sentence length validation passed"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("🔧 Fixes applied:"));
    expect(exitSpy).not.toHaveBeenCalledWith(1);
  });

  it("should test handleToCCommand with failed validation but no fixes available", async () => {
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

    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleToCCommand([testFile]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("❌ ToC validation failed"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("💡 Use --fix flag"));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should test handleSentenceLengthCommand with failed validation but no fixes available", async () => {
    const content = `# Test

This is a very long sentence that exceeds the maximum length and should be detected as problematic because it goes on and on without proper breaks.

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleSentenceLengthCommand([testFile, "--max-length", "50"]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("❌ Sentence length validation failed"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("💡 Use --fix flag"));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should test showHelp function", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    showHelp();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Markdown Validation Tools"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("toc"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("links"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("sentence-length"));

    consoleSpy.mockRestore();
  });

  it("should test colorize function", () => {
    const result = colorize("test", "red");
    expect(result).toContain("test");
  });

  it("should test printColored function", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    printColored("test message", "blue");

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("test message"));

    consoleSpy.mockRestore();
  });

  it("should test main function with help command", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Mock process.argv to simulate help command
    const originalArgv = process.argv;
    process.argv = ["node", "cli.js", "--help"];

    await main();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Markdown Validation Tools"));

    process.argv = originalArgv;
    consoleSpy.mockRestore();
  });

  it("should test main function with unknown command", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    // Mock process.argv to simulate unknown command
    const originalArgv = process.argv;
    process.argv = ["node", "cli.js", "unknown"];

    await expect(main()).rejects.toThrow("process.exit called");

    process.argv = originalArgv;
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("should test main function with no arguments", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Mock process.argv to simulate no arguments
    const originalArgv = process.argv;
    process.argv = ["node", "cli.js"];

    await main();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Markdown Validation Tools"));

    process.argv = originalArgv;
    consoleSpy.mockRestore();
  });

  it("should test main function with -h flag", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Mock process.argv to simulate -h flag
    const originalArgv = process.argv;
    process.argv = ["node", "cli.js", "-h"];

    await main();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Markdown Validation Tools"));

    process.argv = originalArgv;
    consoleSpy.mockRestore();
  });

  it("should test handleToCCommand with successful validation and no fixes", async () => {
    const content = `# Test

## Table of Contents

- [Section 1](#section-1)
- [Section 2](#section-2)

## Section 1

Content here.

## Section 2

More content.`;

    writeFileSync(testFile, content);

    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleToCCommand([testFile]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✅ ToC validation passed"));
    expect(exitSpy).not.toHaveBeenCalledWith(1);
  });

  it("should test handleSentenceLengthCommand with successful validation and no fixes", async () => {
    const content = `# Test

This is a short sentence.

## Section 1

Content here.`;

    writeFileSync(testFile, content);

    const consoleSpy = vi.spyOn(console, "log");
    const exitSpy = vi.spyOn(process, "exit");

    await handleSentenceLengthCommand([testFile]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✅ Sentence length validation passed"));
    expect(exitSpy).not.toHaveBeenCalledWith(1);
  });
});
