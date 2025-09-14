/**
 * Service Management Settings Component
 * Configuration for service monitoring and management
 */

import { Component, Show, createSignal, createEffect } from "solid-js";
import { Button, TextField } from "reynard-components";
import { useSettings } from "../composables/useSettings";

export interface ServiceManagementSettingsProps {
  /** Settings instance */
  settings?: ReturnType<typeof useSettings>;
  /** Custom class name */
  class?: string;
}

export const ServiceManagementSettings: Component<
  ServiceManagementSettingsProps
> = (props) => {
  const settings = props.settings || useSettings();
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);

  // Service management configuration state
  const [autoRefresh, setAutoRefresh] = createSignal(true);
  const [refreshInterval, setRefreshInterval] = createSignal(5000);
  const [enableHealthChecks, setEnableHealthChecks] = createSignal(true);
  const [healthCheckInterval, setHealthCheckInterval] = createSignal(30000);
  const [enableAutoRestart, setEnableAutoRestart] = createSignal(false);
  const [restartDelay, setRestartDelay] = createSignal(5000);
  const [maxRestartAttempts, setMaxRestartAttempts] = createSignal(3);
  const [enableNotifications, setEnableNotifications] = createSignal(true);
  const [enableLogging, setEnableLogging] = createSignal(true);
  const [logLevel, setLogLevel] = createSignal("info");

  // Load settings on mount
  createEffect(() => {
    loadServiceSettings();
  });

  const loadServiceSettings = async () => {
    setIsLoading(true);
    try {
      setAutoRefresh(settings.getSetting("services.auto_refresh") || true);
      setRefreshInterval(
        settings.getSetting("services.refresh_interval") || 5000,
      );
      setEnableHealthChecks(
        settings.getSetting("services.enable_health_checks") || true,
      );
      setHealthCheckInterval(
        settings.getSetting("services.health_check_interval") || 30000,
      );
      setEnableAutoRestart(
        settings.getSetting("services.enable_auto_restart") || false,
      );
      setRestartDelay(settings.getSetting("services.restart_delay") || 5000);
      setMaxRestartAttempts(
        settings.getSetting("services.max_restart_attempts") || 3,
      );
      setEnableNotifications(
        settings.getSetting("services.enable_notifications") || true,
      );
      setEnableLogging(settings.getSetting("services.enable_logging") || true);
      setLogLevel(settings.getSetting("services.log_level") || "info");
    } catch (error) {
      console.error("Failed to load service management settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveServiceSettings = async () => {
    setIsSaving(true);
    try {
      await settings.setSetting("services.auto_refresh", autoRefresh());
      await settings.setSetting("services.refresh_interval", refreshInterval());
      await settings.setSetting(
        "services.enable_health_checks",
        enableHealthChecks(),
      );
      await settings.setSetting(
        "services.health_check_interval",
        healthCheckInterval(),
      );
      await settings.setSetting(
        "services.enable_auto_restart",
        enableAutoRestart(),
      );
      await settings.setSetting("services.restart_delay", restartDelay());
      await settings.setSetting(
        "services.max_restart_attempts",
        maxRestartAttempts(),
      );
      await settings.setSetting(
        "services.enable_notifications",
        enableNotifications(),
      );
      await settings.setSetting("services.enable_logging", enableLogging());
      await settings.setSetting("services.log_level", logLevel());

      await settings.saveSettings();
    } catch (error) {
      console.error("Failed to save service management settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const logLevels = [
    { value: "debug", label: "Debug" },
    { value: "info", label: "Info" },
    { value: "warn", label: "Warning" },
    { value: "error", label: "Error" },
  ];

  return (
    <div class={`service-management-settings ${props.class || ""}`}>
      <div class="settings-section">
        <h3>Service Management</h3>
        <p class="settings-description">
          Configure service monitoring, health checks, and management settings.
        </p>

        <Show when={isLoading()}>
          <div class="loading-state">
            Loading service management configuration...
          </div>
        </Show>

        <Show when={!isLoading()}>
          {/* Monitoring Settings */}
          <div class="setting-group">
            <h4>Monitoring Settings</h4>
            <p class="setting-description">
              Configure service monitoring and status updates.
            </p>

            <div class="setting-row">
              <Button
                checked={autoRefresh()}
                onChange={setAutoRefresh}
                label="Auto-refresh Status"
                helperText="Automatically refresh service status information"
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Refresh Interval (ms)"
                type="number"
                value={refreshInterval()}
                onChange={(value) =>
                  setRefreshInterval(parseInt(value) || 5000)
                }
                helperText="How often to refresh service status (in milliseconds)"
                disabled={!autoRefresh()}
              />
            </div>

            <div class="setting-row">
              <Button
                checked={enableHealthChecks()}
                onChange={setEnableHealthChecks}
                label="Enable Health Checks"
                helperText="Perform periodic health checks on services"
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Health Check Interval (ms)"
                type="number"
                value={healthCheckInterval()}
                onChange={(value) =>
                  setHealthCheckInterval(parseInt(value) || 30000)
                }
                helperText="How often to perform health checks (in milliseconds)"
                disabled={!enableHealthChecks()}
              />
            </div>
          </div>

          {/* Auto-restart Settings */}
          <div class="setting-group">
            <h4>Auto-restart Settings</h4>
            <p class="setting-description">
              Configure automatic service restart behavior.
            </p>

            <div class="setting-row">
              <Button
                checked={enableAutoRestart()}
                onChange={setEnableAutoRestart}
                label="Enable Auto-restart"
                helperText="Automatically restart failed services"
              />
            </div>

            <Show when={enableAutoRestart()}>
              <div class="setting-row">
                <TextField
                  label="Restart Delay (ms)"
                  type="number"
                  value={restartDelay()}
                  onChange={(e) =>
                    setRestartDelay(parseInt(e.target.value) || 5000)
                  }
                  helperText="Delay before attempting to restart a failed service"
                />
              </div>

              <div class="setting-row">
                <TextField
                  label="Max Restart Attempts"
                  type="number"
                  value={maxRestartAttempts()}
                  onChange={(value) =>
                    setMaxRestartAttempts(parseInt(value) || 3)
                  }
                  helperText="Maximum number of restart attempts before giving up"
                />
              </div>
            </Show>
          </div>

          {/* Notification Settings */}
          <div class="setting-group">
            <h4>Notification Settings</h4>
            <p class="setting-description">
              Configure service status notifications.
            </p>

            <div class="setting-row">
              <Button
                checked={enableNotifications()}
                onChange={setEnableNotifications}
                label="Enable Notifications"
                helperText="Show notifications for service status changes"
              />
            </div>
          </div>

          {/* Logging Settings */}
          <div class="setting-group">
            <h4>Logging Settings</h4>
            <p class="setting-description">
              Configure service management logging.
            </p>

            <div class="setting-row">
              <Button
                checked={enableLogging()}
                onChange={setEnableLogging}
                label="Enable Logging"
                helperText="Enable logging for service management activities"
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Log Level"
                value={logLevel()}
                onChange={setLogLevel}
                helperText="Minimum log level to record"
                disabled={!enableLogging()}
              />
            </div>
          </div>

          {/* Service Status Summary */}
          <div class="setting-group">
            <h4>Current Configuration</h4>
            <div class="config-summary">
              <div class="config-item">
                <span class="config-label">Auto-refresh:</span>
                <span class="config-value">
                  {autoRefresh() ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div class="config-item">
                <span class="config-label">Refresh Interval:</span>
                <span class="config-value">{refreshInterval()}ms</span>
              </div>
              <div class="config-item">
                <span class="config-label">Health Checks:</span>
                <span class="config-value">
                  {enableHealthChecks() ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div class="config-item">
                <span class="config-label">Health Check Interval:</span>
                <span class="config-value">{healthCheckInterval()}ms</span>
              </div>
              <div class="config-item">
                <span class="config-label">Auto-restart:</span>
                <span class="config-value">
                  {enableAutoRestart() ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div class="config-item">
                <span class="config-label">Max Restart Attempts:</span>
                <span class="config-value">{maxRestartAttempts()}</span>
              </div>
              <div class="config-item">
                <span class="config-label">Notifications:</span>
                <span class="config-value">
                  {enableNotifications() ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div class="config-item">
                <span class="config-label">Logging:</span>
                <span class="config-value">
                  {enableLogging() ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div class="config-item">
                <span class="config-label">Log Level:</span>
                <span class="config-value">{logLevel()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div class="settings-actions">
            <Button
              variant="primary"
              onClick={saveServiceSettings}
              loading={isSaving()}
              disabled={isSaving()}
            >
              Save Service Settings
            </Button>
          </div>
        </Show>
      </div>
    </div>
  );
};
