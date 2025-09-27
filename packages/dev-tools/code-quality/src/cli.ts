#!/usr/bin/env node
/**
 * Reynard Code Quality CLI
 *
 * Command-line interface for running comprehensive code quality analysis with SonarQube-like functionality.
 */

import { Command } from "commander";
import {
  handleAnalyzeCommand,
  handleEnhancedCommand,
  handleQualityGateCommand,
  handleSecurityCommand,
  handleWatchCommand,
  handleJunkDetectionCommand,
  createNamingViolationCommand,
  createDocstringCommand,
  createEmojiRoleplayCommand,
} from "./commands";
import { handleQualityGateManagementCommand } from "./commands/quality-gate-management-command";

const program = new Command();

program.name("reynard-code-quality").description("Comprehensive code quality analysis for Reynard").version("1.0.0");

// Analyze command
program
  .command("analyze")
  .description("Run comprehensive code quality analysis")
  .option("-p, --project <path>", "Project root path", process.cwd())
  .option("-o, --output <file>", "Output file for results (JSON)")
  .option("-f, --format <format>", "Output format (json, table, summary)", "summary")
  .option("--security", "Enable security analysis (includes bandit)")
  .option("--no-quality-gates", "Skip quality gate evaluation")
  .option("--environment <env>", "Environment for quality gates", "development")
  .option("--ai", "Enable AI-powered analysis")
  .option("--behavioral", "Enable behavioral analysis")
  .option("--enhanced-security", "Enable enhanced security analysis with Fenrir")
  .action(handleAnalyzeCommand);

// Enhanced command
program
  .command("enhanced")
  .description("Run enhanced analysis with AI, behavioral insights, and advanced security")
  .option("-p, --project <path>", "Project root path", process.cwd())
  .option("-e, --environment <env>", "Environment (development, staging, production)", "development")
  .option("-f, --format <format>", "Output format (table, json, summary)", "summary")
  .option("--ai", "Enable AI-powered analysis")
  .option("--behavioral", "Enable behavioral analysis")
  .option("--enhanced-security", "Enable enhanced security analysis with Fenrir")
  .action(handleEnhancedCommand);

// Quality gate command
program
  .command("quality-gate")
  .description("Evaluate quality gates only")
  .option("-p, --project <path>", "Project root path", process.cwd())
  .option("-e, --environment <env>", "Environment", "development")
  .option("--metrics <file>", "Metrics file (JSON)")
  .action(handleQualityGateCommand);

// Security command
program
  .command("security")
  .description("Run security analysis only")
  .option("-p, --project <path>", "Project root path", process.cwd())
  .option("-o, --output <file>", "Output file for results (JSON)")
  .option("--format <format>", "Output format (json, table, summary)", "summary")
  .action(handleSecurityCommand);

// Watch command
program
  .command("watch")
  .description("Watch for file changes and run analysis")
  .option("-p, --project <path>", "Project root path", process.cwd())
  .option("-i, --interval <ms>", "Analysis interval in milliseconds", "5000")
  .action(handleWatchCommand);

// Junk detection command
program
  .command("junk-detection")
  .description("Detect Git-tracked junk files and development artifacts")
  .option("-p, --project <path>", "Project root path", process.cwd())
  .option("-o, --output <file>", "Output file for results (JSON)")
  .option("-f, --format <format>", "Output format (json, table, summary, report)", "summary")
  .option("-s, --severity <level>", "Filter by severity (all, critical, high, medium, low)", "all")
  .option("-c, --category <type>", "Filter by category (all, python, typescript, reynard, general)", "all")
  .option("--fix", "Generate git commands to fix detected issues")
  .action(handleJunkDetectionCommand);

// Naming violation command
program.addCommand(createNamingViolationCommand());

// Docstring command
program.addCommand(createDocstringCommand());

// Emoji and roleplay scanning command
program.addCommand(createEmojiRoleplayCommand());

// Quality gate management command
program
  .command("quality-gate-mgmt")
  .description("Manage quality gates (create, update, delete, list)")
  .option("-p, --project <path>", "Project root path", process.cwd())
  .option("-a, --action <action>", "Action to perform (list, show, create, update, delete, init, stats, history)", "list")
  .option("--gate-id <id>", "Quality gate ID")
  .option("--name <name>", "Quality gate name")
  .option("-e, --environment <env>", "Environment (development, staging, production, all)")
  .option("--description <desc>", "Quality gate description")
  .option("--enabled", "Enable the quality gate")
  .option("--disabled", "Disable the quality gate")
  .option("--backend-url <url>", "Backend URL", "http://localhost:8000")
  .option("--api-key <key>", "API key for authentication")
  .action(async (options) => {
    // Convert enabled/disabled flags to boolean
    if (options.enabled) options.enabled = true;
    if (options.disabled) options.enabled = false;
    
    await handleQualityGateManagementCommand(options);
  });

// Handle uncaught errors
process.on("uncaughtException", error => {
  console.error("❌ Uncaught Exception:", error.message);
  process.exit(1);
});

process.on("unhandledRejection", reason => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

program.parse();

export default program;
