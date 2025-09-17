#!/usr/bin/env node
/**
 * @fileoverview CLI entry point for Reynard documentation generator
 */
import { ReynardDocsCLI } from "./cli-runner";
// Run CLI if this file is executed directly
const cli = new ReynardDocsCLI();
const options = cli.parseArgs(process.argv.slice(2));
cli.run(options).catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
});
