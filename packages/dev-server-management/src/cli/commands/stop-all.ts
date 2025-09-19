import { DevServerManager } from "../../core/DevServerManager.js";
import type { GlobalOptions } from "./types.js";

export const handleStopAll = async (
  options: { force?: boolean },
  globalOptions: GlobalOptions
) => {
  try {
    const devServerManager = new DevServerManager(globalOptions.config);
    await devServerManager.initialize();
    await devServerManager.stopAll();
    
    console.log("Stopping all projects...");
    console.log("All projects stopped successfully");
  } catch (error) {
    console.error(`Failed to stop all projects:`, error);
    process.exit(1);
  }
};