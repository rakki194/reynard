/**
 * @fileoverview Main CLI runner for Reynard documentation generator
 */
import { createDocGenerator } from "../generator";
import { validateConfig } from "../config/utils";
import { ArgParser } from "./arg-parser";
import { ConfigLoader } from "./config-loader";
/**
 * Main CLI runner for the documentation generator
 */
export class ReynardDocsCLI {
    constructor() {
        Object.defineProperty(this, "argParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "configLoader", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.argParser = new ArgParser();
        this.configLoader = new ConfigLoader();
    }
    /**
     * Parse command line arguments
     */
    parseArgs(args) {
        return this.argParser.parseArgs(args);
    }
    /**
     * Run the CLI
     */
    async run(options) {
        try {
            console.log("🦊 Reynard Documentation Generator");
            console.log("=====================================\n");
            // Load configuration
            console.log(`📋 Loading configuration from: ${options.configPath}`);
            const config = await this.configLoader.loadConfiguration(options.configPath);
            // Validate configuration
            const validation = validateConfig(config);
            if (!validation.isValid) {
                console.error("❌ Configuration validation failed:");
                validation.errors.forEach((error) => console.error(`  - ${error}`));
                process.exit(1);
            }
            console.log("✅ Configuration validated");
            // Create generator
            const generator = createDocGenerator(config);
            if (options.watch) {
                console.log("👀 Starting watch mode...");
                await generator.watch();
            }
            else {
                console.log("🚀 Generating documentation...");
                await generator.generate();
                console.log("🎉 Documentation generation complete!");
            }
        }
        catch (error) {
            console.error("❌ Error:", error);
            process.exit(1);
        }
    }
}
