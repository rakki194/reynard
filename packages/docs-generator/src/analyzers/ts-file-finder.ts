import { promises as fs } from "fs";
import path from "path";

/**
 * Recursively find all TypeScript files under a directory, excluding dot-dirs and node_modules
 */
export const findTypeScriptFiles = async (dir: string): Promise<string[]> => {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== "node_modules"
      ) {
        const subFiles = await findTypeScriptFiles(fullPath);
        files.push(...subFiles);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
      ) {
        files.push(fullPath);
      }
    }
  } catch (_err) {
    // ignore read errors to be resilient
  }

  return files;
};
