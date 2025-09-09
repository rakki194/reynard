/**
 * @fileoverview Core type definitions for docs generator config
 */

import {
  DocTheme,
  DocNavigation,
  DocFooter,
  DocSearchConfig,
  DocAnalytics,
  DocSocial,
} from "./site";

// Re-exported in ./package

export interface GeneratorConfig {
  rootPath: string;
  outputPath: string;
  packages: Array<{
    name: string;
    path?: string;
    pattern?: string;
    category?: string;
    priority?: number;
    include?: string[];
    exclude?: string[];
  }>;
  templates: Array<{
    name: string;
    path: string;
    type: "package-overview" | "api" | "example" | "custom";
  }>;
  examples: Array<{
    name: string;
    path: string;
    type: "component" | "hook" | "utility" | "integration";
    framework?: "solid" | "react" | "vue" | "vanilla";
  }>;
  site: {
    title: string;
    description: string;
    baseUrl: string;
    logo?: string;
    favicon?: string;
  };
  theme: DocTheme;
  navigation: DocNavigation;
  footer?: DocFooter;
  search?: DocSearchConfig;
  analytics?: DocAnalytics;
  social?: DocSocial;
  customComponents?: Record<string, unknown>;
  plugins?: unknown[];
  excludePatterns?: string[];
  watch?: boolean;
  verbose?: boolean;
}

// Moved to ./api

// Moved to ./package
