#!/usr/bin/env node

/**
 * 🦊 FOXY Git Hooks Installer
 * 
 * Flexible Orchestration for Xenial Yield - Git Hooks System
 * This script installs the FOXY git hooks system to replace husky.
 */

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, chmodSync } from "fs";
import { join, resolve } from "path";

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
} as const;

type Color = keyof typeof colors;

function log(message: string, color: Color = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function findGitRoot(): string {
  let currentDir = process.cwd();
  while (currentDir !== resolve("/")) {
    if (existsSync(join(currentDir, ".git"))) {
      return currentDir;
    }
    currentDir = resolve(currentDir, "..");
  }
  throw new Error("Not a Git repository. Cannot install hooks.");
}

function generatePreCommitHook(): string {
  return `#!/bin/sh
# FOXY Git Hook: pre-commit
# Flexible Orchestration for Xenial Yield
# Managed by reynard-dev-tools-catalyst

# Get the absolute path to the foxy CLI
FOXY_CLI="$(dirname "$0")/../../../../node_modules/.bin/foxy"

if [ -x "$FOXY_CLI" ]; then
  exec "$FOXY_CLI" pre-commit "$@"
else
  echo "Error: FOXY CLI not found or not executable."
  echo "Please run: pnpm install"
  exit 1
fi
`;
}

function generateCommitMsgHook(): string {
  return `#!/bin/sh
# FOXY Git Hook: commit-msg
# Flexible Orchestration for Xenial Yield
# Managed by reynard-dev-tools-catalyst

# Get the absolute path to the foxy CLI
FOXY_CLI="$(dirname "$0")/../../../../node_modules/.bin/foxy"

if [ -x "$FOXY_CLI" ]; then
  exec "$FOXY_CLI" commit-msg "$@"
else
  echo "Error: FOXY CLI not found or not executable."
  echo "Please run: pnpm install"
  exit 1
fi
`;
}

function generatePrePushHook(): string {
  return `#!/bin/sh
# FOXY Git Hook: pre-push
# Flexible Orchestration for Xenial Yield
# Managed by reynard-dev-tools-catalyst

# Get the absolute path to the foxy CLI
FOXY_CLI="$(dirname "$0")/../../../../node_modules/.bin/foxy"

if [ -x "$FOXY_CLI" ]; then
  exec "$FOXY_CLI" pre-push "$@"
else
  echo "Error: FOXY CLI not found or not executable."
  echo "Please run: pnpm install"
  exit 1
fi
`;
}

function installHooks(): void {
  try {
    log("🦊 Installing FOXY Git hooks...", 'blue');
    
    const gitRoot = findGitRoot();
    const hookDir = join(gitRoot, ".git", "hooks");
    
    if (!existsSync(hookDir)) {
      execSync(`mkdir -p ${hookDir}`);
    }
    
    // Install pre-commit hook
    const preCommitPath = join(hookDir, "pre-commit");
    writeFileSync(preCommitPath, generatePreCommitHook());
    chmodSync(preCommitPath, 0o755);
    log(`✅ Installed pre-commit hook at ${preCommitPath}`, 'green');
    
    // Install commit-msg hook
    const commitMsgPath = join(hookDir, "commit-msg");
    writeFileSync(commitMsgPath, generateCommitMsgHook());
    chmodSync(commitMsgPath, 0o755);
    log(`✅ Installed commit-msg hook at ${commitMsgPath}`, 'green');
    
    // Install pre-push hook
    const prePushPath = join(hookDir, "pre-push");
    writeFileSync(prePushPath, generatePrePushHook());
    chmodSync(prePushPath, 0o755);
    log(`✅ Installed pre-push hook at ${prePushPath}`, 'green');
    
    log("🎉 FOXY Git hooks installed successfully!", 'green');
    log("📝 Hooks will run the following checks:", 'blue');
    log("  • pre-commit: format check, linting, line count check, type check, test check", 'yellow');
    log("  • commit-msg: commit message linting", 'yellow');
    log("  • pre-push: full test suite and build check", 'yellow');
    
  } catch (error: any) {
    log(`❌ Failed to install hooks: ${error.message}`, 'red');
    process.exit(1);
  }
}

function uninstallHooks(): void {
  try {
    log("🗑️ Uninstalling FOXY Git hooks...", 'blue');
    
    const gitRoot = findGitRoot();
    const hookDir = join(gitRoot, ".git", "hooks");
    
    const hooks = ["pre-commit", "commit-msg", "pre-push"] as const;
    
    for (const hook of hooks) {
      const hookPath = join(hookDir, hook);
      if (existsSync(hookPath)) {
        execSync(`rm ${hookPath}`);
        log(`🗑️ Uninstalled ${hook} hook from ${hookPath}`, 'green');
      }
    }
    
    log("🎉 FOXY Git hooks uninstalled successfully!", 'green');
    
  } catch (error: any) {
    log(`❌ Failed to uninstall hooks: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Main execution
const command = process.argv[2];

switch (command) {
  case "install":
    installHooks();
    break;
  case "uninstall":
    uninstallHooks();
    break;
  default:
    log("Usage: node install-git-hooks.js [install|uninstall]", 'yellow');
    process.exit(1);
}
