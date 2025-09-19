import { DevServerManager } from "../../core/DevServerManager.js";
import type { GlobalOptions } from "./types.js";

export const handleStart = async (
  project: string,
  options: { port?: number; detached?: boolean; healthCheck?: boolean },
  globalOptions: GlobalOptions
) => {
  try {
    const devServerManager = new DevServerManager(globalOptions.config);
    await devServerManager.initialize();
    await devServerManager.start(project, options);
    console.log(`Starting project: ${project}`);
  } catch (error) {
    console.error(`Failed to start project ${project}:`, error);
    process.exit(1);
  }
};