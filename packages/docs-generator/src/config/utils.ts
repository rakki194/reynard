/**
 * @fileoverview Config utilities: load, validate, merge
 */

import * as path from "path";
import { GeneratorConfig } from "./types/core";
import { defaultGeneratorConfig } from "./defaults";

export async function loadConfig(configPath: string): Promise<GeneratorConfig> {
  try {
    const absolutePath = path.isAbsolute(configPath) ? configPath : path.resolve(process.cwd(), configPath);

    const configFile = absolutePath.endsWith(".js") ? absolutePath : `${absolutePath}.js`;

    const configContent = await import(configFile);
    return {
      ...defaultGeneratorConfig,
      ...configContent.default,
    } as GeneratorConfig;
  } catch (error) {
    throw new Error(`Failed to load configuration from ${configPath}: ${error}`);
  }
}

export function validateConfig(config: GeneratorConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.rootPath) errors.push("rootPath is required");
  if (!config.outputPath) errors.push("outputPath is required");
  if (!config.site.title) errors.push("site.title is required");
  if (!config.site.description) errors.push("site.description is required");
  if (!config.site.baseUrl) errors.push("site.baseUrl is required");
  if (!config.packages || config.packages.length === 0) errors.push("At least one package must be configured");

  for (const pkg of config.packages) {
    if (!pkg.name) errors.push("Package name is required");
    if (!pkg.path && !pkg.pattern) errors.push(`Package ${pkg.name} must have either path or pattern`);
  }

  return { isValid: errors.length === 0, errors };
}

export function mergeConfig(base: Partial<GeneratorConfig>, override: Partial<GeneratorConfig>): GeneratorConfig {
  return {
    ...defaultGeneratorConfig,
    ...base,
    ...override,
    site: {
      ...defaultGeneratorConfig.site,
      ...base.site,
      ...override.site,
    },
    theme: {
      ...defaultGeneratorConfig.theme,
      ...base.theme,
      ...override.theme,
    },
    navigation: {
      ...defaultGeneratorConfig.navigation,
      ...base.navigation,
      ...override.navigation,
    },
    packages: [...(base.packages || []), ...(override.packages || [])],
    templates: [...(base.templates || []), ...(override.templates || [])],
    examples: [...(base.examples || []), ...(override.examples || [])],
  } as GeneratorConfig;
}
