#!/usr/bin/env node

/**
 * 🦊 Test Script for Race Condition Prevention
 *
 * This script tests the race condition prevention mechanisms.
 */

import { execSync } from "child_process";
import fs from "fs";

// Create a test markdown file with long lines and no ToC
const testContent = `# Test Race Condition

This is a very long sentence that should definitely be broken up by the sentence length validator because it exceeds the maximum line length limit of 120 characters and needs to be properly formatted for better readability and compliance with the project standards.

## Long Sentence Test

This is an extremely long sentence that contains many words and should be automatically broken up by the validation tools to ensure that all markdown files in the project maintain consistent formatting and readability standards throughout the entire codebase.

## Another Long Section

Here is another very long sentence that should be automatically broken up by the validation tools to ensure that all markdown files in the project maintain consistent formatting and readability standards throughout the entire codebase.

## Final Section

This is the final section with another very long sentence that should be broken up by the validation tools to ensure proper formatting and readability throughout the document and maintain consistency with the project's documentation standards.
`;

const testFilePath = "scripts/testing/test-race-condition.md";

console.log("🦊 Creating test markdown file for race condition testing...");
fs.writeFileSync(testFilePath, testContent, "utf8");
console.log(`✅ Created test file: ${testFilePath}`);

console.log("\n🦊 Testing race condition prevention...");

try {
  // Simulate multiple rapid saves by running validation multiple times quickly
  console.log("\n📚 Running multiple rapid validations to test race condition prevention...");

  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            console.log(`🔄 Running validation ${i + 1}/5...`);
            execSync(`node scripts/dev/queue-validation-runner.js "${testFilePath}"`, {
              stdio: "pipe",
              cwd: process.cwd(),
            });
            resolve(`Validation ${i + 1} completed`);
          } catch (error) {
            reject(`Validation ${i + 1} failed: ${error.message}`);
          }
        }, i * 100); // Stagger the starts
      })
    );
  }

  const results = await Promise.allSettled(promises);

  console.log("\n📊 Race condition test results:");
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(`✅ ${result.value}`);
    } else {
      console.log(`❌ ${result.reason}`);
    }
  });

  console.log("\n📄 Final content after race condition test:");
  console.log("=".repeat(50));
  const finalContent = fs.readFileSync(testFilePath, "utf8");
  console.log(finalContent);
  console.log("=".repeat(50));

  // Check if the file is properly formatted
  const lines = finalContent.split("\n");
  const hasToC = lines.some(line => line.includes("## Table of Contents"));
  const hasLongLines = lines.some(line => line.length > 120 && !line.startsWith("```") && !line.startsWith("|"));

  console.log("\n🔍 Validation Results:");
  console.log(`📚 Table of Contents: ${hasToC ? "✅ Added" : "❌ Missing"}`);
  console.log(`📝 Long Lines: ${hasLongLines ? "❌ Still present" : "✅ Fixed"}`);

  if (hasToC && !hasLongLines) {
    console.log("\n🎉 Race condition prevention test PASSED!");
  } else {
    console.log("\n⚠️  Race condition prevention test FAILED!");
  }
} catch (error) {
  console.error("❌ Race condition test failed:", error.message);
} finally {
  // Clean up test file
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
    console.log(`\n🧹 Cleaned up test file: ${testFilePath}`);
  }
}
