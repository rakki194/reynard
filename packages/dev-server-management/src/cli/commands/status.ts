import { DevServerManager } from "../../core/DevServerManager.js";
import type { GlobalOptions } from "./types.js";

export const handleStatus = async (
  project: string | undefined,
  options: { json?: boolean; health?: boolean },
  globalOptions: GlobalOptions
) => {
  try {
    const devServerManager = new DevServerManager(globalOptions.config);
    await devServerManager.initialize();
    const status = await devServerManager.status(project);
    
            if (project) {
              console.log(`Status for: ${project}`);
              const projectStatus = status.find(s => s.name === project);
              console.log(`Status: ${projectStatus?.status || "unknown"}`);
              console.log(`Port: ${projectStatus?.port || "unknown"}`);
            } else {
      console.log("Status for: all projects");
      console.log(`Total projects: ${status.length}`);
    }
  } catch (error) {
    console.error(`Failed to get status:`, error);
    process.exit(1);
  }
};