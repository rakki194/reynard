/**
 * CLI Options Parser
 *
 * Handles parsing command-line arguments into structured options
 * for the trace analyzer CLI.
 */

import type { CLIOptions, OutputFormat } from "./types";

export class OptionsParser {
  /**
   * Parse command-line arguments into CLIOptions
   */
  static parseArgs(args: string[]): CLIOptions {
    const options: Partial<CLIOptions> = {
      input: "",
      format: "console",
      verbose: false,
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case "-i":
        case "--input":
          options.input = args[++i];
          break;
        case "-o":
        case "--output":
          options.output = args[++i];
          break;
        case "-f":
        case "--format":
          options.format = this.validateFormat(args[++i]);
          break;
        case "-v":
        case "--verbose":
          options.verbose = true;
          break;
        case "-c":
        case "--compare":
          options.compare = args[++i];
          break;
        case "-h":
        case "--help":
          throw new HelpRequestedError();
      }
    }

    return options as CLIOptions;
  }

  /**
   * Validate and normalize output format
   */
  private static validateFormat(format: string): OutputFormat {
    const validFormats: OutputFormat[] = ["markdown", "json", "console"];

    if (validFormats.includes(format as OutputFormat)) {
      return format as OutputFormat;
    }

    throw new Error(`Invalid format: ${format}. Valid formats: ${validFormats.join(", ")}`);
  }

  /**
   * Check if required options are present
   */
  static validateOptions(options: CLIOptions): void {
    if (!options.input) {
      throw new Error("Input file is required. Use -i or --input to specify a trace file.");
    }
  }
}

/**
 * Custom error for help requests
 */
export class HelpRequestedError extends Error {
  constructor() {
    super("Help requested");
    this.name = "HelpRequestedError";
  }
}
