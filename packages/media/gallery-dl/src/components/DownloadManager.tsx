/**
 * Download Manager Component
 *
 * Main orchestrator component for gallery downloads with comprehensive
 * state management, progress tracking, and batch processing capabilities.
 */
import { createSignal, createEffect, onMount, onCleanup, Show, For } from "solid-js";
import { Button, Card, TextField } from "reynard-primitives";
import { Icon } from "reynard-fluent-icons";
import { GalleryService } from "../services/GalleryService";

export interface DownloadManagerProps {
  serviceConfig?: {
    baseUrl?: string;
    timeout?: number;
    token?: string;
  };
  defaultOptions?: Record<string, any>;
  onDownloadComplete?: (result: any) => void;
  onDownloadError?: (error: any) => void;
}

export interface Download {
  id: string;
  url: string;
  status: "pending" | "downloading" | "completed" | "error" | "cancelled";
  progress: number;
  totalFiles?: number;
  downloadedFiles?: number;
  downloadedBytes?: number;
  totalBytes?: number;
  speed?: number;
  eta?: number;
  result?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface DownloadQueue {
  id: string;
  downloads: Download[];
  status: "idle" | "running" | "paused" | "completed" | "error";
  totalDownloads: number;
  completedDownloads: number;
  failedDownloads: number;
}

export const DownloadManager = (props: DownloadManagerProps) => {
  // Service instance
  const [service] = createSignal(
    new GalleryService({
      name: "gallery-service",
      baseUrl: props.serviceConfig?.baseUrl || "http://localhost:8000",
      timeout: props.serviceConfig?.timeout || 30000,
      token: props.serviceConfig?.token,
    })
  );

  // State management
  const [url, setUrl] = createSignal("");
  const [downloadOptions, setDownloadOptions] = createSignal(props.defaultOptions || {});
  const [downloads, setDownloads] = createSignal<Download[]>([]);
  const [isValidating, setIsValidating] = createSignal(false);
  const [validationResult, setValidationResult] = createSignal<any>(null);
  const [isDownloading, setIsDownloading] = createSignal(false);
  const [showAdvanced, setShowAdvanced] = createSignal(false);

  // Initialize service
  onMount(async () => {
    try {
      const extractorsResult = await service().getExtractors();
      if (extractorsResult.success) {
        // Extractors loaded successfully
        console.log("Extractors loaded:", extractorsResult.data);
      }
    } catch (error) {
      console.error("Failed to load extractors:", error);
    }
  });

  // URL validation
  const validateUrl = async (urlToValidate: string) => {
    if (!urlToValidate.trim()) {
      setValidationResult(null);
      return;
    }
    setIsValidating(true);
    try {
      const result = await service().validateUrl(urlToValidate);
      setValidationResult({
        isValid: result.isValid,
        extractor: result.extractor,
        error: result.error,
      });
    } catch (error) {
      setValidationResult({
        isValid: false,
        error: error instanceof Error ? error.message : "Validation failed",
      });
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
    }
  });

  // Start download
  const startDownload = async () => {
    const currentUrl = url().trim();
    if (!currentUrl || !validationResult()?.isValid) {
      return;
    }

    setIsDownloading(true);
    const downloadId = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create download entry
    const download: Download = {
      id: downloadId,
      url: currentUrl,
      status: "pending",
      progress: 0,
      startTime: new Date(),
    };

    setDownloads(prev => [...prev, download]);

    try {
      const result = await service().downloadGallery(currentUrl, downloadOptions());

      if (result.success) {
        setDownloads(prev =>
          prev.map(d =>
            d.id === downloadId
              ? { ...d, status: "completed", progress: 100, result: result.data, endTime: new Date() }
              : d
          )
        );
        props.onDownloadComplete?.(result.data);
      } else {
        setDownloads(prev =>
          prev.map(d => (d.id === downloadId ? { ...d, status: "error", error: result.error, endTime: new Date() } : d))
        );
        props.onDownloadError?.(result.error);
      }
    } catch (error) {
      setDownloads(prev =>
        prev.map(d =>
          d.id === downloadId
            ? {
                ...d,
                status: "error",
                error: error instanceof Error ? error.message : "Download failed",
                endTime: new Date(),
              }
            : d
        )
      );
      props.onDownloadError?.(error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Cancel download
  const cancelDownload = (downloadId: string) => {
    setDownloads(prev => prev.map(d => (d.id === downloadId ? { ...d, status: "cancelled", endTime: new Date() } : d)));
  };

  // Clear completed downloads
  const clearCompleted = () => {
    setDownloads(prev => prev.filter(d => d.status !== "completed"));
  };

  // Clear all downloads
  const clearAll = () => {
    setDownloads([]);
  };

  return (
    <div class="download-manager">
      <Card class="download-input-card">
        <div class="download-input-header">
          <Icon name="Download" class="header-icon" />
          <h2>Gallery Download Manager</h2>
        </div>

        <div class="download-input-section">
          <TextField
            value={url()}
            onInput={e => setUrl(e.currentTarget.value)}
            placeholder="Enter gallery URL (e.g., https://twitter.com/user/status/123)"
            class="url-input"
            disabled={isDownloading()}
          />

          <Show when={isValidating()}>
            <div class="validation-indicator">
              <Icon name="Clock" class="loading-icon" />
              <span>Validating URL...</span>
            </div>
          </Show>

          <Show when={validationResult()}>
            <div class={`validation-result ${validationResult()?.isValid ? "valid" : "invalid"}`}>
              <Icon name={validationResult()?.isValid ? "CheckCircle" : "AlertCircle"} class="validation-icon" />
              <span>
                {validationResult()?.isValid
                  ? `Valid - ${validationResult()?.extractor?.name || "Unknown extractor"}`
                  : validationResult()?.error}
              </span>
            </div>
          </Show>
        </div>

        <div class="download-actions">
          <Button
            onClick={startDownload}
            disabled={!url().trim() || !validationResult()?.isValid || isDownloading()}
            class="start-download-btn"
          >
            <Icon name={isDownloading() ? "Pause" : "Play"} />
            {isDownloading() ? "Downloading..." : "Start Download"}
          </Button>

          <Button onClick={() => setShowAdvanced(!showAdvanced())} variant="secondary" class="advanced-toggle-btn">
            <Icon name="Settings" />
            Advanced Options
          </Button>
        </div>

        <Show when={showAdvanced()}>
          <div class="advanced-options">
            <h3>Download Options</h3>
            <div class="options-grid">
              <div class="option-group">
                <label>Output Directory</label>
                <TextField
                  value={downloadOptions().outputDirectory || ""}
                  onInput={e => setDownloadOptions(prev => ({ ...prev, outputDirectory: e.currentTarget.value }))}
                  placeholder="./downloads"
                />
              </div>

              <div class="option-group">
                <label>Filename Format</label>
                <TextField
                  value={downloadOptions().filename || ""}
                  onInput={e => setDownloadOptions(prev => ({ ...prev, filename: e.currentTarget.value }))}
                  placeholder="{title}_{id}"
                />
              </div>

              <div class="option-group">
                <label>Max Concurrent Downloads</label>
                <TextField
                  type="number"
                  value={downloadOptions().maxConcurrent || ""}
                  onInput={e =>
                    setDownloadOptions(prev => ({ ...prev, maxConcurrent: parseInt(e.currentTarget.value) }))
                  }
                  placeholder="5"
                />
              </div>
            </div>
          </div>
        </Show>
      </Card>

      <Show when={downloads().length > 0}>
        <Card class="downloads-list-card">
          <div class="downloads-header">
            <h3>Download History</h3>
            <div class="downloads-actions">
              <Button onClick={clearCompleted} variant="secondary" size="sm">
                Clear Completed
              </Button>
              <Button onClick={clearAll} variant="secondary" size="sm">
                Clear All
              </Button>
            </div>
          </div>

          <div class="downloads-list">
            <For each={downloads()}>
              {download => (
                <div class={`download-item ${download.status}`}>
                  <div class="download-info">
                    <div class="download-url">{download.url}</div>
                    <div class="download-status">
                      <Icon
                        name={
                          download.status === "completed"
                            ? "CheckCircle"
                            : download.status === "error"
                              ? "AlertCircle"
                              : download.status === "downloading"
                                ? "Clock"
                                : "Square"
                        }
                        class="status-icon"
                      />
                      <span class="status-text">{download.status}</span>
                    </div>
                  </div>

                  <Show when={download.status === "downloading"}>
                    <div class="download-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" style={{ width: `${download.progress}%` }} />
                      </div>
                      <span class="progress-text">
                        {download.progress}% ({download.downloadedFiles || 0}/{download.totalFiles || 0} files)
                      </span>
                    </div>
                  </Show>

                  <Show when={download.status === "error"}>
                    <div class="download-error">
                      <span class="error-text">{download.error}</span>
                    </div>
                  </Show>

                  <Show when={download.status === "downloading"}>
                    <Button
                      onClick={() => cancelDownload(download.id)}
                      variant="secondary"
                      size="sm"
                      class="cancel-btn"
                    >
                      <Icon name="Square" />
                      Cancel
                    </Button>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Card>
      </Show>
    </div>
  );
};
