/**
 * 🦊 Dataset Configurator Component
 *
 * Dataset path and settings with validation
 * following Reynard's form component patterns.
 */

import { Show, createSignal, createEffect, Component } from "solid-js";
import { Card } from "reynard-primitives";
import { Button } from "reynard-primitives";
import { TextField } from "reynard-primitives";
import { Select } from "reynard-primitives";
import { Badge } from "reynard-primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";

export interface DatasetConfig {
  path: string;
  resolutions: number[];
  enable_ar_bucket: boolean;
  min_ar: number;
  max_ar: number;
  num_ar_buckets: number;
  frame_buckets: number[];
  shuffle_tags: boolean;
  caption_prefix?: string;
  num_repeats: number;
}

export interface DatasetConfiguratorProps {
  datasetPath: string;
  onDatasetChange: (path: string) => void;
  onDatasetConfigChange: (config: DatasetConfig) => void;
  compact?: boolean;
}

export const DatasetConfigurator: Component<DatasetConfiguratorProps> = props => {
  const [datasetConfig, setDatasetConfig] = createSignal<DatasetConfig>({
    path: "/home/kade/datasets/e6ai/1_e6ai",
    resolutions: [512],
    enable_ar_bucket: true,
    min_ar: 0.5,
    max_ar: 2.0,
    num_ar_buckets: 9,
    frame_buckets: [1],
    shuffle_tags: true,
    caption_prefix: "by e6ai, ",
    num_repeats: 1,
  });

  const [isValidating, setIsValidating] = createSignal(false);
  const [validationErrors, setValidationErrors] = createSignal<string[]>([]);
  const [isExpanded, setIsExpanded] = createSignal(!props.compact);

  // Available dataset presets
  const datasetPresets = [
    {
      name: "E6AI 512",
      description: "E6AI dataset optimized for 512 resolution",
      config: {
        path: "/home/kade/datasets/e6ai/1_e6ai",
        resolutions: [512],
        enable_ar_bucket: true,
        min_ar: 0.5,
        max_ar: 2.0,
        num_ar_buckets: 9,
        frame_buckets: [1],
        shuffle_tags: true,
        caption_prefix: "by e6ai, ",
        num_repeats: 1,
      },
    },
    {
      name: "E6AI 1024",
      description: "E6AI dataset optimized for 1024 resolution",
      config: {
        path: "/home/kade/datasets/e6ai/1_e6ai",
        resolutions: [1024],
        enable_ar_bucket: true,
        min_ar: 0.5,
        max_ar: 2.0,
        num_ar_buckets: 9,
        frame_buckets: [1],
        shuffle_tags: true,
        caption_prefix: "by e6ai, ",
        num_repeats: 1,
      },
    },
    {
      name: "Custom Dataset",
      description: "Custom dataset configuration",
      config: {
        path: "",
        resolutions: [512],
        enable_ar_bucket: false,
        min_ar: 0.5,
        max_ar: 2.0,
        num_ar_buckets: 9,
        frame_buckets: [1],
        shuffle_tags: false,
        caption_prefix: "",
        num_repeats: 1,
      },
    },
  ];

  // Update dataset config and notify parent
  const updateDatasetConfig = (updates: Partial<DatasetConfig>) => {
    const newConfig = { ...datasetConfig(), ...updates };
    setDatasetConfig(newConfig);
    props.onDatasetConfigChange(newConfig);
  };

  // Validate dataset path
  const validateDatasetPath = async (path: string) => {
    setIsValidating(true);
    setValidationErrors([]);

    try {
      // This would typically call the API to validate the dataset path
      // const client = createDiffusionPipeClient();
      // const isValid = await client.validateDatasetPath(path);

      // Mock validation for now
      const errors: string[] = [];

      if (!path) {
        errors.push("Dataset path is required");
      } else if (!path.startsWith("/")) {
        errors.push("Dataset path must be absolute");
      } else if (!path.includes("datasets")) {
        errors.push('Dataset path should contain "datasets" directory');
      }

      setValidationErrors(errors);
    } catch (error) {
      setValidationErrors([error instanceof Error ? error.message : "Validation error"]);
    } finally {
      setIsValidating(false);
    }
  };

  // Handle preset selection
  const handlePresetSelect = (preset: (typeof datasetPresets)[0]) => {
    setDatasetConfig(preset.config);
    props.onDatasetConfigChange(preset.config);
    props.onDatasetChange(preset.config.path);
  };

  // Handle path change
  const handlePathChange = (path: string) => {
    updateDatasetConfig({ path });
    props.onDatasetChange(path);
    validateDatasetPath(path);
  };

  // Get dataset icon
  const getDatasetIcon = () => {
    return fluentIconsPackage.getIcon("folder");
  };

  // Get validation icon
  const getValidationIcon = () => {
    if (isValidating()) {
      return fluentIconsPackage.getIcon("spinner");
    }
    if (validationErrors().length > 0) {
      return fluentIconsPackage.getIcon("warning");
    }
    return fluentIconsPackage.getIcon("checkmark-circle");
  };

  // Get validation color
  const getValidationColor = () => {
    if (isValidating()) {
      return "secondary";
    }
    if (validationErrors().length > 0) {
      return "destructive";
    }
    return "secondary";
  };

  return (
    <Card class={`dataset-configurator ${props.compact ? "compact" : ""}`}>
      <div class="dataset-header">
        <div class="dataset-title">
          <h3>Dataset Configuration</h3>
          <Badge variant={getValidationColor()}>
            <span class="validation-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={getValidationIcon()?.outerHTML || ""}
              />
            </span>
            <Show when={isValidating()} fallback={validationErrors().length > 0 ? "Invalid" : "Valid"}>
              Validating...
            </Show>
          </Badge>
        </div>

        <div class="dataset-actions">
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
        <div class="dataset-errors">
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
        <div class="dataset-content">
          {/* Dataset Presets */}
          <div class="dataset-presets">
            <h4>Dataset Presets</h4>
            <div class="preset-grid">
              {datasetPresets.map(preset => (
                <div class="preset-card" onClick={() => handlePresetSelect(preset)}>
                  <div class="preset-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={getDatasetIcon()?.outerHTML || ""}
                    />
                  </div>
                  <div class="preset-info">
                    <h5>{preset.name}</h5>
                    <p>{preset.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dataset Path */}
          <div class="dataset-path">
            <h4>Dataset Path</h4>
            <TextField
              label="Dataset Directory"
              value={datasetConfig().path}
              onInput={e => handlePathChange(e.currentTarget.value)}
              placeholder="/path/to/dataset"
              fullWidth
              error={validationErrors().length > 0}
              helperText="Absolute path to the dataset directory"
            />
          </div>

          {/* Dataset Settings */}
          <div class="dataset-settings">
            <h4>Dataset Settings</h4>
            <div class="settings-grid">
              <div class="setting-item">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={datasetConfig().enable_ar_bucket}
                    onChange={e => updateDatasetConfig({ enable_ar_bucket: e.currentTarget.checked })}
                  />
                  <span>Enable Aspect Ratio Bucketing</span>
                </label>
              </div>

              <Show when={datasetConfig().enable_ar_bucket}>
                <div class="setting-item">
                  <TextField
                    label="Min Aspect Ratio"
                    type="number"
                    step="0.1"
                    value={datasetConfig().min_ar.toString()}
                    onInput={e => updateDatasetConfig({ min_ar: parseFloat(e.currentTarget.value) || 0.5 })}
                    placeholder="0.5"
                  />
                </div>
                <div class="setting-item">
                  <TextField
                    label="Max Aspect Ratio"
                    type="number"
                    step="0.1"
                    value={datasetConfig().max_ar.toString()}
                    onInput={e => updateDatasetConfig({ max_ar: parseFloat(e.currentTarget.value) || 2.0 })}
                    placeholder="2.0"
                  />
                </div>
                <div class="setting-item">
                  <TextField
                    label="Number of AR Buckets"
                    type="number"
                    value={datasetConfig().num_ar_buckets.toString()}
                    onInput={e => updateDatasetConfig({ num_ar_buckets: parseInt(e.currentTarget.value) || 9 })}
                    placeholder="9"
                  />
                </div>
              </Show>

              <div class="setting-item">
                <TextField
                  label="Caption Prefix"
                  value={datasetConfig().caption_prefix || ""}
                  onInput={e => updateDatasetConfig({ caption_prefix: e.currentTarget.value })}
                  placeholder="by e6ai, "
                  helperText="Optional prefix for captions"
                />
              </div>

              <div class="setting-item">
                <TextField
                  label="Number of Repeats"
                  type="number"
                  value={datasetConfig().num_repeats.toString()}
                  onInput={e => updateDatasetConfig({ num_repeats: parseInt(e.currentTarget.value) || 1 })}
                  placeholder="1"
                  helperText="How many times to repeat each image"
                />
              </div>

              <div class="setting-item">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={datasetConfig().shuffle_tags}
                    onChange={e => updateDatasetConfig({ shuffle_tags: e.currentTarget.checked })}
                  />
                  <span>Shuffle Tags</span>
                </label>
              </div>
            </div>
          </div>

          {/* Resolution Settings */}
          <div class="resolution-settings">
            <h4>Resolution Settings</h4>
            <div class="resolution-grid">
              {datasetConfig().resolutions.map((resolution, index) => (
                <div class="resolution-item">
                  <TextField
                    label={`Resolution ${index + 1}`}
                    type="number"
                    value={resolution.toString()}
                    onInput={e => {
                      const newResolutions = [...datasetConfig().resolutions];
                      newResolutions[index] = parseInt(e.currentTarget.value) || 512;
                      updateDatasetConfig({ resolutions: newResolutions });
                    }}
                    placeholder="512"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newResolutions = datasetConfig().resolutions.filter((_, i) => i !== index);
                      updateDatasetConfig({ resolutions: newResolutions });
                    }}
                  >
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={fluentIconsPackage.getIcon("dismiss")?.outerHTML || ""}
                    />
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const newResolutions = [...datasetConfig().resolutions, 512];
                  updateDatasetConfig({ resolutions: newResolutions });
                }}
              >
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("add")?.outerHTML || ""}
                />
                Add Resolution
              </Button>
            </div>
          </div>
        </div>
      </Show>
    </Card>
  );
};

export default DatasetConfigurator;
