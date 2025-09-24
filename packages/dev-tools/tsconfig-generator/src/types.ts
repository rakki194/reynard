/**
 * 🦊 TypeScript Configuration Generator Types
 */

export interface TSConfigGeneratorConfig {
  /** Include source packages */
  includePackages?: boolean;
  /** Include template projects */
  includeTemplates?: boolean;
  /** Include scripts */
  includeScripts?: boolean;
  /** Include tools packages */
  includeTools?: boolean;
  /** Include documentation packages */
  includeDocumentation?: boolean;
  /** Include testing packages */
  includeTesting?: boolean;
  /** Include non-buildable directories */
  includeNonBuildable?: boolean;
  /** Custom TypeScript compiler options */
  customCompilerOptions?: Record<string, any>;
  /** Output file path */
  outputPath?: string;
  /** Whether to generate individual package tsconfigs */
  generateIndividual?: boolean;
  /** Whether to include references to other packages */
  includeReferences?: boolean;
  /** Verbose output */
  verbose?: boolean;
}

export interface TSConfigResult {
  /** Whether generation was successful */
  success: boolean;
  /** Generated TypeScript configuration */
  config: any;
  /** Number of packages processed */
  packagesProcessed: number;
  /** Any errors encountered */
  errors: string[];
  /** Any warnings */
  warnings: string[];
}

export interface PackageTSConfig {
  /** Package name */
  name: string;
  /** Package path */
  path: string;
  /** Generated tsconfig content */
  config: any;
  /** Dependencies for references */
  references: string[];
}
