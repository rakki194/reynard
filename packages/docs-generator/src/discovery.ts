import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";
import type { GeneratorConfig } from "./config/types/core";

export async function discoverPackages(config: GeneratorConfig): Promise<string[]> {
  const packages: string[] = [];
  const excludePatterns = config.excludePatterns || [
    "**/third_party/**",
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.git/**",
    "**/coverage/**",
  ];

  for (const packageConfig of config.packages) {
    if (packageConfig.path) {
      const shouldExclude = excludePatterns.some((pattern: string) => {
        const normalizedPath = path.normalize(packageConfig.path!);
        const normalizedPattern = pattern.replace(/\*\*/g, "**");
        return normalizedPath.includes(normalizedPattern.replace("**/", "").replace("/**", ""));
      });
      if (shouldExclude) {
        console.log(`🚫 Excluding package: ${packageConfig.path}`);
        continue;
      }
      try {
        await fs.access(packageConfig.path);
        packages.push(packageConfig.path);
      } catch {
        console.warn(`⚠️  Package path not found: ${packageConfig.path}`);
      }
    } else if (packageConfig.pattern) {
      const matches = await glob(packageConfig.pattern, {
        cwd: config.rootPath,
        absolute: true,
        ignore: excludePatterns,
      });
      packages.push(...matches);
    }
  }

  return packages;
}
