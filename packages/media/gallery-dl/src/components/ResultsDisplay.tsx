/**
 * Results Display Component
 *
 * Displays download results with filtering, sorting, and detailed information
 * about downloaded files and metadata.
 */
import { Component, createSignal, createMemo, Show, For } from "solid-js";
import { Card, Button, TextField, Icon } from "reynard-primitives";

export interface ResultsDisplayProps {
  results: DownloadResult[];
  onResultSelect?: (result: DownloadResult) => void;
  onResultShare?: (result: DownloadResult) => void;
  onResultViewFiles?: (result: DownloadResult) => void;
  class?: string;
}

export interface DownloadResult {
  id: string;
  url: string;
  title: string;
  extractor: string;
  status: "completed" | "error" | "partial";
  files: DownloadedFile[];
  metadata?: {
    total_files: number;
    total_size: number;
    duration?: number;
    quality?: string;
    resolution?: string;
  };
  created_at: Date;
  completed_at?: Date;
  error?: string;
}

export interface DownloadedFile {
  id: string;
  filename: string;
  path: string;
  size: number;
  type: "image" | "video" | "audio" | "document" | "other";
  extension: string;
  url?: string;
  thumbnail?: string;
}

type SortField = "title" | "created_at" | "total_size" | "status" | "extractor";

export const ResultsDisplay: Component<ResultsDisplayProps> = props => {
  const [searchTerm, setSearchTerm] = createSignal("");
  const [sortField, setSortField] = createSignal<SortField>("created_at");
  const [sortOrder, setSortOrder] = createSignal<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = createSignal<string>("all");
  const [filterExtractor, setFilterExtractor] = createSignal<string>("all");
  const [viewMode, setViewMode] = createSignal<"list" | "grid">("list");
  const [selectedResult, setSelectedResult] = createSignal<DownloadResult | null>(null);

  // Filter and sort results
  const filteredAndSortedResults = createMemo(() => {
    let filtered = props.results.filter(result => {
      const matchesSearch =
        result.title.toLowerCase().includes(searchTerm().toLowerCase()) ||
        result.url.toLowerCase().includes(searchTerm().toLowerCase());
      const matchesStatus = filterStatus() === "all" || result.status === filterStatus();
      const matchesExtractor = filterExtractor() === "all" || result.extractor === filterExtractor();
      return matchesSearch && matchesStatus && matchesExtractor;
    });

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField()) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "created_at":
          comparison = a.created_at.getTime() - b.created_at.getTime();
          break;
        case "total_size":
          comparison = (a.metadata?.total_size || 0) - (b.metadata?.total_size || 0);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "extractor":
          comparison = a.extractor.localeCompare(b.extractor);
          break;
      }

      return sortOrder() === "asc" ? comparison : -comparison;
    });

    return filtered;
  });

  const extractors = createMemo(() => {
    const extractorSet = new Set(props.results.map(result => result.extractor));
    return Array.from(extractorSet);
  });

  const handleSort = (field: SortField) => {
    if (sortField() === field) {
      setSortOrder(sortOrder() === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const getFileTypeIcon = (type: string): string => {
    switch (type) {
      case "image":
        return "Image";
      case "video":
        return "Video";
      case "audio":
        return "Music";
      case "document":
        return "Document";
      default:
        return "File";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "success";
      case "error":
        return "error";
      case "partial":
        return "warning";
      default:
        return "muted";
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "completed":
        return "CheckCircle";
      case "error":
        return "AlertCircle";
      case "partial":
        return "AlertTriangle";
      default:
        return "Circle";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div class={`results-display ${props.class || ""}`}>
      <Card class="results-header">
        <div class="header-content">
          <div class="header-title">
            <Icon name="Download" class="header-icon" />
            <h2>Download Results</h2>
          </div>

          <div class="results-stats">
            <span class="stat">
              <Icon name="CheckCircle" />
              {props.results.filter(r => r.status === "completed").length} Completed
            </span>
            <span class="stat">
              <Icon name="AlertCircle" />
              {props.results.filter(r => r.status === "error").length} Errors
            </span>
            <span class="stat">
              <Icon name="AlertTriangle" />
              {props.results.filter(r => r.status === "partial").length} Partial
            </span>
          </div>
        </div>
      </Card>

      <Card class="filters-section">
        <div class="filters-row">
          <div class="filter-group">
            <TextField
              value={searchTerm()}
              onInput={e => setSearchTerm(e.currentTarget.value)}
              placeholder="Search results..."
              class="search-input"
            />
          </div>

          <div class="filter-group">
            <select value={filterStatus()} onChange={e => setFilterStatus(e.currentTarget.value)}>
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="error">Error</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          <div class="filter-group">
            <select value={filterExtractor()} onChange={e => setFilterExtractor(e.currentTarget.value)}>
              <option value="all">All Extractors</option>
              <For each={extractors()}>{extractor => <option value={extractor}>{extractor}</option>}</For>
            </select>
          </div>

          <div class="filter-group">
            <Button
              onClick={() => setViewMode("list")}
              variant={viewMode() === "list" ? "primary" : "secondary"}
              size="sm"
            >
              <Icon name="List" />
            </Button>
            <Button
              onClick={() => setViewMode("grid")}
              variant={viewMode() === "grid" ? "primary" : "secondary"}
              size="sm"
            >
              <Icon name="Grid" />
            </Button>
          </div>
        </div>

        <div class="sort-controls">
          <span class="sort-label">Sort by:</span>
          <For each={["title", "created_at", "total_size", "status", "extractor"] as SortField[]}>
            {field => (
              <Button
                onClick={() => handleSort(field)}
                variant={sortField() === field ? "primary" : "secondary"}
                size="sm"
              >
                {field} {sortField() === field && (sortOrder() === "asc" ? "↑" : "↓")}
              </Button>
            )}
          </For>
        </div>

        <div class="results-count">
          {filteredAndSortedResults().length} of {props.results.length} results
        </div>
      </Card>

      <Card class="results-content">
        <Show
          when={filteredAndSortedResults().length === 0}
          fallback={
            <div class={`results-list ${viewMode()}`}>
              <For each={filteredAndSortedResults()}>
                {result => (
                  <div class={`result-item ${result.status}`} onClick={() => setSelectedResult(result)}>
                    <div class="result-header">
                      <Icon
                        name={getStatusIcon(result.status)}
                        class={`status-icon ${getStatusColor(result.status)}`}
                      />
                      <div class="result-title">
                        <h3>{result.title}</h3>
                        <span class="result-url">{result.url}</span>
                      </div>
                      <div class="result-meta">
                        <span class="result-extractor">{result.extractor}</span>
                        <span class="result-date">{result.created_at.toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div class="result-content">
                      <div class="result-stats">
                        <div class="stat-item">
                          <Icon name="File" />
                          <span>{result.files.length} files</span>
                        </div>
                        <Show when={result.metadata?.total_size}>
                          <div class="stat-item">
                            <Icon name="HardDrive" />
                            <span>{formatFileSize(result.metadata!.total_size)}</span>
                          </div>
                        </Show>
                        <Show when={result.metadata?.duration}>
                          <div class="stat-item">
                            <Icon name="Clock" />
                            <span>{formatDuration(result.metadata!.duration!)}</span>
                          </div>
                        </Show>
                      </div>

                      <Show when={result.metadata?.quality || result.metadata?.resolution}>
                        <div class="result-quality">
                          <Show when={result.metadata?.quality}>
                            <span class="quality-badge">{result.metadata!.quality}</span>
                          </Show>
                          <Show when={result.metadata?.resolution}>
                            <span class="resolution-badge">{result.metadata!.resolution}</span>
                          </Show>
                        </div>
                      </Show>

                      <Show when={result.error}>
                        <div class="result-error">
                          <Icon name="AlertCircle" class="error-icon" />
                          <span class="error-text">{result.error}</span>
                        </div>
                      </Show>
                    </div>

                    <div class="result-actions">
                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          props.onResultSelect?.(result);
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        <Icon name="Eye" />
                        View
                      </Button>

                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          props.onResultShare?.(result);
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        <Icon name="Share" />
                        Share
                      </Button>

                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          props.onResultViewFiles?.(result);
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        <Icon name="Folder" />
                        Files
                      </Button>

                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          copyToClipboard(result.url);
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        <Icon name="Copy" />
                        Copy URL
                      </Button>

                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          openInNewTab(result.url);
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        <Icon name="ExternalLink" />
                        Open
                      </Button>
                    </div>
                  </div>
                )}
              </For>
            </div>
          }
        >
          <div class="empty-state">
            <Icon name="Download" class="empty-icon" />
            <p>No results found</p>
            <Show when={searchTerm()}>
              <Button onClick={() => setSearchTerm("")} variant="secondary">
                Clear search
              </Button>
            </Show>
          </div>
        </Show>
      </Card>

      <Show when={selectedResult()}>
        <Card class="result-details-section">
          <div class="section-header">
            <h3>Result Details: {selectedResult()?.title}</h3>
            <Button onClick={() => setSelectedResult(null)} variant="secondary" size="sm">
              <Icon name="X" />
              Close
            </Button>
          </div>

          <div class="details-content">
            <div class="detail-section">
              <h4>Basic Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">URL:</span>
                  <span class="detail-value">{selectedResult()?.url}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Extractor:</span>
                  <span class="detail-value">{selectedResult()?.extractor}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">{selectedResult()?.status}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Created:</span>
                  <span class="detail-value">{selectedResult()?.created_at.toLocaleString()}</span>
                </div>
                <Show when={selectedResult()?.completed_at}>
                  <div class="detail-item">
                    <span class="detail-label">Completed:</span>
                    <span class="detail-value">{selectedResult()?.completed_at?.toLocaleString()}</span>
                  </div>
                </Show>
              </div>
            </div>

            <Show when={selectedResult()?.metadata}>
              <div class="detail-section">
                <h4>Metadata</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">Total Files:</span>
                    <span class="detail-value">{selectedResult()?.metadata?.total_files}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Total Size:</span>
                    <span class="detail-value">{formatFileSize(selectedResult()?.metadata?.total_size || 0)}</span>
                  </div>
                  <Show when={selectedResult()?.metadata?.duration}>
                    <div class="detail-item">
                      <span class="detail-label">Duration:</span>
                      <span class="detail-value">{formatDuration(selectedResult()?.metadata?.duration!)}</span>
                    </div>
                  </Show>
                  <Show when={selectedResult()?.metadata?.quality}>
                    <div class="detail-item">
                      <span class="detail-label">Quality:</span>
                      <span class="detail-value">{selectedResult()?.metadata?.quality}</span>
                    </div>
                  </Show>
                  <Show when={selectedResult()?.metadata?.resolution}>
                    <div class="detail-item">
                      <span class="detail-label">Resolution:</span>
                      <span class="detail-value">{selectedResult()?.metadata?.resolution}</span>
                    </div>
                  </Show>
                </div>
              </div>
            </Show>

            <div class="detail-section">
              <h4>Downloaded Files</h4>
              <div class="files-list">
                <For each={selectedResult()?.files || []}>
                  {file => (
                    <div class="file-item">
                      <div class="file-info">
                        <Icon name={getFileTypeIcon(file.type)} class="file-icon" />
                        <div class="file-details">
                          <span class="file-name">{file.filename}</span>
                          <span class="file-path">{file.path}</span>
                        </div>
                      </div>
                      <div class="file-meta">
                        <span class="file-size">{formatFileSize(file.size)}</span>
                        <span class="file-type">{file.type}</span>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </Card>
      </Show>
    </div>
  );
};
