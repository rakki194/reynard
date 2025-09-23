/**
 * URL Validator Component
 *
 * Validates gallery URLs and provides extractor information with real-time feedback.
 */
import { Component, createSignal, createEffect, onCleanup, Show, For } from "solid-js";
import { Card, Button, TextField, Icon } from "reynard-components-core";
import { GalleryService } from "../services/GalleryService";

export interface UrlValidatorProps {
  service: GalleryService;
  onValidationChange?: (result: ValidationResult) => void;
  placeholder?: string;
  class?: string;
}

export interface ValidationResult {
  isValid: boolean;
  extractor?: {
    name: string;
    category: string;
    subcategory?: string;
    patterns: string[];
    description?: string;
    features?: string[];
  };
  error?: string;
}

export const UrlValidator: Component<UrlValidatorProps> = (props) => {
  const [url, setUrl] = createSignal("");
  const [isValidating, setIsValidating] = createSignal(false);
  const [validationResult, setValidationResult] = createSignal<ValidationResult | null>(null);
  const [validationHistory, setValidationHistory] = createSignal<ValidationResult[]>([]);

  const validateUrl = async (urlToValidate: string) => {
    if (!urlToValidate.trim()) {
      setValidationResult(null);
      props.onValidationChange?.(null as any);
      return;
    }

    setIsValidating(true);
    try {
      const result = await props.service.validateUrl(urlToValidate);
      const validation: ValidationResult = {
        isValid: result.isValid,
        extractor: result.extractor,
        error: result.error,
      };
      
      setValidationResult(validation);
      props.onValidationChange?.(validation);
      
      // Add to history
      setValidationHistory(prev => [validation, ...prev.slice(0, 9)]);
    } catch (error) {
      const validation: ValidationResult = {
        isValid: false,
        error: error instanceof Error ? error.message : "Validation failed",
      };
      
      setValidationResult(validation);
      props.onValidationChange?.(validation);
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-validate URL on change
  createEffect(() => {
    const currentUrl = url();
    if (currentUrl.trim()) {
      const timeoutId = setTimeout(() => validateUrl(currentUrl), 500);
      onCleanup(() => clearTimeout(timeoutId));
    } else {
      setValidationResult(null);
      props.onValidationChange?.(null as any);
    }
  });

  const clearHistory = () => {
    setValidationHistory([]);
  };

  return (
    <div class={`url-validator ${props.class || ""}`}>
      <Card class="validation-card">
        <div class="validation-header">
          <Icon name="Link" class="header-icon" />
          <h3>URL Validator</h3>
        </div>
        
        <div class="validation-input">
          <TextField
            value={url()}
            onInput={(e) => setUrl(e.currentTarget.value)}
            placeholder={props.placeholder || "Enter gallery URL..."}
            class="url-input"
            disabled={isValidating()}
          />
          
          <Show when={isValidating()}>
            <div class="validation-indicator">
              <Icon name="Clock" class="loading-icon" />
              <span>Validating...</span>
            </div>
          </Show>
        </div>

        <Show when={validationResult()}>
          <div class={`validation-result ${validationResult()?.isValid ? 'valid' : 'invalid'}`}>
            <div class="result-header">
              <Icon 
                name={validationResult()?.isValid ? "CheckCircle" : "AlertCircle"} 
                class="result-icon"
              />
              <span class="result-status">
                {validationResult()?.isValid ? "Valid URL" : "Invalid URL"}
              </span>
            </div>
            
            <Show when={validationResult()?.extractor}>
              <div class="extractor-info">
                <div class="extractor-name">
                  <strong>{validationResult()?.extractor?.name}</strong>
                </div>
                <div class="extractor-category">
                  {validationResult()?.extractor?.category}
                  <Show when={validationResult()?.extractor?.subcategory}>
                    <span> • {validationResult()?.extractor?.subcategory}</span>
                  </Show>
                </div>
                <Show when={validationResult()?.extractor?.description}>
                  <div class="extractor-description">
                    {validationResult()?.extractor?.description}
                  </div>
                </Show>
                <Show when={validationResult()?.extractor?.features && (validationResult()?.extractor?.features?.length || 0) > 0}>
                  <div class="extractor-features">
                    <strong>Features:</strong>
                    <div class="features-list">
                      <For each={validationResult()?.extractor?.features || []}>
                        {(feature) => (
                          <span class="feature-tag">
                            {feature}
                          </span>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>
              </div>
            </Show>
            
            <Show when={validationResult()?.error}>
              <div class="validation-error">
                <Icon name="AlertCircle" class="error-icon" />
                <span class="error-text">{validationResult()?.error}</span>
              </div>
            </Show>
          </div>
        </Show>
      </Card>

        <Show when={validationHistory().length > 0}>
          <Card class="history-card">
            <div class="history-header">
              <h4>Validation History</h4>
              <Button onClick={clearHistory} variant="secondary" size="sm">
                Clear
              </Button>
            </div>
            
            <div class="history-list">
              <For each={validationHistory()}>
                {(result) => (
                  <div class={`history-item ${result.isValid ? 'valid' : 'invalid'}`}>
                    <div class="history-status">
                      <Icon 
                        name={result.isValid ? "CheckCircle" : "AlertCircle"} 
                        class="history-icon"
                      />
                      <span class="history-text">
                        {result.isValid 
                          ? `Valid - ${result.extractor?.name || 'Unknown'}`
                          : result.error
                        }
                      </span>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Card>
        </Show>
    </div>
  );
};