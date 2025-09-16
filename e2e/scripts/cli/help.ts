/**
 * CLI Help System
 *
 * Provides help text and usage information for the trace analyzer CLI.
 */

export class HelpSystem {
  /**
   * Display help information
   */
  static showHelp(): void {
    console.log(this.getHelpText());
  }

  /**
   * Get formatted help text
   */
  static getHelpText(): string {
    return `
🔍 Reynard Trace Analyzer

Usage: tsx trace-analyzer-cli.ts [options]

Options:
  -i, --input <file>     Input trace zip file (required)
  -o, --output <file>    Output file path
  -f, --format <format>  Output format: console, markdown, json (default: console)
  -v, --verbose          Show detailed resource list
  -c, --compare <file>   Compare with another trace file
  -h, --help             Show this help message

Examples:
  tsx trace-analyzer-cli.ts -i trace.zip
  tsx trace-analyzer-cli.ts -i trace.zip -f markdown -o report.md
  tsx trace-analyzer-cli.ts -i trace1.zip -c trace2.zip -f json
  tsx trace-analyzer-cli.ts -i trace.zip -v

Output Formats:
  console   - Human-readable console output (default)
  markdown  - Markdown report format
  json      - Machine-readable JSON format

Comparison:
  Use -c or --compare to compare two trace files and see performance differences.
  The comparison shows before/after metrics with percentage changes.
`;
  }

  /**
   * Display version information
   */
  static showVersion(): void {
    console.log("Reynard Trace Analyzer v1.0.0");
  }

  /**
   * Display error help for common issues
   */
  static showErrorHelp(error: string): void {
    console.log(`\n❌ Error: ${error}`);
    console.log("\n💡 Common solutions:");
    console.log("  • Make sure the trace file exists and is readable");
    console.log("  • Check that the file is a valid trace zip file");
    console.log("  • Verify you have permission to read the file");
    console.log("  • Use --help for more information");
  }
}
