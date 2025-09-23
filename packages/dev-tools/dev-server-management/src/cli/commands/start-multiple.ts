import { DevServerManager } from "../../core/DevServerManager.js";
import type { GlobalOptions } from "./types.js";

export const handleStartMultiple = async (globalOptions: GlobalOptions) => {
  try {
    const devServerManager = new DevServerManager(globalOptions.config);
    await devServerManager.initialize();

    console.log("Starting multiple projects interactively...");
    // Implementation for interactive selection would go here
  } catch (error) {
    console.error(`Failed to start projects:`, error);
    // In test environment, throw instead of exiting
    if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
      throw error;
    }
    process.exit(1);
  }
};
