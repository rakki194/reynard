/**
 * Model Management Settings Component
 * Configuration for AI model management and optimization
 */

import { Component, Show, createSignal, createEffect } from "solid-js";
import { Button, TextField, Select, Tabs } from "reynard-components";
import { Toggle } from "./Toggle";
import { useSettings } from "../composables/useSettings";

export interface ModelManagementSettingsProps {
  /** Settings instance */
  settings?: ReturnType<typeof useSettings>;
  /** Custom class name */
  class?: string;
}

export const ModelManagementSettings: Component<
  ModelManagementSettingsProps
> = (props) => {
  const settings = props.settings || useSettings();
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal("general");

  // Model management configuration state
  const [autoDownload, setAutoDownload] = createSignal(true);
  const [preloadModels, setPreloadModels] = createSignal(false);
  const [maxConcurrentModels, setMaxConcurrentModels] = createSignal(3);
  const [modelCacheSize, setModelCacheSize] = createSignal(10);
  const [enableModelSharing, setEnableModelSharing] = createSignal(true);
  const [defaultDevice, setDefaultDevice] = createSignal("auto");
  const [enableQuantization, setEnableQuantization] = createSignal(true);
  const [quantizationBits, setQuantizationBits] = createSignal(8);

  // Load settings on mount
  createEffect(() => {
    loadModelSettings();
  });

  const loadModelSettings = async () => {
    setIsLoading(true);
    try {
      setAutoDownload(settings.getSetting("models.auto_download") || true);
      setPreloadModels(settings.getSetting("models.preload") || false);
      setMaxConcurrentModels(
        settings.getSetting("models.max_concurrent") || 3,
      );
      setModelCacheSize(settings.getSetting("models.cache_size") || 10);
      setEnableModelSharing(
        settings.getSetting("models.enable_sharing") || true,
      );
      setDefaultDevice(
        settings.getSetting("models.default_device") || "auto",
      );
      setEnableQuantization(
        settings.getSetting("models.enable_quantization") || true,
      );
      setQuantizationBits(
        settings.getSetting("models.quantization_bits") || 8,
      );
    } catch (error) {
      console.error("Failed to load model management settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveModelSettings = async () => {
    setIsSaving(true);
    try {
      await settings.setSetting("models.auto_download", autoDownload());
      await settings.setSetting("models.preload", preloadModels());
      await settings.setSetting(
        "models.max_concurrent",
        maxConcurrentModels(),
      );
      await settings.setSetting("models.cache_size", modelCacheSize());
      await settings.setSetting(
        "models.enable_sharing",
        enableModelSharing(),
      );
      await settings.setSetting("models.default_device", defaultDevice());
      await settings.setSetting(
        "models.enable_quantization",
        enableQuantization(),
      );
      await settings.setSetting(
        "models.quantization_bits",
        quantizationBits(),
      );

      await settings.saveSettings();
    } catch (error) {
      console.error("Failed to save model management settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const deviceOptions = [
    { value: "auto", label: "Auto" },
    { value: "cuda", label: "CUDA" },
    { value: "cpu", label: "CPU" },
    { value: "mps", label: "MPS (Apple Silicon)" },
  ];

  const quantizationOptions = [
    { value: 4, label: "4-bit (Most Efficient)" },
    { value: 8, label: "8-bit (Balanced)" },
    { value: 16, label: "16-bit (High Quality)" },
  ];

  const tabs = [
    { id: "general", label: "General" },
    { id: "performance", label: "Performance" },
    { id: "storage", label: "Storage" },
    { id: "advanced", label: "Advanced" },
  ];

  return (
    <div class={`model-management-settings ${props.class || ""}`}>
      <div class="settings-section">
        <h3>Model Management</h3>
        <p class="settings-description">
          Configure AI model management, downloading, and optimization settings.
        </p>

        <Show when={isLoading()}>
          <div class="loading-state">
            Loading model management configuration...
          </div>
        </Show>

        <Show when={!isLoading()}>
          <Tabs
            items={tabs}
            activeTab={activeTab()}
            onTabChange={setActiveTab}
            variant="underline"
          />

          {/* General Settings Tab */}
          <Show when={activeTab() === "general"}>
            <div class="setting-group">
              <h4>General Model Settings</h4>
              <p class="setting-description">
                Basic model management configuration.
              </p>

              <div class="setting-row">
                <Toggle
                  checked={autoDownload()}
                  onChange={setAutoDownload}
                  label="Auto-download Models"
                  helperText="Automatically download required models when needed"
                />
              </div>

              <div class="setting-row">
                <Toggle
                  checked={preloadModels()}
                  onChange={setPreloadModels}
                  label="Preload Models"
                  helperText="Preload frequently used models for faster access"
                />
              </div>

              <div class="setting-row">
                <Select
                  label="Default Device"
                  value={defaultDevice()}
                  onChange={setDefaultDevice}
                  options={deviceOptions}
                  helperText="Default device for model execution"
                />
              </div>

              <div class="setting-row">
                <Toggle
                  checked={enableModelSharing()}
                  onChange={setEnableModelSharing}
                  label="Enable Model Sharing"
                  helperText="Allow sharing of model files between instances"
                />
              </div>
            </div>
          </Show>

          {/* Performance Settings Tab */}
          <Show when={activeTab() === "performance"}>
            <div class="setting-group">
              <h4>Performance Optimization</h4>
              <p class="setting-description">
                Configure model performance and resource usage.
              </p>

              <div class="setting-row">
                <TextField
                  label="Max Concurrent Models"
                  type="number"
                  value={maxConcurrentModels()}
                  onChange={(value) =>
                    setMaxConcurrentModels(parseInt(value) || 3)
                  }
                  helperText="Maximum number of models to load simultaneously"
                 
                />
              </div>

              <div class="setting-row">
                <Toggle
                  checked={enableQuantization()}
                  onChange={setEnableQuantization}
                  label="Enable Quantization"
                  helperText="Use quantized models for reduced memory usage"
                />
              </div>

              <Show when={enableQuantization()}>
                <div class="setting-row">
                  <Select
                    label="Quantization Bits"
                    value={quantizationBits()}
                    onChange={(value) =>
                      setQuantizationBits(parseInt(value) || 8)
                    }
                    options={quantizationOptions}
                    helperText="Quantization precision (lower = more efficient, higher = better quality)"
                  />
                </div>
              </Show>
            </div>
          </Show>

          {/* Storage Settings Tab */}
          <Show when={activeTab() === "storage"}>
            <div class="setting-group">
              <h4>Storage Management</h4>
              <p class="setting-description">
                Configure model storage and caching.
              </p>

              <div class="setting-row">
                <TextField
                  label="Model Cache Size (GB)"
                  type="number"
                  value={modelCacheSize()}
                  onChange={(e) => setModelCacheSize(parseInt(e.target.value) || 10)}
                  helperText="Maximum disk space for model cache"
                 
                />
              </div>

              <div class="setting-row">
                <Button variant="secondary">Clear Model Cache</Button>
              </div>

              <div class="setting-row">
                <Button variant="secondary">View Storage Usage</Button>
              </div>
            </div>
          </Show>

          {/* Advanced Settings Tab */}
          <Show when={activeTab() === "advanced"}>
            <div class="setting-group">
              <h4>Advanced Configuration</h4>
              <p class="setting-description">
                Advanced model management options.
              </p>

              <div class="setting-row">
                <Button variant="secondary">Export Model Registry</Button>
              </div>

              <div class="setting-row">
                <Button variant="secondary">Import Model Registry</Button>
              </div>

              <div class="setting-row">
                <Button variant="secondary">Reset Model Settings</Button>
              </div>

              <div class="setting-row">
                <Button variant="secondary">Validate Model Integrity</Button>
              </div>
            </div>
          </Show>

          {/* Model Status Summary */}
          <div class="setting-group">
            <h4>Current Configuration</h4>
            <div class="config-summary">
              <div class="config-item">
                <span class="config-label">Auto-download:</span>
                <span class="config-value">
                  {autoDownload() ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div class="config-item">
                <span class="config-label">Preload:</span>
                <span class="config-value">
                  {preloadModels() ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div class="config-item">
                <span class="config-label">Max Concurrent:</span>
                <span class="config-value">{maxConcurrentModels()}</span>
              </div>
              <div class="config-item">
                <span class="config-label">Cache Size:</span>
                <span class="config-value">{modelCacheSize()}GB</span>
              </div>
              <div class="config-item">
                <span class="config-label">Device:</span>
                <span class="config-value">{defaultDevice()}</span>
              </div>
              <div class="config-item">
                <span class="config-label">Quantization:</span>
                <span class="config-value">
                  {enableQuantization()
                    ? `${quantizationBits()}-bit`
                    : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div class="settings-actions">
            <Button
              variant="primary"
              onClick={saveModelSettings}
              loading={isSaving()}
              disabled={isSaving()}
            >
              Save Model Settings
            </Button>
          </div>
        </Show>
      </div>
    </div>
  );
};
