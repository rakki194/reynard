/**
 * 🦊 Model Selector Component
 *
 * Model type selection with capabilities and presets
 * following Reynard's selection component patterns.
 */

import { Show, createSignal, createEffect, Component } from "solid-js";
import { Card } from "reynard-components-core/primitives";
import { Button } from "reynard-components-core/primitives";
import { TextField } from "reynard-components-core/primitives";
import { Select } from "reynard-components-core/primitives";
import { Badge } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";

export interface ModelInfo {
  type: string;
  name: string;
  description: string;
  capabilities: string[];
  presets: ModelPreset[];
  requirements: {
    min_memory: number; // GB
    recommended_memory: number; // GB
    supported_dtypes: string[];
    supported_resolutions: number[];
  };
}

export interface ModelPreset {
  name: string;
  description: string;
  config: {
    diffusers_path: string;
    transformer_path: string;
    dtype: string;
    transformer_dtype: string;
    flux_shift?: boolean;
  };
}

export interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelType: string) => void;
  onModelConfigChange: (config: any) => void;
  compact?: boolean;
}

export const ModelSelector: Component<ModelSelectorProps> = props => {
  const [selectedPreset, setSelectedPreset] = createSignal<string>("");
  const [customConfig, setCustomConfig] = createSignal({
    diffusers_path: "",
    transformer_path: "",
    dtype: "bfloat16",
    transformer_dtype: "float8",
    flux_shift: false,
  });

  // Available models with their capabilities and presets
  const availableModels: ModelInfo[] = [
    {
      type: "chroma",
      name: "Chroma",
      description: "High-quality image generation model with LoRA support",
      capabilities: ["lora", "text-to-image", "image-to-image", "inpainting"],
      requirements: {
        min_memory: 8,
        recommended_memory: 12,
        supported_dtypes: ["bfloat16", "float16", "float32"],
        supported_resolutions: [512, 768, 1024],
      },
      presets: [
        {
          name: "Chroma E6AI 512",
          description: "Optimized for E6AI dataset at 512 resolution",
          config: {
            diffusers_path: "/home/kade/flux_schnell_diffusers",
            transformer_path: "/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v47.safetensors",
            dtype: "bfloat16",
            transformer_dtype: "float8",
            flux_shift: true,
          },
        },
        {
          name: "Chroma E6AI 1024",
          description: "Optimized for E6AI dataset at 1024 resolution",
          config: {
            diffusers_path: "/home/kade/flux_schnell_diffusers",
            transformer_path: "/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v50.safetensors",
            dtype: "bfloat16",
            transformer_dtype: "float8",
            flux_shift: true,
          },
        },
      ],
    },
    {
      type: "sdxl",
      name: "SDXL",
      description: "Stable Diffusion XL for high-resolution generation",
      capabilities: ["lora", "text-to-image", "image-to-image"],
      requirements: {
        min_memory: 6,
        recommended_memory: 10,
        supported_dtypes: ["bfloat16", "float16"],
        supported_resolutions: [512, 768, 1024],
      },
      presets: [
        {
          name: "SDXL Base",
          description: "Standard SDXL configuration",
          config: {
            diffusers_path: "/home/kade/sdxl_diffusers",
            transformer_path: "/home/kade/sdxl_unet.safetensors",
            dtype: "bfloat16",
            transformer_dtype: "float8",
            flux_shift: false,
          },
        },
      ],
    },
    {
      type: "flux",
      name: "Flux",
      description: "Next-generation diffusion model",
      capabilities: ["lora", "text-to-image"],
      requirements: {
        min_memory: 10,
        recommended_memory: 16,
        supported_dtypes: ["bfloat16", "float16"],
        supported_resolutions: [512, 1024],
      },
      presets: [
        {
          name: "Flux Base",
          description: "Standard Flux configuration",
          config: {
            diffusers_path: "/home/kade/flux_diffusers",
            transformer_path: "/home/kade/flux_unet.safetensors",
            dtype: "bfloat16",
            transformer_dtype: "float8",
            flux_shift: true,
          },
        },
      ],
    },
  ];

  // Get current model info
  const getCurrentModel = () => {
    return availableModels.find(model => model.type === props.selectedModel);
  };

  // Get model icon
  const getModelIcon = (modelType: string) => {
    switch (modelType) {
      case "chroma":
        return fluentIconsPackage.getIcon("image");
      case "sdxl":
        return fluentIconsPackage.getIcon("picture");
      case "flux":
        return fluentIconsPackage.getIcon("sparkle");
      default:
        return fluentIconsPackage.getIcon("cube");
    }
  };

  // Get capability icon
  const getCapabilityIcon = (capability: string) => {
    switch (capability) {
      case "lora":
        return fluentIconsPackage.getIcon("layers");
      case "text-to-image":
        return fluentIconsPackage.getIcon("text");
      case "image-to-image":
        return fluentIconsPackage.getIcon("arrow-right");
      case "inpainting":
        return fluentIconsPackage.getIcon("edit");
      default:
        return fluentIconsPackage.getIcon("checkmark");
    }
  };

  // Handle model change
  const handleModelChange = (modelType: string) => {
    props.onModelChange(modelType);
    setSelectedPreset("");
  };

  // Handle preset selection
  const handlePresetSelect = (preset: ModelPreset) => {
    setSelectedPreset(preset.name);
    setCustomConfig({
      ...preset.config,
      flux_shift: preset.config.flux_shift ?? false
    });
    props.onModelConfigChange({
      ...preset.config,
      flux_shift: preset.config.flux_shift ?? false
    });
  };

  // Handle custom config change
  const handleCustomConfigChange = (field: string, value: any) => {
    const newConfig = { ...customConfig(), [field]: value };
    setCustomConfig(newConfig);
    props.onModelConfigChange(newConfig);
  };

  // Check if current config matches a preset
  const getMatchingPreset = () => {
    const currentModel = getCurrentModel();
    if (!currentModel) return null;

    return currentModel.presets.find(
      preset =>
        preset.config.diffusers_path === customConfig().diffusers_path &&
        preset.config.transformer_path === customConfig().transformer_path &&
        preset.config.dtype === customConfig().dtype &&
        preset.config.transformer_dtype === customConfig().transformer_dtype &&
        preset.config.flux_shift === customConfig().flux_shift
    );
  };

  const currentModel = getCurrentModel();
  const matchingPreset = getMatchingPreset();

  return (
    <Card class={`model-selector ${props.compact ? "compact" : ""}`}>
      <div class="model-selector-header">
        <h3>Model Selection</h3>
        <Show when={matchingPreset}>
          <Badge variant="secondary">{matchingPreset!.name}</Badge>
        </Show>
      </div>

      <div class="model-selector-content">
        {/* Model Type Selection */}
        <div class="model-type-selection">
          <h4>Model Type</h4>
          <div class="model-grid">
            {availableModels.map(model => (
              <div
                class={`model-card ${props.selectedModel === model.type ? "selected" : ""}`}
                onClick={() => handleModelChange(model.type)}
              >
                <div class="model-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={getModelIcon(model.type)?.outerHTML || ""}
                  />
                </div>
                <div class="model-info">
                  <h5>{model.name}</h5>
                  <p>{model.description}</p>
                  <div class="model-capabilities">
                    {model.capabilities.map(capability => (
                      <Badge variant="outline" size="sm">
                        <span class="capability-icon">
                          <div
                            // eslint-disable-next-line solid/no-innerhtml
                            innerHTML={getCapabilityIcon(capability)?.outerHTML || ""}
                          />
                        </span>
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div class="model-requirements">
                  <div class="requirement-item">
                    <span class="requirement-label">Min Memory:</span>
                    <span class="requirement-value">{model.requirements.min_memory}GB</span>
                  </div>
                  <div class="requirement-item">
                    <span class="requirement-label">Recommended:</span>
                    <span class="requirement-value">{model.requirements.recommended_memory}GB</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Configuration */}
        <Show when={currentModel}>
          <div class="model-configuration">
            <h4>Model Configuration</h4>

            {/* Presets */}
            <div class="model-presets">
              <h5>Presets</h5>
              <div class="preset-grid">
                {currentModel!.presets.map(preset => (
                  <div
                    class={`preset-card ${selectedPreset() === preset.name ? "selected" : ""}`}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <h6>{preset.name}</h6>
                    <p>{preset.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Configuration */}
            <div class="custom-config">
              <h5>Custom Configuration</h5>
              <div class="config-grid">
                <div class="config-item">
                  <TextField
                    label="Diffusers Path"
                    value={customConfig().diffusers_path}
                    onInput={e => handleCustomConfigChange("diffusers_path", e.currentTarget.value)}
                    placeholder="/path/to/diffusers"
                    fullWidth
                  />
                </div>
                <div class="config-item">
                  <TextField
                    label="Transformer Path"
                    value={customConfig().transformer_path}
                    onInput={e => handleCustomConfigChange("transformer_path", e.currentTarget.value)}
                    placeholder="/path/to/transformer.safetensors"
                    fullWidth
                  />
                </div>
                <div class="config-item">
                  <Select
                    label="Data Type"
                    value={customConfig().dtype}
                    onChange={e => handleCustomConfigChange("dtype", e.currentTarget.value)}
                    options={currentModel!.requirements.supported_dtypes.map(dtype => ({
                      value: dtype,
                      label: dtype,
                    }))}
                  />
                </div>
                <div class="config-item">
                  <Select
                    label="Transformer Data Type"
                    value={customConfig().transformer_dtype}
                    onChange={e => handleCustomConfigChange("transformer_dtype", e.currentTarget.value)}
                    options={currentModel!.requirements.supported_dtypes.map(dtype => ({
                      value: dtype,
                      label: dtype,
                    }))}
                  />
                </div>
                <Show when={currentModel!.type === "chroma" || currentModel!.type === "flux"}>
                  <div class="config-item">
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        checked={customConfig().flux_shift}
                        onChange={e => handleCustomConfigChange("flux_shift", e.currentTarget.checked)}
                      />
                      <span>Flux Shift</span>
                    </label>
                  </div>
                </Show>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </Card>
  );
};

export default ModelSelector;
