/**
 * Settings Panel Component
 * Complete settings interface with categories, search, and controls
 */
import { Component } from "solid-js";
import type { SettingCategory, SettingsConfiguration } from "../types";
export interface SettingsPanelProps {
  /** Settings configuration */
  config?: SettingsConfiguration;
  /** Panel title */
  title?: string;
  /** Whether panel is in modal mode */
  modal?: boolean;
  /** Whether to show search */
  showSearch?: boolean;
  /** Whether to show categories */
  showCategories?: boolean;
  /** Whether to show import/export */
  showImportExport?: boolean;
  /** Whether to show reset options */
  showReset?: boolean;
  /** Default category to show */
  defaultCategory?: SettingCategory;
  /** Custom class name */
  class?: string;
  /** Close handler for modal mode */
  onClose?: () => void;
}
export declare const SettingsPanel: Component<SettingsPanelProps>;
