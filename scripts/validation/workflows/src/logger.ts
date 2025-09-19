/**
 * 🐺 Logger Module
 * Provides colorized logging functionality for the workflow shell extractor
 */

import type { ColorConfig, Logger } from "./types.js";

export class WorkflowLogger implements Logger {
  private readonly verbose: boolean;
  private readonly colors: ColorConfig = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    reset: "\x1b[0m",
    bold: "\x1b[1m",
  };

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  log(message: string, color: keyof ColorConfig = "reset"): void {
    if (this.verbose || color !== "reset") {
      console.log(`${this.colors[color]}${message}${this.colors.reset}`);
    }
  }

  error(message: string): void {
    this.log(`❌ ${message}`, "red");
  }

  warn(message: string): void {
    this.log(`⚠️  ${message}`, "yellow");
  }

  info(message: string): void {
    this.log(`ℹ️  ${message}`, "blue");
  }

  success(message: string): void {
    this.log(`✅ ${message}`, "green");
  }

  debug(message: string): void {
    if (this.verbose) {
      this.log(`🐛 ${message}`, "cyan");
    }
  }

  section(title: string): void {
    this.log("", "reset");
    this.log(`🎯 ${title}`, "magenta");
    this.log("=".repeat(30), "magenta");
  }
}
