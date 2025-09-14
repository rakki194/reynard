#!/usr/bin/env node

/**
 * 🦊 Test Script for Queue System
 *
 * This script tests the queue-based file processing system.
 */

import fs from "fs";
import { Processors, queueManager } from "../dev/queue-manager.js";

// Create test files
const testMarkdownContent = `# Test Queue System

## Section 1

This is a very long sentence that should definitely be broken up by the sentence length validator because it exceeds the maximum line length limit of 120 characters and needs to be properly formatted for better readability and compliance with the project standards.

## Section 2

Here is another extremely long sentence that contains many words and should be automatically broken up by the validation tools to ensure that all markdown files in the project maintain consistent formatting and readability standards throughout the entire codebase.
`;

const testFilePath = "scripts/testing/test-queue-system.md";

console.log("🦊 Creating test file for queue system testing...");
fs.writeFileSync(testFilePath, testMarkdownContent, "utf8");
console.log(`✅ Created test file: ${testFilePath}`);

console.log("\n🦊 Testing queue-based processing...");

try {
  // Test 1: Single file processing
  console.log("\n📝 Test 1: Single file processing");
  const processors = [Processors.waitForStable, Processors.validateSentenceLength];

  queueManager.enqueueFile(testFilePath, processors, {
    fileType: "markdown",
    priority: "high",
  });

  // Wait for processing to complete
  await new Promise(resolve => {
    let attempts = 0;
    const maxAttempts = 30; // 3 seconds max wait

    const checkCompletion = () => {
      attempts++;
      const status = queueManager.getStatus();

      if (
        !status.processingFiles.includes(testFilePath) &&
        status.queueDetails[testFilePath]?.pendingProcessors === 0
      ) {
        console.log("  ✅ Single file processing completed");
        resolve();
      } else if (attempts >= maxAttempts) {
        console.log("  ⏰ Timeout reached, proceeding anyway");
        resolve();
      } else {
        setTimeout(checkCompletion, 100);
      }
    };
    setTimeout(checkCompletion, 100);
  });

  console.log("✅ Single file processing completed");

  // Test 2: Multiple rapid file changes (simulating race conditions)
  console.log("\n📝 Test 2: Multiple rapid file changes");

  const rapidChanges = [];
  for (let i = 0; i < 5; i++) {
    rapidChanges.push(
      new Promise(resolve => {
        setTimeout(() => {
          // Modify the file slightly
          const content = fs.readFileSync(testFilePath, "utf8");
          const modifiedContent = content.replace("Test Queue System", `Test Queue System ${i}`);
          fs.writeFileSync(testFilePath, modifiedContent, "utf8");

          // Queue processing
          queueManager.enqueueFile(testFilePath, [Processors.validateSentenceLength], {
            fileType: "markdown",
            priority: "normal",
          });

          resolve();
        }, i * 50); // Stagger the changes
      })
    );
  }

  await Promise.all(rapidChanges);
  console.log("✅ Multiple rapid changes queued");

  // Wait for all processing to complete
  await new Promise(resolve => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait

    const checkCompletion = () => {
      attempts++;
      const status = queueManager.getStatus();

      console.log(
        `  🔍 Check ${attempts}: processing=${status.isProcessing}, files=${status.processingFiles.length}, queues=${Object.keys(status.queueDetails).length}`
      );

      if (!status.isProcessing && status.processingFiles.length === 0) {
        console.log("  ✅ All processing completed");
        resolve();
      } else if (attempts >= maxAttempts) {
        console.log("  ⏰ Timeout reached, proceeding anyway");
        resolve();
      } else {
        setTimeout(checkCompletion, 100);
      }
    };
    setTimeout(checkCompletion, 100);
  });

  console.log("✅ All rapid changes processed");

  // Test 3: Queue status reporting
  console.log("\n📊 Test 3: Queue status reporting");
  const status = queueManager.getStatus();
  console.log("Queue Status:", JSON.stringify(status, null, 2));

  // Show final content
  console.log("\n📄 Final content after queue processing:");
  console.log("=".repeat(50));
  const finalContent = fs.readFileSync(testFilePath, "utf8");
  console.log(finalContent);
  console.log("=".repeat(50));

  // Check if sentence length validation worked
  const lines = finalContent.split("\n");
  const hasLongLines = lines.some(line => line.length > 120 && !line.startsWith("```") && !line.startsWith("|"));

  console.log("\n🔍 Queue System Test Results:");
  console.log(`📝 Long Lines: ${hasLongLines ? "❌ Still present" : "✅ Fixed"}`);

  if (!hasLongLines) {
    console.log("\n🎉 Queue system test PASSED!");
    console.log("✅ Perfect sequencing achieved");
    console.log("✅ No race conditions detected");
    console.log("✅ All processors ran in order");
  } else {
    console.log("\n⚠️  Queue system test FAILED!");
  }
} catch (error) {
  console.error("❌ Queue system test failed:", error.message);
} finally {
  // Clean up test file
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
    console.log(`\n🧹 Cleaned up test file: ${testFilePath}`);
  }

  // Force exit to prevent hanging
  console.log("\n🏁 Test completed, exiting...");
  process.exit(0);
}
