#!/usr/bin/env node

/**
 * 🦊 Test Script for Save Simulation
 *
 * This script simulates the actual save process to detect ToC conflicts.
 */

import { execSync } from "child_process";
import fs from "fs";

// Create a test markdown file with long lines
const testContent = `# Test Save Simulation

## Section 1

This is a very long sentence that should definitely be broken up by the sentence length validator because it exceeds the maximum line length limit of 120 characters and needs to be properly formatted for better readability and compliance with the project standards.

## Section 2

Here is another extremely long sentence that contains many words and should be automatically broken up by the validation tools to ensure that all markdown files in the project maintain consistent formatting and readability standards throughout the entire codebase.

## Section 3

This is the final section with another very long sentence that should be broken up by the validation tools to ensure proper formatting and readability throughout the document and maintain consistency with the project's documentation standards.
`;

const testFilePath = "scripts/testing/test-save-simulation.md";

console.log("🦊 Creating test markdown file for save simulation...");
fs.writeFileSync(testFilePath, testContent, "utf8");
console.log(`✅ Created test file: ${testFilePath}`);

console.log("\n🦊 Simulating save process...");

try {
  // Step 1: Run our custom validation (simulating what happens on save)
  console.log("\n📝 Step 1: Running our custom sentence length validator...");
  execSync(`node scripts/validation/markdown/validate-sentence-length.js --fix "${testFilePath}"`, {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  // Step 2: Simulate Prettier formatting (VSCode runs this on save)
  console.log("\n🎨 Step 2: Running Prettier formatting...");
  try {
    execSync(`npx prettier --write "${testFilePath}"`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (prettierError) {
    console.log("⚠️  Prettier not available or failed, continuing...");
  }

  // Step 3: Check for conflicts
  const finalContent = fs.readFileSync(testFilePath, "utf8");
  console.log("\n📄 Final content after save simulation:");
  console.log("=".repeat(50));
  console.log(finalContent);
  console.log("=".repeat(50));

  // Analyze the results
  const tocMatches = finalContent.match(/## Table of Contents/g);
  const tocCount = tocMatches ? tocMatches.length : 0;

  console.log(`\n🔍 Save Simulation Analysis:`);
  console.log(`📚 Number of "## Table of Contents" sections: ${tocCount}`);

  if (tocCount === 1) {
    console.log("✅ Only one ToC section found - no conflict detected!");
  } else if (tocCount > 1) {
    console.log("❌ Multiple ToC sections found - conflict detected!");
    console.log("🔧 This suggests multiple ToC validators are running on save");
  } else {
    console.log("⚠️  No ToC section found - our validator may not be working");
  }

  // Check for duplicate ToC entries
  const tocLines = finalContent.split("\n").filter(line => line.trim().startsWith("- [") && line.includes("](#"));

  console.log(`📝 Number of ToC entries: ${tocLines.length}`);

  // Check for duplicates
  const uniqueEntries = new Set(tocLines);
  if (tocLines.length !== uniqueEntries.size) {
    console.log("❌ Duplicate ToC entries found - conflict detected!");
    console.log("🔧 This suggests multiple ToC validators are running");
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

  // Check if the ToC is in the right place (after first H2)
  const lines = finalContent.split("\n");
  const firstH2Index = lines.findIndex(line => line.trim().startsWith("## ") && !line.includes("Table of Contents"));
  const tocIndex = lines.findIndex(line => line.trim() === "## Table of Contents");

  if (firstH2Index !== -1 && tocIndex !== -1) {
    if (tocIndex > firstH2Index) {
      console.log("✅ ToC is correctly placed after first H2");
    } else {
      console.log("❌ ToC is not correctly placed after first H2");
    }
  }
} catch (error) {
  console.error("❌ Save simulation test failed:", error.message);
} finally {
  // Clean up test file
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
    console.log(`\n🧹 Cleaned up test file: ${testFilePath}`);
  }
}
