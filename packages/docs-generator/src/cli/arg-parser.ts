/**
 * @fileoverview Command line argument parser for Reynard documentation generator
 */

export interface CLIOptions {
  configPath: string;
  watch: boolean;
  verbose: boolean;
}

/**
 * Parses command line arguments for the documentation generator CLI
 */
export class ArgParser {
  private options: CLIOptions;

  constructor() {
    this.options = {
      configPath: "reynard-docs.config.js",
      watch: false,
      verbose: false,
    };
  }

  /**
   * Parse command line arguments
   */
  parseArgs(args: string[]): CLIOptions {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case "--config":
        case "-c":
          this.options.configPath = args[++i];
          break;
        case "--watch":
        case "-w":
          this.options.watch = true;
          break;
        case "--verbose":
        case "-v":
          this.options.verbose = true;
          break;
        case "--help":
        case "-h":
          this.showHelp();
          process.exit(0);
          break;
        case "--version":
          this.showVersion();
          process.exit(0);
          break;
        default:
          if (arg.startsWith("-")) {
            console.error(`Unknown option: ${arg}`);
            this.showHelp();
            process.exit(1);
          }
          break;
      }
    }

    return this.options;
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log(`
🦊 Reynard Documentation Generator

Usage: reynard-docs [options]

Options:
  -c, --config <path>    Configuration file path (default: reynard-docs.config.js)
  -w, --watch           Watch for changes and regenerate documentation
  -v, --verbose         Enable verbose output
  -h, --help            Show this help message
  --version             Show version information

Examples:
  reynard-docs                          # Generate documentation once
  reynard-docs --watch                  # Watch for changes
  reynard-docs --config ./my-config.js  # Use custom config file
  reynard-docs --verbose --watch        # Verbose output with watching

For more information, visit: https://github.com/rakki194/reynard
    `);
  }

  /**
   * Show version information
   */
  private showVersion(): void {
    console.log("Reynard Documentation Generator v0.1.0");
  }
}
