/**
 * URL Validator Component
 *
 * URL validation and extractor detection component with real-time feedback
 * and comprehensive error handling.
 */

import { Button, Card, TextField } from "reynard-components";
import { Icon } from "reynard-fluent-icons";
import { Component, createEffect, createSignal, onCleanup, Show, For } from "solid-js";
import { GalleryService } from "../services/GalleryService";
import type { ExtractorInfo, ValidationResult } from "../types";

export interface UrlValidatorProps {
  /** Initial URL value */
  initialUrl?: string;
  /** Callback when validation result changes */
  onValidation?: (result: ValidationResult) => void;
  /** Callback when URL changes */
  onUrlChange?: (url: string) => void;
  /** Service instance */
  service?: GalleryService;
  /** Whether to show extractor details */
  showExtractorDetails?: boolean;
  /** CSS class */
  class?: string;
}

export const UrlValidator: Component<UrlValidatorProps> = props => {
  // State management
  const [url, setUrl] = createSignal<string>(props.initialUrl || "");
  const [isValidating, setIsValidating] = createSignal<boolean>(false);
  const [validationResult, setValidationResult] = createSignal<ValidationResult | null>(null);
  const [validationHistory, setValidationHistory] = createSignal<ValidationResult[]>([]);
  const [showHistory, setShowHistory] = createSignal<boolean>(false);

  // Service instance
  const [service] = createSignal<GalleryService>(
    props.service ||
      new GalleryService({
        name: "gallery-service",
        baseUrl: "http://localhost:8000",
        timeout: 30000,
      })
  );

  // Validation timeout
  let validationTimeout: NodeJS.Timeout | null = null;

  // Validate URL
  const validateUrl = async (urlToValidate: string) => {
    if (!urlToValidate.trim()) {
      setValidationResult(null);
      props.onValidation?.({
        isValid: false,
        error: "URL is required",
      });
      return;
    }

    setIsValidating(true);
    try {
      const result = await service().validateUrl(urlToValidate);
      setValidationResult(result);

      // Add to history
      setValidationHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10

      // Call callback
      props.onValidation?.(result);
    } catch (error) {
      const errorResult: ValidationResult = {
        isValid: false,
        error: error instanceof Error ? error.message : "Validation failed",
      };
      setValidationResult(errorResult);
      props.onValidation?.(errorResult);
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-validate on URL change
  createEffect(() => {
    const currentUrl = url();
    props.onUrlChange?.(currentUrl);

    // Clear existing timeout
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    if (currentUrl.trim()) {
      // Debounce validation
      validationTimeout = setTimeout(() => {
        validateUrl(currentUrl);
      }, 500);
    } else {
      setValidationResult(null);
      props.onValidation?.({
        isValid: false,
        error: "URL is required",
      });
    }
  });

  // Cleanup timeout on unmount
  onCleanup(() => {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }
  });

  // Manual validation
  const handleValidate = () => {
    validateUrl(url());
  };

  // Clear validation
  const handleClear = () => {
    setUrl("");
    setValidationResult(null);
    props.onValidation?.({
      isValid: false,
      error: "URL is required",
    });
  };

  // Get validation status
  const getValidationStatus = () => {
    const result = validationResult();
    if (isValidating()) return "validating";
    if (!result) return "none";
    return result.isValid ? "valid" : "invalid";
  };

  // Get status icon
  const getStatusIcon = () => {
    const status = getValidationStatus();
    switch (status) {
      case "validating":
        return "loading";
      case "valid":
        return "checkmark";
      case "invalid":
        return "error";
      default:
        return null;
    }
  };

  // Get status color
  const getStatusColor = () => {
    const status = getValidationStatus();
    switch (status) {
      case "validating":
        return "info";
      case "valid":
        return "success";
      case "invalid":
        return "error";
      default:
        return "muted";
    }
  };

  // Get status message
  const getStatusMessage = () => {
    const result = validationResult();
    if (isValidating()) return "Validating URL...";
    if (!result) return "Enter a URL to validate";
    if (result.isValid) return "URL is valid and supported";
    return result.error || "URL is not supported";
  };

  // Format extractor info
  const formatExtractorInfo = (extractor: ExtractorInfo) => {
    return `${extractor.name} (${extractor.category}${extractor.subcategory ? `.${extractor.subcategory}` : ""})`;
  };

  return (
    <div class={`reynard-url-validator ${props.class || ""}`}>
      {/* URL Input */}
      <Card variant="elevated" padding="lg" class="reynard-url-validator__input">
        <div class="reynard-url-validator__form">
          <TextField
            label="Gallery URL"
            placeholder="Enter gallery URL (e.g., https://example.com/gallery)"
            value={url()}
            onInput={e => setUrl(e.currentTarget.value)}
            fullWidth
            required
            error={getValidationStatus() === "invalid"}
            errorMessage={validationResult()?.error}
            rightIcon={getStatusIcon() ? <Icon name={getStatusIcon()!} size="sm" variant={getStatusColor()} /> : null}
          />

          <div class="reynard-url-validator__actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleValidate}
              disabled={!url().trim() || isValidating()}
              loading={isValidating()}
              leftIcon={<Icon name="search" size="sm" />}
            >
              Validate
            </Button>
            <Button
              variant="tertiary"
              size="sm"
              onClick={handleClear}
              disabled={!url().trim()}
              leftIcon={<Icon name="clear" size="sm" />}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Validation Status */}
      <Card variant="elevated" padding="md" class="reynard-url-validator__status">
        <div class="reynard-url-validator__status-content">
          <div class="reynard-url-validator__status-icon">
            <Icon name={getStatusIcon() || "info"} size="md" variant={getStatusColor()} />
          </div>
          <div class="reynard-url-validator__status-text">
            <div class="reynard-url-validator__status-message">{getStatusMessage()}</div>
            <Show when={validationResult()?.isValid && validationResult()?.extractor}>
              <div class="reynard-url-validator__extractor-info">
                <Icon name="info" size="sm" variant="info" />
                <span>Detected extractor: {formatExtractorInfo(validationResult()!.extractor!)}</span>
              </div>
            </Show>
          </div>
        </div>
      </Card>

      {/* Extractor Details */}
      <Show when={props.showExtractorDetails && validationResult()?.isValid && validationResult()?.extractor}>
        <Card variant="elevated" padding="md" class="reynard-url-validator__extractor-details">
          <div class="reynard-url-validator__extractor-header">
            <h4>Extractor Information</h4>
            <Icon name="extract" size="sm" variant="info" />
          </div>

          <div class="reynard-url-validator__extractor-content">
            <div class="reynard-url-validator__extractor-field">
              <span class="reynard-url-validator__extractor-label">Name:</span>
              <span class="reynard-url-validator__extractor-value">{validationResult()?.extractor?.name}</span>
            </div>

            <div class="reynard-url-validator__extractor-field">
              <span class="reynard-url-validator__extractor-label">Category:</span>
              <span class="reynard-url-validator__extractor-value">{validationResult()?.extractor?.category}</span>
            </div>

            <Show when={validationResult()?.extractor?.subcategory}>
              <div class="reynard-url-validator__extractor-field">
                <span class="reynard-url-validator__extractor-label">Subcategory:</span>
                <span class="reynard-url-validator__extractor-value">{validationResult()?.extractor?.subcategory}</span>
              </div>
            </Show>

            <Show when={validationResult()?.extractor?.description}>
              <div class="reynard-url-validator__extractor-field">
                <span class="reynard-url-validator__extractor-label">Description:</span>
                <span class="reynard-url-validator__extractor-value">{validationResult()?.extractor?.description}</span>
              </div>
            </Show>

            <Show when={validationResult()?.extractor?.patterns && validationResult()?.extractor?.patterns.length > 0}>
              <div class="reynard-url-validator__extractor-field">
                <span class="reynard-url-validator__extractor-label">Supported Patterns:</span>
                <div class="reynard-url-validator__extractor-patterns">
                  <For each={validationResult()?.extractor?.patterns}>
                    {pattern => <span class="reynard-url-validator__extractor-pattern">{pattern}</span>}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        </Card>
      </Show>

      {/* Validation History */}
      <Show when={validationHistory().length > 0}>
        <Card variant="elevated" padding="md" class="reynard-url-validator__history">
          <div class="reynard-url-validator__history-header">
            <h4>Validation History</h4>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setShowHistory(!showHistory())}
              rightIcon={<Icon name={showHistory() ? "chevron-up" : "chevron-down"} size="sm" />}
            >
              {showHistory() ? "Hide" : "Show"} History
            </Button>
          </div>

          <Show when={showHistory()}>
            <div class="reynard-url-validator__history-list">
              <For each={validationHistory()}>
                {(result, index) => (
                  <div class="reynard-url-validator__history-item">
                    <div class="reynard-url-validator__history-status">
                      <Icon
                        name={result.isValid ? "checkmark" : "error"}
                        size="sm"
                        variant={result.isValid ? "success" : "error"}
                      />
                      <span class="reynard-url-validator__history-index">#{index() + 1}</span>
                    </div>
                    <div class="reynard-url-validator__history-info">
                      <Show when={result.isValid && result.extractor}>
                        <span class="reynard-url-validator__history-extractor">
                          {formatExtractorInfo(result.extractor!)}
                        </span>
                      </Show>
                      <Show when={result.error}>
                        <span class="reynard-url-validator__history-error">{result.error}</span>
                      </Show>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Card>
      </Show>
    </div>
  );
};
