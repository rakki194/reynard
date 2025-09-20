/**
 * ComfyUI Health Status Component
 *
 * Displays the current health status of the ComfyUI service.
 */
import { createSignal, createEffect, onCleanup } from "solid-js";
import { useComfy } from "../composables/useComfy.js";
export const ComfyHealthStatus = props => {
  const comfy = useComfy();
  const [lastChecked, setLastChecked] = createSignal(null);
  // Auto-refresh health status
  createEffect(() => {
    const interval = setInterval(() => {
      setLastChecked(new Date());
    }, props.refreshInterval || 30000);
    onCleanup(() => {
      clearInterval(interval);
    });
  });
  const getStatusColor = status => {
    switch (status) {
      case "ok":
      case "healthy":
        return "text-green-600";
      case "error":
      case "unhealthy":
        return "text-red-600";
      case "disabled":
        return "text-gray-600";
      default:
        return "text-yellow-600";
    }
  };
  const getStatusIcon = status => {
    switch (status) {
      case "ok":
      case "healthy":
        return "✓";
      case "error":
      case "unhealthy":
        return "✗";
      case "disabled":
        return "⊘";
      default:
        return "?";
    }
  };
  const formatTimestamp = timestamp => {
    return timestamp.toLocaleTimeString();
  };
  return (
    <div class={`comfy-health-status ${props.class || ""}`}>
      <div class="health-header">
        <h3>ComfyUI Service Status</h3>
        {lastChecked() && <small class="text-gray-500">Last checked: {formatTimestamp(lastChecked())}</small>}
      </div>

      <div class="health-content">
        {comfy.health() ? (
          <div class="status-info">
            <div class="status-main">
              <span class={`status-icon ${getStatusColor(comfy.health().status)}`}>
                {getStatusIcon(comfy.health().status)}
              </span>
              <span class={`status-text ${getStatusColor(comfy.health().status)}`}>
                {comfy.health().status.toUpperCase()}
              </span>
            </div>

            {props.showDetails && (
              <div class="status-details">
                <div class="detail-item">
                  <span class="detail-label">Enabled:</span>
                  <span class="detail-value">{comfy.health().enabled ? "Yes" : "No"}</span>
                </div>

                {comfy.health().baseUrl && (
                  <div class="detail-item">
                    <span class="detail-label">Base URL:</span>
                    <span class="detail-value">{comfy.health().baseUrl}</span>
                  </div>
                )}

                {comfy.health().connectionState && (
                  <div class="detail-item">
                    <span class="detail-label">Connection:</span>
                    <span class="detail-value">{comfy.health().connectionState}</span>
                  </div>
                )}

                {comfy.health().connectionAttempts !== undefined && (
                  <div class="detail-item">
                    <span class="detail-label">Attempts:</span>
                    <span class="detail-value">{comfy.health().connectionAttempts}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div class="status-loading">{comfy.isLoading() ? "Checking status..." : "Status unknown"}</div>
        )}

        {comfy.error() && (
          <div class="error-message">
            <span class="error-icon">⚠</span>
            <span class="error-text">{comfy.error()}</span>
          </div>
        )}
      </div>

      <div class="health-actions">
        <button
          onClick={() => {
            setLastChecked(new Date());
          }}
          disabled={comfy.isLoading()}
          class="btn btn-sm btn-secondary"
        >
          {comfy.isLoading() ? "Checking..." : "Refresh"}
        </button>
      </div>
    </div>
  );
};
