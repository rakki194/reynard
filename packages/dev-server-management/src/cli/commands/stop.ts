import { DevServerManager } from "../../core/DevServerManager.js";
import type { GlobalOptions } from "./types.js";

export const handleStop = async (
  project: string,
  options: { force?: boolean },
  globalOptions: GlobalOptions
) => {
  try {
    const devServerManager = new DevServerManager(globalOptions.config);
    await devServerManager.initialize();
    await devServerManager.stop(project);
    console.log(`Stopping project: ${project}`);
  } catch (error) {
    console.error(`Failed to stop project ${project}:`, error);
    process.exit(1);
  }
};