/**
 * Type definitions for Package Configuration System
 * Centralized types for package configuration components
 */

export interface PackageConfiguration {
  name: string;
  version: string;
  description: string;
  settings: PackageSetting[];
  isConfigured: boolean;
  lastModified: Date;
  category: string;
}

export interface PackageSetting {
  key: string;
  label: string;
  description: string;
  type: "string" | "number" | "boolean" | "select" | "multiselect";
  value: any;
  defaultValue: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
  category: string;
}

export interface GlobalConfiguration {
  autoDiscovery: boolean;
  autoInstall: boolean;
  autoUpdate: boolean;
  maxConcurrentInstalls: number;
  maxConcurrentLoads: number;
  installationTimeout: number;
  loadTimeout: number;
  memoryLimit: number;
  cacheSize: number;
  logLevel: string;
  enableAnalytics: boolean;
  enablePerformanceMonitoring: boolean;
  enableErrorReporting: boolean;
}

export interface PackageConfigurationPanelProps {
  showGlobalSettings?: boolean;
  showPackageSettings?: boolean;
  showAdvancedSettings?: boolean;
}

export interface PackageSettingsFormProps {
  package: PackageConfiguration;
  onSave: (settings: PackageSetting[]) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export interface GlobalSettingsFormProps {
  config: GlobalConfiguration;
  onSave: (config: GlobalConfiguration) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export interface PackageListProps {
  packages: PackageConfiguration[];
  selectedPackage: string | null;
  onSelectPackage: (name: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export interface PackageConfigurationState {
  packages: PackageConfiguration[];
  globalConfig: GlobalConfiguration;
  selectedPackage: string | null;
  isSaving: boolean;
  isRefreshing: boolean;
  searchQuery: string;
  selectedCategory: string;
  lastUpdate: Date | null;
}
