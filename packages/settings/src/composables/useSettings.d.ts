/**
 * Settings Composable
 * Main settings management hook with reactive state and persistence
 */
import type {
  SettingsManagerOptions,
  SettingsState,
  SettingDefinition,
  SettingsExportData,
  SettingsImportOptions,
  SettingsSearch,
  SettingsSearchResult,
} from "../types";
import { StorageManager } from "../storage";
export interface UseSettingsOptions extends Partial<SettingsManagerOptions> {
  /** Initial settings values */
  initialValues?: Record<string, any>;
  /** Whether to load settings on mount */
  loadOnMount?: boolean;
}
export declare function useSettings(options?: UseSettingsOptions): {
  settingsState: import("solid-js").Accessor<SettingsState>;
  hasUnsavedChanges: import("solid-js").Accessor<boolean>;
  hasValidationErrors: import("solid-js").Accessor<boolean>;
  isLoading: import("solid-js").Accessor<boolean>;
  isSaving: import("solid-js").Accessor<boolean>;
  getSetting: <T = any>(key: string) => T;
  getSettingDefinition: (key: string) => SettingDefinition | undefined;
  setSetting: (key: string, value: any) => Promise<boolean>;
  setSettings: (settings: Record<string, any>) => Promise<boolean>;
  resetSetting: (key: string) => Promise<void>;
  resetAllSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  exportSettings: () => Promise<SettingsExportData>;
  importSettings: (
    data: SettingsExportData,
    options?: SettingsImportOptions,
  ) => Promise<void>;
  searchSettings: (query: SettingsSearch) => SettingsSearchResult;
  storageManager: StorageManager;
};
