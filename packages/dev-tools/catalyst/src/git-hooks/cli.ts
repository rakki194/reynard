#!/usr/bin/env node
/**
 * 🦊 FOXY Git Hooks CLI
 * 
 * Flexible Orchestration for Xenial Yield - Git Hooks System
 * Command-line interface for managing FOXY git hooks.
 */

import { Command } from "commander";
import { existsSync, readFileSync } from "fs";
import { HookManager } from "./HookManager.js";
import { ReynardLogger } from "../logger/ReynardLogger.js";
import type { HookConfig } from "../types/GitHooks.js";

const program = new Command();

program
  .name("foxy")
  .description("🦊 FOXY Git Hook Management System - Flexible Orchestration for Xenial Yield")
  .version("1.0.0");

// Install hooks command
program
  .command("install")
  .description("Install FOXY git hooks")
  .option("-c, --config <path>", "Path to hook configuration file")
  .option("-v, --verbose", "Enable verbose logging")
  .action(async (options) => {
    const logger = new ReynardLogger({ verbose: options.verbose });
    const hookManager = new HookManager(process.cwd(), logger);

    try {
      const config = await loadHookConfig(options.config);
      await hookManager.installHooks(config);
      process.exit(0);
    } catch (error) {
      logger.error(`Failed to install hooks: ${error}`);
      process.exit(1);
    }
  });

// Uninstall hooks command
program
  .command("uninstall")
  .description("Uninstall FOXY git hooks")
  .option("-v, --verbose", "Enable verbose logging")
  .action(async (options) => {
    const logger = new ReynardLogger({ verbose: options.verbose });
    const hookManager = new HookManager(process.cwd(), logger);

    try {
      await hookManager.uninstallHooks();
      process.exit(0);
    } catch (error) {
      logger.error(`Failed to uninstall hooks: ${error}`);
      process.exit(1);
    }
  });

// Pre-commit hook command
program
  .command("pre-commit")
  .description("Run pre-commit validation")
  .option("-v, --verbose", "Enable verbose logging")
  .action(async (options) => {
    const logger = new ReynardLogger({ verbose: options.verbose });
    const hookManager = new HookManager(process.cwd(), logger);

    try {
      const result = await hookManager.runPreCommit();
      if (!result.success) {
        logger.error(result.message);
        if (result.details) {
          logger.error(result.details);
        }
        process.exit(1);
      }
      process.exit(0);
    } catch (error) {
      logger.error(`Pre-commit hook failed: ${error}`);
      process.exit(1);
    }
  });

// Commit message hook command
program
  .command("commit-msg")
  .description("Validate commit message")
  .argument("<message>", "Commit message to validate")
  .option("-v, --verbose", "Enable verbose logging")
  .action(async (message, options) => {
    const logger = new ReynardLogger({ verbose: options.verbose });
    const hookManager = new HookManager(process.cwd(), logger);

    try {
      const result = await hookManager.runCommitMsg(message);
      if (!result.success) {
        logger.error(result.message);
        if (result.details) {
          logger.error(result.details);
        }
        process.exit(1);
      }
      process.exit(0);
    } catch (error) {
      logger.error(`Commit message validation failed: ${error}`);
      process.exit(1);
    }
  });

// Pre-push hook command
program
  .command("pre-push")
  .description("Run pre-push validation")
  .option("-v, --verbose", "Enable verbose logging")
  .action(async (options) => {
    const logger = new ReynardLogger({ verbose: options.verbose });
    const hookManager = new HookManager(process.cwd(), logger);

    try {
      const result = await hookManager.runPrePush();
      if (!result.success) {
        logger.error(result.message);
        if (result.details) {
          logger.error(result.details);
        }
        process.exit(1);
      }
      process.exit(0);
    } catch (error) {
      logger.error(`Pre-push hook failed: ${error}`);
      process.exit(1);
    }
  });

// Status command
program
  .command("status")
  .description("Show git hooks status")
  .option("-v, --verbose", "Enable verbose logging")
  .action(async (options) => {
    const logger = new ReynardLogger({ verbose: options.verbose });
    const hookManager = new HookManager(process.cwd(), logger);

    try {
      await showHookStatus(hookManager, logger);
      process.exit(0);
    } catch (error) {
      logger.error(`Failed to show hook status: ${error}`);
      process.exit(1);
    }
  });

/**
 * Load hook configuration from file or use defaults
 */
async function loadHookConfig(configPath?: string): Promise<HookConfig> {
  // Try to load from specified path or default .foxy.json
  const configFile = configPath || ".foxy.json";
  
  if (existsSync(configFile)) {
    try {
      const configContent = readFileSync(configFile, "utf8");
      const config = JSON.parse(configContent);
      
      // Return the hooks section of the config
      return config.hooks || config;
    } catch (error) {
      throw new Error(`Failed to load config from ${configFile}: ${error}`);
    }
  }

  // Default configuration
  return {
    hooks: {
      "pre-commit": {
        enabled: true,
        commands: ["lint", "type-check", "test"],
        timeout: 30000,
        parallel: false,
        failFast: true
      },
      "commit-msg": {
        enabled: true,
        commands: ["validate-message"],
        timeout: 5000,
        parallel: false,
        failFast: true
      },
      "pre-push": {
        enabled: true,
        commands: ["full-test", "security-scan"],
        timeout: 120000,
        parallel: true,
        failFast: false
      }
    },
    global: {
      enabled: true,
      verbose: false,
      failFast: true
    }
  };
}

/**
 * Show git hooks status
 */
async function showHookStatus(hookManager: HookManager, logger: ReynardLogger): Promise<void> {
  logger.info("🦊 Reynard Git Hooks Status");
  logger.info("==========================");

  const { existsSync, readFileSync } = await import("fs");
  const { join } = await import("path");

  const hooksDir = join(process.cwd(), ".git", "hooks");
  const hookTypes = ["pre-commit", "commit-msg", "pre-push"];

  for (const hookType of hookTypes) {
    const hookPath = join(hooksDir, hookType);
    
    if (existsSync(hookPath)) {
      const content = readFileSync(hookPath, "utf8");
      if (content.includes("🦊 Reynard")) {
        logger.success(`✅ ${hookType}: Installed`);
      } else {
        logger.warn(`⚠️  ${hookType}: Custom hook (not Reynard)`);
      }
    } else {
      logger.info(`❌ ${hookType}: Not installed`);
    }
  }
}

// Parse command line arguments
program.parse();
