import { DevServerManager } from "../../core/DevServerManager.js";
import type { GlobalOptions } from "./types.js";

export const handleList = async (
  options: { category?: string; json?: boolean },
  globalOptions: GlobalOptions
) => {
  try {
    const devServerManager = new DevServerManager(globalOptions.config);
    await devServerManager.initialize();
    const projects = await devServerManager.list();
    
    console.log("Available projects:");
    projects.forEach(project => {
      console.log(`- ${project.name}: ${project.description}`);
    });
  } catch (error) {
    console.error(`Failed to list projects:`, error);
    process.exit(1);
  }
};