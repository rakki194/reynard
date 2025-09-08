/**
 * @fileoverview Configuration types and utilities for documentation generator
 */

// import { DocTheme, DocNavigation, DocFooter, DocSearchConfig, DocAnalytics, DocSocial } from 'reynard-docs-core';

// Temporary local type definitions
interface DocTheme {
  name: string;
  colors?: any;
  fonts?: any;
  primaryColor?: string;
  [key: string]: any;
}

interface DocNavigation {
  main?: any[];
  footer?: any[];
  breadcrumbs?: boolean;
  [key: string]: any;
}

interface DocFooter {
  links: any[];
  copyright: string;
  [key: string]: any;
}

interface DocSearchConfig {
  enabled: boolean;
  provider: string;
  apiKey?: string;
  placeholder?: string;
  [key: string]: any;
}

interface DocAnalytics {
  enabled: boolean;
  provider: string;
  trackingId?: string;
  [key: string]: any;
}

interface DocSocial {
  github?: string;
  twitter?: string;
  discord?: string;
  [key: string]: any;
}

/**
 * Package configuration for documentation generation
 */
export interface PackageConfig {
  name: string;
  path?: string;
  pattern?: string;
  category?: string;
  priority?: number;
  include?: string[];
  exclude?: string[];
}

/**
 * Template configuration
 */
export interface TemplateConfig {
  name: string;
  path: string;
  type: 'package-overview' | 'api' | 'example' | 'custom';
}

/**
 * Example configuration
 */
export interface ExampleConfig {
  name: string;
  path: string;
  type: 'component' | 'hook' | 'utility' | 'integration';
  framework?: 'solid' | 'react' | 'vue' | 'vanilla';
}

/**
 * Generator configuration
 */
export interface GeneratorConfig {
  rootPath: string;
  outputPath: string;
  packages: PackageConfig[];
  templates: TemplateConfig[];
  examples: ExampleConfig[];
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
  customComponents?: Record<string, any>;
  plugins?: any[];
  watch?: boolean;
  verbose?: boolean;
}

/**
 * Package information extracted during analysis
 */
export interface PackageInfo {
  name: string;
  displayName?: string;
  description: string;
  version: string;
  path: string;
  category: string;
  keywords: string[];
  dependencies: string[];
  peerDependencies: string[];
  devDependencies: string[];
  exports: Record<string, string>;
  types: Record<string, string>;
  api: ApiInfo[];
  examples: ExampleInfo[];
  readme?: string;
  changelog?: string;
  license?: string;
  repository?: {
    type: string;
    url: string;
  };
  homepage?: string;
  bugs?: {
    url: string;
  };
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  contributors?: Array<{
    name: string;
    email?: string;
    url?: string;
  }>;
}

/**
 * API information extracted from TypeScript
 */
export interface ApiInfo {
  name: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'enum' | 'namespace' | 'variable';
  description: string;
  parameters?: ApiParameter[];
  returns?: ApiReturn;
  examples?: string[];
  deprecated?: boolean;
  since?: string;
  tags?: string[];
  source?: {
    file: string;
    line: number;
    column: number;
  };
  exports?: string[];
  imports?: string[];
}

/**
 * API parameter information
 */
export interface ApiParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
  optional?: boolean;
  rest?: boolean;
}

/**
 * API return information
 */
export interface ApiReturn {
  type: string;
  description: string;
  nullable?: boolean;
  undefined?: boolean;
}

/**
 * Example information
 */
export interface ExampleInfo {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  framework?: string;
  live?: boolean;
  editable?: boolean;
  dependencies?: string[];
  imports?: string[];
  output?: string;
  tags?: string[];
  category?: string;
}

/**
 * Default generator configuration
 */
export const defaultGeneratorConfig: Partial<GeneratorConfig> = {
  outputPath: 'docs-generated',
  packages: [],
  templates: [],
  examples: [],
  site: {
    title: 'Reynard Documentation',
    description: 'Beautiful documentation powered by Reynard framework',
    baseUrl: '/'
  },
  theme: {
    name: 'reynard-default',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#f59e0b'
  },
  navigation: {
    main: [],
    breadcrumbs: true,
    sidebar: true
  },
  search: {
    enabled: true,
    provider: 'local',
    placeholder: 'Search documentation...'
  },
  watch: false,
  verbose: false
};

/**
 * Create a generator configuration from a config file
 */
export async function loadConfig(configPath: string): Promise<GeneratorConfig> {
  try {
    const configContent = await import(configPath);
    return {
      ...defaultGeneratorConfig,
      ...configContent.default
    } as GeneratorConfig;
  } catch (error) {
    throw new Error(`Failed to load configuration from ${configPath}: ${error}`);
  }
}

/**
 * Validate generator configuration
 */
export function validateConfig(config: GeneratorConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.rootPath) {
    errors.push('rootPath is required');
  }

  if (!config.outputPath) {
    errors.push('outputPath is required');
  }

  if (!config.site.title) {
    errors.push('site.title is required');
  }

  if (!config.site.description) {
    errors.push('site.description is required');
  }

  if (!config.site.baseUrl) {
    errors.push('site.baseUrl is required');
  }

  if (!config.packages || config.packages.length === 0) {
    errors.push('At least one package must be configured');
  }

  for (const pkg of config.packages) {
    if (!pkg.name) {
      errors.push('Package name is required');
    }
    if (!pkg.path && !pkg.pattern) {
      errors.push(`Package ${pkg.name} must have either path or pattern`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Merge configurations
 */
export function mergeConfig(base: Partial<GeneratorConfig>, override: Partial<GeneratorConfig>): GeneratorConfig {
  return {
    ...defaultGeneratorConfig,
    ...base,
    ...override,
    site: {
      ...defaultGeneratorConfig.site,
      ...base.site,
      ...override.site
    },
    theme: {
      ...defaultGeneratorConfig.theme,
      ...base.theme,
      ...override.theme
    },
    navigation: {
      ...defaultGeneratorConfig.navigation,
      ...base.navigation,
      ...override.navigation
    },
    packages: [
      ...(base.packages || []),
      ...(override.packages || [])
    ],
    templates: [
      ...(base.templates || []),
      ...(override.templates || [])
    ],
    examples: [
      ...(base.examples || []),
      ...(override.examples || [])
    ]
  } as GeneratorConfig;
}
