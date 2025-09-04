/**
 * Settings Utilities
 * Helper functions for validation, migration, and settings management
 */
import type {
  SettingDefinition,
  SettingsSchema,
  SettingCondition,
} from "../types";
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
export interface MultiValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
/**
 * Validate a single setting value
 */
export declare function validateSetting(
  definition: SettingDefinition,
  value: any,
): ValidationResult;
/**
 * Validate all settings against their definitions
 */
export declare function validateAllSettings(
  definitions: Record<string, SettingDefinition>,
  values: Record<string, any>,
): MultiValidationResult;
/**
 * Evaluate a setting condition
 */
export declare function evaluateCondition(
  condition: SettingCondition,
  values: Record<string, any>,
): boolean;
/**
 * Check if a setting should be visible based on its conditions
 */
export declare function isSettingVisible(
  definition: SettingDefinition,
  values: Record<string, any>,
): boolean;
/**
 * Filter settings based on visibility conditions
 */
export declare function getVisibleSettings(
  definitions: Record<string, SettingDefinition>,
  values: Record<string, any>,
): Record<string, SettingDefinition>;
/**
 * Migrate a setting value from an old version
 */
export declare function migrateSettingValue(
  definition: SettingDefinition,
  oldValue: any,
  oldVersion: string,
): any;
/**
 * Serialize a setting value for storage
 */
export declare function serializeSettingValue(
  definition: SettingDefinition,
  value: any,
): string;
/**
 * Deserialize a setting value from storage
 */
export declare function deserializeSettingValue(
  definition: SettingDefinition,
  serializedValue: string,
): any;
/**
 * Get setting dependencies
 */
export declare function getSettingDependencies(
  key: string,
  definitions: Record<string, SettingDefinition>,
): string[];
/**
 * Resolve setting dependencies in correct order
 */
export declare function resolveDependencyOrder(
  definitions: Record<string, SettingDefinition>,
): string[];
/**
 * Create a settings schema builder
 */
export declare class SettingsSchemaBuilder {
  private schema;
  constructor(version?: string);
  /**
   * Add a setting definition
   */
  addSetting(definition: SettingDefinition): this;
  /**
   * Add multiple setting definitions
   */
  addSettings(definitions: SettingDefinition[]): this;
  /**
   * Add a setting group
   */
  addGroup(group: { id: string; name: string; settings: string[] }): this;
  /**
   * Set schema metadata
   */
  setMetadata(metadata: SettingsSchema["metadata"]): this;
  /**
   * Build the final schema
   */
  build(): SettingsSchema;
}
/**
 * Deep clone an object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Debounce function
 */
export declare function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): T;
/**
 * Throttle function
 */
export declare function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): T;
/**
 * Check if code is running in browser environment
 */
export declare function isBrowser(): boolean;
/**
 * Format file size in human readable format
 */
export declare function formatFileSize(bytes: number): string;
