import { Component, For } from "solid-js";
import type { DownloadResult } from "reynard-gallery-dl";

interface HistoryViewerProps {
  history: DownloadResult[];
  onRetry: (url: string) => void;
}

export const HistoryViewer: Component<HistoryViewerProps> = props => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (duration: number): string => {
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${(duration / 60000).toFixed(1)}m`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusIcon = (success: boolean): string => {
    return success ? "✅" : "❌";
  };

  const getStatusText = (success: boolean): string => {
    return success ? "Completed" : "Failed";
  };

  const getStatusClass = (success: boolean): string => {
    return success ? "success" : "error";
  };

  return (
    <div class="history-viewer">
      {props.history.length === 0 ? (
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p>No download history</p>
          <p>Completed downloads will appear here</p>
        </div>
      ) : (
        <div class="history-list">
          <For each={props.history}>
            {download => (
              <div class="history-item">
                <div class="history-info">
                  <div class="history-url">
                    {getStatusIcon(download.success)} {download.url}
                  </div>
                  <div class="history-meta">
                    <span class={`status ${getStatusClass(download.success)}`}>{getStatusText(download.success)}</span>
                    {download.success && (
                      <>
                        <span> • {download.files?.length || 0} files</span>
                        {download.stats && (
                          <>
                            <span> • {formatBytes(download.stats.totalBytes || 0)}</span>
                            <span> • {formatDuration(download.duration || 0)}</span>
                          </>
                        )}
                      </>
                    )}
                    {download.extractor && <span> • {download.extractor}</span>}
                  </div>
                </div>

                <div class="history-actions">
                  {download.success && (
                    <button
                      class="action-button"
                      onClick={() => {
                        // In a real app, this would open the download folder
                        console.log("Open download folder for:", download.url);
                      }}
                    >
                      Open Folder
                    </button>
                  )}
                  <button class="action-button" onClick={() => props.onRetry(download.url)}>
                    Retry
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      )}
    </div>
  );
};
