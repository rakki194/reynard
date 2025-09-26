/**
 * 🦊 Advanced Settings Component
 *
 * Advanced training parameters with tooltips
 * following Reynard's form component patterns.
 */

import { Show, createSignal, createEffect, Component } from "solid-js";
import { Card } from "reynard-primitives";
import { Button } from "reynard-primitives";
import { TextField } from "reynard-primitives";
import { Select } from "reynard-primitives";
import { Badge } from "reynard-primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import type { TrainingConfig } from "./ConfigBuilder";

export interface AdvancedSettingsProps {
  config: TrainingConfig;
  onConfigChange: (updates: Partial<TrainingConfig>) => void;
  compact?: boolean;
}

export const AdvancedSettings: Component<AdvancedSettingsProps> = props => {
  const [isExpanded, setIsExpanded] = createSignal(!props.compact);
  const [showTooltips, setShowTooltips] = createSignal(true);

  // Update config and notify parent
  const updateConfig = (updates: Partial<TrainingConfig>) => {
    props.onConfigChange(updates);
  };

  // Get tooltip content for a setting
  const getTooltip = (setting: string) => {
    const tooltips: Record<string, string> = {
      pipeline_stages:
        "Number of pipeline stages for model parallelism. Higher values reduce memory usage but may impact performance.",
      gradient_accumulation_steps:
        "Number of steps to accumulate gradients before updating weights. Higher values simulate larger batch sizes.",
      gradient_clipping: "Maximum gradient norm for clipping. Prevents exploding gradients during training.",
      warmup_steps: "Number of steps to gradually increase learning rate from 0 to target value.",
      lr: "Learning rate for the optimizer. Higher values train faster but may be unstable.",
      betas: "Beta parameters for Adam optimizer. Controls momentum and adaptive learning rate.",
      weight_decay: "L2 regularization strength. Higher values prevent overfitting but may hurt performance.",
      eps: "Epsilon value for numerical stability in optimizer calculations.",
      rank: "LoRA rank determines the size of the low-rank adaptation. Higher values increase model capacity but use more memory.",
      enable_wandb: "Enable Weights & Biases logging for experiment tracking and visualization.",
      wandb_api_key: "API key for Weights & Biases authentication.",
      wandb_tracker_name: "Project name in Weights & Biases for organizing experiments.",
      wandb_run_name: "Run name for this specific training session.",
    };
    return tooltips[setting] || "No tooltip available";
  };

  // Get setting icon
  const getSettingIcon = (setting: string) => {
    switch (setting) {
      case "pipeline_stages":
        return fluentIconsPackage.getIcon("layers");
      case "gradient_accumulation_steps":
        return fluentIconsPackage.getIcon("arrow-up");
      case "gradient_clipping":
        return fluentIconsPackage.getIcon("clipboard");
      case "warmup_steps":
        return fluentIconsPackage.getIcon("temperature");
      case "lr":
        return fluentIconsPackage.getIcon("speed");
      case "betas":
        return fluentIconsPackage.getIcon("settings");
      case "weight_decay":
        return fluentIconsPackage.getIcon("shield");
      case "eps":
        return fluentIconsPackage.getIcon("calculator");
      case "rank":
        return fluentIconsPackage.getIcon("layers");
      case "enable_wandb":
        return fluentIconsPackage.getIcon("chart-line");
      default:
        return fluentIconsPackage.getIcon("info");
    }
  };

  return (
    <Card class={`advanced-settings ${props.compact ? "compact" : ""}`}>
      <div class="advanced-header">
        <div class="advanced-title">
          <h3>Advanced Settings</h3>
          <Badge variant="outline">Expert</Badge>
        </div>

        <div class="advanced-actions">
          <Button variant="ghost" size="sm" onClick={() => setShowTooltips(!showTooltips())}>
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon(showTooltips() ? "eye-off" : "eye")?.outerHTML || ""}
            />
            {showTooltips() ? "Hide" : "Show"} Tooltips
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded())}>
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon(isExpanded() ? "chevron-up" : "chevron-down")?.outerHTML || ""}
            />
          </Button>
        </div>
      </div>

      <Show when={isExpanded()}>
        <div class="advanced-content">
          {/* Training Parameters */}
          <div class="settings-section">
            <h4>Training Parameters</h4>
            <div class="settings-grid">
              <div class="setting-item">
                <div class="setting-header">
                  <span class="setting-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={getSettingIcon("pipeline_stages")?.outerHTML || ""}
                    />
                  </span>
                  <span class="setting-label">Pipeline Stages</span>
                  <Show when={showTooltips()}>
                    <span class="tooltip" title={getTooltip("pipeline_stages")}>
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML || ""}
                      />
                    </span>
                  </Show>
                </div>
                <TextField
                  type="number"
                  value={props.config.pipeline_stages.toString()}
                  onInput={e => updateConfig({ pipeline_stages: parseInt(e.currentTarget.value) || 1 })}
                  placeholder="1"
                />
              </div>

              <div class="setting-item">
                <div class="setting-header">
                  <span class="setting-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={getSettingIcon("gradient_accumulation_steps")?.outerHTML || ""}
                    />
                  </span>
                  <span class="setting-label">Gradient Accumulation Steps</span>
                  <Show when={showTooltips()}>
                    <span class="tooltip" title={getTooltip("gradient_accumulation_steps")}>
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML || ""}
                      />
                    </span>
                  </Show>
                </div>
                <TextField
                  type="number"
                  value={props.config.gradient_accumulation_steps.toString()}
                  onInput={e => updateConfig({ gradient_accumulation_steps: parseInt(e.currentTarget.value) || 1 })}
                  placeholder="1"
                />
              </div>

              <div class="setting-item">
                <div class="setting-header">
                  <span class="setting-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={getSettingIcon("gradient_clipping")?.outerHTML || ""}
                    />
                  </span>
                  <span class="setting-label">Gradient Clipping</span>
                  <Show when={showTooltips()}>
                    <span class="tooltip" title={getTooltip("gradient_clipping")}>
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML || ""}
                      />
                    </span>
                  </Show>
                </div>
                <TextField
                  type="number"
                  step="0.1"
                  value={props.config.gradient_clipping.toString()}
                  onInput={e => updateConfig({ gradient_clipping: parseFloat(e.currentTarget.value) || 1.0 })}
                  placeholder="1.0"
                />
              </div>

              <div class="setting-item">
                <div class="setting-header">
                  <span class="setting-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={getSettingIcon("warmup_steps")?.outerHTML || ""}
                    />
                  </span>
                  <span class="setting-label">Warmup Steps</span>
                  <Show when={showTooltips()}>
                    <span class="tooltip" title={getTooltip("warmup_steps")}>
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML || ""}
                      />
                    </span>
                  </Show>
                </div>
                <TextField
                  type="number"
                  value={props.config.warmup_steps.toString()}
                  onInput={e => updateConfig({ warmup_steps: parseInt(e.currentTarget.value) || 100 })}
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          {/* Optimizer Settings */}
          <div class="settings-section">
            <h4>Optimizer Settings</h4>
            <div class="settings-grid">
              <div class="setting-item">
                <div class="setting-header">
                  <span class="setting-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={getSettingIcon("lr")?.outerHTML || ""}
                    />
                  </span>
                  <span class="setting-label">Learning Rate</span>
                  <Show when={showTooltips()}>
                    <span class="tooltip" title={getTooltip("lr")}>
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML || ""}
                      />
                    </span>
                  </Show>
                </div>
                <TextField
                  type="number"
                  step="1e-6"
                  value={props.config.optimizer.lr.toString()}
                  onInput={e =>
                    updateConfig({
                      optimizer: { ...props.config.optimizer, lr: parseFloat(e.currentTarget.value) || 2.5e-4 },
                    })
                  }
                  placeholder="2.5e-4"
                />
              </div>

              <div class="setting-item">
                <div class="setting-header">
                  <span class="setting-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={getSettingIcon("betas")?.outerHTML || ""}
                    />
                  </span>
                  <span class="setting-label">Beta 1</span>
                  <Show when={showTooltips()}>
                    <span class="tooltip" title={getTooltip("betas")}>
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML || ""}
                      />
                    </span>
                  </Show>
                </div>
                <TextField
                  type="number"
                  step="0.01"
                  value={props.config.optimizer.betas[0].toString()}
                  onInput={e =>
                    updateConfig({
                      optimizer: {
                        ...props.config.optimizer,
                        betas: [parseFloat(e.currentTarget.value) || 0.9, props.config.optimizer.betas[1]],
                      },
                    })
                  }
                  placeholder="0.9"
                />
              </div>

              <div class="setting-item">
                <div class="setting-header">
                  <span class="setting-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={getSettingIcon("betas")?.outerHTML || ""}
                    />
                  </span>
                  <span class="setting-label">Beta 2</span>
                  <Show when={showTooltips()}>
                    <span class="tooltip" title={getTooltip("betas")}>
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML || ""}
                      />
                    </span>
                  </Show>
                </div>
                <TextField
                  type="number"
                  step="0.01"
                  value={props.config.optimizer.betas[1].toString()}
                  onInput={e =>
                    updateConfig({
                      optimizer: {
                        ...props.config.optimizer,
                        betas: [props.config.optimizer.betas[0], parseFloat(e.currentTarget.value) || 0.99],
                      },
                    })
                  }
                  placeholder="0.99"
                />
              </div>

              <div class="setting-item">
                <div class="setting-header">
                  <span class="setting-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={getSettingIcon("weight_decay")?.outerHTML || ""}
                    />
                  </span>
                  <span class="setting-label">Weight Decay</span>
                  <Show when={showTooltips()}>
                    <span class="tooltip" title={getTooltip("weight_decay")}>
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML || ""}
                      />
                    </span>
                  </Show>
                </div>
                <TextField
                  type="number"
                  step="0.001"
                  value={props.config.optimizer.weight_decay.toString()}
                  onInput={e =>
                    updateConfig({
                      optimizer: { ...props.config.optimizer, weight_decay: parseFloat(e.currentTarget.value) || 0.01 },
                    })
                  }
                  placeholder="0.01"
                />
              </div>

              <div class="setting-item">
                <div class="setting-header">
                  <span class="setting-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={getSettingIcon("eps")?.outerHTML || ""}
                    />
                  </span>
                  <span class="setting-label">Epsilon</span>
                  <Show when={showTooltips()}>
                    <span class="tooltip" title={getTooltip("eps")}>
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML || ""}
                      />
                    </span>
                  </Show>
                </div>
                <TextField
                  type="number"
                  step="1e-9"
                  value={props.config.optimizer.eps.toString()}
                  onInput={e =>
                    updateConfig({
                      optimizer: { ...props.config.optimizer, eps: parseFloat(e.currentTarget.value) || 1e-8 },
                    })
                  }
                  placeholder="1e-8"
                />
              </div>
            </div>
          </div>

          {/* LoRA Settings */}
          <div class="settings-section">
            <h4>LoRA Settings</h4>
            <div class="settings-grid">
              <div class="setting-item">
                <div class="setting-header">
                  <span class="setting-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={getSettingIcon("rank")?.outerHTML || ""}
                    />
                  </span>
                  <span class="setting-label">LoRA Rank</span>
                  <Show when={showTooltips()}>
                    <span class="tooltip" title={getTooltip("rank")}>
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML || ""}
                      />
                    </span>
                  </Show>
                </div>
                <TextField
                  type="number"
                  value={props.config.adapter.rank.toString()}
                  onInput={e =>
                    updateConfig({
                      adapter: { ...props.config.adapter, rank: parseInt(e.currentTarget.value) || 32 },
                    })
                  }
                  placeholder="32"
                />
              </div>
            </div>
          </div>

          {/* Monitoring Settings */}
          <div class="settings-section">
            <h4>Monitoring Settings</h4>
            <div class="settings-grid">
              <div class="setting-item">
                <div class="setting-header">
                  <span class="setting-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={getSettingIcon("enable_wandb")?.outerHTML || ""}
                    />
                  </span>
                  <span class="setting-label">Enable WandB</span>
                  <Show when={showTooltips()}>
                    <span class="tooltip" title={getTooltip("enable_wandb")}>
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML || ""}
                      />
                    </span>
                  </Show>
                </div>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={props.config.monitoring.enable_wandb}
                    onChange={e =>
                      updateConfig({
                        monitoring: { ...props.config.monitoring, enable_wandb: e.currentTarget.checked },
                      })
                    }
                  />
                  <span>Enable Weights & Biases</span>
                </label>
              </div>

              <Show when={props.config.monitoring.enable_wandb}>
                <div class="setting-item">
                  <div class="setting-header">
                    <span class="setting-icon">
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={getSettingIcon("wandb_api_key")?.outerHTML || ""}
                      />
                    </span>
                    <span class="setting-label">WandB API Key</span>
                    <Show when={showTooltips()}>
                      <span class="tooltip" title={getTooltip("wandb_api_key")}>
                        <div
                          // eslint-disable-next-line solid/no-innerhtml
                          innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML || ""}
                        />
                      </span>
                    </Show>
                  </div>
                  <TextField
                    type="password"
                    value={props.config.monitoring.wandb_api_key || ""}
                    onInput={e =>
                      updateConfig({
                        monitoring: { ...props.config.monitoring, wandb_api_key: e.currentTarget.value },
                      })
                    }
                    placeholder="Enter your WandB API key"
                    fullWidth
                  />
                </div>

                <div class="setting-item">
                  <div class="setting-header">
                    <span class="setting-icon">
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={getSettingIcon("wandb_tracker_name")?.outerHTML || ""}
                      />
                    </span>
                    <span class="setting-label">Project Name</span>
                    <Show when={showTooltips()}>
                      <span class="tooltip" title={getTooltip("wandb_tracker_name")}>
                        <div
                          // eslint-disable-next-line solid/no-innerhtml
                          innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML || ""}
                        />
                      </span>
                    </Show>
                  </div>
                  <TextField
                    value={props.config.monitoring.wandb_tracker_name || ""}
                    onInput={e =>
                      updateConfig({
                        monitoring: { ...props.config.monitoring, wandb_tracker_name: e.currentTarget.value },
                      })
                    }
                    placeholder="e6ai-lora"
                    fullWidth
                  />
                </div>

                <div class="setting-item">
                  <div class="setting-header">
                    <span class="setting-icon">
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={getSettingIcon("wandb_run_name")?.outerHTML || ""}
                      />
                    </span>
                    <span class="setting-label">Run Name</span>
                    <Show when={showTooltips()}>
                      <span class="tooltip" title={getTooltip("wandb_run_name")}>
                        <div
                          // eslint-disable-next-line solid/no-innerhtml
                          innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML || ""}
                        />
                      </span>
                    </Show>
                  </div>
                  <TextField
                    value={props.config.monitoring.wandb_run_name || ""}
                    onInput={e =>
                      updateConfig({
                        monitoring: { ...props.config.monitoring, wandb_run_name: e.currentTarget.value },
                      })
                    }
                    placeholder="e6ai-512-2"
                    fullWidth
                  />
                </div>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </Card>
  );
};

export default AdvancedSettings;
