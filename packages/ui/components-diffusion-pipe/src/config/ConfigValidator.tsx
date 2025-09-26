/**
 * 🦊 Config Validator Component
 *
 * Real-time configuration validation with error highlighting
 * following Reynard's validation component patterns.
 */

import { Show, createSignal, createEffect, Component } from "solid-js";
import { Card } from "reynard-primitives";
import { Button } from "reynard-primitives";
import { Badge } from "reynard-primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import type { TrainingConfig } from "./ConfigBuilder";

export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning" | "info";
  suggestion?: string;
}

export interface ConfigValidatorProps {
  config: TrainingConfig;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  compact?: boolean;
}

export const ConfigValidator: Component<ConfigValidatorProps> = props => {
  const [validationErrors, setValidationErrors] = createSignal<ValidationError[]>([]);
  const [isValidating, setIsValidating] = createSignal(false);
  const [isExpanded, setIsExpanded] = createSignal(!props.compact);

  // Validate configuration
  const validateConfig = async () => {
    setIsValidating(true);
    const errors: ValidationError[] = [];

    try {
      // Basic validation
      if (!props.config.output_dir) {
        errors.push({
          field: "output_dir",
          message: "Output directory is required",
          severity: "error",
        });
      } else if (!props.config.output_dir.startsWith("/")) {
        errors.push({
          field: "output_dir",
          message: "Output directory must be an absolute path",
          severity: "error",
          suggestion: "Use a path starting with /",
        });
      }

      if (props.config.epochs <= 0) {
        errors.push({
          field: "epochs",
          message: "Epochs must be greater than 0",
          severity: "error",
        });
      } else if (props.config.epochs > 10000) {
        errors.push({
          field: "epochs",
          message: "Epochs value seems very high",
          severity: "warning",
          suggestion: "Consider using a lower value for faster iteration",
        });
      }

      if (props.config.micro_batch_size_per_gpu <= 0) {
        errors.push({
          field: "micro_batch_size_per_gpu",
          message: "Micro batch size must be greater than 0",
          severity: "error",
        });
      } else if (props.config.micro_batch_size_per_gpu > 16) {
        errors.push({
          field: "micro_batch_size_per_gpu",
          message: "Micro batch size seems very high",
          severity: "warning",
          suggestion: "Consider using a lower value to avoid memory issues",
        });
      }

      // Model validation
      if (!props.config.model.type) {
        errors.push({
          field: "model.type",
          message: "Model type is required",
          severity: "error",
        });
      }

      if (!props.config.model.diffusers_path) {
        errors.push({
          field: "model.diffusers_path",
          message: "Diffusers path is required",
          severity: "error",
        });
      } else if (!props.config.model.diffusers_path.startsWith("/")) {
        errors.push({
          field: "model.diffusers_path",
          message: "Diffusers path must be an absolute path",
          severity: "error",
        });
      }

      if (!props.config.model.transformer_path) {
        errors.push({
          field: "model.transformer_path",
          message: "Transformer path is required",
          severity: "error",
        });
      } else if (!props.config.model.transformer_path.endsWith(".safetensors")) {
        errors.push({
          field: "model.transformer_path",
          message: "Transformer path should end with .safetensors",
          severity: "warning",
          suggestion: "Use .safetensors format for better compatibility",
        });
      }

      // Adapter validation
      if (!props.config.adapter.type) {
        errors.push({
          field: "adapter.type",
          message: "Adapter type is required",
          severity: "error",
        });
      }

      if (props.config.adapter.rank <= 0) {
        errors.push({
          field: "adapter.rank",
          message: "LoRA rank must be greater than 0",
          severity: "error",
        });
      } else if (props.config.adapter.rank > 128) {
        errors.push({
          field: "adapter.rank",
          message: "LoRA rank seems very high",
          severity: "warning",
          suggestion: "Consider using a lower rank (16-64) for better performance",
        });
      }

      // Optimizer validation
      if (props.config.optimizer.lr <= 0) {
        errors.push({
          field: "optimizer.lr",
          message: "Learning rate must be greater than 0",
          severity: "error",
        });
      } else if (props.config.optimizer.lr > 0.01) {
        errors.push({
          field: "optimizer.lr",
          message: "Learning rate seems very high",
          severity: "warning",
          suggestion: "Consider using a lower learning rate (1e-5 to 1e-3)",
        });
      }

      if (props.config.optimizer.betas[0] <= 0 || props.config.optimizer.betas[0] >= 1) {
        errors.push({
          field: "optimizer.betas[0]",
          message: "Beta 1 must be between 0 and 1",
          severity: "error",
        });
      }

      if (props.config.optimizer.betas[1] <= 0 || props.config.optimizer.betas[1] >= 1) {
        errors.push({
          field: "optimizer.betas[1]",
          message: "Beta 2 must be between 0 and 1",
          severity: "error",
        });
      }

      if (props.config.optimizer.weight_decay < 0) {
        errors.push({
          field: "optimizer.weight_decay",
          message: "Weight decay must be non-negative",
          severity: "error",
        });
      }

      // Dataset validation
      if (!props.config.dataset) {
        errors.push({
          field: "dataset",
          message: "Dataset configuration is required",
          severity: "error",
        });
      }

      // Monitoring validation
      if (props.config.monitoring.enable_wandb) {
        if (!props.config.monitoring.wandb_api_key) {
          errors.push({
            field: "monitoring.wandb_api_key",
            message: "WandB API key is required when WandB is enabled",
            severity: "error",
          });
        }

        if (!props.config.monitoring.wandb_tracker_name) {
          errors.push({
            field: "monitoring.wandb_tracker_name",
            message: "WandB project name is required when WandB is enabled",
            severity: "error",
          });
        }
      }

      // Advanced validation
      if (props.config.pipeline_stages <= 0) {
        errors.push({
          field: "pipeline_stages",
          message: "Pipeline stages must be greater than 0",
          severity: "error",
        });
      }

      if (props.config.gradient_accumulation_steps <= 0) {
        errors.push({
          field: "gradient_accumulation_steps",
          message: "Gradient accumulation steps must be greater than 0",
          severity: "error",
        });
      }

      if (props.config.gradient_clipping <= 0) {
        errors.push({
          field: "gradient_clipping",
          message: "Gradient clipping must be greater than 0",
          severity: "error",
        });
      }

      if (props.config.warmup_steps < 0) {
        errors.push({
          field: "warmup_steps",
          message: "Warmup steps must be non-negative",
          severity: "error",
        });
      }

      setValidationErrors(errors);

      // Notify parent component
      const errorMessages = errors.map(error => error.message);
      props.onValidationChange?.(errors.length === 0, errorMessages);
    } catch (error) {
      console.error("Validation error:", error);
      const validationError: ValidationError = {
        field: "general",
        message: "Configuration validation failed",
        severity: "error",
      };
      setValidationErrors([validationError]);
      props.onValidationChange?.(false, [validationError.message]);
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-validate on config changes
  createEffect(() => {
    if (props.config) {
      validateConfig();
    }
  });

  // Get validation icon
  const getValidationIcon = () => {
    if (isValidating()) {
      return fluentIconsPackage.getIcon("spinner");
    }
    if (validationErrors().length === 0) {
      return fluentIconsPackage.getIcon("checkmark-circle");
    }
    const hasErrors = validationErrors().some(error => error.severity === "error");
    return hasErrors ? fluentIconsPackage.getIcon("dismiss-circle") : fluentIconsPackage.getIcon("warning");
  };

  // Get validation color
  const getValidationColor = () => {
    if (isValidating()) {
      return "secondary";
    }
    if (validationErrors().length === 0) {
      return "secondary";
    }
    const hasErrors = validationErrors().some(error => error.severity === "error");
    return hasErrors ? "destructive" : "outline";
  };

  // Get validation message
  const getValidationMessage = () => {
    if (isValidating()) {
      return "Validating configuration...";
    }
    if (validationErrors().length === 0) {
      return "Configuration is valid";
    }
    const errorCount = validationErrors().filter(error => error.severity === "error").length;
    const warningCount = validationErrors().filter(error => error.severity === "warning").length;

    if (errorCount > 0) {
      return `${errorCount} error${errorCount !== 1 ? "s" : ""} found`;
    }
    if (warningCount > 0) {
      return `${warningCount} warning${warningCount !== 1 ? "s" : ""} found`;
    }
    return "Validation issues found";
  };

  // Get error icon
  const getErrorIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return fluentIconsPackage.getIcon("dismiss-circle");
      case "warning":
        return fluentIconsPackage.getIcon("warning");
      case "info":
        return fluentIconsPackage.getIcon("info");
      default:
        return fluentIconsPackage.getIcon("info");
    }
  };

  // Get error color
  const getErrorColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "destructive";
      case "warning":
        return "outline";
      case "info":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <Card class={`config-validator ${props.compact ? "compact" : ""}`}>
      <div class="validator-header">
        <div class="validator-title">
          <h3>Configuration Validation</h3>
          <Badge variant={getValidationColor()}>
            <span class="validation-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={getValidationIcon()?.outerHTML || ""}
              />
            </span>
            {getValidationMessage()}
          </Badge>
        </div>

        <div class="validator-actions">
          <Button variant="ghost" size="sm" onClick={validateConfig} disabled={isValidating()}>
            <Show when={isValidating()} fallback="Validate">
              <span class="spinner" />
              Validating...
            </Show>
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
        <div class="validator-content">
          <Show
            when={validationErrors().length > 0}
            fallback={
              <div class="validator-success">
                <div class="success-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("checkmark-circle")?.outerHTML || ""}
                  />
                </div>
                <p>Configuration is valid and ready for training!</p>
              </div>
            }
          >
            <div class="validator-errors">
              {validationErrors().map((error, index) => (
                <div class="error-item">
                  <div class="error-header">
                    <span class="error-icon">
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={getErrorIcon(error.severity)?.outerHTML || ""}
                      />
                    </span>
                    <span class="error-field">{error.field}</span>
                    <Badge variant={getErrorColor(error.severity)}>{error.severity}</Badge>
                  </div>
                  <div class="error-message">{error.message}</div>
                  <Show when={error.suggestion}>
                    <div class="error-suggestion">
                      <span class="suggestion-label">Suggestion:</span>
                      <span class="suggestion-text">{error.suggestion}</span>
                    </div>
                  </Show>
                </div>
              ))}
            </div>
          </Show>
        </div>
      </Show>
    </Card>
  );
};

export default ConfigValidator;
