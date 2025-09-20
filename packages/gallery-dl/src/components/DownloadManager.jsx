/**
 * Download Manager Component
 *
 * Main orchestrator component for gallery downloads with comprehensive
 * state management, progress tracking, and batch processing capabilities.
 */
import { ProgressTracker } from "reynard-ai-shared";
import { Button, Card, TextField } from "reynard-components-core";
import { Icon } from "reynard-fluent-icons";
import { createEffect, createSignal, onCleanup, onMount, Show, For } from "solid-js";
import { GalleryService } from "../services/GalleryService";
export const DownloadManager = props => {
    // Service instance
    const [service] = createSignal(new GalleryService({
        name: "gallery-service",
        baseUrl: props.serviceConfig?.baseUrl || "http://localhost:8000",
        timeout: props.serviceConfig?.timeout || 30000,
        token: props.serviceConfig?.token,
    }));
    // State management
    const [url, setUrl] = createSignal("");
    const [downloadOptions, setDownloadOptions] = createSignal(props.defaultOptions || {});
    const [downloads, setDownloads] = createSignal([]);
    const [queue, setQueue] = createSignal(null);
    const [extractors, setExtractors] = createSignal([]);
    const [isValidating, setIsValidating] = createSignal(false);
    const [validationResult, setValidationResult] = createSignal(null);
    const [isDownloading, setIsDownloading] = createSignal(false);
    const [showAdvanced, setShowAdvanced] = createSignal(false);
    // Progress tracking
    const [progressTracker] = createSignal(new ProgressTracker());
    // Initialize service
    onMount(async () => {
        try {
            const extractorsResult = await service().getExtractors();
            if (extractorsResult.success) {
                setExtractors(extractorsResult.data);
            }
        }
        catch (error) {
            console.error("Failed to load extractors:", error);
        }
    });
    // URL validation
    const validateUrl = async (urlToValidate) => {
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
        }
        catch (error) {
            setValidationResult({
                isValid: false,
                error: error instanceof Error ? error.message : "Validation failed",
            });
        }
        finally {
            setIsValidating(false);
        }
    };
    // Auto-validate URL on change
    createEffect(() => {
        const currentUrl = url();
        if (currentUrl.trim()) {
            const timeoutId = setTimeout(() => validateUrl(currentUrl), 500);
            onCleanup(() => clearTimeout(timeoutId));
        }
        else {
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
        const download = {
            id: downloadId,
            url: currentUrl,
            options: downloadOptions(),
            status: "pending",
            progress: {
                percentage: 0,
                status: "pending",
                message: "Starting download...",
            },
            createdAt: new Date(),
        };
        setDownloads(prev => [...prev, download]);
        try {
            // Start download
            const result = await service().downloadGallery(currentUrl, downloadOptions());
            if (result.success) {
                // Update download with success
                setDownloads(prev => prev.map(d => d.id === downloadId
                    ? {
                        ...d,
                        status: "completed",
                        result: result.data,
                        completedAt: new Date(),
                        progress: {
                            ...d.progress,
                            percentage: 100,
                            status: "completed",
                            message: "Download completed successfully",
                        },
                    }
                    : d));
                // Call completion callback
                props.onDownloadComplete?.(result.data);
            }
            else {
                // Update download with error
                setDownloads(prev => prev.map(d => d.id === downloadId
                    ? {
                        ...d,
                        status: "error",
                        error: result.error?.message || "Download failed",
                        completedAt: new Date(),
                        progress: {
                            ...d.progress,
                            status: "error",
                            message: result.error?.message || "Download failed",
                        },
                    }
                    : d));
            }
        }
        catch (error) {
            // Update download with error
            setDownloads(prev => prev.map(d => d.id === downloadId
                ? {
                    ...d,
                    status: "error",
                    error: error instanceof Error ? error.message : "Download failed",
                    completedAt: new Date(),
                    progress: {
                        ...d.progress,
                        status: "error",
                        message: error instanceof Error ? error.message : "Download failed",
                    },
                }
                : d));
        }
        finally {
            setIsDownloading(false);
        }
    };
    // Start batch download
    const startBatchDownload = async (urls, options = {}) => {
        const batchResult = await service().startBatchDownload(urls, options);
        if (batchResult.success) {
            setQueue({
                id: batchResult.data.id,
                downloads: [],
                status: "active",
                maxConcurrent: options.maxConcurrent || 3,
                createdAt: new Date(),
            });
            props.onBatchComplete?.(batchResult.data);
        }
    };
    // Cancel download
    const cancelDownload = (downloadId) => {
        setDownloads(prev => prev.map(d => d.id === downloadId
            ? {
                ...d,
                status: "cancelled",
                completedAt: new Date(),
                progress: {
                    ...d.progress,
                    status: "cancelled",
                    message: "Download cancelled",
                },
            }
            : d));
    };
    // Clear completed downloads
    const clearCompleted = () => {
        setDownloads(prev => prev.filter(d => d.status === "downloading" || d.status === "pending"));
    };
    // Get active downloads
    const activeDownloads = () => downloads().filter(d => d.status === "downloading" || d.status === "pending");
    const completedDownloads = () => downloads().filter(d => d.status === "completed");
    const failedDownloads = () => downloads().filter(d => d.status === "error");
    return (<div class={`reynard-download-manager ${props.class || ""}`}>
      {/* Header */}
      <div class="reynard-download-manager__header">
        <h2>Gallery Download Manager</h2>
        <p>Download galleries from supported websites with progress tracking</p>
      </div>

      {/* Download Form */}
      <Card variant="elevated" padding="lg" class="reynard-download-manager__form">
        <div class="reynard-download-form">
          <div class="reynard-download-form__url">
            <TextField label="Gallery URL" placeholder="Enter gallery URL (e.g., https://example.com/gallery)" value={url()} onInput={e => setUrl(e.currentTarget.value)} fullWidth required error={validationResult()?.isValid === false} errorMessage={validationResult()?.error} rightIcon={isValidating() ? (<Icon name="loading" size="sm"/>) : validationResult()?.isValid ? (<Icon name="checkmark" size="sm" variant="success"/>) : validationResult()?.isValid === false ? (<Icon name="error" size="sm" variant="error"/>) : null}/>
          </div>

          {/* Extractor Info */}
          <Show when={validationResult()?.extractor}>
            <div class="reynard-download-form__extractor">
              <div class="reynard-extractor-info">
                <Icon name="info" size="sm" variant="info"/>
                <span>
                  Detected: {validationResult()?.extractor?.name}({validationResult()?.extractor?.category})
                </span>
              </div>
            </div>
          </Show>

          {/* Advanced Options Toggle */}
          <div class="reynard-download-form__advanced">
            <Button variant="tertiary" size="sm" onClick={() => setShowAdvanced(!showAdvanced())} rightIcon={<Icon name={showAdvanced() ? "chevron-up" : "chevron-down"} size="sm"/>}>
              Advanced Options
            </Button>
          </div>

          {/* Advanced Options */}
          <Show when={showAdvanced()}>
            <div class="reynard-download-form__advanced-options">
              <div class="reynard-form-row">
                <TextField label="Output Directory" placeholder="Leave empty for default" value={downloadOptions().outputDirectory || ""} onInput={e => setDownloadOptions(prev => ({
            ...prev,
            outputDirectory: e.currentTarget.value || undefined,
        }))}/>
                <TextField label="Filename Pattern" placeholder="Leave empty for default" value={downloadOptions().filename || ""} onInput={e => setDownloadOptions(prev => ({
            ...prev,
            filename: e.currentTarget.value || undefined,
        }))}/>
              </div>
              <div class="reynard-form-row">
                <TextField label="Max Concurrent Downloads" type="number" value={downloadOptions().maxConcurrent?.toString() || "3"} onInput={e => setDownloadOptions(prev => ({
            ...prev,
            maxConcurrent: parseInt(e.currentTarget.value) || 3,
        }))}/>
              </div>
            </div>
          </Show>

          {/* Download Button */}
          <div class="reynard-download-form__actions">
            <Button variant="primary" size="lg" fullWidth onClick={startDownload} disabled={!validationResult()?.isValid || isDownloading()} loading={isDownloading()} leftIcon={<Icon name="download" size="sm"/>}>
              {isDownloading() ? "Downloading..." : "Start Download"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Active Downloads */}
      <Show when={activeDownloads().length > 0}>
        <Card variant="elevated" padding="lg" class="reynard-download-manager__active">
          <div class="reynard-download-manager__active-header">
            <h3>Active Downloads</h3>
            <span class="reynard-download-count">{activeDownloads().length}</span>
          </div>
          <div class="reynard-download-list">
            <For each={activeDownloads()}>
              {download => (<div class="reynard-download-item">
                  <div class="reynard-download-item__info">
                    <div class="reynard-download-item__url">{download.url}</div>
                    <div class="reynard-download-item__status">
                      <Icon name={download.status === "downloading" ? "loading" : "clock"} size="sm"/>
                      <span>{download.progress.message}</span>
                    </div>
                  </div>
                  <div class="reynard-download-item__progress">
                    <div class="reynard-progress-bar">
                      <div class="reynard-progress-bar__fill" style={`width: ${download.progress.percentage}%`}/>
                    </div>
                    <span class="reynard-progress-text">{download.progress.percentage.toFixed(1)}%</span>
                  </div>
                  <div class="reynard-download-item__actions">
                    <Button variant="tertiary" size="sm" iconOnly onClick={() => cancelDownload(download.id)}>
                      <Icon name="cancel" size="sm"/>
                    </Button>
                  </div>
                </div>)}
            </For>
          </div>
        </Card>
      </Show>

      {/* Download History */}
      <Show when={downloads().length > 0}>
        <Card variant="elevated" padding="lg" class="reynard-download-manager__history">
          <div class="reynard-download-manager__history-header">
            <h3>Download History</h3>
            <div class="reynard-download-stats">
              <span class="reynard-stat">
                <Icon name="checkmark" size="sm" variant="success"/>
                {completedDownloads().length} completed
              </span>
              <span class="reynard-stat">
                <Icon name="error" size="sm" variant="error"/>
                {failedDownloads().length} failed
              </span>
            </div>
            <Button variant="tertiary" size="sm" onClick={clearCompleted}>
              Clear Completed
            </Button>
          </div>
          <div class="reynard-download-list">
            <For each={downloads().slice(-10)}>
              {" "}
              {/* Show last 10 downloads */}
              {download => (<div class={`reynard-download-item reynard-download-item--${download.status}`}>
                  <div class="reynard-download-item__info">
                    <div class="reynard-download-item__url">{download.url}</div>
                    <div class="reynard-download-item__status">
                      <Icon name={download.status === "completed"
                ? "checkmark"
                : download.status === "error"
                    ? "error"
                    : download.status === "cancelled"
                        ? "cancel"
                        : "clock"} size="sm" variant={download.status === "completed" ? "success" : download.status === "error" ? "error" : "muted"}/>
                      <span>{download.progress.message}</span>
                    </div>
                  </div>
                  <div class="reynard-download-item__result">
                    <Show when={download.result}>
                      <span class="reynard-download-files">{download.result?.files.length || 0} files</span>
                    </Show>
                    <Show when={download.error}>
                      <span class="reynard-download-error">{download.error}</span>
                    </Show>
                  </div>
                </div>)}
            </For>
          </div>
        </Card>
      </Show>
    </div>);
};
