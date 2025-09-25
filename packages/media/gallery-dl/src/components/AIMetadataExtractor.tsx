/**
 * AI Metadata Extractor Component
 *
 * Provides AI-powered metadata extraction for downloaded gallery content
 * with progress tracking, batch processing, and result visualization.
 */
import { Component, createSignal, onMount, Show, For } from "solid-js";
import { Card, Button, Icon } from "reynard-components-core";
import { GalleryService } from "../services/GalleryService";

export interface AIMetadataExtractorProps {
  service: GalleryService;
  onExtractionComplete?: (results: MetadataResult[]) => void;
  onExtractionError?: (error: string) => void;
  class?: string;
}

export interface MetadataJob {
  id: string;
  download_id: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  created_at: Date;
  error?: string;
}

export interface MetadataResult {
  id: string;
  download_id: string;
  status: "completed" | "error";
  tags: string[];
  captions: string[];
  objects: string[];
  dominant_colors: string[];
  emotions: string[];
  processing_time: number;
  created_at: Date;
  error?: string;
}

export const AIMetadataExtractor: Component<AIMetadataExtractorProps> = props => {
  const [jobs, setJobs] = createSignal<MetadataJob[]>([]);
  const [results, setResults] = createSignal<MetadataResult[]>([]);
  const [, setIsExtracting] = createSignal(false);
  const [showResults, setShowResults] = createSignal(false);

  // Load initial data
  onMount(async () => {
    await loadJobs();
    await loadResults();
  });

  const loadJobs = async () => {
    try {
      // Mock data for now - replace with actual service call
      const mockJobs: MetadataJob[] = [
        {
          id: "job_1",
          download_id: "download_1",
          status: "completed",
          progress: 100,
          created_at: new Date(),
        },
        {
          id: "job_2",
          download_id: "download_2",
          status: "processing",
          progress: 45,
          created_at: new Date(),
        },
      ];
      setJobs(mockJobs);
    } catch (error) {
      console.error("Failed to load metadata jobs:", error);
    }
  };

  const loadResults = async () => {
    try {
      // Mock data for now - replace with actual service call
      const mockResults: MetadataResult[] = [
        {
          id: "result_1",
          download_id: "download_1",
          status: "completed",
          tags: ["nature", "landscape", "mountain"],
          captions: ["Beautiful mountain landscape at sunset"],
          objects: ["mountain", "sky", "clouds"],
          dominant_colors: ["#FF6B35", "#F7931E", "#FFD23F"],
          emotions: ["peaceful", "awe-inspiring"],
          processing_time: 2.5,
          created_at: new Date(),
        },
      ];
      setResults(mockResults);
    } catch (error) {
      console.error("Failed to load metadata results:", error);
    }
  };

  const startExtraction = async (downloadId: string) => {
    setIsExtracting(true);
    try {
      // Mock extraction start - replace with actual service call
      const newJob: MetadataJob = {
        id: `job_${Date.now()}`,
        download_id: downloadId,
        status: "processing",
        progress: 0,
        created_at: new Date(),
      };

      setJobs(prev => [newJob, ...prev]);

      // Simulate progress updates
      simulateProgress(newJob.id);
    } catch (error) {
      props.onExtractionError?.(error instanceof Error ? error.message : "Extraction failed");
    } finally {
      setIsExtracting(false);
    }
  };

  const simulateProgress = (jobId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        // Mark job as completed
        setJobs(prev => prev.map(job => (job.id === jobId ? { ...job, status: "completed", progress: 100 } : job)));

        // Add mock result
        const mockResult: MetadataResult = {
          id: `result_${Date.now()}`,
          download_id: jobId,
          status: "completed",
          tags: ["ai-generated", "processed"],
          captions: ["AI-processed content"],
          objects: ["detected-objects"],
          dominant_colors: ["#FF0000", "#00FF00", "#0000FF"],
          emotions: ["neutral"],
          processing_time: 1.5,
          created_at: new Date(),
        };

        setResults(prev => [mockResult, ...prev]);
        props.onExtractionComplete?.([mockResult]);
      } else {
        setJobs(prev => prev.map(job => (job.id === jobId ? { ...job, progress } : job)));
      }
    }, 500);
  };

  const exportResults = async () => {
    try {
      const dataStr = JSON.stringify(results(), null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `metadata-results-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export results:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "processing":
        return "primary";
      case "error":
        return "error";
      default:
        return "muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "CheckCircle";
      case "processing":
        return "Clock";
      case "error":
        return "AlertCircle";
      default:
        return "Circle";
    }
  };

  return (
    <div class={`ai-metadata-extractor ${props.class || ""}`}>
      <Card class="extractor-header">
        <div class="header-content">
          <div class="header-title">
            <Icon name="Brain" class="header-icon" />
            <h2>AI Metadata Extractor</h2>
          </div>

          <div class="header-actions">
            <Button onClick={() => setShowResults(!showResults())} variant="secondary">
              <Icon name="Eye" />
              {showResults() ? "Hide Results" : "Show Results"}
            </Button>

            <Button onClick={exportResults} variant="secondary" disabled={results().length === 0}>
              <Icon name="Download" />
              Export Results
            </Button>
          </div>
        </div>
      </Card>

      <Card class="jobs-section">
        <div class="section-header">
          <h3>Extraction Jobs</h3>
          <div class="job-stats">
            <span class="stat">
              <Icon name="Clock" />
              {jobs().filter(j => j.status === "processing").length} Processing
            </span>
            <span class="stat">
              <Icon name="CheckCircle" />
              {jobs().filter(j => j.status === "completed").length} Completed
            </span>
            <span class="stat">
              <Icon name="AlertCircle" />
              {jobs().filter(j => j.status === "error").length} Errors
            </span>
          </div>
        </div>

        <div class="jobs-list">
          <For each={jobs()}>
            {job => (
              <div class={`job-item ${job.status}`}>
                <div class="job-info">
                  <div class="job-header">
                    <Icon name={getStatusIcon(job.status)} class={`status-icon ${getStatusColor(job.status)}`} />
                    <span class="job-id">Job {job.id}</span>
                    <span class="job-download-id">Download: {job.download_id}</span>
                  </div>

                  <div class="job-details">
                    <span class="job-status">{job.status}</span>
                    <span class="job-date">{job.created_at.toLocaleDateString()}</span>
                  </div>

                  <Show when={job.status === "processing"}>
                    <div class="job-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" style={{ width: `${job.progress}%` }} />
                      </div>
                      <span class="progress-text">{Math.round(job.progress)}%</span>
                    </div>
                  </Show>

                  <Show when={job.error}>
                    <div class="job-error">
                      <Icon name="AlertCircle" class="error-icon" />
                      <span class="error-text">{job.error}</span>
                    </div>
                  </Show>
                </div>

                <div class="job-actions">
                  <Button onClick={() => console.log("View job:", job.id)} variant="secondary" size="sm">
                    <Icon name="Eye" />
                    View
                  </Button>

                  <Show when={job.status === "completed"}>
                    <Button onClick={() => startExtraction(job.download_id)} variant="secondary" size="sm">
                      <Icon name="RefreshCw" />
                      Re-extract
                    </Button>
                  </Show>
                </div>
              </div>
            )}
          </For>
        </div>
      </Card>

      <Show when={showResults()}>
        <Card class="results-section">
          <div class="section-header">
            <h3>Extraction Results</h3>
            <span class="results-count">{results().length} results</span>
          </div>

          <div class="results-list">
            <For each={results()}>
              {result => (
                <div class="result-item">
                  <div class="result-header">
                    <Icon name="CheckCircle" class="result-icon success" />
                    <span class="result-id">Result {result.id}</span>
                    <span class="result-download-id">Download: {result.download_id}</span>
                  </div>

                  <div class="result-content">
                    <div class="result-section">
                      <h4>Tags</h4>
                      <div class="tags-list">
                        <For each={result.tags}>{tag => <span class="tag">{tag}</span>}</For>
                      </div>
                    </div>

                    <div class="result-section">
                      <h4>Captions</h4>
                      <div class="captions-list">
                        <For each={result.captions}>{caption => <p class="caption">{caption}</p>}</For>
                      </div>
                    </div>

                    <div class="result-section">
                      <h4>Objects</h4>
                      <div class="objects-list">
                        <For each={result.objects}>{object => <span class="object">{object}</span>}</For>
                      </div>
                    </div>

                    <div class="result-section">
                      <h4>Dominant Colors</h4>
                      <div class="colors-list">
                        <For each={result.dominant_colors}>
                          {color => <div class="color-swatch" style={{ "background-color": color }} title={color} />}
                        </For>
                      </div>
                    </div>

                    <div class="result-section">
                      <h4>Emotions</h4>
                      <div class="emotions-list">
                        <For each={result.emotions}>{emotion => <span class="emotion">{emotion}</span>}</For>
                      </div>
                    </div>

                    <div class="result-meta">
                      <span class="processing-time">Processing time: {result.processing_time}s</span>
                      <span class="result-date">{result.created_at.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Card>
      </Show>
    </div>
  );
};
