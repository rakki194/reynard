/**
 * Error Fallback Component
 * Default error UI with recovery options and reporting
 */

import { Component, Show, For, createSignal } from "solid-js";
import { ErrorFallbackProps } from "../types/ErrorTypes";
import { RecoveryAction } from "../types/RecoveryTypes";

export const ErrorFallback: Component<ErrorFallbackProps> = props => {
  const [userReport, setUserReport] = createSignal("");

  const handleRetry = () => {
    props.retry();
  };

  const handleReset = () => {
    props.reset();
  };

  const handleRecovery = (action: RecoveryAction) => {
    props.onRecovery?.(action);
  };

  const handleReport = () => {
    // In a real implementation, this would send the user report
    console.log("User report:", userReport());
    // Could integrate with error reporting system
  };

  return (
    <div class="reynard-error-fallback">
      <div class="reynard-error-fallback__content">
        {/* Error Icon */}
        <div class="reynard-error-fallback__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        {/* Error Title */}
        <h2 class="reynard-error-fallback__title">Something went wrong</h2>

        {/* Error Message */}
        <p class="reynard-error-fallback__message">{props.error.message || "An unexpected error occurred"}</p>

        {/* Primary Actions */}
        <div class="reynard-error-fallback__actions">
          <button
            class="reynard-error-fallback__button reynard-error-fallback__button--primary"
            onClick={handleRetry}
            disabled={props.isRecovering}
          >
            {props.isRecovering ? "Recovering..." : "Try Again"}
          </button>

          <button
            class="reynard-error-fallback__button reynard-error-fallback__button--secondary"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>

        {/* Recovery Options */}
        <Show when={props.recoveryActions.length > 0}>
          <div class="reynard-error-fallback__recovery">
            <h3 class="reynard-error-fallback__recovery-title">Recovery Options</h3>
            <div class="reynard-error-fallback__recovery-actions">
              <For each={props.recoveryActions}>
                {(action: RecoveryAction) => (
                  <button
                    class="reynard-error-fallback__recovery-button"
                    onClick={() => handleRecovery(action)}
                    disabled={props.isRecovering}
                    title={action.description}
                  >
                    {action.name}
                  </button>
                )}
              </For>
            </div>
          </div>
        </Show>

        {/* User Report Section */}
        <div class="reynard-error-fallback__report">
          <h3 class="reynard-error-fallback__report-title">Help us improve</h3>
          <p class="reynard-error-fallback__report-description">
            This error has been automatically reported. You can also send additional details:
          </p>
          <textarea
            class="reynard-error-fallback__report-textarea"
            placeholder="Describe what you were doing when this error occurred..."
            value={userReport()}
            onInput={(e: Event) => setUserReport((e.target as HTMLTextAreaElement).value)}
          />
          <button class="reynard-error-fallback__report-button" onClick={handleReport} disabled={!userReport().trim()}>
            Send Report
          </button>
        </div>

        {/* Technical Details */}
        <details class="reynard-error-fallback__details">
          <summary class="reynard-error-fallback__details-summary">Technical Details</summary>
          <div class="reynard-error-fallback__details-content">
            <div class="reynard-error-fallback__details-section">
              <h4>Error Information</h4>
              <pre class="reynard-error-fallback__details-pre">
                <strong>Name:</strong> {props.error.name}
                <br />
                <strong>Message:</strong> {props.error.message}
                <br />
                <strong>Stack:</strong>
                <br />
                {props.error.stack || "No stack trace available"}
              </pre>
            </div>

            <Show when={props.errorInfo}>
              <div class="reynard-error-fallback__details-section">
                <h4>Component Stack</h4>
                <pre class="reynard-error-fallback__details-pre">
                  {props.errorInfo.componentStack || "No component stack available"}
                </pre>
              </div>
            </Show>
          </div>
        </details>
      </div>
    </div>
  );
};
