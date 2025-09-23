import { Component, For, createEffect, onMount, onCleanup } from "solid-js";
import type { ProgressState, DownloadResult } from "reynard-gallery-dl";

interface ProgressTrackerProps {
  downloads: Map<string, ProgressState>;
  onCancel: (downloadId: string) => void;
  onComplete: (downloadId: string, result: DownloadResult) => void;
}

export const ProgressTracker: Component<ProgressTrackerProps> = (props) => {
  let progressInterval: number | undefined;

  // Simulate progress updates (in a real app, this would come from WebSocket or polling)
  onMount(() => {
    progressInterval = setInterval(() => {
      // This is a demo - in reality, progress would come from the backend
      // For now, we'll just simulate some progress updates
    }, 1000);
  });

  onCleanup(() => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  });

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatBytes(bytesPerSecond) + "/s";
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending": return "pending";
      case "running": return "running";
      case "completed": return "completed";
      case "error": return "error";
      default: return "pending";
    }
  };

  const downloadsArray = () => Array.from(props.downloads.entries());

  return (
    <div class="progress-tracker">
      {downloadsArray().length === 0 ? (
        <div class="empty-state">
          <div class="empty-state-icon">📥</div>
          <p>No active downloads</p>
          <p>Start a download to see progress here</p>
        </div>
      ) : (
        <div class="progress-list">
          <For each={downloadsArray()}>
            {([downloadId, progress]) => (
              <div class="progress-item">
                <div class="progress-header">
                  <div class="progress-url">
                    {progress.url || `Download ${downloadId.slice(-8)}`}
                  </div>
                  <div class={`progress-status ${getStatusColor(progress.status)}`}>
                    {progress.status}
                  </div>
                </div>

                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    style={{ width: `${progress.percentage || 0}%` }}
                  />
                </div>

                <div class="progress-details">
                  <span>{progress.percentage?.toFixed(1) || 0}%</span>
                  {progress.current_file && (
                    <span>Current: {progress.current_file}</span>
                  )}
                  {progress.total_files && (
                    <span>Files: {progress.downloaded_files || 0}/{progress.total_files}</span>
                  )}
                  {progress.speed && (
                    <span>Speed: {formatSpeed(progress.speed)}</span>
                  )}
                  {progress.estimated_time && (
                    <span>ETA: {formatTime(progress.estimated_time)}</span>
                  )}
                </div>

                {progress.message && (
                  <div class="progress-message">
                    {progress.message}
                  </div>
                )}

                {progress.status === "running" && (
                  <div class="progress-actions">
                    <button
                      class="action-button danger"
                      onClick={() => props.onCancel(downloadId)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </For>
        </div>
      )}
    </div>
  );
};
