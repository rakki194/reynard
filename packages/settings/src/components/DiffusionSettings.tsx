/**
 * Diffusion Settings Component
 * Configuration for text generation and diffusion models
 */

import { Component, Show, createSignal, createEffect } from "solid-js";
import { Button, TextField, Select } from "reynard-components";
import { Toggle } from "./Toggle";
import { Button } from "./Button";
import { useSettings } from "../composables/useSettings";

export interface DiffusionSettingsProps {
  /** Settings instance */
  settings?: ReturnType<typeof useSettings>;
  /** Custom class name */
  class?: string;
}

export const DiffusionSettings: Component<DiffusionSettingsProps> = props => {
  const settings = props.settings || useSettings();
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);

  // Diffusion configuration state
  const [maxNewTokens, setMaxNewTokens] = createSignal(64);
  const [timeoutSeconds, setTimeoutSeconds] = createSignal(120);
  const [device, setDevice] = createSignal("auto");
  const [autoTrim, setAutoTrim] = createSignal(false);
  const [fixPunctuation, setFixPunctuation] = createSignal(false);
  const [temperature, setTemperature] = createSignal(0.7);
  const [topP, setTopP] = createSignal(0.9);
  const [repetitionPenalty, setRepetitionPenalty] = createSignal(1.1);
  const [enableStreaming, setEnableStreaming] = createSignal(true);

  // Load settings on mount
  createEffect(() => {
    loadDiffusionSettings();
  });

  const loadDiffusionSettings = async () => {
    setIsLoading(true);
    try {
      setMaxNewTokens(settings.getSetting("diffusion.max_new_tokens") || 64);
      setTimeoutSeconds(settings.getSetting("diffusion.timeout_seconds") || 120);
      setDevice(settings.getSetting("diffusion.device") || "auto");
      setAutoTrim(settings.getSetting("diffusion.auto_trim") || false);
      setFixPunctuation(settings.getSetting("diffusion.fix_punctuation") || false);
      setTemperature(settings.getSetting("diffusion.temperature") || 0.7);
      setTopP(settings.getSetting("diffusion.top_p") || 0.9);
      setRepetitionPenalty(settings.getSetting("diffusion.repetition_penalty") || 1.1);
      setEnableStreaming(settings.getSetting("diffusion.enable_streaming") || true);
    } catch (error) {
      console.error("Failed to load diffusion settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDiffusionSettings = async () => {
    setIsSaving(true);
    try {
      await settings.setSetting("diffusion.max_new_tokens", maxNewTokens());
      await settings.setSetting("diffusion.timeout_seconds", timeoutSeconds());
      await settings.setSetting("diffusion.device", device());
      await settings.setSetting("diffusion.auto_trim", autoTrim());
      await settings.setSetting("diffusion.fix_punctuation", fixPunctuation());
      await settings.setSetting("diffusion.temperature", temperature());
      await settings.setSetting("diffusion.top_p", topP());
      await settings.setSetting("diffusion.repetition_penalty", repetitionPenalty());
      await settings.setSetting("diffusion.enable_streaming", enableStreaming());

      await settings.saveSettings();
    } catch (error) {
      console.error("Failed to save diffusion settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const deviceOptions = [
    { value: "auto", label: "Auto" },
    { value: "cuda", label: "CUDA" },
    { value: "cpu", label: "CPU" },
  ];

  return (
    <div class={`diffusion-settings ${props.class || ""}`}>
      <div class="settings-section">
        <h3>Text Generation Settings</h3>
        <p class="settings-description">Configure settings for text generation and diffusion models.</p>

        <Show when={isLoading()}>
          <div class="loading-state">Loading diffusion configuration...</div>
        </Show>

        <Show when={!isLoading()}>
          {/* Generation Parameters */}
          <div class="setting-group">
            <h4>Generation Parameters</h4>
            <p class="setting-description">Configure text generation behavior and quality.</p>

            <div class="setting-row">
              <TextField
                label="Max New Tokens"
                type="number"
                value={maxNewTokens()}
                onChange={e => setMaxNewTokens(parseInt(e.target.value) || 64)}
                helperText="Maximum number of tokens to generate in a single response"
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Request Timeout (seconds)"
                type="number"
                value={timeoutSeconds()}
                onChange={e => setTimeoutSeconds(parseInt(e.target.value) || 120)}
                helperText="Maximum time to wait for a response from the text generation model"
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Temperature"
                type="number"
                step="0.1"
                value={temperature()}
                onChange={e => setTemperature(parseFloat(e.target.value) || 0.7)}
                helperText="Controls randomness in generation (0.0 = deterministic, 1.0 = very random)"
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Top P"
                type="number"
                step="0.1"
                value={topP()}
                onChange={e => setTopP(parseFloat(e.target.value) || 0.9)}
                helperText="Nucleus sampling parameter (0.0 = very focused, 1.0 = very diverse)"
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Repetition Penalty"
                type="number"
                step="0.1"
                value={repetitionPenalty()}
                onChange={value => setRepetitionPenalty(parseFloat(value) || 1.1)}
                helperText="Penalty for repeating tokens (1.0 = no penalty, >1.0 = reduce repetition)"
              />
            </div>
          </div>

          {/* Device Configuration */}
          <div class="setting-group">
            <h4>Device Configuration</h4>
            <p class="setting-description">Configure hardware preferences for model execution.</p>

            <div class="setting-row">
              <Select
                label="Preferred Device"
                value={device()}
                onChange={setDevice}
                options={deviceOptions}
                helperText="Select the preferred device for running diffusion models"
              />
            </div>
          </div>

          {/* Output Processing */}
          <div class="setting-group">
            <h4>Output Processing</h4>
            <p class="setting-description">Configure post-processing of generated text.</p>

            <div class="setting-row">
              <Button
                checked={autoTrim()}
                onChange={setAutoTrim}
                label="Auto-trim Output"
                helperText="Automatically remove leading and trailing whitespace from generated text"
              />
            </div>

            <div class="setting-row">
              <Button
                checked={fixPunctuation()}
                onChange={setFixPunctuation}
                label="Fix Punctuation"
                helperText="Automatically fix common punctuation spacing issues in generated text"
              />
            </div>

            <div class="setting-row">
              <Button
                checked={enableStreaming()}
                onChange={setEnableStreaming}
                label="Enable Streaming"
                helperText="Enable real-time streaming of generated text"
              />
            </div>
          </div>

          {/* Current Configuration Summary */}
          <div class="setting-group">
            <h4>Current Configuration</h4>
            <div class="config-summary">
              <div class="config-item">
                <span class="config-label">Max Tokens:</span>
                <span class="config-value">{maxNewTokens()}</span>
              </div>
              <div class="config-item">
                <span class="config-label">Timeout:</span>
                <span class="config-value">{timeoutSeconds()}s</span>
              </div>
              <div class="config-item">
                <span class="config-label">Device:</span>
                <span class="config-value">{device()}</span>
              </div>
              <div class="config-item">
                <span class="config-label">Temperature:</span>
                <span class="config-value">{temperature()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div class="settings-actions">
            <Button variant="primary" onClick={saveDiffusionSettings} loading={isSaving()} disabled={isSaving()}>
              Save Diffusion Settings
            </Button>
          </div>
        </Show>
      </div>
    </div>
  );
};
