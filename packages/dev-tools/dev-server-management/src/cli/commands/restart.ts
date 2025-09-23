import { DevServerManager } from "../../core/DevServerManager.js";
import type { GlobalOptions } from "./types.js";

export const handleRestart = async (project: string, globalOptions: GlobalOptions) => {
  try {
    const devServerManager = new DevServerManager(globalOptions.config);
    await devServerManager.initialize();
    await devServerManager.restart(project);
    console.log(`Restarting project: ${project}`);
  } catch (error) {
    console.error(`Failed to restart project ${project}:`, error);
    // In test environment, throw instead of exiting
    if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
      throw error;
    }
    process.exit(1);
  }
};
