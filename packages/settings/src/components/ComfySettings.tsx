/**
 * ComfyUI Settings Component
 * Configuration for ComfyUI workflow automation
 */

import { Component, Show, createSignal, createEffect } from "solid-js";
import { Button, TextField, Toggle } from "reynard-components";
import { useSettings } from "../composables/useSettings";

export interface ComfySettingsProps {
  /** Settings instance */
  settings?: ReturnType<typeof useSettings>;
  /** Custom class name */
  class?: string;
}

export const ComfySettings: Component<ComfySettingsProps> = (props) => {
  const settings = props.settings || useSettings();
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);
  const [isTestingConnection, setIsTestingConnection] = createSignal(false);

  // ComfyUI configuration state
  const [enabled, setEnabled] = createSignal(false);
  const [apiUrl, setApiUrl] = createSignal("http://localhost:8188");
  const [timeoutSeconds, setTimeoutSeconds] = createSignal(300);
  const [retryAttempts, setRetryAttempts] = createSignal(3);
  const [enableQueue, setEnableQueue] = createSignal(true);
  const [maxQueueSize, setMaxQueueSize] = createSignal(10);
  const [autoDownloadModels, setAutoDownloadModels] = createSignal(true);
  const [modelCacheSize, setModelCacheSize] = createSignal(5);
  const [enableProgressTracking, setEnableProgressTracking] = createSignal(true);

  // Load settings on mount
  createEffect(() => {
    loadComfySettings();
  });

  const loadComfySettings = async () => {
    setIsLoading(true);
    try {
      setEnabled(settings().getSetting("comfy.enabled") || false);
      setApiUrl(settings().getSetting("comfy.api_url") || "http://localhost:8188");
      setTimeoutSeconds(settings().getSetting("comfy.timeout_seconds") || 300);
      setRetryAttempts(settings().getSetting("comfy.retry_attempts") || 3);
      setEnableQueue(settings().getSetting("comfy.enable_queue") || true);
      setMaxQueueSize(settings().getSetting("comfy.max_queue_size") || 10);
      setAutoDownloadModels(settings().getSetting("comfy.auto_download_models") || true);
      setModelCacheSize(settings().getSetting("comfy.model_cache_size") || 5);
      setEnableProgressTracking(settings().getSetting("comfy.enable_progress_tracking") || true);
    } catch (error) {
      console.error("Failed to load ComfyUI settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveComfySettings = async () => {
    setIsSaving(true);
    try {
      await settings().setSetting("comfy.enabled", enabled());
      await settings().setSetting("comfy.api_url", apiUrl());
      await settings().setSetting("comfy.timeout_seconds", timeoutSeconds());
      await settings().setSetting("comfy.retry_attempts", retryAttempts());
      await settings().setSetting("comfy.enable_queue", enableQueue());
      await settings().setSetting("comfy.max_queue_size", maxQueueSize());
      await settings().setSetting("comfy.auto_download_models", autoDownloadModels());
      await settings().setSetting("comfy.model_cache_size", modelCacheSize());
      await settings().setSetting("comfy.enable_progress_tracking", enableProgressTracking());
      
      await settings().saveSettings();
    } catch (error) {
      console.error("Failed to save ComfyUI settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      // TODO: Implement actual connection testing
      const response = await fetch(`${apiUrl()}/system_stats`);
      if (response.ok) {
        console.log("ComfyUI connection successful");
        // Show success message
      } else {
        console.error("ComfyUI connection failed");
        // Show error message
      }
    } catch (error) {
      console.error("ComfyUI connection test failed:", error);
      // Show error message
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div class={`comfy-settings ${props.class || ""}`}>
      <div class="settings-section">
        <h3>ComfyUI Integration</h3>
        <p class="settings-description">
          Configure ComfyUI workflow automation and model management.
        </p>

        <Show when={isLoading()}>
          <div class="loading-state">Loading ComfyUI configuration...</div>
        </Show>

        <Show when={!isLoading()}>
          {/* Core ComfyUI Settings */}
          <div class="setting-group">
            <h4>Core Settings</h4>
            <p class="setting-description">Basic ComfyUI integration configuration.</p>

            <div class="setting-row">
              <Toggle
                checked={enabled()}
                onChange={setEnabled}
                label="Enable ComfyUI"
                description="Enable ComfyUI workflow automation and integration"
              />
            </div>

            <div class="setting-row">
              <TextField
                label="API URL"
                value={apiUrl()}
                onChange={setApiUrl}
                placeholder="http://localhost:8188"
                description="ComfyUI server API endpoint URL"
                disabled={!enabled()}
              />
            </div>

            <div class="setting-row">
              <Button
                variant="secondary"
                onClick={testConnection}
                disabled={!enabled() || !apiUrl() || isTestingConnection()}
                loading={isTestingConnection()}
              >
                Test Connection
              </Button>
            </div>
          </div>

          {/* Connection Settings */}
          <div class="setting-group">
            <h4>Connection Settings</h4>
            <p class="setting-description">Configure connection timeouts and retry behavior.</p>

            <div class="setting-row">
              <TextField
                label="Request Timeout (seconds)"
                type="number"
                value={timeoutSeconds()}
                onChange={(value) => setTimeoutSeconds(parseInt(value) || 300)}
                description="Maximum time to wait for ComfyUI workflow completion"
                validation={{ min: 30, max: 1800 }}
                disabled={!enabled()}
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Retry Attempts"
                type="number"
                value={retryAttempts()}
                onChange={(value) => setRetryAttempts(parseInt(value) || 3)}
                description="Number of retry attempts for failed requests"
                validation={{ min: 0, max: 10 }}
                disabled={!enabled()}
              />
            </div>
          </div>

          {/* Queue Management */}
          <div class="setting-group">
            <h4>Queue Management</h4>
            <p class="setting-description">Configure workflow queue and processing behavior.</p>

            <div class="setting-row">
              <Toggle
                checked={enableQueue()}
                onChange={setEnableQueue}
                label="Enable Queue"
                description="Enable workflow queue for better resource management"
                disabled={!enabled()}
              />
            </div>

            <Show when={enableQueue()}>
              <div class="setting-row">
                <TextField
                  label="Max Queue Size"
                  type="number"
                  value={maxQueueSize()}
                  onChange={(value) => setMaxQueueSize(parseInt(value) || 10)}
                  description="Maximum number of workflows in queue"
                  validation={{ min: 1, max: 100 }}
                  disabled={!enabled()}
                />
              </div>
            </Show>
          </div>

          {/* Model Management */}
          <div class="setting-group">
            <h4>Model Management</h4>
            <p class="setting-description">Configure automatic model downloading and caching.</p>

            <div class="setting-row">
              <Toggle
                checked={autoDownloadModels()}
                onChange={setAutoDownloadModels}
                label="Auto-download Models"
                description="Automatically download required models when needed"
                disabled={!enabled()}
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Model Cache Size (GB)"
                type="number"
                value={modelCacheSize()}
                onChange={(value) => setModelCacheSize(parseInt(value) || 5)}
                description="Maximum disk space for model cache"
                validation={{ min: 1, max: 100 }}
                disabled={!enabled()}
              />
            </div>
          </div>

          {/* Progress Tracking */}
          <div class="setting-group">
            <h4>Progress Tracking</h4>
            <p class="setting-description">Configure workflow progress monitoring and reporting.</p>

            <div class="setting-row">
              <Toggle
                checked={enableProgressTracking()}
                onChange={setEnableProgressTracking}
                label="Enable Progress Tracking"
                description="Track and report workflow execution progress"
                disabled={!enabled()}
              />
            </div>
          </div>

          {/* Connection Status */}
          <Show when={enabled()}>
            <div class="setting-group">
              <h4>Connection Status</h4>
              <div class="connection-status">
                <div class="status-indicator">
                  <span class="status-dot"></span>
                  <span class="status-text">ComfyUI Integration Active</span>
                </div>
                <div class="status-details">
                  <div class="status-item">
                    <span class="status-label">API URL:</span>
                    <span class="status-value">{apiUrl()}</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">Timeout:</span>
                    <span class="status-value">{timeoutSeconds()}s</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">Queue:</span>
                    <span class="status-value">{enableQueue() ? "Enabled" : "Disabled"}</span>
                  </div>
                </div>
              </div>
            </div>
          </Show>

          {/* Actions */}
          <div class="settings-actions">
            <Button
              variant="primary"
              onClick={saveComfySettings}
              loading={isSaving()}
              disabled={isSaving()}
            >
              Save ComfyUI Settings
            </Button>
          </div>
        </Show>
      </div>
    </div>
  );
};
