import { DevServerManager } from "../../core/DevServerManager.js";
import type { GlobalOptions } from "./types.js";

export const handleHealth = async (
  project: string | undefined,
  options: { json?: boolean; watch?: boolean },
  globalOptions: GlobalOptions
) => {
  try {
    const devServerManager = new DevServerManager(globalOptions.config);
    await devServerManager.initialize();
    const health = await devServerManager.health(project);

    if (project) {
      console.log(`Health for: ${project}`);
      const projectHealth = health.find(h => h.project === project);
      console.log(`Status: ${projectHealth?.health === "healthy" ? "healthy" : "unhealthy"}`);
    } else {
      console.log("Health for: all projects");
      console.log(`Total checks: ${health.length}`);
    }
  } catch (error) {
    console.error(`Failed to check health:`, error);
    // In test environment, throw instead of exiting
    if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
      throw error;
    }
    process.exit(1);
  }
};
