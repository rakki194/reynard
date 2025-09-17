#!/usr/bin/env node

/**
 * 🦊 Reynard Project Architecture - VS Code Integration Example
 *
 * This script demonstrates VS Code task generation using the project architecture.
 */

import {
  generateVSCodeTasksConfig,
  generateVSCodeWorkspaceConfig,
  generateQueueWatcherTask,
  generateAutoStartQueueWatcherTask,
  generateBuildTasks,
  generateTestTasks,
  generateLintTasks,
} from "./dist/index.js";

import fs from "fs";
import path from "path";

console.log("🦊 Reynard Project Architecture - VS Code Integration Example\n");

// 1. Generate complete VS Code tasks configuration
console.log("=== 1. Generating VS Code Tasks Configuration ===");
const tasksConfig = generateVSCodeTasksConfig();
console.log(`Generated ${tasksConfig.tasks.length} tasks:`);
tasksConfig.tasks.forEach(task => {
  console.log(`  - ${task.label}`);
});
console.log();

// 2. Generate workspace configuration
console.log("=== 2. Generating VS Code Workspace Configuration ===");
const workspaceConfig = generateVSCodeWorkspaceConfig();
console.log("Workspace configuration generated with:");
console.log(`  - Folders: ${workspaceConfig.folders.length}`);
console.log(`  - Settings: ${Object.keys(workspaceConfig.settings).length} categories`);
console.log(`  - Tasks: ${workspaceConfig.tasks.tasks.length}`);
console.log();

// 3. Generate specific task types
console.log("=== 3. Generating Specific Task Types ===");

// Queue watcher task
const watcherTask = generateQueueWatcherTask();
console.log("Queue Watcher Task:");
console.log(`  Label: ${watcherTask.label}`);
console.log(`  Command: ${watcherTask.command}`);
console.log(`  Args: ${watcherTask.args.join(" ")}`);
console.log(`  Is Background: ${watcherTask.isBackground}`);
console.log();

// Auto-start watcher task
const autoStartTask = generateAutoStartQueueWatcherTask();
console.log("Auto-Start Watcher Task:");
console.log(`  Label: ${autoStartTask.label}`);
console.log(`  Run On: ${autoStartTask.runOptions?.runOn}`);
console.log();

// Build tasks
const buildTasks = generateBuildTasks();
console.log(`Build Tasks (${buildTasks.length}):`);
buildTasks.forEach(task => {
  console.log(`  - ${task.label}`);
});
console.log();

// Test tasks
const testTasks = generateTestTasks();
console.log(`Test Tasks (${testTasks.length}):`);
testTasks.forEach(task => {
  console.log(`  - ${task.label}`);
});
console.log();

// Lint tasks
const lintTasks = generateLintTasks();
console.log(`Lint Tasks (${lintTasks.length}):`);
lintTasks.forEach(task => {
  console.log(`  - ${task.label}`);
});
console.log();

// 4. Write configuration files (optional)
console.log("=== 4. Writing Configuration Files ===");
const outputDir = "./vscode-output";

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write tasks.json
const tasksPath = path.join(outputDir, "tasks.json");
fs.writeFileSync(tasksPath, JSON.stringify(tasksConfig, null, 2));
console.log(`✅ Written tasks.json to ${tasksPath}`);

// Write workspace configuration
const workspacePath = path.join(outputDir, "reynard.code-workspace");
fs.writeFileSync(workspacePath, JSON.stringify(workspaceConfig, null, 2));
console.log(`✅ Written workspace config to ${workspacePath}`);

// Write individual task files
const watcherTaskPath = path.join(outputDir, "queue-watcher-task.json");
fs.writeFileSync(watcherTaskPath, JSON.stringify(watcherTask, null, 2));
console.log(`✅ Written queue watcher task to ${watcherTaskPath}`);

console.log();
console.log("🦊 VS Code integration example completed!");
console.log(`📁 Configuration files written to: ${outputDir}/`);
