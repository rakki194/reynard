/**
 * 🦊 CLI Interface
 *
 * Main CLI interface for the git automation tools
 */

import { Command } from "commander";
import chalk from "chalk";
import { CLICommands } from "./commands";

const program = new Command();

program.name("reynard-git").description("🦊 Reynard Git workflow automation tools").version("0.1.0");

// Junk Detection Command
program
  .command("junk")
  .description("Detect and analyze junk files in the repository")
  .option("-c, --cleanup", "Clean up detected junk files")
  .option("-f, --force", "Force cleanup without confirmation")
  .option("-d, --dry-run", "Show what would be cleaned up without actually doing it")
  .action(async options => {
    await CLICommands.junkDetection(options);
  });

// Change Analysis Command
program
  .command("analyze")
  .description("Analyze Git changes and categorize them")
  .option("-w, --working-dir <dir>", "Working directory", ".")
  .option("-o, --output <file>", "Output file for results")
  .action(async options => {
    await CLICommands.changeAnalysis(options);
  });

// Commit Message Generation Command
program
  .command("commit")
  .description("Generate conventional commit message from changes")
  .option("-w, --working-dir <dir>", "Working directory", ".")
  .option("-p, --preview", "Preview the commit message")
  .action(async options => {
    await CLICommands.commitMessage(options);
  });

// Changelog Management Command
program
  .command("changelog")
  .description("Manage CHANGELOG.md file")
  .option("-a, --action <action>", "Action to perform (read, add, promote)", "read")
  .option("-v, --version <version>", "Version for promote action")
  .option("-e, --entry <entry>", "Entry text for add action")
  .option("-t, --type <type>", "Entry type for add action")
  .option("-w, --working-dir <dir>", "Working directory", ".")
  .action(async options => {
    await CLICommands.changelogManagement(options);
  });

// Version Management Command
program
  .command("version")
  .description("Manage package version")
  .option("-a, --action <action>", "Action to perform (current, bump)", "current")
  .option("-v, --version <version>", "Version for bump action")
  .option("-w, --working-dir <dir>", "Working directory", ".")
  .action(async options => {
    await CLICommands.versionManagement(options);
  });

// Workflow Orchestration Command
program
  .command("workflow")
  .description("Execute complete Git workflow")
  .option("-w, --working-dir <dir>", "Working directory", ".")
  .option("-c, --commit", "Generate and apply commit message")
  .option("-v, --version", "Bump version")
  .option("-l, --changelog", "Update changelog")
  .option("-d, --dry-run", "Show what would be done without actually doing it")
  .action(async options => {
    await CLICommands.workflowOrchestration(options);
  });

// Error handling
program.on("command:*", () => {
  console.error(chalk.red("❌ Invalid command. Use --help for available commands."));
  process.exit(1);
});

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
