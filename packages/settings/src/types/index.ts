/**
 * Settings Types and Interfaces
 * Comprehensive type definitions for settings management
 */

export type SettingType = 
  | "boolean"
  | "string" 
  | "number"
  | "select"
  | "multiselect"
  | "range"
  | "color"
  | "date"
  | "time"
  | "datetime"
  | "json"
  | "file"
  | "folder";

export type SettingCategory = 
  | "general"
  | "appearance" 
  | "behavior"
  | "privacy"
  | "security"
  | "performance"
  | "accessibility"
  | "advanced"
  | "experimental"
  | "integrations"
  | "ai"
  | "media"
  | "datetime"
  | "custom";

export type SettingScope = "user" | "global" | "session" | "temporary";

export type SettingStorage = "localStorage" | "sessionStorage" | "indexedDB" | "memory" | "remote";

export interface SettingDefinition<T = any> {
  /** Unique setting identifier */
  key: string;
  /** Human-readable label */
  label: string;
  /** Detailed description */
  description?: string;
  /** Setting category for organization */
  category: SettingCategory;
  /** Type of setting control */
  type: SettingType;
  /** Default value */
  defaultValue: T;
  /** Current value */
  value?: T;
  /** Setting scope */
  scope?: SettingScope;
  /** Storage mechanism */
  storage?: SettingStorage;
  /** Whether setting is required */
  required?: boolean;
  /** Whether setting is read-only */
  readonly?: boolean;
  /** Whether setting is hidden from UI */
  hidden?: boolean;
  /** Whether setting is experimental */
  experimental?: boolean;
  /** Setting validation rules */
  validation?: SettingValidation<T>;
  /** Options for select/multiselect types */
  options?: SettingOption[];
  /** Conditional visibility */
  condition?: SettingCondition;
  /** Dependencies on other settings */
  dependencies?: string[];
  /** Help text or documentation link */
  help?: string;
  /** Icon for UI display */
  icon?: string;
  /** Order for UI display */
  order?: number;
  /** Tags for filtering/searching */
  tags?: string[];
  /** Migration function for value updates */
  migrate?: (oldValue: any, oldVersion: string) => T;
  /** Custom serialization */
  serialize?: (value: T) => string;
  /** Custom deserialization */
  deserialize?: (value: string) => T;
}

export interface SettingValidation<T = any> {
  /** Minimum value for numbers */
  min?: number;
  /** Maximum value for numbers */
  max?: number;
  /** Step increment for numbers */
  step?: number;
  /** Minimum length for strings */
  minLength?: number;
  /** Maximum length for strings */
  maxLength?: number;
  /** Regular expression pattern */
  pattern?: RegExp;
  /** Custom validation function */
  validator?: (value: T) => boolean | string;
  /** Required validation */
  required?: boolean;
  /** Custom error message */
  errorMessage?: string;
}

export interface SettingOption {
  /** Option value */
  value: any;
  /** Display label */
  label: string;
  /** Option description */
  description?: string;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Option icon */
  icon?: string;
  /** Option group */
  group?: string;
}

export interface SettingCondition {
  /** Setting key to check */
  key: string;
  /** Expected value or comparison */
  value?: any;
  /** Comparison operator */
  operator?: "equals" | "not-equals" | "greater" | "less" | "contains" | "exists";
  /** Multiple conditions */
  and?: SettingCondition[];
  /** Alternative conditions */
  or?: SettingCondition[];
}

export interface SettingGroup {
  /** Group identifier */
  id: string;
  /** Group name */
  name: string;
  /** Group description */
  description?: string;
  /** Group category */
  category: SettingCategory;
  /** Group icon */
  icon?: string;
  /** Display order */
  order?: number;
  /** Whether group is collapsible */
  collapsible?: boolean;
  /** Whether group is collapsed by default */
  collapsed?: boolean;
  /** Group settings */
  settings: string[];
  /** Conditional visibility */
  condition?: SettingCondition;
}

export interface SettingsSchema {
  /** Schema version */
  version: string;
  /** Schema metadata */
  metadata?: {
    name?: string;
    description?: string;
    author?: string;
    created?: string;
    updated?: string;
  };
  /** Setting definitions */
  settings: Record<string, SettingDefinition>;
  /** Setting groups */
  groups: Record<string, SettingGroup>;
  /** Category configurations */
  categories?: Record<SettingCategory, CategoryConfig>;
  /** Global validation rules */
  validation?: {
    [key: string]: SettingValidation;
  };
}

export interface CategoryConfig {
  /** Category name */
  name: string;
  /** Category description */
  description?: string;
  /** Category icon */
  icon?: string;
  /** Display order */
  order?: number;
  /** Whether category is collapsible */
  collapsible?: boolean;
  /** Custom color theme */
  color?: string;
}

export interface SettingsState {
  /** Current setting values */
  values: Record<string, any>;
  /** Whether settings are loading */
  loading: boolean;
  /** Whether settings are saving */
  saving: boolean;
  /** Current error state */
  error: string | null;
  /** Validation errors */
  validationErrors: Record<string, string>;
  /** Whether settings have unsaved changes */
  hasChanges: boolean;
  /** Last saved timestamp */
  lastSaved?: Date;
  /** Settings version */
  version: string;
}

export interface SettingsConfiguration {
  /** Settings schema */
  schema: SettingsSchema;
  /** Storage configuration */
  storage?: {
    /** Default storage mechanism */
    default: SettingStorage;
    /** Storage prefix for keys */
    prefix?: string;
    /** Whether to encrypt sensitive data */
    encrypt?: boolean;
    /** Compression settings */
    compression?: boolean;
    /** Remote storage URL */
    remoteUrl?: string;
    /** Storage sync interval (ms) */
    syncInterval?: number;
  };
  /** Validation configuration */
  validation?: {
    /** Whether to validate on change */
    validateOnChange?: boolean;
    /** Whether to validate on save */
    validateOnSave?: boolean;
    /** Whether to show validation errors immediately */
    showErrorsImmediately?: boolean;
  };
  /** Migration configuration */
  migration?: {
    /** Whether to auto-migrate settings */
    autoMigrate?: boolean;
    /** Migration handlers */
    handlers?: Record<string, (oldValue: any) => any>;
  };
  /** Backup configuration */
  backup?: {
    /** Whether to create backups */
    enabled?: boolean;
    /** Maximum number of backups */
    maxBackups?: number;
    /** Backup interval (ms) */
    interval?: number;
  };
  /** Debug configuration */
  debug?: {
    /** Whether to enable debug logging */
    enabled?: boolean;
    /** Log level */
    level?: "error" | "warn" | "info" | "debug";
  };
}

export interface SettingsManagerOptions {
  /** Settings configuration */
  config: SettingsConfiguration;
  /** Whether to auto-initialize */
  autoInit?: boolean;
  /** Whether to auto-save changes */
  autoSave?: boolean;
  /** Auto-save debounce delay (ms) */
  autoSaveDelay?: number;
  /** Whether to validate on load */
  validateOnLoad?: boolean;
  /** Event callbacks */
  callbacks?: SettingsCallbacks;
}

export interface SettingsCallbacks {
  /** Called when settings are loaded */
  onLoad?: (settings: Record<string, any>) => void;
  /** Called when setting value changes */
  onChange?: (key: string, value: any, oldValue: any) => void;
  /** Called when settings are saved */
  onSave?: (settings: Record<string, any>) => void;
  /** Called when validation fails */
  onValidationError?: (errors: Record<string, string>) => void;
  /** Called when storage error occurs */
  onStorageError?: (error: Error) => void;
  /** Called when migration occurs */
  onMigration?: (oldVersion: string, newVersion: string) => void;
  /** Called when settings are reset */
  onReset?: () => void;
}

export interface SettingsExportData {
  /** Export metadata */
  metadata: {
    /** Export timestamp */
    timestamp: string;
    /** Settings version */
    version: string;
    /** App name/identifier */
    app?: string;
    /** User identifier */
    user?: string;
  };
  /** Settings data */
  settings: Record<string, any>;
  /** Schema definition */
  schema?: SettingsSchema;
}

export interface SettingsImportOptions {
  /** Whether to validate imported data */
  validate?: boolean;
  /** Whether to merge with existing settings */
  merge?: boolean;
  /** Whether to backup before import */
  backup?: boolean;
  /** Settings to exclude from import */
  exclude?: string[];
  /** Settings to include in import */
  include?: string[];
  /** Custom migration function */
  migrate?: (data: SettingsExportData) => Record<string, any>;
}

export interface SettingsSearch {
  /** Search query */
  query?: string;
  /** Category filter */
  category?: SettingCategory;
  /** Type filter */
  type?: SettingType;
  /** Scope filter */
  scope?: SettingScope;
  /** Tags filter */
  tags?: string[];
  /** Whether to include hidden settings */
  includeHidden?: boolean;
  /** Whether to include experimental settings */
  includeExperimental?: boolean;
}

export interface SettingsSearchResult {
  /** Matching settings */
  settings: SettingDefinition[];
  /** Total count */
  total: number;
  /** Search metadata */
  meta: {
    query: string;
    filters: SettingsSearch;
    duration: number;
  };
}

// Predefined setting types
export interface BooleanSetting extends SettingDefinition<boolean> {
  type: "boolean";
}

export interface StringSetting extends SettingDefinition<string> {
  type: "string";
  validation?: SettingValidation<string> & {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
}

export interface NumberSetting extends SettingDefinition<number> {
  type: "number" | "range";
  validation?: SettingValidation<number> & {
    min?: number;
    max?: number;
    step?: number;
  };
}

export interface SelectSetting extends SettingDefinition<string | number> {
  type: "select";
  options: SettingOption[];
}

export interface MultiSelectSetting extends SettingDefinition<(string | number)[]> {
  type: "multiselect";
  options: SettingOption[];
}

export interface ColorSetting extends SettingDefinition<string> {
  type: "color";
  validation?: SettingValidation<string> & {
    format?: "hex" | "rgb" | "hsl" | "hsv";
  };
}

export interface DateTimeSetting extends SettingDefinition<string | Date> {
  type: "date" | "time" | "datetime";
  validation?: SettingValidation<string | Date> & {
    minDate?: Date;
    maxDate?: Date;
    format?: string;
  };
}

export interface JsonSetting extends SettingDefinition<object> {
  type: "json";
  validation?: SettingValidation<object> & {
    schema?: object; // JSON Schema
  };
}

// Default configurations
export const DEFAULT_SETTINGS_CONFIG: SettingsConfiguration = {
  schema: {
    version: "1.0.0",
    settings: {},
    groups: {},
  },
  storage: {
    default: "localStorage",
    prefix: "reynard_settings_",
    encrypt: false,
    compression: false,
    syncInterval: 1000,
  },
  validation: {
    validateOnChange: true,
    validateOnSave: true,
    showErrorsImmediately: false,
  },
  migration: {
    autoMigrate: true,
  },
  backup: {
    enabled: true,
    maxBackups: 5,
    interval: 60000, // 1 minute
  },
  debug: {
    enabled: false,
    level: "warn",
  },
};

export const COMMON_SETTING_CATEGORIES: Record<SettingCategory, CategoryConfig> = {
  general: {
    name: "General",
    description: "Basic application settings",
    icon: "settings",
    order: 1,
  },
  appearance: {
    name: "Appearance", 
    description: "Visual and theme settings",
    icon: "palette",
    order: 2,
  },
  behavior: {
    name: "Behavior",
    description: "Application behavior settings",
    icon: "tune",
    order: 3,
  },
  privacy: {
    name: "Privacy",
    description: "Privacy and data settings",
    icon: "privacy_tip", 
    order: 4,
  },
  security: {
    name: "Security",
    description: "Security and authentication settings",
    icon: "security",
    order: 5,
  },
  performance: {
    name: "Performance",
    description: "Performance optimization settings",
    icon: "speed",
    order: 6,
  },
  accessibility: {
    name: "Accessibility",
    description: "Accessibility and usability settings", 
    icon: "accessibility",
    order: 7,
  },
  advanced: {
    name: "Advanced",
    description: "Advanced configuration options",
    icon: "engineering",
    order: 8,
  },
  experimental: {
    name: "Experimental",
    description: "Experimental features and settings",
    icon: "science",
    order: 9,
  },
  integrations: {
    name: "Integrations",
    description: "Third-party service integrations",
    icon: "extension",
    order: 10,
  },
  ai: {
    name: "AI & ML",
    description: "Artificial intelligence settings",
    icon: "psychology",
    order: 11,
  },
  media: {
    name: "Media",
    description: "Media processing and display settings",
    icon: "photo_library",
    order: 12,
  },
  datetime: {
    name: "Date & Time",
    description: "Date, time, and timezone settings",
    icon: "schedule",
    order: 13,
  },
  custom: {
    name: "Custom",
    description: "Custom user-defined settings",
    icon: "build",
    order: 14,
  },
};




