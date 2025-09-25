/**
 * 🦊 Config Builder Component
 *
 * Interactive configuration builder with TOML validation
 * following Reynard's form component patterns.
 */

import { Show, createSignal, createEffect, Component } from "solid-js";
import { Card } from "reynard-components-core/primitives";
import { Button } from "reynard-components-core/primitives";
import { TextField } from "reynard-components-core/primitives";
import { Select } from "reynard-components-core/primitives";
import { Badge } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { ModelSelector } from "./ModelSelector";
import { DatasetConfigurator } from "./DatasetConfigurator";
import { AdvancedSettings } from "./AdvancedSettings";
import { ConfigTemplates } from "./ConfigTemplates";
import { ConfigValidator } from "./ConfigValidator";

export interface TrainingConfig {
  // Basic settings
  output_dir: string;
  epochs: number;
  micro_batch_size_per_gpu: number;
  pipeline_stages: number;
  gradient_accumulation_steps: number;
  gradient_clipping: number;
  warmup_steps: number;

  // Model configuration
  model: {
    type: string;
    diffusers_path: string;
    transformer_path: string;
    dtype: string;
    transformer_dtype: string;
    flux_shift?: boolean;
  };

  // Adapter configuration
  adapter: {
    type: string;
    rank: number;
    dtype: string;
  };

  // Optimizer configuration
  optimizer: {
    type: string;
    lr: number;
    betas: [number, number];
    weight_decay: number;
    eps: number;
  };

  // Monitoring configuration
  monitoring: {
    enable_wandb: boolean;
    wandb_api_key?: string;
    wandb_tracker_name?: string;
    wandb_run_name?: string;
  };

  // Dataset configuration
  dataset: string;
}

export interface ConfigBuilderProps {
  initialConfig?: Partial<TrainingConfig>;
  onConfigChange?: (config: TrainingConfig) => void;
  onConfigSave?: (config: TrainingConfig) => void;
  onConfigValidate?: (config: TrainingConfig) => Promise<boolean>;
  onConfigLoad?: (config: TrainingConfig) => void;
  compact?: boolean;
}

export const ConfigBuilder: Component<ConfigBuilderProps> = props => {
  const [config, setConfig] = createSignal<TrainingConfig>({
    output_dir: "/home/kade/runeset/diffusion-pipe/output",
    epochs: 1000,
    micro_batch_size_per_gpu: 4,
    pipeline_stages: 1,
    gradient_accumulation_steps: 1,
    gradient_clipping: 1.0,
    warmup_steps: 100,
    model: {
      type: "chroma",
      diffusers_path: "/home/kade/flux_schnell_diffusers",
      transformer_path: "/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v47.safetensors",
      dtype: "bfloat16",
      transformer_dtype: "float8",
      flux_shift: true,
    },
    adapter: {
      type: "lora",
      rank: 32,
      dtype: "bfloat16",
    },
    optimizer: {
      type: "adamw_optimi",
      lr: 2.5e-4,
      betas: [0.9, 0.99],
      weight_decay: 0.01,
      eps: 1e-8,
    },
    monitoring: {
      enable_wandb: true,
      wandb_api_key: "",
      wandb_tracker_name: "e6ai-lora",
      wandb_run_name: "e6ai-512-2",
    },
    dataset: "train/e6ai_dataset_512.toml",
    ...props.initialConfig,
  });

  const [activeTab, setActiveTab] = createSignal("basic");
  const [isValidating, setIsValidating] = createSignal(false);
  const [validationErrors, setValidationErrors] = createSignal<string[]>([]);
  const [isExpanded, setIsExpanded] = createSignal(!props.compact);

  // Update config and notify parent
  const updateConfig = (updates: Partial<TrainingConfig>) => {
    const newConfig = { ...config(), ...updates };
    setConfig(newConfig);
    props.onConfigChange?.(newConfig);
  };

  // Validate configuration
  const validateConfig = async () => {
    setIsValidating(true);
    setValidationErrors([]);

    try {
      const isValid = await props.onConfigValidate?.(config());
      if (!isValid) {
        setValidationErrors(["Configuration validation failed"]);
      }
    } catch (error) {
      setValidationErrors([error instanceof Error ? error.message : "Validation error"]);
    } finally {
      setIsValidating(false);
    }
  };

  // Save configuration
  const saveConfig = () => {
    props.onConfigSave?.(config());
  };

  // Load configuration from template
  const loadConfig = (templateConfig: TrainingConfig) => {
    setConfig(templateConfig);
    props.onConfigLoad?.(templateConfig);
  };

  // Auto-validate on config changes
  createEffect(() => {
    if (config()) {
      validateConfig();
    }
  });

  // Tabs configuration
  const tabs = [
    {
      id: "basic",
      label: "Basic",
      content: (
        <div class="config-tab-basic">
          <div class="config-section">
            <h3>Basic Training Settings</h3>
            <div class="config-grid">
              <div class="config-item">
                <TextField
                  label="Output Directory"
                  value={config().output_dir}
                  onInput={e => updateConfig({ output_dir: e.currentTarget.value })}
                  placeholder="/path/to/output"
                  fullWidth
                />
              </div>
              <div class="config-item">
                <TextField
                  label="Epochs"
                  type="number"
                  value={config().epochs.toString()}
                  onInput={e => updateConfig({ epochs: parseInt(e.currentTarget.value) || 1000 })}
                  placeholder="1000"
                />
              </div>
              <div class="config-item">
                <TextField
                  label="Micro Batch Size"
                  type="number"
                  value={config().micro_batch_size_per_gpu.toString()}
                  onInput={e => updateConfig({ micro_batch_size_per_gpu: parseInt(e.currentTarget.value) || 4 })}
                  placeholder="4"
                />
              </div>
              <div class="config-item">
                <TextField
                  label="Gradient Accumulation Steps"
                  type="number"
                  value={config().gradient_accumulation_steps.toString()}
                  onInput={e => updateConfig({ gradient_accumulation_steps: parseInt(e.currentTarget.value) || 1 })}
                  placeholder="1"
                />
              </div>
              <div class="config-item">
                <TextField
                  label="Gradient Clipping"
                  type="number"
                  step="0.1"
                  value={config().gradient_clipping.toString()}
                  onInput={e => updateConfig({ gradient_clipping: parseFloat(e.currentTarget.value) || 1.0 })}
                  placeholder="1.0"
                />
              </div>
              <div class="config-item">
                <TextField
                  label="Warmup Steps"
                  type="number"
                  value={config().warmup_steps.toString()}
                  onInput={e => updateConfig({ warmup_steps: parseInt(e.currentTarget.value) || 100 })}
                  placeholder="100"
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "model",
      label: "Model",
      content: (
        <div class="config-tab-model">
          <ModelSelector
            selectedModel={config().model.type}
            onModelChange={modelType =>
              updateConfig({
                model: { ...config().model, type: modelType },
              })
            }
            onModelConfigChange={modelConfig =>
              updateConfig({
                model: { ...config().model, ...modelConfig },
              })
            }
          />
        </div>
      ),
    },
    {
      id: "dataset",
      label: "Dataset",
      content: (
        <div class="config-tab-dataset">
          <DatasetConfigurator
            datasetPath={config().dataset}
            onDatasetChange={datasetPath => updateConfig({ dataset: datasetPath })}
            onDatasetConfigChange={datasetConfig => {
              // Handle dataset configuration changes
            }}
          />
        </div>
      ),
    },
    {
      id: "advanced",
      label: "Advanced",
      content: (
        <div class="config-tab-advanced">
          <AdvancedSettings config={config()} onConfigChange={updateConfig} />
        </div>
      ),
    },
    {
      id: "templates",
      label: "Templates",
      content: (
        <div class="config-tab-templates">
          <ConfigTemplates onTemplateLoad={loadConfig} onTemplateSave={saveConfig} currentConfig={config()} />
        </div>
      ),
    },
  ];

  return (
    <Card class={`config-builder ${props.compact ? "compact" : ""}`}>
      <div class="config-header">
        <div class="config-title">
          <h3>Training Configuration</h3>
          <Show when={validationErrors().length > 0}>
            <Badge variant="destructive">
              {validationErrors().length} Error{validationErrors().length !== 1 ? "s" : ""}
            </Badge>
          </Show>
          <Show when={validationErrors().length === 0 && !isValidating()}>
            <Badge variant="secondary">Valid</Badge>
          </Show>
        </div>

        <div class="config-actions">
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded())}>
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon(isExpanded() ? "chevron-up" : "chevron-down")?.outerHTML || ""}
            />
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      <Show when={validationErrors().length > 0}>
        <div class="config-errors">
          {validationErrors().map(error => (
            <div class="error-item">
              <span class="error-icon">
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("warning")?.outerHTML || ""}
                />
              </span>
              <span class="error-message">{error}</span>
            </div>
          ))}
        </div>
      </Show>

      <Show when={isExpanded()}>
        <div class="config-content">
          {/* Tabs */}
          <div class="config-tabs">
            {tabs.map(tab => (
              <button
                class={`config-tab ${activeTab() === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div class="config-tab-content">{tabs.find(tab => tab.id === activeTab())?.content}</div>

          {/* Config Validator */}
          <div class="config-validator">
            <ConfigValidator
              config={config()}
              onValidationChange={(isValid, errors) => {
                setValidationErrors(errors);
              }}
            />
          </div>

          {/* Action Buttons */}
          <div class="config-actions-bottom">
            <Button variant="primary" onClick={saveConfig}>
              Save Configuration
            </Button>
            <Button variant="secondary" onClick={validateConfig} disabled={isValidating()}>
              <Show when={isValidating()} fallback="Validate">
                <span class="spinner" />
                Validating...
              </Show>
            </Button>
          </div>
        </div>
      </Show>
    </Card>
  );
};

export default ConfigBuilder;
