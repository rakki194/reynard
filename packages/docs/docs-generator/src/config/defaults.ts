/**
 * @fileoverview Default configuration values for docs generator
 */

import { GeneratorConfig } from "./types/core";

export const defaultGeneratorConfig: Partial<GeneratorConfig> = {
  outputPath: "docs-generated",
  packages: [],
  templates: [],
  examples: [],
  site: {
    title: "Reynard Documentation",
    description: "Beautiful documentation powered by Reynard framework",
    baseUrl: "/",
  },
  theme: {
    name: "reynard-default",
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    accentColor: "#f59e0b",
  } as unknown as GeneratorConfig["theme"],
  navigation: {
    main: [],
    breadcrumbs: true,
    sidebar: true,
  },
  search: {
    enabled: true,
    provider: "local",
    placeholder: "Search documentation...",
  },
  watch: false,
  verbose: false,
};
