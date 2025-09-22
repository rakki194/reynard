/**
 * Junk Fix Handler
 *
 * Handles the fix option for junk file detection, generating git commands
 * to remove tracked junk files and providing guidance for .gitignore updates.
 */

import { JunkFileAnalysis } from "../JunkFileDetector";

/**
 * Handle fix option - generate git commands to remove files
 */
export async function handleFixOption(analysis: JunkFileAnalysis, _projectRoot: string): Promise<void> {
  console.log("\n🔧 Fix Commands:");
  console.log("=".repeat(40));

  const criticalFiles = analysis.files.filter(f => f.severity === "critical");
  const highFiles = analysis.files.filter(f => f.severity === "high");

  if (criticalFiles.length > 0) {
    displayCriticalFiles(criticalFiles);
  }

  if (highFiles.length > 0) {
    displayHighPriorityFiles(highFiles);
  }

  displayGitignoreGuidance();
}

/**
 * Display critical files removal commands
 */
function displayCriticalFiles(criticalFiles: any[]): void {
  console.log("\n🔴 Critical files (recommended to remove immediately):");
  criticalFiles.forEach(file => {
    console.log(`   git rm --cached "${file.file}"`);
  });
}

/**
 * Display high priority files removal commands
 */
function displayHighPriorityFiles(highFiles: any[]): void {
  console.log("\n🟠 High-priority files (recommended to remove):");
  highFiles.forEach(file => {
    console.log(`   git rm --cached "${file.file}"`);
  });
}

/**
 * Display .gitignore update guidance
 */
function displayGitignoreGuidance(): void {
  console.log("\n💡 After removing files, update .gitignore to prevent future tracking:");
  console.log("   # Add appropriate patterns to .gitignore");
  console.log("   git add .gitignore");
  console.log("   git commit -m 'Remove junk files and update .gitignore'");
}
