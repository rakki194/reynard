/**
 * Emoji and Roleplay Scanning Command
 *
 * CLI command for scanning and reporting on emojis and roleplay language
 * in documentation, Python, and TypeScript files.
 */

import { Command } from "commander";
import { handleEmojiRoleplayAction } from "./emoji-roleplay-action-handler";

export function createEmojiRoleplayCommand(): Command {
  const command = new Command("emoji-roleplay");

  command
    .description("Scan for emojis and roleplay language in documentation and code files")
    .option("-p, --project <path>", "Project root path", process.cwd())
    .option("-o, --output <file>", "Output report file path")
    .option("-f, --files <files...>", "Specific files to scan")
    .option("--format <format>", "Output format (markdown, json)", "markdown")
    .option("--threshold <number>", "Professional language score threshold", "80")
    .action(handleEmojiRoleplayAction);

  return command;
}
