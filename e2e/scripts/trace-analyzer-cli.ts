#!/usr/bin/env tsx

/**
 * Trace Analyzer CLI - Legacy Entry Point
 *
 * This file now serves as a compatibility layer that imports and uses
 * the new modular CLI implementation. The original functionality is
 * preserved while leveraging the improved modular architecture.
 */

export { TraceAnalyzerCLI } from "./cli";

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const { TraceAnalyzerCLI } = await import("./cli");
  const cli = new TraceAnalyzerCLI();
  cli.run(process.argv.slice(2)).catch(console.error);
}
