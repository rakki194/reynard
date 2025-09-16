/**
 * Global Settings Form Component
 * Form for editing global package configuration settings
 */

import { Component } from "solid-js";
import { Button, TextField, Select } from "../../primitives";
import { Toggle } from "../../primitives";
import { Icon } from "../../icons";
import type { GlobalSettingsFormProps } from "../types/PackageConfigurationTypes";

export const GlobalSettingsForm: Component<GlobalSettingsFormProps> = props => {
  const handleConfigChange = (key: keyof typeof props.config, value: any) => {
    const updatedConfig = { ...props.config, [key]: value };
    // This would typically update local state, but for now we'll just call onSave
    props.onSave(updatedConfig);
  };

  return (
    <div class="reynard-global-settings-form">
      <div class="reynard-global-settings-form__header">
        <Icon name="settings" size="lg" />
        <h3>Global Package Configuration</h3>
        <p>Configure global settings that apply to all packages</p>
      </div>

      <div class="reynard-global-settings-form__content">
        <div class="reynard-settings-section">
          <h4>Discovery & Installation</h4>

          <div class="reynard-setting-field">
            <div class="reynard-setting-field__label">
              <label>Auto Discovery</label>
            </div>
            <Toggle
              checked={props.config.autoDiscovery}
              onChange={checked => handleConfigChange("autoDiscovery", checked)}
            />
            <div class="reynard-setting-field__description">Automatically discover new packages</div>
          </div>

          <div class="reynard-setting-field">
            <div class="reynard-setting-field__label">
              <label>Auto Install</label>
            </div>
            <Toggle
              checked={props.config.autoInstall}
              onChange={checked => handleConfigChange("autoInstall", checked)}
            />
            <div class="reynard-setting-field__description">Automatically install discovered packages</div>
          </div>

          <div class="reynard-setting-field">
            <div class="reynard-setting-field__label">
              <label>Auto Update</label>
            </div>
            <Toggle checked={props.config.autoUpdate} onChange={checked => handleConfigChange("autoUpdate", checked)} />
            <div class="reynard-setting-field__description">
              Automatically update packages when new versions are available
            </div>
          </div>
        </div>

        <div class="reynard-settings-section">
          <h4>Performance & Limits</h4>

          <div class="reynard-setting-field">
            <div class="reynard-setting-field__label">
              <label>Max Concurrent Installs</label>
            </div>
            <TextField
              type="number"
              value={props.config.maxConcurrentInstalls}
              onInput={e => handleConfigChange("maxConcurrentInstalls", Number(e.currentTarget.value))}
              min="1"
              max="10"
              size="sm"
            />
            <div class="reynard-setting-field__description">
              Maximum number of packages that can be installed simultaneously
            </div>
          </div>

          <div class="reynard-setting-field">
            <div class="reynard-setting-field__label">
              <label>Memory Limit (MB)</label>
            </div>
            <TextField
              type="number"
              value={props.config.memoryLimit}
              onInput={e => handleConfigChange("memoryLimit", Number(e.currentTarget.value))}
              min="512"
              max="8192"
              step="256"
              size="sm"
            />
            <div class="reynard-setting-field__description">Maximum memory usage for package operations</div>
          </div>
        </div>

        <div class="reynard-settings-section">
          <h4>Monitoring & Analytics</h4>

          <div class="reynard-setting-field">
            <div class="reynard-setting-field__label">
              <label>Enable Analytics</label>
            </div>
            <Toggle
              checked={props.config.enableAnalytics}
              onChange={checked => handleConfigChange("enableAnalytics", checked)}
            />
            <div class="reynard-setting-field__description">Collect usage analytics and performance data</div>
          </div>

          <div class="reynard-setting-field">
            <div class="reynard-setting-field__label">
              <label>Log Level</label>
            </div>
            <Select
              value={props.config.logLevel}
              onChange={value => handleConfigChange("logLevel", value)}
              options={[
                { value: "debug", label: "Debug" },
                { value: "info", label: "Info" },
                { value: "warn", label: "Warning" },
                { value: "error", label: "Error" },
              ]}
              size="sm"
            />
            <div class="reynard-setting-field__description">Minimum log level for package operations</div>
          </div>
        </div>
      </div>

      <div class="reynard-global-settings-form__actions">
        <Button variant="secondary" onClick={props.onCancel} disabled={props.isSaving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => props.onSave(props.config)} loading={props.isSaving}>
          Save Global Settings
        </Button>
      </div>
    </div>
  );
};
