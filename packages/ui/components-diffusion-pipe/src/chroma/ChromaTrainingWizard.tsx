/**
 * 🦊 Chroma Training Wizard Component
 *
 * Guided Chroma LoRA setup with step-by-step flow
 * following Reynard's wizard component patterns.
 */

import { Show, createSignal, createEffect, Component } from "solid-js";
import { Card } from "reynard-primitives";
import { Button } from "reynard-primitives";
import { TextField } from "reynard-primitives";
import { Select } from "reynard-primitives";
import { Badge } from "reynard-primitives";
import { Checkbox } from "reynard-primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import type { TrainingConfig } from "../config/ConfigBuilder";

export interface ChromaWizardStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  optional?: boolean;
}

export interface ChromaTrainingWizardProps {
  onConfigGenerated?: (config: TrainingConfig) => void;
  onWizardComplete?: (config: TrainingConfig) => void;
  compact?: boolean;
}

export const ChromaTrainingWizard: Component<ChromaTrainingWizardProps> = props => {
  const [currentStep, setCurrentStep] = createSignal(0);
  const [wizardConfig, setWizardConfig] = createSignal<Partial<TrainingConfig>>({});
  const [isExpanded, setIsExpanded] = createSignal(!props.compact);

  // Wizard steps
  const steps: ChromaWizardStep[] = [
    {
      id: "model-selection",
      title: "Model Selection",
      description: "Choose your Chroma model and configuration",
      icon: "cube",
      completed: false,
    },
    {
      id: "dataset-setup",
      title: "Dataset Setup",
      description: "Configure your training dataset",
      icon: "folder",
      completed: false,
    },
    {
      id: "training-params",
      title: "Training Parameters",
      description: "Set training hyperparameters",
      icon: "settings",
      completed: false,
    },
    {
      id: "optimization",
      title: "Optimization",
      description: "Configure LoRA and optimization settings",
      icon: "target",
      completed: false,
    },
    {
      id: "monitoring",
      title: "Monitoring",
      description: "Set up monitoring and logging",
      icon: "chart-line",
      completed: false,
      optional: true,
    },
    {
      id: "review",
      title: "Review & Launch",
      description: "Review configuration and start training",
      icon: "checkmark-circle",
      completed: false,
    },
  ];

  // Model presets
  const chromaModels = [
    {
      id: "chroma-unlocked-v47",
      name: "Chroma Unlocked v47",
      description: "Latest stable Chroma model with LoRA support",
      path: "/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v47.safetensors",
      recommended: true,
    },
    {
      id: "chroma-unlocked-v50",
      name: "Chroma Unlocked v50",
      description: "Advanced Chroma model with enhanced capabilities",
      path: "/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v50.safetensors",
      recommended: false,
    },
  ];

  // Dataset presets
  const datasetPresets = [
    {
      id: "e6ai-512",
      name: "E6AI 512",
      description: "E6AI dataset optimized for 512x512 resolution",
      path: "train/e6ai_dataset_512.toml",
      recommended: true,
    },
    {
      id: "e6ai-1024",
      name: "E6AI 1024",
      description: "E6AI dataset optimized for 1024x1024 resolution",
      path: "train/e6ai_dataset_1024.toml",
      recommended: false,
    },
  ];

  // Training presets
  const trainingPresets = [
    {
      id: "fast-training",
      name: "Fast Training",
      description: "Quick training with lower quality",
      epochs: 500,
      batchSize: 4,
      learningRate: 1e-3,
    },
    {
      id: "balanced-training",
      name: "Balanced Training",
      description: "Good balance of speed and quality",
      epochs: 1000,
      batchSize: 2,
      learningRate: 2.5e-4,
      recommended: true,
    },
    {
      id: "quality-training",
      name: "Quality Training",
      description: "High quality training with longer time",
      epochs: 2000,
      batchSize: 1,
      learningRate: 1e-4,
    },
  ];

  // Update wizard config
  const updateWizardConfig = (updates: Partial<TrainingConfig>) => {
    setWizardConfig(prev => ({ ...prev, ...updates }));
  };

  // Mark step as completed
  const markStepCompleted = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      steps[stepIndex].completed = true;
    }
  };

  // Navigate to next step
  const nextStep = () => {
    if (currentStep() < steps.length - 1) {
      setCurrentStep(currentStep() + 1);
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep() > 0) {
      setCurrentStep(currentStep() - 1);
    }
  };

  // Generate final configuration
  const generateConfig = (): TrainingConfig => {
    const config = wizardConfig();
    return {
      output_dir: config.output_dir || "/home/kade/runeset/diffusion-pipe/output/chroma-training",
      epochs: config.epochs || 1000,
      micro_batch_size_per_gpu: config.micro_batch_size_per_gpu || 2,
      pipeline_stages: 1,
      gradient_accumulation_steps: 1,
      gradient_clipping: 1.0,
      warmup_steps: 100,
      model: {
        type: "chroma",
        diffusers_path: config.model?.diffusers_path || "/home/kade/flux_schnell_diffusers",
        transformer_path:
          config.model?.transformer_path || "/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v47.safetensors",
        dtype: "bfloat16",
        transformer_dtype: "float8",
        flux_shift: true,
      },
      adapter: {
        type: "lora",
        rank: config.adapter?.rank || 32,
        dtype: "bfloat16",
      },
      optimizer: {
        type: "adamw_optimi",
        lr: config.optimizer?.lr || 2.5e-4,
        betas: [0.9, 0.99],
        weight_decay: 0.01,
        eps: 1e-8,
      },
      monitoring: {
        enable_wandb: config.monitoring?.enable_wandb || false,
        wandb_api_key: config.monitoring?.wandb_api_key || "",
        wandb_tracker_name: config.monitoring?.wandb_tracker_name || "chroma-lora",
        wandb_run_name: config.monitoring?.wandb_run_name || "chroma-training",
      },
      dataset: config.dataset || "train/e6ai_dataset_512.toml",
    };
  };

  // Complete wizard
  const completeWizard = () => {
    const finalConfig = generateConfig();
    props.onWizardComplete?.(finalConfig);
    props.onConfigGenerated?.(finalConfig);
  };

  // Get step icon
  const getStepIcon = (step: ChromaWizardStep) => {
    if (step.completed) {
      return fluentIconsPackage.getIcon("checkmark-circle");
    }
    return fluentIconsPackage.getIcon(step.icon);
  };

  // Get step color
  const getStepColor = (step: ChromaWizardStep, index: number) => {
    if (step.completed) {
      return "secondary";
    }
    if (index === currentStep()) {
      return "default";
    }
    return "outline";
  };

  // Render current step content
  const renderStepContent = () => {
    const step = steps[currentStep()];

    switch (step.id) {
      case "model-selection":
        return (
          <div class="wizard-step-content">
            <h4>Select Chroma Model</h4>
            <p>Choose the Chroma model you want to train with LoRA.</p>

            <div class="model-selection">
              {chromaModels.map(model => (
                <div
                  class={`model-option ${wizardConfig().model?.transformer_path === model.path ? "selected" : ""}`}
                  onClick={() => {
                    updateWizardConfig({
                      model: {
                        type: "chroma",
                        diffusers_path: "/home/kade/flux_schnell_diffusers",
                        transformer_path: model.path,
                        dtype: "bfloat16",
                        transformer_dtype: "float8",
                        flux_shift: true,
                      },
                    });
                    markStepCompleted("model-selection");
                  }}
                >
                  <div class="model-header">
                    <h5>{model.name}</h5>
                    {model.recommended && <Badge variant="secondary">Recommended</Badge>}
                  </div>
                  <p>{model.description}</p>
                  <div class="model-path">
                    <code>{model.path}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "dataset-setup":
        return (
          <div class="wizard-step-content">
            <h4>Configure Dataset</h4>
            <p>Select your training dataset configuration.</p>

            <div class="dataset-selection">
              {datasetPresets.map(preset => (
                <div
                  class={`dataset-option ${wizardConfig().dataset === preset.path ? "selected" : ""}`}
                  onClick={() => {
                    updateWizardConfig({ dataset: preset.path });
                    markStepCompleted("dataset-setup");
                  }}
                >
                  <div class="dataset-header">
                    <h5>{preset.name}</h5>
                    {preset.recommended && <Badge variant="secondary">Recommended</Badge>}
                  </div>
                  <p>{preset.description}</p>
                  <div class="dataset-path">
                    <code>{preset.path}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "training-params":
        return (
          <div class="wizard-step-content">
            <h4>Training Parameters</h4>
            <p>Configure your training hyperparameters.</p>

            <div class="training-presets">
              <h5>Training Presets</h5>
              {trainingPresets.map(preset => (
                <div
                  class={`preset-option ${wizardConfig().epochs === preset.epochs ? "selected" : ""}`}
                  onClick={() => {
                    updateWizardConfig({
                      epochs: preset.epochs,
                      micro_batch_size_per_gpu: preset.batchSize,
                      optimizer: {
                        type: "adamw_optimi",
                        lr: preset.learningRate,
                        betas: [0.9, 0.99],
                        weight_decay: 0.01,
                        eps: 1e-8,
                      },
                    });
                    markStepCompleted("training-params");
                  }}
                >
                  <div class="preset-header">
                    <h6>{preset.name}</h6>
                    {preset.recommended && <Badge variant="secondary">Recommended</Badge>}
                  </div>
                  <p>{preset.description}</p>
                  <div class="preset-details">
                    <span>Epochs: {preset.epochs}</span>
                    <span>Batch Size: {preset.batchSize}</span>
                    <span>Learning Rate: {preset.learningRate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "optimization":
        return (
          <div class="wizard-step-content">
            <h4>LoRA Optimization</h4>
            <p>Configure LoRA rank and optimization settings.</p>

            <div class="optimization-settings">
              <div class="setting-group">
                <TextField
                  label="LoRA Rank"
                  type="number"
                  value={wizardConfig().adapter?.rank?.toString() || "32"}
                  onChange={e => {
                    const rank = parseInt(e.currentTarget.value) || 32;
                    updateWizardConfig({
                      adapter: {
                        type: "lora",
                        rank,
                        dtype: "bfloat16",
                      },
                    });
                    markStepCompleted("optimization");
                  }}
                  min="8"
                  max="128"
                  helperText="Higher rank = more parameters, better quality but slower training"
                />
              </div>

              <div class="setting-group">
                <div class="checkbox-with-label">
                  <Checkbox
                    checked={wizardConfig().model?.flux_shift ?? true}
                    onChange={checked => {
                      updateWizardConfig({
                        model: {
                          type: wizardConfig().model?.type || "chroma",
                          diffusers_path: wizardConfig().model?.diffusers_path || "",
                          transformer_path: wizardConfig().model?.transformer_path || "",
                          dtype: wizardConfig().model?.dtype || "bfloat16",
                          transformer_dtype: wizardConfig().model?.transformer_dtype || "float8",
                          flux_shift: checked,
                        },
                      });
                    }}
                  />
                  <label>Enable Flux Shift</label>
                </div>
              </div>
            </div>
          </div>
        );

      case "monitoring":
        return (
          <div class="wizard-step-content">
            <h4>Monitoring Setup</h4>
            <p>Configure monitoring and logging (optional).</p>

            <div class="monitoring-settings">
              <div class="checkbox-with-label">
                <Checkbox
                  checked={wizardConfig().monitoring?.enable_wandb ?? false}
                  onChange={checked => {
                    updateWizardConfig({
                      monitoring: {
                        enable_wandb: checked,
                        wandb_api_key: wizardConfig().monitoring?.wandb_api_key || "",
                        wandb_tracker_name: "chroma-lora",
                        wandb_run_name: "chroma-training",
                      } as TrainingConfig["monitoring"],
                    });
                    markStepCompleted("monitoring");
                  }}
                />
                <label>Enable WandB Monitoring</label>
              </div>

              <Show when={wizardConfig().monitoring?.enable_wandb}>
                <TextField
                  label="WandB API Key"
                  type="password"
                  value={wizardConfig().monitoring?.wandb_api_key || ""}
                  onChange={e => {
                    updateWizardConfig({
                      monitoring: {
                        enable_wandb: wizardConfig().monitoring?.enable_wandb ?? false,
                        wandb_api_key: e.currentTarget.value,
                        wandb_tracker_name: wizardConfig().monitoring?.wandb_tracker_name || "chroma-lora",
                        wandb_run_name: wizardConfig().monitoring?.wandb_run_name || "chroma-training",
                      },
                    });
                  }}
                  placeholder="Enter your WandB API key"
                />
              </Show>
            </div>
          </div>
        );

      case "review":
        return (
          <div class="wizard-step-content">
            <h4>Review Configuration</h4>
            <p>Review your Chroma LoRA training configuration before starting.</p>

            <div class="config-review">
              <div class="review-section">
                <h5>Model Configuration</h5>
                <div class="review-item">
                  <span class="label">Model:</span>
                  <span class="value">
                    {wizardConfig().model?.transformer_path?.split("/").pop() || "Not selected"}
                  </span>
                </div>
                <div class="review-item">
                  <span class="label">Dataset:</span>
                  <span class="value">{wizardConfig().dataset || "Not selected"}</span>
                </div>
              </div>

              <div class="review-section">
                <h5>Training Parameters</h5>
                <div class="review-item">
                  <span class="label">Epochs:</span>
                  <span class="value">{wizardConfig().epochs || "Not set"}</span>
                </div>
                <div class="review-item">
                  <span class="label">Batch Size:</span>
                  <span class="value">{wizardConfig().micro_batch_size_per_gpu || "Not set"}</span>
                </div>
                <div class="review-item">
                  <span class="label">Learning Rate:</span>
                  <span class="value">{wizardConfig().optimizer?.lr || "Not set"}</span>
                </div>
              </div>

              <div class="review-section">
                <h5>LoRA Settings</h5>
                <div class="review-item">
                  <span class="label">LoRA Rank:</span>
                  <span class="value">{wizardConfig().adapter?.rank || "Not set"}</span>
                </div>
                <div class="review-item">
                  <span class="label">Flux Shift:</span>
                  <span class="value">{wizardConfig().model?.flux_shift ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Card class={`chroma-training-wizard ${props.compact ? "compact" : ""}`}>
      <div class="wizard-header">
        <div class="wizard-title">
          <h3>Chroma LoRA Training Wizard</h3>
          <Badge variant="secondary">
            Step {currentStep() + 1} of {steps.length}
          </Badge>
        </div>

        <div class="wizard-actions">
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded())}>
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon(isExpanded() ? "chevron-up" : "chevron-down")?.outerHTML || ""}
            />
          </Button>
        </div>
      </div>

      <Show when={isExpanded()}>
        <div class="wizard-content">
          {/* Step Progress */}
          <div class="wizard-progress">
            {steps.map((step, index) => (
              <div
                class={`progress-step ${index === currentStep() ? "active" : ""} ${step.completed ? "completed" : ""}`}
                onClick={() => setCurrentStep(index)}
              >
                <div class="step-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={getStepIcon(step)?.outerHTML || ""}
                  />
                </div>
                <div class="step-info">
                  <h5>{step.title}</h5>
                  <p>{step.description}</p>
                </div>
                <Show when={step.optional}>
                  <Badge variant="outline" size="sm">
                    Optional
                  </Badge>
                </Show>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div class="wizard-step">{renderStepContent()}</div>

          {/* Navigation */}
          <div class="wizard-navigation">
            <Button variant="ghost" onClick={prevStep} disabled={currentStep() === 0}>
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("chevron-left")?.outerHTML || ""}
              />
              Previous
            </Button>

            <div class="step-indicator">
              {steps.map((_, index) => (
                <div
                  class={`indicator-dot ${index === currentStep() ? "active" : ""} ${index < currentStep() ? "completed" : ""}`}
                />
              ))}
            </div>

            <Show
              when={currentStep() === steps.length - 1}
              fallback={
                <Button
                  variant="primary"
                  onClick={nextStep}
                  disabled={!steps[currentStep()].completed && !steps[currentStep()].optional}
                >
                  Next
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("chevron-right")?.outerHTML || ""}
                  />
                </Button>
              }
            >
              <Button
                variant="primary"
                onClick={completeWizard}
                disabled={!steps.every(step => step.completed || step.optional)}
              >
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("play")?.outerHTML || ""}
                />
                Start Training
              </Button>
            </Show>
          </div>
        </div>
      </Show>
    </Card>
  );
};

export default ChromaTrainingWizard;
