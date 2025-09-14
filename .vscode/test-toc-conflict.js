#!/usr/bin/env node

/**
 * 🦊 Test Script for ToC Conflict Detection
 *
 * This script tests to see if multiple ToC validators are running.
 */

import { execSync } from "child_process";
import fs from "fs";

// Create a test markdown file with a specific ToC that we can track
const testContent = `# Test ToC Conflict

## Section 1

Some content here.

## Section 2

More content here.

## Section 3

Final content here.
`;

const testFilePath = ".vscode/test-toc-conflict.md";

console.log("🦊 Creating test markdown file for ToC conflict detection...");
fs.writeFileSync(testFilePath, testContent, "utf8");
console.log(`✅ Created test file: ${testFilePath}`);

console.log("\n🦊 Testing ToC conflict detection...");

try {
  // Run our custom ToC validator
  console.log("\n📚 Running our custom ToC validator...");
  execSync(`node scripts/validation/markdown/validate-markdown-toc.js --fix "${testFilePath}"`, {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  // Read the file after our validator
  const contentAfterOurValidator = fs.readFileSync(testFilePath, "utf8");
  console.log("\n📄 Content after our ToC validator:");
  console.log("=".repeat(50));
  console.log(contentAfterOurValidator);
  console.log("=".repeat(50));

  // Count ToC sections
  const tocMatches = contentAfterOurValidator.match(/## Table of Contents/g);
  const tocCount = tocMatches ? tocMatches.length : 0;

  console.log(`\n🔍 ToC Analysis:`);
  console.log(`📚 Number of "## Table of Contents" sections: ${tocCount}`);

  if (tocCount === 1) {
    console.log("✅ Only one ToC section found - no conflict detected!");
  } else if (tocCount > 1) {
    console.log("❌ Multiple ToC sections found - conflict detected!");
    console.log("🔧 This suggests multiple ToC validators are running");
  } else {
    console.log("⚠️  No ToC section found - our validator may not be working");
  }

  // Check for duplicate ToC entries
  const tocLines = contentAfterOurValidator
    .split("\n")
    .filter(line => line.trim().startsWith("- [") && line.includes("](#"));

  console.log(`📝 Number of ToC entries: ${tocLines.length}`);

  // Check for duplicates
  const uniqueEntries = new Set(tocLines);
  if (tocLines.length !== uniqueEntries.size) {
    console.log("❌ Duplicate ToC entries found - conflict detected!");
  } else {
    console.log("✅ No duplicate ToC entries found");
  }

  // Show ToC entries
  if (tocLines.length > 0) {
    console.log("\n📋 ToC Entries:");
    tocLines.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.trim()}`);
    });
  }
} catch (error) {
  console.error("❌ ToC conflict test failed:", error.message);
} finally {
  // Clean up test file
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
    console.log(`\n🧹 Cleaned up test file: ${testFilePath}`);
  }
}
