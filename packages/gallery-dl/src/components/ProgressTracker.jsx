/**
 * Progress Tracker Component
 *
 * Real-time progress tracking component for gallery downloads with
 * comprehensive status indicators and visual feedback.
 */
import { Button, Card } from "reynard-components";
import { Icon } from "reynard-fluent-icons";
import { Show } from "solid-js";
export const ProgressTracker = props => {
    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };
    // Format speed
    const formatSpeed = (bytesPerSecond) => {
        return `${formatFileSize(bytesPerSecond)}/s`;
    };
    // Format time
    const formatTime = (seconds) => {
        if (seconds < 60)
            return `${Math.round(seconds)}s`;
        if (seconds < 3600)
            return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
        return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
    };
    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case "pending":
                return "clock";
            case "validating":
                return "search";
            case "extracting":
                return "extract";
            case "downloading":
                return "download";
            case "processing":
                return "settings";
            case "completed":
                return "checkmark";
            case "error":
                return "error";
            case "cancelled":
                return "cancel";
            default:
                return "clock";
        }
    };
    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "muted";
            case "validating":
                return "info";
            case "extracting":
                return "info";
            case "downloading":
                return "primary";
            case "processing":
                return "warning";
            case "completed":
                return "success";
            case "error":
                return "error";
            case "cancelled":
                return "muted";
            default:
                return "muted";
        }
    };
    // Get progress bar color
    const getProgressBarColor = (status) => {
        switch (status) {
            case "completed":
                return "success";
            case "error":
                return "error";
            case "cancelled":
                return "muted";
            default:
                return "primary";
        }
    };
    // Calculate estimated time remaining
    const getEstimatedTime = () => {
        const progress = props.progress;
        if (!progress.estimatedTime || progress.estimatedTime <= 0) {
            return null;
        }
        return formatTime(progress.estimatedTime);
    };
    // Get progress percentage
    const getProgressPercentage = () => {
        return Math.min(Math.max(props.progress.percentage, 0), 100);
    };
    // Check if download is active
    const isActive = () => {
        const status = props.progress.status;
        return status === "downloading" || status === "extracting" || status === "processing";
    };
    // Check if download is completed
    const isCompleted = () => {
        return props.progress.status === "completed";
    };
    // Check if download has error
    const hasError = () => {
        return props.progress.status === "error";
    };
    // Check if download is cancelled
    const isCancelled = () => {
        return props.progress.status === "cancelled";
    };
    return (<Card variant="elevated" padding="md" class={`reynard-progress-tracker ${props.class || ""}`}>
      <div class="reynard-progress-tracker__header">
        <div class="reynard-progress-tracker__status">
          <Icon name={getStatusIcon(props.progress.status)} size="sm" variant={getStatusColor(props.progress.status)}/>
          <span class="reynard-progress-tracker__status-text">
            {props.progress.status.charAt(0).toUpperCase() + props.progress.status.slice(1)}
          </span>
        </div>
        <div class="reynard-progress-tracker__percentage">{getProgressPercentage().toFixed(1)}%</div>
      </div>

      {/* Progress Bar */}
      <div class="reynard-progress-tracker__bar">
        <div class={`reynard-progress-bar reynard-progress-bar--${getProgressBarColor(props.progress.status)}`}>
          <div class="reynard-progress-bar__fill" style={`width: ${getProgressPercentage()}%`}/>
          <Show when={isActive()}>
            <div class="reynard-progress-bar__animation"/>
          </Show>
        </div>
      </div>

      {/* Progress Message */}
      <div class="reynard-progress-tracker__message">
        <Show when={props.progress.message}>
          <span class="reynard-progress-tracker__message-text">{props.progress.message}</span>
        </Show>
        <Show when={props.progress.currentFile}>
          <span class="reynard-progress-tracker__current-file">Current: {props.progress.currentFile}</span>
        </Show>
      </div>

      {/* Detailed Information */}
      <Show when={props.showDetails}>
        <div class="reynard-progress-tracker__details">
          <div class="reynard-progress-tracker__detail-row">
            <span class="reynard-progress-tracker__detail-label">URL:</span>
            <span class="reynard-progress-tracker__detail-value">{props.url}</span>
          </div>

          <Show when={props.progress.totalBytes && props.progress.downloadedBytes}>
            <div class="reynard-progress-tracker__detail-row">
              <span class="reynard-progress-tracker__detail-label">Downloaded:</span>
              <span class="reynard-progress-tracker__detail-value">
                {formatFileSize(props.progress.downloadedBytes || 0)} / {formatFileSize(props.progress.totalBytes || 0)}
              </span>
            </div>
          </Show>

          <Show when={props.progress.speed && props.progress.speed > 0}>
            <div class="reynard-progress-tracker__detail-row">
              <span class="reynard-progress-tracker__detail-label">Speed:</span>
              <span class="reynard-progress-tracker__detail-value">{formatSpeed(props.progress.speed)}</span>
            </div>
          </Show>

          <Show when={getEstimatedTime()}>
            <div class="reynard-progress-tracker__detail-row">
              <span class="reynard-progress-tracker__detail-label">ETA:</span>
              <span class="reynard-progress-tracker__detail-value">{getEstimatedTime()}</span>
            </div>
          </Show>
        </div>
      </Show>

      {/* Error Information */}
      <Show when={hasError() && props.progress.error}>
        <div class="reynard-progress-tracker__error">
          <Icon name="error" size="sm" variant="error"/>
          <span class="reynard-progress-tracker__error-text">{props.progress.error}</span>
        </div>
      </Show>

      {/* Actions */}
      <div class="reynard-progress-tracker__actions">
        <Show when={isActive() && props.onCancel}>
          <Button variant="tertiary" size="sm" onClick={props.onCancel} leftIcon={<Icon name="cancel" size="sm"/>}>
            Cancel
          </Button>
        </Show>

        <Show when={hasError() && props.onRetry}>
          <Button variant="primary" size="sm" onClick={props.onRetry} leftIcon={<Icon name="refresh" size="sm"/>}>
            Retry
          </Button>
        </Show>

        <Show when={isCompleted()}>
          <div class="reynard-progress-tracker__completed">
            <Icon name="checkmark" size="sm" variant="success"/>
            <span>Download completed successfully</span>
          </div>
        </Show>

        <Show when={isCancelled()}>
          <div class="reynard-progress-tracker__cancelled">
            <Icon name="cancel" size="sm" variant="muted"/>
            <span>Download cancelled</span>
          </div>
        </Show>
      </div>
    </Card>);
};
