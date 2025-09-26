/**
 * Advanced Config Watcher Component
 * Advanced configuration monitoring and management
 */

import { Component, Show, createSignal, createEffect } from "solid-js";
import { Button, TextField, Tabs } from "reynard-primitives";
import { useSettings } from "../composables/useSettings";

export interface ConfigWatcherProps {
  /** Settings instance */
  settings?: ReturnType<typeof useSettings>;
  /** Custom class name */
  class?: string;
}

export const ConfigWatcher: Component<ConfigWatcherProps> = props => {
  const settings = props.settings || useSettings();
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal("history");

  // Config watcher state
  const [enableWatching, setEnableWatching] = createSignal(true);
  const [watchInterval, setWatchInterval] = createSignal(5000);
  const [enableBackups, setEnableBackups] = createSignal(true);
  const [backupInterval, setBackupInterval] = createSignal(3600000);
  const [maxBackups, setMaxBackups] = createSignal(10);
  const [enableTemplates, setEnableTemplates] = createSignal(true);
  const [enableScheduling, setEnableScheduling] = createSignal(false);
  const [scheduleInterval, setScheduleInterval] = createSignal(86400000);
  const [enableApproval, setEnableApproval] = createSignal(false);
  const [enableImportExport, setEnableImportExport] = createSignal(true);

  // Load settings on mount
  createEffect(() => {
    loadConfigWatcherSettings();
  });

  const loadConfigWatcherSettings = async () => {
    setIsLoading(true);
    try {
      setEnableWatching(settings.getSetting("config_watcher.enable_watching") || true);
      setWatchInterval(settings.getSetting("config_watcher.watch_interval") || 5000);
      setEnableBackups(settings.getSetting("config_watcher.enable_backups") || true);
      setBackupInterval(settings.getSetting("config_watcher.backup_interval") || 3600000);
      setMaxBackups(settings.getSetting("config_watcher.max_backups") || 10);
      setEnableTemplates(settings.getSetting("config_watcher.enable_templates") || true);
      setEnableScheduling(settings.getSetting("config_watcher.enable_scheduling") || false);
      setScheduleInterval(settings.getSetting("config_watcher.schedule_interval") || 86400000);
      setEnableApproval(settings.getSetting("config_watcher.enable_approval") || false);
      setEnableImportExport(settings.getSetting("config_watcher.enable_import_export") || true);
    } catch (error) {
      console.error("Failed to load config watcher settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfigWatcherSettings = async () => {
    setIsSaving(true);
    try {
      await settings.setSetting("config_watcher.enable_watching", enableWatching());
      await settings.setSetting("config_watcher.watch_interval", watchInterval());
      await settings.setSetting("config_watcher.enable_backups", enableBackups());
      await settings.setSetting("config_watcher.backup_interval", backupInterval());
      await settings.setSetting("config_watcher.max_backups", maxBackups());
      await settings.setSetting("config_watcher.enable_templates", enableTemplates());
      await settings.setSetting("config_watcher.enable_scheduling", enableScheduling());
      await settings.setSetting("config_watcher.schedule_interval", scheduleInterval());
      await settings.setSetting("config_watcher.enable_approval", enableApproval());
      await settings.setSetting("config_watcher.enable_import_export", enableImportExport());

      await settings.saveSettings();
    } catch (error) {
      console.error("Failed to save config watcher settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "history", label: "History" },
    { id: "backups", label: "Backups" },
    { id: "templates", label: "Templates" },
    { id: "schedule", label: "Schedule" },
    { id: "approval", label: "Approval" },
    { id: "import", label: "Import/Export" },
  ];

  return (
    <div class={`advanced-config-watcher ${props.class || ""}`}>
      <div class="settings-section">
        <h3>Advanced Configuration Watcher</h3>
        <p class="settings-description">Advanced configuration monitoring, backup, and management system.</p>

        <Show when={isLoading()}>
          <div class="loading-state">Loading config watcher configuration...</div>
        </Show>

        <Show when={!isLoading()}>
          {/* Core Settings */}
          <div class="setting-group">
            <h4>Core Settings</h4>
            <p class="setting-description">Basic configuration watching and monitoring.</p>

            <div class="setting-row">
              <Button
                checked={enableWatching()}
                onChange={setEnableWatching}
                label="Enable Configuration Watching"
                helperText="Monitor configuration files for changes"
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Watch Interval (ms)"
                type="number"
                value={watchInterval()}
                onChange={value => setWatchInterval(parseInt(value) || 5000)}
                helperText="How often to check for configuration changes"
                disabled={!enableWatching()}
              />
            </div>
          </div>

          <Tabs items={tabs} activeTab={activeTab()} onTabChange={setActiveTab} variant="underline" />

          {/* History Tab */}
          <Show when={activeTab() === "history"}>
            <div class="setting-group">
              <h4>Configuration History</h4>
              <p class="setting-description">View and manage configuration change history.</p>

              <div class="setting-row">
                <Button variant="secondary">View Change History</Button>
              </div>

              <div class="setting-row">
                <Button variant="secondary">Clear History</Button>
              </div>

              <div class="setting-row">
                <Button variant="secondary">Export History</Button>
              </div>
            </div>
          </Show>

          {/* Backups Tab */}
          <Show when={activeTab() === "backups"}>
            <div class="setting-group">
              <h4>Backup Configuration</h4>
              <p class="setting-description">Configure automatic configuration backups.</p>

              <div class="setting-row">
                <Button
                  checked={enableBackups()}
                  onChange={setEnableBackups}
                  label="Enable Automatic Backups"
                  helperText="Automatically backup configuration files"
                />
              </div>

              <div class="setting-row">
                <TextField
                  label="Backup Interval (ms)"
                  type="number"
                  value={backupInterval()}
                  onChange={value => setBackupInterval(parseInt(value) || 3600000)}
                  helperText="How often to create configuration backups"
                  disabled={!enableBackups()}
                />
              </div>

              <div class="setting-row">
                <TextField
                  label="Max Backups"
                  type="number"
                  value={maxBackups()}
                  onChange={value => setMaxBackups(parseInt(value) || 10)}
                  helperText="Maximum number of backups to retain"
                  disabled={!enableBackups()}
                />
              </div>

              <div class="setting-row">
                <Button variant="secondary">Create Manual Backup</Button>
              </div>

              <div class="setting-row">
                <Button variant="secondary">Restore from Backup</Button>
              </div>
            </div>
          </Show>

          {/* Templates Tab */}
          <Show when={activeTab() === "templates"}>
            <div class="setting-group">
              <h4>Configuration Templates</h4>
              <p class="setting-description">Manage configuration templates and presets.</p>

              <div class="setting-row">
                <Button
                  checked={enableTemplates()}
                  onChange={setEnableTemplates}
                  label="Enable Templates"
                  helperText="Enable configuration template system"
                />
              </div>

              <div class="setting-row">
                <Button variant="secondary">Create Template</Button>
              </div>

              <div class="setting-row">
                <Button variant="secondary">Load Template</Button>
              </div>

              <div class="setting-row">
                <Button variant="secondary">Manage Templates</Button>
              </div>
            </div>
          </Show>

          {/* Schedule Tab */}
          <Show when={activeTab() === "schedule"}>
            <div class="setting-group">
              <h4>Scheduled Operations</h4>
              <p class="setting-description">Configure scheduled configuration operations.</p>

              <div class="setting-row">
                <Button
                  checked={enableScheduling()}
                  onChange={setEnableScheduling}
                  label="Enable Scheduling"
                  helperText="Enable scheduled configuration operations"
                />
              </div>

              <div class="setting-row">
                <TextField
                  label="Schedule Interval (ms)"
                  type="number"
                  value={scheduleInterval()}
                  onChange={value => setScheduleInterval(parseInt(value) || 86400000)}
                  helperText="Default interval for scheduled operations"
                  disabled={!enableScheduling()}
                />
              </div>

              <div class="setting-row">
                <Button variant="secondary">Create Schedule</Button>
              </div>

              <div class="setting-row">
                <Button variant="secondary">View Schedules</Button>
              </div>
            </div>
          </Show>

          {/* Approval Tab */}
          <Show when={activeTab() === "approval"}>
            <div class="setting-group">
              <h4>Approval Workflow</h4>
              <p class="setting-description">Configure configuration change approval process.</p>

              <div class="setting-row">
                <Button
                  checked={enableApproval()}
                  onChange={setEnableApproval}
                  label="Enable Approval Workflow"
                  helperText="Require approval for configuration changes"
                />
              </div>

              <div class="setting-row">
                <Button variant="secondary">Configure Approvers</Button>
              </div>

              <div class="setting-row">
                <Button variant="secondary">View Pending Approvals</Button>
              </div>

              <div class="setting-row">
                <Button variant="secondary">Approval History</Button>
              </div>
            </div>
          </Show>

          {/* Import/Export Tab */}
          <Show when={activeTab() === "import"}>
            <div class="setting-group">
              <h4>Import/Export</h4>
              <p class="setting-description">Import and export configuration data.</p>

              <div class="setting-row">
                <Button
                  checked={enableImportExport()}
                  onChange={setEnableImportExport}
                  label="Enable Import/Export"
                  helperText="Enable configuration import and export functionality"
                />
              </div>

              <div class="setting-row">
                <Button variant="secondary">Export Configuration</Button>
              </div>

              <div class="setting-row">
                <Button variant="secondary">Import Configuration</Button>
              </div>

              <div class="setting-row">
                <Button variant="secondary">Validate Configuration</Button>
              </div>
            </div>
          </Show>

          {/* Current Configuration Summary */}
          <div class="setting-group">
            <h4>Current Configuration</h4>
            <div class="config-summary">
              <div class="config-item">
                <span class="config-label">Watching:</span>
                <span class="config-value">{enableWatching() ? "Enabled" : "Disabled"}</span>
              </div>
              <div class="config-item">
                <span class="config-label">Watch Interval:</span>
                <span class="config-value">{watchInterval()}ms</span>
              </div>
              <div class="config-item">
                <span class="config-label">Backups:</span>
                <span class="config-value">{enableBackups() ? "Enabled" : "Disabled"}</span>
              </div>
              <div class="config-item">
                <span class="config-label">Backup Interval:</span>
                <span class="config-value">{backupInterval()}ms</span>
              </div>
              <div class="config-item">
                <span class="config-label">Max Backups:</span>
                <span class="config-value">{maxBackups()}</span>
              </div>
              <div class="config-item">
                <span class="config-label">Templates:</span>
                <span class="config-value">{enableTemplates() ? "Enabled" : "Disabled"}</span>
              </div>
              <div class="config-item">
                <span class="config-label">Scheduling:</span>
                <span class="config-value">{enableScheduling() ? "Enabled" : "Disabled"}</span>
              </div>
              <div class="config-item">
                <span class="config-label">Approval:</span>
                <span class="config-value">{enableApproval() ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div class="settings-actions">
            <Button variant="primary" onClick={saveConfigWatcherSettings} loading={isSaving()} disabled={isSaving()}>
              Save Config Watcher Settings
            </Button>
          </div>
        </Show>
      </div>
    </div>
  );
};
