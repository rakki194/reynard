/**
 * 🦊 Chroma Model Validator Component
 * 
 * Model validation interface with compatibility checks
 * following Reynard's validation component patterns.
 */

import { Show, createSignal, createEffect, Component } from 'solid-js';
import { Card } from 'reynard-components-core/primitives';
import { Button } from 'reynard-components-core/primitives';
import { TextField } from 'reynard-components-core/primitives';
import { Badge } from 'reynard-components-core/primitives';
import { fluentIconsPackage } from 'reynard-fluent-icons';

export interface ChromaModelInfo {
  path: string;
  name: string;
  version: string;
  size: number;
  format: string;
  lastModified: string;
  checksum?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
  compatibility: {
    supports_lora: boolean;
    supports_flux_shift: boolean;
    recommended_rank: number;
    max_rank: number;
    supported_dtypes: string[];
  };
}

export interface ChromaModelValidatorProps {
  modelPath?: string;
  onValidationComplete?: (result: ValidationResult) => void;
  onModelSelect?: (model: ChromaModelInfo) => void;
  compact?: boolean;
}

export const ChromaModelValidator: Component<ChromaModelValidatorProps> = (props) => {
  const [modelPath, setModelPath] = createSignal(props.modelPath || '');
  const [modelInfo, setModelInfo] = createSignal<ChromaModelInfo | null>(null);
  const [validationResult, setValidationResult] = createSignal<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = createSignal(false);
  const [isExpanded, setIsExpanded] = createSignal(!props.compact);

  // Known Chroma models
  const knownModels: ChromaModelInfo[] = [
    {
      path: '/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v47.safetensors',
      name: 'Chroma Unlocked v47',
      version: 'v47',
      size: 2.1 * 1024 * 1024 * 1024, // 2.1 GB
      format: 'safetensors',
      lastModified: '2024-01-15T10:30:00Z',
      checksum: 'sha256:abc123...'
    },
    {
      path: '/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v50.safetensors',
      name: 'Chroma Unlocked v50',
      version: 'v50',
      size: 2.3 * 1024 * 1024 * 1024, // 2.3 GB
      format: 'safetensors',
      lastModified: '2024-01-20T14:45:00Z',
      checksum: 'sha256:def456...'
    }
  ];

  // Validate model
  const validateModel = async (path: string) => {
    if (!path) {
      setValidationResult({
        isValid: false,
        errors: ['Model path is required'],
        warnings: [],
        info: [],
        compatibility: {
          supports_lora: false,
          supports_flux_shift: false,
          recommended_rank: 0,
          max_rank: 0,
          supported_dtypes: []
        }
      });
      return;
    }

    setIsValidating(true);
    
    try {
      // Mock validation - in real implementation, this would call the backend
      const knownModel = knownModels.find(model => model.path === path);
      
      if (knownModel) {
        setModelInfo(knownModel);
        
        // Simulate validation delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const result: ValidationResult = {
          isValid: true,
          errors: [],
          warnings: [],
          info: [
            `Model: ${knownModel.name}`,
            `Version: ${knownModel.version}`,
            `Size: ${formatFileSize(knownModel.size)}`,
            `Format: ${knownModel.format.toUpperCase()}`
          ],
          compatibility: {
            supports_lora: true,
            supports_flux_shift: true,
            recommended_rank: 32,
            max_rank: 128,
            supported_dtypes: ['bfloat16', 'float16', 'float8']
          }
        };
        
        // Add warnings based on model version
        if (knownModel.version === 'v47') {
          result.warnings.push('Consider upgrading to v50 for better performance');
        }
        
        setValidationResult(result);
        props.onValidationComplete?.(result);
      } else {
        // Unknown model - perform basic validation
        const result: ValidationResult = {
          isValid: path.endsWith('.safetensors'),
          errors: path.endsWith('.safetensors') ? [] : ['Model must be in SafeTensors format'],
          warnings: ['Unknown model - compatibility not guaranteed'],
          info: ['Custom model detected'],
          compatibility: {
            supports_lora: path.endsWith('.safetensors'),
            supports_flux_shift: path.endsWith('.safetensors'),
            recommended_rank: 16,
            max_rank: 64,
            supported_dtypes: ['bfloat16', 'float16']
          }
        };
        
        setValidationResult(result);
        props.onValidationComplete?.(result);
      }
    } catch (error) {
      const result: ValidationResult = {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        warnings: [],
        info: [],
        compatibility: {
          supports_lora: false,
          supports_flux_shift: false,
          recommended_rank: 0,
          max_rank: 0,
          supported_dtypes: []
        }
      };
      
      setValidationResult(result);
      props.onValidationComplete?.(result);
    } finally {
      setIsValidating(false);
    }
  };

  // Handle model path change
  const handleModelPathChange = (path: string) => {
    setModelPath(path);
    if (path) {
      validateModel(path);
    } else {
      setModelInfo(null);
      setValidationResult(null);
    }
  };

  // Select known model
  const selectKnownModel = (model: ChromaModelInfo) => {
    setModelPath(model.path);
    setModelInfo(model);
    validateModel(model.path);
    props.onModelSelect?.(model);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // Get validation icon
  const getValidationIcon = () => {
    if (isValidating()) {
      return fluentIconsPackage.getIcon('spinner');
    }
    if (!validationResult()) {
      return fluentIconsPackage.getIcon('question-circle');
    }
    if (validationResult()!.isValid) {
      return fluentIconsPackage.getIcon('checkmark-circle');
    }
    return fluentIconsPackage.getIcon('dismiss-circle');
  };

  // Get validation color
  const getValidationColor = () => {
    if (isValidating()) {
      return 'secondary';
    }
    if (!validationResult()) {
      return 'outline';
    }
    if (validationResult()!.isValid) {
      return 'secondary';
    }
    return 'destructive';
  };

  // Get validation message
  const getValidationMessage = () => {
    if (isValidating()) {
      return 'Validating model...';
    }
    if (!validationResult()) {
      return 'Enter model path to validate';
    }
    if (validationResult()!.isValid) {
      return 'Model is valid and compatible';
    }
    return 'Model validation failed';
  };

  // Get error icon
  const getErrorIcon = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error':
        return fluentIconsPackage.getIcon('dismiss-circle');
      case 'warning':
        return fluentIconsPackage.getIcon('warning');
      case 'info':
        return fluentIconsPackage.getIcon('info');
    }
  };

  // Get error color
  const getErrorColor = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'outline';
      case 'info':
        return 'default';
    }
  };

  return (
    <Card class={`chroma-model-validator ${props.compact ? 'compact' : ''}`}>
      <div class="validator-header">
        <div class="validator-title">
          <h3>Chroma Model Validator</h3>
          <Badge variant={getValidationColor()}>
            <span class="validation-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={getValidationIcon()?.outerHTML || ''}
              />
            </span>
            {getValidationMessage()}
          </Badge>
        </div>
        
        <div class="validator-actions">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded())}
          >
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon(isExpanded() ? 'chevron-up' : 'chevron-down')?.outerHTML || ''}
            />
          </Button>
        </div>
      </div>

      <Show when={isExpanded()}>
        <div class="validator-content">
          {/* Model Path Input */}
          <div class="model-path-section">
            <h4>Model Path</h4>
            <TextField
              label="Chroma Model Path"
              value={modelPath()}
              onChange={(e) => handleModelPathChange(e.currentTarget.value)}
              placeholder="/path/to/chroma-model.safetensors"
              fullWidth
            />
          </div>

          {/* Known Models */}
          <div class="known-models-section">
            <h4>Known Chroma Models</h4>
            <div class="known-models-grid">
              {knownModels.map(model => (
                <div 
                  class={`known-model-card ${modelPath() === model.path ? 'selected' : ''}`}
                  onClick={() => selectKnownModel(model)}
                >
                  <div class="model-header">
                    <h5>{model.name}</h5>
                    <Badge variant="outline">{model.version}</Badge>
                  </div>
                  <div class="model-details">
                    <div class="model-detail">
                      <span class="label">Size:</span>
                      <span class="value">{formatFileSize(model.size)}</span>
                    </div>
                    <div class="model-detail">
                      <span class="label">Format:</span>
                      <span class="value">{model.format.toUpperCase()}</span>
                    </div>
                    <div class="model-detail">
                      <span class="label">Modified:</span>
                      <span class="value">{new Date(model.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div class="model-path">
                    <code>{model.path}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Information */}
          <Show when={modelInfo()}>
            <div class="model-info-section">
              <h4>Model Information</h4>
              <div class="model-info-card">
                <div class="info-header">
                  <h5>{modelInfo()!.name}</h5>
                  <Badge variant="secondary">{modelInfo()!.version}</Badge>
                </div>
                <div class="info-details">
                  <div class="info-item">
                    <span class="label">Size:</span>
                    <span class="value">{formatFileSize(modelInfo()!.size)}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Format:</span>
                    <span class="value">{modelInfo()!.format.toUpperCase()}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Last Modified:</span>
                    <span class="value">{new Date(modelInfo()!.lastModified).toLocaleString()}</span>
                  </div>
                  <Show when={modelInfo()!.checksum}>
                    <div class="info-item">
                      <span class="label">Checksum:</span>
                      <span class="value checksum">{modelInfo()!.checksum}</span>
                    </div>
                  </Show>
                </div>
              </div>
            </div>
          </Show>

          {/* Validation Results */}
          <Show when={validationResult()}>
            <div class="validation-results-section">
              <h4>Validation Results</h4>
              
              {/* Compatibility Information */}
              <div class="compatibility-info">
                <h5>Compatibility</h5>
                <div class="compatibility-grid">
                  <div class="compatibility-item">
                    <span class="label">LoRA Support:</span>
                    <Badge variant={validationResult()!.compatibility.supports_lora ? 'secondary' : 'destructive'}>
                      {validationResult()!.compatibility.supports_lora ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div class="compatibility-item">
                    <span class="label">Flux Shift:</span>
                    <Badge variant={validationResult()!.compatibility.supports_flux_shift ? 'secondary' : 'destructive'}>
                      {validationResult()!.compatibility.supports_flux_shift ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div class="compatibility-item">
                    <span class="label">Recommended Rank:</span>
                    <Badge variant="outline">{validationResult()!.compatibility.recommended_rank}</Badge>
                  </div>
                  <div class="compatibility-item">
                    <span class="label">Max Rank:</span>
                    <Badge variant="outline">{validationResult()!.compatibility.max_rank}</Badge>
                  </div>
                </div>
                
                <div class="supported-dtypes">
                  <span class="label">Supported Data Types:</span>
                  <div class="dtype-badges">
                    {validationResult()!.compatibility.supported_dtypes.map(dtype => (
                      <Badge variant="outline">{dtype}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Validation Messages */}
              <Show when={validationResult()!.errors.length > 0 || validationResult()!.warnings.length > 0 || validationResult()!.info.length > 0}>
                <div class="validation-messages">
                  <Show when={validationResult()!.errors.length > 0}>
                    <div class="message-group errors">
                      <h6>Errors</h6>
                      {validationResult()!.errors.map((error, index) => (
                        <div class="message-item error">
                          <span class="message-icon">
                            <div
                              // eslint-disable-next-line solid/no-innerhtml
                              innerHTML={getErrorIcon('error')?.outerHTML || ''}
                            />
                          </span>
                          <span class="message-text">{error}</span>
                        </div>
                      ))}
                    </div>
                  </Show>
                  
                  <Show when={validationResult()!.warnings.length > 0}>
                    <div class="message-group warnings">
                      <h6>Warnings</h6>
                      {validationResult()!.warnings.map((warning, index) => (
                        <div class="message-item warning">
                          <span class="message-icon">
                            <div
                              // eslint-disable-next-line solid/no-innerhtml
                              innerHTML={getErrorIcon('warning')?.outerHTML || ''}
                            />
                          </span>
                          <span class="message-text">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </Show>
                  
                  <Show when={validationResult()!.info.length > 0}>
                    <div class="message-group info">
                      <h6>Information</h6>
                      {validationResult()!.info.map((info, index) => (
                        <div class="message-item info">
                          <span class="message-icon">
                            <div
                              // eslint-disable-next-line solid/no-innerhtml
                              innerHTML={getErrorIcon('info')?.outerHTML || ''}
                            />
                          </span>
                          <span class="message-text">{info}</span>
                        </div>
                      ))}
                    </div>
                  </Show>
                </div>
              </Show>
            </div>
          </Show>

          {/* Loading State */}
          <Show when={isValidating()}>
            <div class="validation-loading">
              <div class="loading-spinner" />
              <span>Validating model compatibility...</span>
            </div>
          </Show>
        </div>
      </Show>
    </Card>
  );
};

export default ChromaModelValidator;
