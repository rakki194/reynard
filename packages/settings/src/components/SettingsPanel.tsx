/**
 * Settings Panel Component
 * Complete settings interface with categories, search, and controls
 */

import {
  Component,
  createSignal,
  createMemo,
  Show,
  For,
  splitProps,
} from "solid-js";
import { Button, TextField, Modal, Tabs } from "reynard-components";
import type {
  SettingDefinition,
  SettingCategory,
  SettingsSearch,
  SettingsExportData,
  SettingsConfiguration,
} from "../types";
import { COMMON_SETTING_CATEGORIES } from "../types";
import { useSettings } from "../composables/useSettings";
import { SettingControl } from "./SettingControl";
import { isSettingVisible } from "../utils";

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

const defaultProps = {
  title: "Settings",
  modal: false,
  showSearch: true,
  showCategories: true,
  showImportExport: true,
  showReset: true,
  defaultCategory: "general" as SettingCategory,
};

export const SettingsPanel: Component<SettingsPanelProps> = (props) => {
  const merged = { ...defaultProps, ...props };
  const [local] = splitProps(merged, [
    "config",
    "title",
    "modal",
    "showSearch",
    "showCategories",
    "showImportExport",
    "showReset",
    "defaultCategory",
    "class",
    "onClose",
  ]);

  // Settings management
  const settingsInstance = createMemo(() =>
    useSettings({ config: local.config }),
  );
  const settings = createMemo(() => settingsInstance());

  // UI state
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedCategory, setSelectedCategory] = createSignal<SettingCategory>(
    local.defaultCategory,
  );
  const [showExportModal, setShowExportModal] = createSignal(false);
  const [showImportModal, setShowImportModal] = createSignal(false);
  const [showResetModal, setShowResetModal] = createSignal(false);
  const [importData, setImportData] = createSignal("");

  // Get available categories
  const availableCategories = createMemo(() => {
    const definitions = settings().settingsState().values;
    const schema = local.config?.schema;
    if (!schema?.settings) return [];

    const categories = new Set<SettingCategory>();

    for (const definition of Object.values(
      schema.settings,
    ) as SettingDefinition[]) {
      if (isSettingVisible(definition, definitions)) {
        categories.add(definition.category);
      }
    }

    return Array.from(categories).sort((a, b) => {
      const aConfig = COMMON_SETTING_CATEGORIES[a];
      const bConfig = COMMON_SETTING_CATEGORIES[b];
      return (aConfig?.order || 999) - (bConfig?.order || 999);
    });
  });

  // Search and filter settings
  const filteredSettings = createMemo(() => {
    const schema = local.config?.schema;
    if (!schema?.settings) return [];

    const search: SettingsSearch = {
      query: searchQuery(),
      category: selectedCategory(),
      includeHidden: false,
      includeExperimental: true,
    };

    const result = settings().searchSettings(search);

    // Filter by visibility
    const values = settings().settingsState().values;
    return result.settings.filter((setting) =>
      isSettingVisible(setting, values),
    );
  });

  // Group settings by category
  const settingsByCategory = createMemo(() => {
    const grouped: Record<SettingCategory, SettingDefinition[]> = {} as Record<
      SettingCategory,
      SettingDefinition[]
    >;

    // Initialize with empty arrays for all categories
    for (const category of availableCategories()) {
      grouped[category] = [];
    }

    for (const setting of filteredSettings()) {
      if (!grouped[setting.category]) {
        grouped[setting.category] = [];
      }
      grouped[setting.category].push(setting);
    }

    // Sort settings within each category by order
    for (const category of Object.keys(grouped)) {
      grouped[category as SettingCategory].sort(
        (a, b) => (a.order || 999) - (b.order || 999),
      );
    }

    return grouped;
  });

  // Handle setting changes
  const handleSettingChange = async (
    key: string,
    value: string | number | boolean | string[] | Record<string, unknown>,
  ) => {
    await settings().setSetting(key, value);
  };

  // Handle export
  const handleExport = async () => {
    try {
      const data = await settings().exportSettings();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `settings-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowExportModal(false);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Handle import
  const handleImport = async () => {
    try {
      const data: SettingsExportData = JSON.parse(importData());
      await settings().importSettings(data, { merge: true });
      setShowImportModal(false);
      setImportData("");
    } catch (error) {
      console.error("Import failed:", error);
    }
  };

  // Handle file import
  const handleFileImport = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
      };
      reader.readAsText(file);
    }
  };

  // Handle reset
  const handleReset = async () => {
    await settings().resetAllSettings();
    setShowResetModal(false);
  };

  // Panel content
  const panelContent = () => (
    <div class={`settings-panel ${local.class || ""}`}>
      {/* Header */}
      <div class="settings-panel__header">
        <div class="settings-panel__title-section">
          <h2 class="settings-panel__title">{local.title}</h2>

          <Show when={settings().hasUnsavedChanges()}>
            <span class="settings-panel__unsaved-indicator">
              • Unsaved changes
            </span>
          </Show>
        </div>

        <div class="settings-panel__actions">
          <Show when={local.showImportExport}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowExportModal(true)}
            >
              Export
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowImportModal(true)}
            >
              Import
            </Button>
          </Show>

          <Show when={local.showReset}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowResetModal(true)}
            >
              Reset
            </Button>
          </Show>

          <Show when={settings().hasUnsavedChanges()}>
            <Button
              variant="primary"
              size="sm"
              loading={settings().isSaving()}
              onClick={() => settings().saveSettings()}
            >
              Save
            </Button>
          </Show>

          <Show when={local.modal && local.onClose}>
            <Button variant="ghost" size="sm" onClick={local.onClose}>
              ✕
            </Button>
          </Show>
        </div>
      </div>

      {/* Search */}
      <Show when={local.showSearch}>
        <div class="settings-panel__search">
          <TextField
            placeholder="Search settings..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Show>

      {/* Categories */}
      <Show when={local.showCategories && availableCategories().length > 1}>
        <div class="settings-panel__categories">
          <Tabs
            items={availableCategories().map((category) => {
              const config = COMMON_SETTING_CATEGORIES[category];
              return {
                id: category,
                label: config?.name || category,
                icon: config?.icon ? <span>{config.icon}</span> : undefined,
              };
            })}
            activeTab={selectedCategory()}
            onTabChange={(tabId) =>
              setSelectedCategory(tabId as SettingCategory)
            }
            variant="pills"
          />
        </div>
      </Show>

      {/* Settings Content */}
      <div class="settings-panel__content">
        <Show when={settings().isLoading()}>
          <div class="settings-panel__loading">Loading settings...</div>
        </Show>

        <Show when={!settings().isLoading() && filteredSettings().length === 0}>
          <div class="settings-panel__empty">
            <Show when={searchQuery()}>
              No settings match your search: "{searchQuery()}"
            </Show>
            <Show when={!searchQuery()}>
              No settings available in this category.
            </Show>
          </div>
        </Show>

        <Show when={!settings().isLoading() && filteredSettings().length > 0}>
          <div class="settings-panel__settings">
            <Show
              when={!local.showCategories || availableCategories().length <= 1}
            >
              {/* Single category view */}
              <For each={filteredSettings()}>
                {(setting) => (
                  <SettingControl
                    definition={setting}
                    value={settings().getSetting(setting.key)}
                    onChange={(value) =>
                      handleSettingChange(setting.key, value)
                    }
                    error={
                      settings().settingsState().validationErrors[setting.key]
                    }
                  />
                )}
              </For>
            </Show>

            <Show
              when={local.showCategories && availableCategories().length > 1}
            >
              {/* Multi-category view */}
              <For each={availableCategories()}>
                {(category) => {
                  const categorySettings = settingsByCategory()[category] || [];
                  if (
                    selectedCategory() !== "general" &&
                    selectedCategory() !== category
                  ) {
                    return null;
                  }

                  if (categorySettings.length === 0) return null;

                  const config = COMMON_SETTING_CATEGORIES[category];

                  return (
                    <div class="settings-panel__category-section">
                      <Show when={selectedCategory() === "general"}>
                        <h3 class="settings-panel__category-title">
                          <Show when={config?.icon}>
                            <span class="settings-panel__category-icon">
                              {config!.icon}
                            </span>
                          </Show>
                          {config?.name || category}
                        </h3>
                      </Show>

                      <div class="settings-panel__category-settings">
                        <For each={categorySettings}>
                          {(setting) => (
                            <SettingControl
                              definition={setting}
                              value={settings().getSetting(setting.key)}
                              onChange={(value) =>
                                handleSettingChange(setting.key, value)
                              }
                              error={
                                settings().settingsState().validationErrors[
                                  setting.key
                                ]
                              }
                            />
                          )}
                        </For>
                      </div>
                    </div>
                  );
                }}
              </For>
            </Show>
          </div>
        </Show>
      </div>

      {/* Export Modal */}
      <Modal
        open={showExportModal()}
        onClose={() => setShowExportModal(false)}
        title="Export Settings"
      >
        <div class="settings-panel__export-modal">
          <p>Export your current settings to a JSON file.</p>
          <div class="settings-panel__modal-actions">
            <Button
              variant="secondary"
              onClick={() => setShowExportModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExport}>
              Export
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        open={showImportModal()}
        onClose={() => setShowImportModal(false)}
        title="Import Settings"
      >
        <div class="settings-panel__import-modal">
          <p>Import settings from a JSON file or paste JSON data.</p>

          <div class="settings-panel__import-options">
            <label
              for="settings-import-file"
              class="settings-panel__file-input-label"
            >
              Choose a JSON file:
            </label>
            <input
              id="settings-import-file"
              type="file"
              accept=".json"
              onChange={handleFileImport}
              class="settings-panel__file-input"
              aria-label="Import settings from JSON file"
            />

            <label
              for="settings-import-textarea"
              class="settings-panel__textarea-label"
            >
              Or paste JSON data here:
            </label>
            <textarea
              id="settings-import-textarea"
              placeholder="Or paste JSON data here..."
              value={importData()}
              onInput={(e) => setImportData(e.target.value)}
              class="settings-panel__import-textarea"
              aria-label="Paste JSON data for import"
            />
          </div>

          <div class="settings-panel__modal-actions">
            <Button
              variant="secondary"
              onClick={() => {
                setShowImportModal(false);
                setImportData("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!importData()}
              onClick={handleImport}
            >
              Import
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Modal */}
      <Modal
        open={showResetModal()}
        onClose={() => setShowResetModal(false)}
        title="Reset Settings"
      >
        <div class="settings-panel__reset-modal">
          <p>
            Are you sure you want to reset all settings to their default values?
            This action cannot be undone.
          </p>

          <div class="settings-panel__modal-actions">
            <Button
              variant="secondary"
              onClick={() => setShowResetModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReset}>
              Reset All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  // Return modal or direct content
  return (
    <Show when={local.modal} fallback={panelContent()}>
      <Modal open={true} onClose={local.onClose} size="lg" title={local.title}>
        {panelContent()}
      </Modal>
    </Show>
  );
};
