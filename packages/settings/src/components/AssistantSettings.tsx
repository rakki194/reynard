/**
 * Assistant Settings Component
 * Configuration for AI assistant and Ollama integration
 */

import { Component, Show, createSignal, createEffect } from "solid-js";
import { Button, TextField, Select, Toggle } from "reynard-components";
import { useSettings } from "../composables/useSettings";

export interface AssistantSettingsProps {
  /** Settings instance */
  settings?: ReturnType<typeof useSettings>;
  /** Custom class name */
  class?: string;
}

export const AssistantSettings: Component<AssistantSettingsProps> = (props) => {
  const settings = props.settings || useSettings();
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);
  const [isTestingConnection, setIsTestingConnection] = createSignal(false);

  // Assistant configuration state
  const [enabled, setEnabled] = createSignal(false);
  const [ollamaUrl, setOllamaUrl] = createSignal("http://localhost:11434");
  const [defaultModel, setDefaultModel] = createSignal("llama3.2");
  const [enableStreaming, setEnableStreaming] = createSignal(true);
  const [maxTokens, setMaxTokens] = createSignal(2048);
  const [temperature, setTemperature] = createSignal(0.7);
  const [topP, setTopP] = createSignal(0.9);
  const [timeoutSeconds, setTimeoutSeconds] = createSignal(120);
  const [enableContext, setEnableContext] = createSignal(true);
  const [contextWindow, setContextWindow] = createSignal(4096);
  const [enableMemory, setEnableMemory] = createSignal(true);
  const [memorySize, setMemorySize] = createSignal(100);

  // Load settings on mount
  createEffect(() => {
    loadAssistantSettings();
  });

  const loadAssistantSettings = async () => {
    setIsLoading(true);
    try {
      setEnabled(settings().getSetting("assistant.enabled") || false);
      setOllamaUrl(settings().getSetting("assistant.ollama_url") || "http://localhost:11434");
      setDefaultModel(settings().getSetting("assistant.default_model") || "llama3.2");
      setEnableStreaming(settings().getSetting("assistant.enable_streaming") || true);
      setMaxTokens(settings().getSetting("assistant.max_tokens") || 2048);
      setTemperature(settings().getSetting("assistant.temperature") || 0.7);
      setTopP(settings().getSetting("assistant.top_p") || 0.9);
      setTimeoutSeconds(settings().getSetting("assistant.timeout_seconds") || 120);
      setEnableContext(settings().getSetting("assistant.enable_context") || true);
      setContextWindow(settings().getSetting("assistant.context_window") || 4096);
      setEnableMemory(settings().getSetting("assistant.enable_memory") || true);
      setMemorySize(settings().getSetting("assistant.memory_size") || 100);
    } catch (error) {
      console.error("Failed to load assistant settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAssistantSettings = async () => {
    setIsSaving(true);
    try {
      await settings().setSetting("assistant.enabled", enabled());
      await settings().setSetting("assistant.ollama_url", ollamaUrl());
      await settings().setSetting("assistant.default_model", defaultModel());
      await settings().setSetting("assistant.enable_streaming", enableStreaming());
      await settings().setSetting("assistant.max_tokens", maxTokens());
      await settings().setSetting("assistant.temperature", temperature());
      await settings().setSetting("assistant.top_p", topP());
      await settings().setSetting("assistant.timeout_seconds", timeoutSeconds());
      await settings().setSetting("assistant.enable_context", enableContext());
      await settings().setSetting("assistant.context_window", contextWindow());
      await settings().setSetting("assistant.enable_memory", enableMemory());
      await settings().setSetting("assistant.memory_size", memorySize());
      
      await settings().saveSettings();
    } catch (error) {
      console.error("Failed to save assistant settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      // TODO: Implement actual connection testing
      const response = await fetch(`${ollamaUrl()}/api/tags`);
      if (response.ok) {
        console.log("Ollama connection successful");
        // Show success message
      } else {
        console.error("Ollama connection failed");
        // Show error message
      }
    } catch (error) {
      console.error("Ollama connection test failed:", error);
      // Show error message
    } finally {
      setIsTestingConnection(false);
    }
  };

  const availableModels = [
    { value: "llama3.2", label: "Llama 3.2" },
    { value: "llama3.1", label: "Llama 3.1" },
    { value: "llama3", label: "Llama 3" },
    { value: "codellama", label: "Code Llama" },
    { value: "mistral", label: "Mistral" },
    { value: "gemma", label: "Gemma" },
    { value: "phi3", label: "Phi-3" },
  ];

  return (
    <div class={`assistant-settings ${props.class || ""}`}>
      <div class="settings-section">
        <h3>AI Assistant Configuration</h3>
        <p class="settings-description">
          Configure AI assistant settings and Ollama integration for local language model support.
        </p>

        <Show when={isLoading()}>
          <div class="loading-state">Loading assistant configuration...</div>
        </Show>

        <Show when={!isLoading()}>
          {/* Core Assistant Settings */}
          <div class="setting-group">
            <h4>Core Settings</h4>
            <p class="setting-description">Basic assistant functionality and connection configuration.</p>

            <div class="setting-row">
              <Toggle
                checked={enabled()}
                onChange={setEnabled}
                label="Enable AI Assistant"
                description="Enable AI assistant functionality with Ollama integration"
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Ollama Server URL"
                value={ollamaUrl()}
                onChange={setOllamaUrl}
                placeholder="http://localhost:11434"
                description="URL of the Ollama server instance"
                disabled={!enabled()}
              />
            </div>

            <div class="setting-row">
              <Button
                variant="secondary"
                onClick={testConnection}
                disabled={!enabled() || !ollamaUrl() || isTestingConnection()}
                loading={isTestingConnection()}
              >
                Test Connection
              </Button>
            </div>
          </div>

          {/* Model Configuration */}
          <div class="setting-group">
            <h4>Model Configuration</h4>
            <p class="setting-description">Configure the language model and generation parameters.</p>

            <div class="setting-row">
              <Select
                label="Default Model"
                value={defaultModel()}
                onChange={setDefaultModel}
                options={availableModels}
                description="Select the default language model for the assistant"
                disabled={!enabled()}
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Max Tokens"
                type="number"
                value={maxTokens()}
                onChange={(value) => setMaxTokens(parseInt(value) || 2048)}
                description="Maximum number of tokens to generate in a response"
                validation={{ min: 100, max: 8192 }}
                disabled={!enabled()}
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Temperature"
                type="number"
                step="0.1"
                value={temperature()}
                onChange={(value) => setTemperature(parseFloat(value) || 0.7)}
                description="Controls randomness in responses (0.0 = deterministic, 1.0 = very random)"
                validation={{ min: 0, max: 2 }}
                disabled={!enabled()}
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Top P"
                type="number"
                step="0.1"
                value={topP()}
                onChange={(value) => setTopP(parseFloat(value) || 0.9)}
                description="Nucleus sampling parameter (0.0 = very focused, 1.0 = very diverse)"
                validation={{ min: 0, max: 1 }}
                disabled={!enabled()}
              />
            </div>
          </div>

          {/* Context and Memory */}
          <div class="setting-group">
            <h4>Context and Memory</h4>
            <p class="setting-description">Configure conversation context and memory management.</p>

            <div class="setting-row">
              <Toggle
                checked={enableContext()}
                onChange={setEnableContext}
                label="Enable Context"
                description="Maintain conversation context across multiple interactions"
                disabled={!enabled()}
              />
            </div>

            <Show when={enableContext()}>
              <div class="setting-row">
                <TextField
                  label="Context Window"
                  type="number"
                  value={contextWindow()}
                  onChange={(value) => setContextWindow(parseInt(value) || 4096)}
                  description="Maximum number of tokens to keep in conversation context"
                  validation={{ min: 512, max: 32768 }}
                  disabled={!enabled()}
                />
              </div>
            </Show>

            <div class="setting-row">
              <Toggle
                checked={enableMemory()}
                onChange={setEnableMemory}
                label="Enable Memory"
                description="Enable long-term memory for the assistant"
                disabled={!enabled()}
              />
            </div>

            <Show when={enableMemory()}>
              <div class="setting-row">
                <TextField
                  label="Memory Size"
                  type="number"
                  value={memorySize()}
                  onChange={(value) => setMemorySize(parseInt(value) || 100)}
                  description="Maximum number of conversation memories to retain"
                  validation={{ min: 10, max: 1000 }}
                  disabled={!enabled()}
                />
              </div>
            </Show>
          </div>

          {/* Performance Settings */}
          <div class="setting-group">
            <h4>Performance Settings</h4>
            <p class="setting-description">Configure performance and timeout settings.</p>

            <div class="setting-row">
              <TextField
                label="Request Timeout (seconds)"
                type="number"
                value={timeoutSeconds()}
                onChange={(value) => setTimeoutSeconds(parseInt(value) || 120)}
                description="Maximum time to wait for a response from the assistant"
                validation={{ min: 10, max: 600 }}
                disabled={!enabled()}
              />
            </div>

            <div class="setting-row">
              <Toggle
                checked={enableStreaming()}
                onChange={setEnableStreaming}
                label="Enable Streaming"
                description="Enable real-time streaming of assistant responses"
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
                  <span class="status-text">AI Assistant Active</span>
                </div>
                <div class="status-details">
                  <div class="status-item">
                    <span class="status-label">Ollama URL:</span>
                    <span class="status-value">{ollamaUrl()}</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">Default Model:</span>
                    <span class="status-value">{defaultModel()}</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">Max Tokens:</span>
                    <span class="status-value">{maxTokens()}</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">Temperature:</span>
                    <span class="status-value">{temperature()}</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">Context:</span>
                    <span class="status-value">{enableContext() ? "Enabled" : "Disabled"}</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">Memory:</span>
                    <span class="status-value">{enableMemory() ? "Enabled" : "Disabled"}</span>
                  </div>
                </div>
              </div>
            </div>
          </Show>

          {/* Actions */}
          <div class="settings-actions">
            <Button
              variant="primary"
              onClick={saveAssistantSettings}
              loading={isSaving()}
              disabled={isSaving()}
            >
              Save Assistant Settings
            </Button>
          </div>
        </Show>
      </div>
    </div>
  );
};
