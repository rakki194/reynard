/**
 * ToolCallDisplay Component for Reynard Chat System
 *
 * Displays tool execution with progress indicators, status updates,
 * and interactive controls.
 */
import { Show, createMemo } from "solid-js";
export const ToolCallDisplay = (props) => {
    const getStatusIcon = () => {
        switch (props.toolCall.status) {
            case "pending":
                return "⏳";
            case "running":
                return "⚡";
            case "completed":
                return "✅";
            case "failed":
                return "❌";
            case "cancelled":
                return "⏹️";
            default:
                return "❓";
        }
    };
    const getStatusColor = () => {
        switch (props.toolCall.status) {
            case "pending":
                return "var(--text-secondary)";
            case "running":
                return "var(--accent)";
            case "completed":
                return "var(--success-color, #22c55e)";
            case "failed":
                return "var(--error-color, #ef4444)";
            case "cancelled":
                return "var(--text-secondary)";
            default:
                return "var(--text-secondary)";
        }
    };
    const getDuration = createMemo(() => {
        if (!props.toolCall.timing?.duration)
            return null;
        return `${props.toolCall.timing.duration}ms`;
    });
    const formatArguments = () => {
        return JSON.stringify(props.toolCall.arguments, null, 2);
    };
    const formatResult = () => {
        if (!props.toolCall.result)
            return null;
        if (typeof props.toolCall.result === "string") {
            return props.toolCall.result;
        }
        return JSON.stringify(props.toolCall.result, null, 2);
    };
    return (<div class="reynard-tool-call" data-status={props.toolCall.status}>
      <div class="reynard-tool-call__header">
        <div class="reynard-tool-call__icon">🔧</div>

        <div class="reynard-tool-call__info">
          <div class="reynard-tool-call__name">{props.toolCall.name}</div>

          <div class="reynard-tool-call__status">
            <span class="reynard-tool-call__status-icon" style={{ color: getStatusColor() }}>
              {getStatusIcon()}
            </span>
            <span class="reynard-tool-call__status-text">
              {props.toolCall.status.charAt(0).toUpperCase() +
            props.toolCall.status.slice(1)}
            </span>

            <Show when={props.toolCall.message}>
              <span class="reynard-tool-call__message">
                - {props.toolCall.message}
              </span>
            </Show>

            <Show when={getDuration()}>
              <span class="reynard-tool-call__duration">({getDuration()})</span>
            </Show>
          </div>
        </div>

        <div class="reynard-tool-call__actions">
          <Show when={props.toolCall.status === "running" && props.onAction}>
            <button class="reynard-tool-call__action reynard-tool-call__action--cancel" onClick={() => props.onAction("cancel", props.toolCall)} title="Cancel tool execution">
              ⏹️
            </button>
          </Show>

          <Show when={props.toolCall.status === "failed" &&
            props.toolCall.error?.retryable &&
            props.onAction}>
            <button class="reynard-tool-call__action reynard-tool-call__action--retry" onClick={() => props.onAction("retry", props.toolCall)} title="Retry tool execution">
              🔄
            </button>
          </Show>
        </div>
      </div>

      {/* Progress Bar */}
      <Show when={props.toolCall.status === "running" &&
            typeof props.toolCall.progress === "number"}>
        <div class="reynard-tool-call__progress">
          <div class="reynard-tool-call__progress-bar">
            <div class="reynard-tool-call__progress-fill" style={{ width: `${props.toolCall.progress}%` }}></div>
          </div>
          <span class="reynard-tool-call__progress-text">
            {props.toolCall.progress}%
          </span>
        </div>
      </Show>

      {/* Arguments */}
      <Show when={Object.keys(props.toolCall.arguments).length > 0}>
        <details class="reynard-tool-call__section">
          <summary class="reynard-tool-call__section-header">
            Parameters
          </summary>
          <pre class="reynard-tool-call__code">{formatArguments()}</pre>
        </details>
      </Show>

      {/* Intermediate Data */}
      <Show when={props.toolCall.intermediateData}>
        <details class="reynard-tool-call__section">
          <summary class="reynard-tool-call__section-header">
            Intermediate Results
          </summary>
          <pre class="reynard-tool-call__code">
            {JSON.stringify(props.toolCall.intermediateData, null, 2)}
          </pre>
        </details>
      </Show>

      {/* Result */}
      <Show when={props.toolCall.result}>
        <details class="reynard-tool-call__section" open>
          <summary class="reynard-tool-call__section-header">Result</summary>
          <div class="reynard-tool-call__result">{formatResult()}</div>
        </details>
      </Show>

      {/* Error */}
      <Show when={props.toolCall.error}>
        <div class="reynard-tool-call__error">
          <div class="reynard-tool-call__error-header">
            <span class="reynard-tool-call__error-icon">⚠️</span>
            <span class="reynard-tool-call__error-title">
              {props.toolCall.error.type || "Error"}
            </span>
          </div>
          <div class="reynard-tool-call__error-message">
            {props.toolCall.error.message}
          </div>
          <Show when={props.toolCall.error.details}>
            <details class="reynard-tool-call__error-details">
              <summary>Error Details</summary>
              <pre>
                {JSON.stringify(props.toolCall.error.details, null, 2)}
              </pre>
            </details>
          </Show>
        </div>
      </Show>
    </div>);
};
