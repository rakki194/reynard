import { DevServerManager } from "../../core/DevServerManager.js";
import type { GlobalOptions } from "./types.js";

export const handleConfig = async (options: { validate?: boolean; migrate?: string }, globalOptions: GlobalOptions) => {
  try {
    const devServerManager = new DevServerManager(globalOptions.config);
    await devServerManager.initialize();
    const config = await devServerManager.getConfig();

    console.log("Configuration:");
    console.log(JSON.stringify(config, null, 2));
  } catch (error) {
    console.error(`Failed to get config:`, error);
    process.exit(1);
  }
};
