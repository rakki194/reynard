/**
 * Settings Types and Interfaces
 * Comprehensive type definitions for settings management
 */
// Default configurations
export const DEFAULT_SETTINGS_CONFIG = {
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
export const COMMON_SETTING_CATEGORIES = {
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
