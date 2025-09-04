/**
 * Settings Composable
 * Main settings management hook with reactive state and persistence
 */
import { createSignal, onMount, onCleanup, createMemo } from "solid-js";
import { DEFAULT_SETTINGS_CONFIG } from "../types";
import { StorageManager } from "../storage";
import {
  validateSetting,
  validateAllSettings,
  migrateSettingValue,
} from "../utils";
export function useSettings(options = {}) {
  const config = { ...DEFAULT_SETTINGS_CONFIG, ...options.config };
  const {
    autoSave = true,
    autoSaveDelay = 1000,
    validateOnLoad = true,
    callbacks = {},
    initialValues = {},
    loadOnMount = true,
  } = options;
  // Storage manager
  const storageManager = new StorageManager(
    config.storage?.default || "localStorage",
    config.storage?.prefix || "reynard_settings_",
  );
  // Settings state
  const [settingsState, setSettingsState] = createSignal({
    values: { ...initialValues },
    loading: false,
    saving: false,
    error: null,
    validationErrors: {},
    hasChanges: false,
    version: config.schema.version,
  });
  // Auto-save timer
  let autoSaveTimer = null;
  // Update settings state helper
  const updateState = (updates) => {
    setSettingsState((prev) => ({ ...prev, ...updates }));
  };
  // Get setting definition
  const getSettingDefinition = (key) => {
    return config.schema.settings[key];
  };
  // Get setting value with fallback to default
  const getSetting = (key) => {
    const state = settingsState();
    const definition = getSettingDefinition(key);
    if (key in state.values) {
      return state.values[key];
    }
    return definition?.defaultValue;
  };
  // Set setting value with validation
  const setSetting = async (key, value) => {
    const definition = getSettingDefinition(key);
    if (!definition) {
      console.warn(`Setting definition not found: ${key}`);
      return false;
    }
    // Validate the value
    const validation = validateSetting(definition, value);
    if (!validation.isValid) {
      updateState({
        validationErrors: {
          ...settingsState().validationErrors,
          [key]: validation.error || "Invalid value",
        },
      });
      if (config.validation?.showErrorsImmediately) {
        callbacks.onValidationError?.({
          [key]: validation.error || "Invalid value",
        });
      }
      return false;
    }
    // Clear validation error for this setting
    const newValidationErrors = { ...settingsState().validationErrors };
    delete newValidationErrors[key];
    // Get old value for callback
    const oldValue = getSetting(key);
    // Update setting value
    updateState({
      values: {
        ...settingsState().values,
        [key]: value,
      },
      validationErrors: newValidationErrors,
      hasChanges: true,
    });
    // Trigger change callback
    callbacks.onChange?.(key, value, oldValue);
    // Schedule auto-save
    if (autoSave) {
      scheduleAutoSave();
    }
    return true;
  };
  // Set multiple settings at once
  const setSettings = async (settings) => {
    let allValid = true;
    const newValues = { ...settingsState().values };
    const newValidationErrors = { ...settingsState().validationErrors };
    // Validate all settings first
    for (const [key, value] of Object.entries(settings)) {
      const definition = getSettingDefinition(key);
      if (!definition) {
        console.warn(`Setting definition not found: ${key}`);
        continue;
      }
      const validation = validateSetting(definition, value);
      if (!validation.isValid) {
        newValidationErrors[key] = validation.error || "Invalid value";
        allValid = false;
      } else {
        delete newValidationErrors[key];
        newValues[key] = value;
      }
    }
    // Update state
    updateState({
      values: newValues,
      validationErrors: newValidationErrors,
      hasChanges: true,
    });
    if (!allValid && config.validation?.showErrorsImmediately) {
      callbacks.onValidationError?.(newValidationErrors);
    }
    // Trigger change callbacks
    for (const [key, value] of Object.entries(settings)) {
      if (key in newValues) {
        callbacks.onChange?.(key, value, getSetting(key));
      }
    }
    // Schedule auto-save
    if (autoSave) {
      scheduleAutoSave();
    }
    return allValid;
  };
  // Reset setting to default value
  const resetSetting = async (key) => {
    const definition = getSettingDefinition(key);
    if (!definition) return;
    await setSetting(key, definition.defaultValue);
  };
  // Reset all settings to defaults
  const resetAllSettings = async () => {
    const defaultValues = {};
    for (const [key, definition] of Object.entries(config.schema.settings)) {
      defaultValues[key] = definition.defaultValue;
    }
    updateState({
      values: defaultValues,
      validationErrors: {},
      hasChanges: true,
    });
    callbacks.onReset?.();
    if (autoSave) {
      scheduleAutoSave();
    }
  };
  // Schedule auto-save
  const scheduleAutoSave = () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    autoSaveTimer = setTimeout(() => {
      saveSettings().catch(console.error);
    }, autoSaveDelay);
  };
  // Save settings to storage
  const saveSettings = async () => {
    updateState({ saving: true, error: null });
    try {
      // Validate all settings if enabled
      if (config.validation?.validateOnSave) {
        const validation = validateAllSettings(
          config.schema.settings,
          settingsState().values,
        );
        if (!validation.isValid) {
          updateState({
            saving: false,
            validationErrors: validation.errors,
            error: "Validation failed",
          });
          callbacks.onValidationError?.(validation.errors);
          return;
        }
      }
      // Save each setting to storage
      for (const [key, value] of Object.entries(settingsState().values)) {
        const definition = getSettingDefinition(key);
        if (!definition) continue;
        try {
          const serializedValue = definition.serialize
            ? definition.serialize(value)
            : JSON.stringify(value);
          await storageManager.set(key, serializedValue, definition.storage);
        } catch (error) {
          console.error(`Failed to save setting ${key}:`, error);
          callbacks.onStorageError?.(error);
        }
      }
      // Save metadata
      await storageManager.set(
        "__metadata__",
        JSON.stringify({
          version: config.schema.version,
          lastSaved: new Date().toISOString(),
        }),
      );
      updateState({
        saving: false,
        hasChanges: false,
        lastSaved: new Date(),
      });
      callbacks.onSave?.(settingsState().values);
    } catch (error) {
      updateState({
        saving: false,
        error: error instanceof Error ? error.message : "Save failed",
      });
      callbacks.onStorageError?.(error);
    }
  };
  // Load settings from storage
  const loadSettings = async () => {
    updateState({ loading: true, error: null });
    try {
      const loadedValues = {};
      // Load metadata first
      let metadata = {};
      try {
        const metadataStr = await storageManager.get("__metadata__");
        if (metadataStr) {
          metadata = JSON.parse(metadataStr);
        }
      } catch (error) {
        console.warn("Failed to load metadata:", error);
      }
      // Load each setting
      for (const [key, definition] of Object.entries(config.schema.settings)) {
        try {
          const stored = await storageManager.get(key, definition.storage);
          if (stored !== null) {
            let value;
            if (definition.deserialize) {
              value = definition.deserialize(stored);
            } else {
              value = JSON.parse(stored);
            }
            // Migrate value if needed
            if (
              definition.migrate &&
              metadata.version !== config.schema.version
            ) {
              value = migrateSettingValue(
                definition,
                value,
                metadata.version || "0.0.0",
              );
            }
            loadedValues[key] = value;
          } else {
            // Use default value if not stored
            loadedValues[key] = definition.defaultValue;
          }
        } catch (error) {
          console.warn(`Failed to load setting ${key}:`, error);
          loadedValues[key] = definition.defaultValue;
        }
      }
      // Validate loaded settings if enabled
      if (validateOnLoad) {
        const validation = validateAllSettings(
          config.schema.settings,
          loadedValues,
        );
        if (!validation.isValid) {
          updateState({
            validationErrors: validation.errors,
          });
          // Use defaults for invalid settings
          for (const [key, error] of Object.entries(validation.errors)) {
            const definition = getSettingDefinition(key);
            if (definition) {
              loadedValues[key] = definition.defaultValue;
            }
          }
        }
      }
      updateState({
        values: loadedValues,
        loading: false,
        hasChanges: false,
        lastSaved: metadata.lastSaved
          ? new Date(metadata.lastSaved)
          : undefined,
        version: config.schema.version,
      });
      callbacks.onLoad?.(loadedValues);
      // Handle migration callback
      if (metadata.version && metadata.version !== config.schema.version) {
        callbacks.onMigration?.(metadata.version, config.schema.version);
      }
    } catch (error) {
      updateState({
        loading: false,
        error: error instanceof Error ? error.message : "Load failed",
      });
      callbacks.onStorageError?.(error);
    }
  };
  // Export settings
  const exportSettings = async () => {
    return storageManager.export(config.storage?.default);
  };
  // Import settings
  const importSettings = async (data, options = {}) => {
    try {
      await storageManager.import(data, {
        merge: options.merge,
        storageType: config.storage?.default,
      });
      // Reload settings
      await loadSettings();
    } catch (error) {
      callbacks.onStorageError?.(error);
      throw error;
    }
  };
  // Search settings
  const searchSettings = (query) => {
    const startTime = performance.now();
    const allSettings = Object.values(config.schema.settings);
    let filteredSettings = allSettings;
    // Apply filters
    if (query.query) {
      const searchTerm = query.query.toLowerCase();
      filteredSettings = filteredSettings.filter(
        (setting) =>
          setting.label.toLowerCase().includes(searchTerm) ||
          setting.description?.toLowerCase().includes(searchTerm) ||
          setting.key.toLowerCase().includes(searchTerm) ||
          setting.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)),
      );
    }
    if (query.category) {
      filteredSettings = filteredSettings.filter(
        (setting) => setting.category === query.category,
      );
    }
    if (query.type) {
      filteredSettings = filteredSettings.filter(
        (setting) => setting.type === query.type,
      );
    }
    if (query.scope) {
      filteredSettings = filteredSettings.filter(
        (setting) => setting.scope === query.scope,
      );
    }
    if (query.tags && query.tags.length > 0) {
      filteredSettings = filteredSettings.filter((setting) =>
        setting.tags?.some((tag) => query.tags.includes(tag)),
      );
    }
    if (!query.includeHidden) {
      filteredSettings = filteredSettings.filter((setting) => !setting.hidden);
    }
    if (!query.includeExperimental) {
      filteredSettings = filteredSettings.filter(
        (setting) => !setting.experimental,
      );
    }
    const duration = performance.now() - startTime;
    return {
      settings: filteredSettings,
      total: filteredSettings.length,
      meta: {
        query: query.query || "",
        filters: query,
        duration,
      },
    };
  };
  // Computed values
  const hasUnsavedChanges = createMemo(() => settingsState().hasChanges);
  const hasValidationErrors = createMemo(
    () => Object.keys(settingsState().validationErrors).length > 0,
  );
  const isLoading = createMemo(() => settingsState().loading);
  const isSaving = createMemo(() => settingsState().saving);
  // Auto-load settings on mount
  onMount(() => {
    if (loadOnMount) {
      loadSettings().catch(console.error);
    }
  });
  // Cleanup on unmount
  onCleanup(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
  });
  return {
    // State
    settingsState,
    hasUnsavedChanges,
    hasValidationErrors,
    isLoading,
    isSaving,
    // Getters
    getSetting,
    getSettingDefinition,
    // Setters
    setSetting,
    setSettings,
    resetSetting,
    resetAllSettings,
    // Persistence
    saveSettings,
    loadSettings,
    // Import/Export
    exportSettings,
    importSettings,
    // Search
    searchSettings,
    // Storage
    storageManager,
  };
}
