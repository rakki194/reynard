#!/usr/bin/env node

/**
 * 🐺 Husky Toolkit Manager
 * Centralized management system for all Husky validation tools
 *
 * This tool provides a unified interface for running, configuring,
 * and managing all validation tools in the Reynard project.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

class HuskyToolkitManager {
  constructor() {
    this.tools = {
      "workflow-shell": {
        name: "Workflow Shell Validation",
        script: "dist/cli.js",
        description: "Extracts and validates shell scripts from GitHub workflows",
        category: "security",
        dependencies: ["node", "shellcheck", "pnpm"],
      },
      "workflow-lint": {
        name: "Workflow Linting",
        script: "pre-commit-workflow-validation",
        description: "Validates GitHub Actions workflow syntax",
        category: "ci-cd",
        dependencies: ["actionlint"],
      },
      "shell-lint": {
        name: "Shell Script Linting",
        script: "pre-commit-shell-validation",
        description: "Validates shell scripts with shellcheck",
        category: "security",
        dependencies: ["shellcheck"],
      },
      "css-validation": {
        name: "CSS Variable Validation",
        script: "validate-css-variables.js",
        description: "Validates CSS custom properties and variables",
        category: "frontend",
        dependencies: ["node"],
      },
      "markdown-toc": {
        name: "Markdown ToC Validation",
        script: "validate-markdown-toc.js",
        description: "Validates and generates table of contents for markdown files",
        category: "documentation",
        dependencies: ["node"],
      },
      "markdown-links": {
        name: "Markdown Link Validation",
        script: "validate-markdown-links.js",
        description: "Validates internal and external links in markdown files",
        category: "documentation",
        dependencies: ["node"],
      },
      "sentence-length": {
        name: "Sentence Length Validation",
        script: "validate-sentence-length.js",
        description: "Validates sentence length for readability",
        category: "documentation",
        dependencies: ["node"],
      },
      "italic-blockquote": {
        name: "Italic to Blockquote Conversion",
        script: "validate-italic-to-blockquote.js",
        description: "Converts italic text to blockquotes for better readability",
        category: "documentation",
        dependencies: ["node"],
      },
      "python-validation": {
        name: "Python Validation",
        script: "validate-python.py",
        description: "Validates Python code with multiple linters",
        category: "backend",
        dependencies: ["python3", "black", "flake8", "isort", "mypy"],
      },
    };

    this.categories = {
      security: { name: "Security", color: "red" },
      "ci-cd": { name: "CI/CD", color: "blue" },
      frontend: { name: "Frontend", color: "cyan" },
      backend: { name: "Backend", color: "yellow" },
      documentation: { name: "Documentation", color: "magenta" },
    };
  }

  log(message, color = "reset") {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  /**
   * Check if a command is available
   */
  isCommandAvailable(command) {
    try {
      execSync(`which ${command}`, { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check dependencies for a tool
   */
  checkDependencies(toolName) {
    const tool = this.tools[toolName];
    if (!tool) {
      return { available: false, missing: [] };
    }

    const missing = [];
    for (const dep of tool.dependencies) {
      if (!this.isCommandAvailable(dep)) {
        missing.push(dep);
      }
    }

    return {
      available: missing.length === 0,
      missing,
    };
  }

  /**
   * Get tool status
   */
  getToolStatus(toolName) {
    const tool = this.tools[toolName];
    if (!tool) {
      return { exists: false, available: false };
    }

    const scriptPath = path.join(__dirname, tool.script);
    const exists = fs.existsSync(scriptPath);
    const deps = this.checkDependencies(toolName);

    return {
      exists,
      available: exists && deps.available,
      missing: deps.missing,
    };
  }

  /**
   * List all tools with their status
   */
  listTools(filter = null) {
    this.log("🐺 Husky Toolkit Status Report", "magenta");
    this.log("=".repeat(50), "magenta");
    this.log("");

    const categories = {};
    for (const [toolName, tool] of Object.entries(this.tools)) {
      if (filter && !toolName.includes(filter) && !tool.name.toLowerCase().includes(filter.toLowerCase())) {
        continue;
      }

      if (!categories[tool.category]) {
        categories[tool.category] = [];
      }
      categories[tool.category].push({ name: toolName, tool });
    }

    for (const [categoryName, tools] of Object.entries(categories)) {
      const category = this.categories[categoryName];
      this.log(`📁 ${category.name} Tools`, category.color);
      this.log("-".repeat(20), category.color);

      for (const { name, tool } of tools) {
        const status = this.getToolStatus(name);
        const statusIcon = status.available ? "✅" : status.exists ? "⚠️" : "❌";
        const statusText = status.available ? "Ready" : status.exists ? "Missing deps" : "Not found";

        this.log(`  ${statusIcon} ${tool.name}`, status.available ? "green" : "yellow");
        this.log(`     ${tool.description}`, "reset");
        this.log(`     Status: ${statusText}`, "reset");

        if (status.missing && status.missing.length > 0) {
          this.log(`     Missing: ${status.missing.join(", ")}`, "red");
        }
        this.log("");
      }
    }
  }

  /**
   * Run a specific tool
   */
  runTool(toolName, args = []) {
    const tool = this.tools[toolName];
    if (!tool) {
      this.log(`❌ Tool '${toolName}' not found`, "red");
      return false;
    }

    const status = this.getToolStatus(toolName);
    if (!status.available) {
      this.log(`❌ Tool '${toolName}' is not available`, "red");
      if (status.missing && status.missing.length > 0) {
        this.log(`   Missing dependencies: ${status.missing.join(", ")}`, "red");
      }
      return false;
    }

    const scriptPath = path.join(__dirname, tool.script);
    this.log(`🔧 Running ${tool.name}...`, "blue");

    try {
      if (tool.script.endsWith(".js")) {
        execSync(`node "${scriptPath}" ${args.join(" ")}`, {
          stdio: "inherit",
        });
      } else if (tool.script.endsWith(".py")) {
        execSync(`python3 "${scriptPath}" ${args.join(" ")}`, {
          stdio: "inherit",
        });
      } else {
        execSync(`bash "${scriptPath}" ${args.join(" ")}`, {
          stdio: "inherit",
        });
      }
      return true;
    } catch (error) {
      this.log(`❌ Tool '${toolName}' failed`, "red");
      return false;
    }
  }

  /**
   * Run all available tools
   */
  runAllTools(args = []) {
    this.log("🐺 Running all available Husky tools...", "magenta");
    this.log("=".repeat(40), "magenta");
    this.log("");

    const results = {};
    let successCount = 0;
    let totalCount = 0;

    for (const toolName of Object.keys(this.tools)) {
      const status = this.getToolStatus(toolName);
      if (status.available) {
        totalCount++;
        this.log(`\n🔧 Running ${this.tools[toolName].name}...`, "blue");
        const success = this.runTool(toolName, args);
        results[toolName] = success;
        if (success) {
          successCount++;
        }
      }
    }

    this.log("\n🎯 Summary", "magenta");
    this.log("=".repeat(20), "magenta");
    this.log(`✅ Successful: ${successCount}/${totalCount}`, successCount === totalCount ? "green" : "yellow");

    if (successCount < totalCount) {
      this.log("❌ Failed tools:", "red");
      for (const [toolName, success] of Object.entries(results)) {
        if (!success) {
          this.log(`  - ${this.tools[toolName].name}`, "red");
        }
      }
    }

    return successCount === totalCount;
  }

  /**
   * Install missing dependencies
   */
  installDependencies() {
    this.log("🐺 Installing missing dependencies...", "magenta");
    this.log("=".repeat(40), "magenta");
    this.log("");

    const allDeps = new Set();
    for (const toolName of Object.keys(this.tools)) {
      const deps = this.checkDependencies(toolName);
      if (!deps.available) {
        deps.missing.forEach(dep => allDeps.add(dep));
      }
    }

    if (allDeps.size === 0) {
      this.log("✅ All dependencies are already installed!", "green");
      return true;
    }

    this.log("📦 Missing dependencies:", "yellow");
    for (const dep of allDeps) {
      this.log(`  - ${dep}`, "yellow");
    }
    this.log("");

    // Generate installation commands
    const archDeps = [];
    const npmDeps = [];
    const pipDeps = [];

    for (const dep of allDeps) {
      if (["node", "npm", "shellcheck", "actionlint"].includes(dep)) {
        archDeps.push(dep);
      } else if (["black", "flake8", "isort", "mypy"].includes(dep)) {
        pipDeps.push(dep);
      }
    }

    if (archDeps.length > 0) {
      this.log("🔧 Install with pacman:", "blue");
      this.log(`   sudo pacman -S ${archDeps.join(" ")}`, "cyan");
    }

    if (pipDeps.length > 0) {
      this.log("🔧 Install with pip:", "blue");
      this.log(`   pip install ${pipDeps.join(" ")}`, "cyan");
    }

    return false;
  }

  /**
   * Show help information
   */
  showHelp() {
    this.log("🐺 Husky Toolkit Manager", "magenta");
    this.log("=".repeat(30), "magenta");
    this.log("");
    this.log("Usage: node husky-toolkit-manager.js <command> [options]", "blue");
    this.log("");
    this.log("Commands:", "yellow");
    this.log("  list [filter]     List all tools with their status", "reset");
    this.log("  run <tool> [args] Run a specific tool", "reset");
    this.log("  run-all [args]    Run all available tools", "reset");
    this.log("  install-deps      Show installation commands for missing dependencies", "reset");
    this.log("  help              Show this help message", "reset");
    this.log("");
    this.log("Examples:", "yellow");
    this.log("  node husky-toolkit-manager.js list", "reset");
    this.log("  node husky-toolkit-manager.js list shell", "reset");
    this.log("  node husky-toolkit-manager.js run workflow-shell --fix", "reset");
    this.log("  node husky-toolkit-manager.js run-all", "reset");
    this.log("  node husky-toolkit-manager.js install-deps", "reset");
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new HuskyToolkitManager();
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "list":
      manager.listTools(args[1]);
      break;
    case "run":
      if (!args[1]) {
        manager.log("❌ Please specify a tool name", "red");
        process.exit(1);
      }
      const success = manager.runTool(args[1], args.slice(2));
      process.exit(success ? 0 : 1);
      break;
    case "run-all":
      const allSuccess = manager.runAllTools(args.slice(1));
      process.exit(allSuccess ? 0 : 1);
      break;
    case "install-deps":
      manager.installDependencies();
      break;
    case "help":
    case "--help":
    case "-h":
      manager.showHelp();
      break;
    default:
      if (command) {
        manager.log(`❌ Unknown command: ${command}`, "red");
      }
      manager.showHelp();
      process.exit(1);
  }
}

export default HuskyToolkitManager;
