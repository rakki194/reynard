/**
 * Advanced Settings Demo
 * Comprehensive demonstration of Reynard's advanced settings system
 */

import { Component, createSignal, Show } from "solid-js";
import {
  SettingsPanel,
  RAGSettings,
  DiffusionSettings,
  ComfySettings,
  ModelManagementSettings,
  ServiceManagementSettings,
  AssistantSettings,
  AdvancedConfigWatcher,
  useSettings,
} from "reynard-settings";
import { Button, Tabs } from "reynard-components";
import type { SettingCategory } from "reynard-settings";

export const App: Component = () => {
  const [activeTab, setActiveTab] = createSignal<SettingCategory>("general");
  const [showAdvancedSettings, setShowAdvancedSettings] = createSignal(false);

  // Initialize settings with comprehensive schema
  const settings = useSettings({
    config: {
      schema: {
        version: "1.0.0",
        settings: {
          // RAG Settings
          "rag.enabled": {
            key: "rag.enabled",
            label: "Enable RAG",
            description: "Enable Retrieval-Augmented Generation functionality",
            category: "rag",
            type: "boolean",
            defaultValue: false,
            order: 1,
          },
          "rag.database_url": {
            key: "rag.database_url",
            label: "Database URL",
            description: "PostgreSQL connection string for vector database",
            category: "rag",
            type: "string",
            defaultValue: "",
            order: 2,
          },
          "rag.embedding_model": {
            key: "rag.embedding_model",
            label: "Embedding Model",
            description: "Model for text vectorization",
            category: "rag",
            type: "select",
            defaultValue: "nomic-embed-text",
            options: [
              { value: "nomic-embed-text", label: "Nomic Embed Text" },
              { value: "all-MiniLM-L6-v2", label: "All-MiniLM-L6-v2" },
            ],
            order: 3,
          },

          // Diffusion Settings
          "diffusion.max_new_tokens": {
            key: "diffusion.max_new_tokens",
            label: "Max New Tokens",
            description: "Maximum tokens to generate",
            category: "diffusion",
            type: "number",
            defaultValue: 64,
            validation: { min: 1, max: 512 },
            order: 1,
          },
          "diffusion.temperature": {
            key: "diffusion.temperature",
            label: "Temperature",
            description: "Controls randomness in generation",
            category: "diffusion",
            type: "number",
            defaultValue: 0.7,
            validation: { min: 0, max: 2, step: 0.1 },
            order: 2,
          },

          // ComfyUI Settings
          "comfy.enabled": {
            key: "comfy.enabled",
            label: "Enable ComfyUI",
            description: "Enable ComfyUI workflow automation",
            category: "comfy",
            type: "boolean",
            defaultValue: false,
            order: 1,
          },
          "comfy.api_url": {
            key: "comfy.api_url",
            label: "API URL",
            description: "ComfyUI server endpoint",
            category: "comfy",
            type: "string",
            defaultValue: "http://localhost:8188",
            order: 2,
          },

          // Model Management Settings
          "models.auto_download": {
            key: "models.auto_download",
            label: "Auto-download Models",
            description: "Automatically download required models",
            category: "model-management",
            type: "boolean",
            defaultValue: true,
            order: 1,
          },
          "models.max_concurrent": {
            key: "models.max_concurrent",
            label: "Max Concurrent Models",
            description: "Maximum models to load simultaneously",
            category: "model-management",
            type: "number",
            defaultValue: 3,
            validation: { min: 1, max: 10 },
            order: 2,
          },

          // Service Management Settings
          "services.auto_refresh": {
            key: "services.auto_refresh",
            label: "Auto-refresh Status",
            description: "Automatically refresh service status",
            category: "service-management",
            type: "boolean",
            defaultValue: true,
            order: 1,
          },
          "services.refresh_interval": {
            key: "services.refresh_interval",
            label: "Refresh Interval",
            description: "How often to refresh service status (ms)",
            category: "service-management",
            type: "number",
            defaultValue: 5000,
            validation: { min: 1000, max: 60000 },
            order: 2,
          },

          // Assistant Settings
          "assistant.enabled": {
            key: "assistant.enabled",
            label: "Enable AI Assistant",
            description: "Enable AI assistant with Ollama",
            category: "assistant",
            type: "boolean",
            defaultValue: false,
            order: 1,
          },
          "assistant.ollama_url": {
            key: "assistant.ollama_url",
            label: "Ollama URL",
            description: "Ollama server endpoint",
            category: "assistant",
            type: "string",
            defaultValue: "http://localhost:11434",
            order: 2,
          },

          // Config Watcher Settings
          "config_watcher.enable_watching": {
            key: "config_watcher.enable_watching",
            label: "Enable Configuration Watching",
            description: "Monitor configuration files for changes",
            category: "config-watcher",
            type: "boolean",
            defaultValue: true,
            order: 1,
          },
          "config_watcher.watch_interval": {
            key: "config_watcher.watch_interval",
            label: "Watch Interval",
            description: "How often to check for changes (ms)",
            category: "config-watcher",
            type: "number",
            defaultValue: 5000,
            validation: { min: 1000, max: 60000 },
            order: 2,
          },
        },
        groups: {},
      },
    },
  });

  const tabs = [
    { id: "general", label: "General" },
    { id: "rag", label: "RAG System" },
    { id: "diffusion", label: "Diffusion LLM" },
    { id: "comfy", label: "ComfyUI" },
    { id: "model-management", label: "Model Management" },
    { id: "service-management", label: "Service Management" },
    { id: "assistant", label: "AI Assistant" },
    { id: "config-watcher", label: "Config Watcher" },
  ];

  return (
    <div class="advanced-settings-demo">
      <header class="demo-header">
        <h1>Reynard Advanced Settings Demo</h1>
        <p>
          Comprehensive demonstration of advanced settings and configuration
          management
        </p>

        <div class="demo-controls">
          <Button
            variant="primary"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings())}
          >
            {showAdvancedSettings() ? "Hide" : "Show"} Advanced Settings
          </Button>
        </div>
      </header>

      <main class="demo-content">
        <Show when={!showAdvancedSettings()}>
          {/* Standard Settings Panel */}
          <div class="settings-container">
            <SettingsPanel
              title="Reynard Settings"
              showSearch={true}
              showCategories={true}
              showImportExport={true}
              showReset={true}
              defaultCategory="general"
              config={settings().config}
            />
          </div>
        </Show>

        <Show when={showAdvancedSettings()}>
          {/* Advanced Settings with Tabs */}
          <div class="advanced-settings-container">
            <Tabs
              items={tabs}
              activeTab={activeTab()}
              onTabChange={setActiveTab}
              variant="underline"
              size="lg"
            />

            <div class="settings-content">
              <Show when={activeTab() === "general"}>
                <SettingsPanel
                  title="General Settings"
                  showSearch={true}
                  showCategories={false}
                  showImportExport={true}
                  showReset={true}
                  defaultCategory="general"
                  config={settings().config}
                />
              </Show>

              <Show when={activeTab() === "rag"}>
                <RAGSettings settings={settings()} />
              </Show>

              <Show when={activeTab() === "diffusion"}>
                <DiffusionSettings settings={settings()} />
              </Show>

              <Show when={activeTab() === "comfy"}>
                <ComfySettings settings={settings()} />
              </Show>

              <Show when={activeTab() === "model-management"}>
                <ModelManagementSettings settings={settings()} />
              </Show>

              <Show when={activeTab() === "service-management"}>
                <ServiceManagementSettings settings={settings()} />
              </Show>

              <Show when={activeTab() === "assistant"}>
                <AssistantSettings settings={settings()} />
              </Show>

              <Show when={activeTab() === "config-watcher"}>
                <AdvancedConfigWatcher settings={settings()} />
              </Show>
            </div>
          </div>
        </Show>
      </main>

      <footer class="demo-footer">
        <p>
          This demo showcases Reynard's comprehensive settings system with
          specialized configuration panels for RAG, Diffusion, ComfyUI, Model
          Management, Service Management, AI Assistant, and Advanced
          Configuration Watching.
        </p>
      </footer>
    </div>
  );
};
