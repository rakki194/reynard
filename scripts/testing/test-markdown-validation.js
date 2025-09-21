#!/usr/bin/env node

/**
 * 🦊 Test Script for Markdown Validation
 *
 * This script tests the markdown validation tools to ensure they're working correctly.
 */

import { execSync } from "child_process";
import fs from "fs";

// Create a test markdown file with long lines
const testContent = `# Test Markdown File

This is a test markdown file with some very long lines that should be broken up by the sentence length validator to ensure proper readability and compliance with line length limits.

## Long Sentence Test

This is an extremely long sentence that contains many words and should definitely be broken up by the sentence length validator because it exceeds the maximum line length limit of 120 characters and needs to be properly formatted for better readability.

## Another Long Section

Here is another very long sentence that should be automatically broken up by the validation tools to ensure that all markdown files in the project maintain consistent formatting and readability standards.

## Code Block (Should Not Be Modified)

\`\`\`javascript
const veryLongLine = "This is a very long line inside a code block that should not be modified by the sentence length validator because it's inside a code block and should remain as is for proper code formatting";
\`\`\`

## Table (Should Not Be Modified)

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| This is a very long cell content that should not be modified | Another long cell | Final cell |

## Final Section

This is the final section with another long sentence that should be broken up by the validation tools to ensure proper formatting and readability throughout the document.
`;

const testFilePath = "scripts/testing/test-markdown.md";

console.log("🦊 Creating test markdown file...");
fs.writeFileSync(testFilePath, testContent, "utf8");
console.log(`✅ Created test file: ${testFilePath}`);

console.log("\n🦊 Testing markdown validation tools...");

try {
  console.log("\n📚 Testing Table of Contents validation...");
  execSync(`node packages/dev-tools/validation/markdown/validate-markdown-toc.js --fix "${testFilePath}"`, {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  console.log("\n📝 Testing sentence length validation...");
  execSync(`node packages/dev-tools/validation/markdown/validate-sentence-length.js --fix "${testFilePath}"`, {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  console.log("\n✅ Validation tests completed!");

  // Show the result
  console.log("\n📄 Final content:");
  console.log("=".repeat(50));
  const finalContent = fs.readFileSync(testFilePath, "utf8");
  console.log(finalContent);
  console.log("=".repeat(50));
} catch (error) {
  console.error("❌ Validation test failed:", error.message);
} finally {
  // Clean up test file
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
    console.log(`\n🧹 Cleaned up test file: ${testFilePath}`);
  }
}
