/**
 * Icon Package Interface
 *
 * Defines the contract that all icon packages must implement
 * to be compatible with the Reynard icon system.
 */

export interface IconPackage {
  /** Unique identifier for the icon package */
  id: string;

  /** Human-readable name of the icon package */
  name: string;

  /** Version of the icon package */
  version: string;

  /** Get an icon by name */
  getIcon: (name: string) => SVGElement | null;

  /** Get all available icon names */
  getIconNames: () => string[];

  /** Check if an icon exists */
  hasIcon: (name: string) => boolean;

  /** Get icon metadata */
  getIconMetadata?: (name: string) => IconMetadata | null;
}

export interface IconMetadata {
  /** Icon name */
  name: string;

  /** Icon category/tags */
  tags?: string[];

  /** Icon size (if fixed) */
  size?: number;

  /** Icon description */
  description?: string;

  /** Icon keywords for search */
  keywords?: string[];
}

export interface IconRegistry {
  /** Register an icon package */
  register: (pkg: IconPackage) => void;

  /** Unregister an icon package */
  unregister: (packageId: string) => void;

  /** Get an icon from any registered package */
  getIcon: (name: string, packageId?: string) => SVGElement | null;

  /** Get all available icon names from all packages */
  getAllIconNames: () => string[];

  /** Get all registered packages */
  getPackages: () => IconPackage[];

  /** Search icons by name or metadata */
  searchIcons: (query: string) => IconSearchResult[];
}

export interface IconSearchResult {
  /** Icon name */
  name: string;

  /** Package ID that contains this icon */
  packageId: string;

  /** Package name */
  packageName: string;

  /** Icon metadata */
  metadata?: IconMetadata;

  /** Relevance score for search */
  score?: number;
}
