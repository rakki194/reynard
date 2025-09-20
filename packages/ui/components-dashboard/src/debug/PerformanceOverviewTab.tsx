/**
 * PerformanceOverviewTab Component
 * Overview tab for performance dashboard
 */
import { Button } from "reynard-components-core/primitives";
export const PerformanceOverviewTab = props => {
  // Format memory usage
  const formatMemory = bytes => {
    if (bytes > 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } else if (bytes > 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else if (bytes > 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${bytes} B`;
    }
  };
  // Format duration
  const formatDuration = ms => {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;
    } else {
      return `${(ms / 1000).toFixed(2)}s`;
    }
  };
  // Get performance status
  const getPerformanceStatus = () => {
    if (props.frameRate < 30) {
      return "critical";
    } else if (props.frameRate < 45) {
      return "warning";
    } else if (props.browserResponsiveness > 100) {
      return "warning";
    } else {
      return "healthy";
    }
  };
  // Get status message
  const getStatusMessage = () => {
    const status = getPerformanceStatus();
    switch (status) {
      case "healthy":
        return "Performance is optimal";
      case "warning":
        return "Performance issues detected";
      case "critical":
        return "Critical performance issues";
      default:
        return "Performance status unknown";
    }
  };
  return (
    <div class="overview-tab">
      <div class="overview-grid">
        {/* Current Status */}
        <div class="status-card">
          <h3>Current Status</h3>
          <div class="status-grid">
            <div class="status-item">
              <label>Dataset Size</label>
              <span class="value">{props.datasetSize.toLocaleString()}</span>
            </div>
            <div class="status-item">
              <label>Selected Items</label>
              <span class="value">{props.selectionCount.toLocaleString()}</span>
            </div>
            <div class="status-item">
              <label>Memory Usage</label>
              <span class="value">{formatMemory(props.memoryUsage)}</span>
            </div>
            <div class="status-item">
              <label>Browser Response</label>
              <span
                class="value"
                classList={{
                  warning: props.browserResponsiveness > 50,
                  error: props.browserResponsiveness > 100,
                }}
              >
                {formatDuration(props.browserResponsiveness)}
              </span>
            </div>
            <div class="status-item">
              <label>Frame Rate</label>
              <span
                class="value"
                classList={{
                  warning: props.frameRate < 55,
                  error: props.frameRate < 30,
                }}
              >
                {props.frameRate} fps
              </span>
            </div>
            <div class="status-item">
              <label>Recording</label>
              <span class="value" classList={{ recording: props.isRecording }}>
                {props.isRecording ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Status */}
        <div class="status-card">
          <h3>Performance Status</h3>
          <div class={`performance-status ${getPerformanceStatus()}`}>
            <span class="status-message">{getStatusMessage()}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div class="status-card">
          <h3>Quick Actions</h3>
          <div class="quick-actions">
            <Button variant={props.isRecording ? "danger" : "primary"} onClick={props.onToggleRecording}>
              {props.isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
            <Button variant="secondary" onClick={props.onClearMetrics}>
              Clear Metrics
            </Button>
            <Button variant="secondary" onClick={props.onExportData}>
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
