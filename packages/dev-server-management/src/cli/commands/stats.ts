import { DevServerManager } from "../../core/DevServerManager.js";
import type { GlobalOptions } from "./types.js";

export const handleStats = async (
  options: { json?: boolean },
  globalOptions: GlobalOptions
) => {
  try {
    const devServerManager = new DevServerManager(globalOptions.config);
    await devServerManager.initialize();
    const stats = await devServerManager.getStats();
    
    console.log("Server Statistics:");
    console.log(`Total projects: ${stats.totalProjects}`);
    console.log(`Running projects: ${stats.runningProjects}`);
    console.log(`Stopped projects: ${stats.totalProjects - stats.runningProjects}`);
  } catch (error) {
    console.error(`Failed to get stats:`, error);
    process.exit(1);
  }
};