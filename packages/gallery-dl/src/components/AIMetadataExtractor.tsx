/**
 * AI Metadata Extractor Component
 *
 * Integrates with Reynard's AI services to extract and enhance metadata
 * from downloaded gallery content. Provides intelligent content analysis,
 * tagging, and organization features.
 */

import { Button, Card } from "reynard-components";
import { For, Show, createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { GalleryService } from "../services/GalleryService";

export interface AIMetadataRequest {
  download_id: string;
  content_type: "image" | "video" | "mixed";
  extract_tags?: boolean;
  extract_captions?: boolean;
  extract_objects?: boolean;
  extract_text?: boolean;
  extract_colors?: boolean;
  extract_emotions?: boolean;
  custom_prompts?: string[];
}

export interface AIMetadataResult {
  download_id: string;
  content_type: string;
  tags: string[];
  captions: string[];
  objects: Array<{
    name: string;
    confidence: number;
    bounding_box?: [number, number, number, number];
  }>;
  extracted_text: string[];
  dominant_colors: Array<{
    color: string;
    percentage: number;
  }>;
  emotions: Array<{
    emotion: string;
    confidence: number;
  }>;
  custom_analysis: Array<{
    prompt: string;
    result: string;
    confidence: number;
  }>;
  processing_time: number;
  created_at: string;
}

export interface MetadataExtractionJob {
  id: string;
  download_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  created_at: string;
  completed_at?: string;
  error?: string;
  result?: AIMetadataResult;
}

export function AIMetadataExtractor() {
  const [selectedDownload, setSelectedDownload] = createSignal<string>("");
  const [contentType, setContentType] = createSignal<"image" | "video" | "mixed">("image");
  const [extractTags, setExtractTags] = createSignal<boolean>(true);
  const [extractCaptions, setExtractCaptions] = createSignal<boolean>(true);
  const [extractObjects, setExtractObjects] = createSignal<boolean>(true);
  const [extractText, setExtractText] = createSignal<boolean>(false);
  const [extractColors, setExtractColors] = createSignal<boolean>(true);
  const [extractEmotions, setExtractEmotions] = createSignal<boolean>(false);
  const [customPrompts, setCustomPrompts] = createSignal<string>("");
  const [isProcessing, setIsProcessing] = createSignal<boolean>(false);

  const [extractionJobs, setExtractionJobs] = createStore<MetadataExtractionJob[]>([]);
  const [metadataResults, setMetadataResults] = createStore<AIMetadataResult[]>([]);

  const galleryService = new GalleryService();

  // Load existing jobs and results on mount
  createEffect(async () => {
    try {
      // Load extraction jobs
      const jobs = await galleryService.getMetadataExtractionJobs();
      setExtractionJobs(jobs);

      // Load metadata results
      const results = await galleryService.getMetadataResults();
      setMetadataResults(results);
    } catch (error) {
      console.error("Failed to load metadata data:", error);
    }
  });

  const handleStartExtraction = async () => {
    if (!selectedDownload()) {
      alert("Please select a download");
      return;
    }

    setIsProcessing(true);
    try {
      const request: AIMetadataRequest = {
        download_id: selectedDownload(),
        content_type: contentType(),
        extract_tags: extractTags(),
        extract_captions: extractCaptions(),
        extract_objects: extractObjects(),
        extract_text: extractText(),
        extract_colors: extractColors(),
        extract_emotions: extractEmotions(),
        custom_prompts: customPrompts()
          .split("\n")
          .map(prompt => prompt.trim())
          .filter(prompt => prompt.length > 0),
      };

      const job = await galleryService.startMetadataExtraction(request);
      setExtractionJobs(prev => [job, ...prev]);

      console.log("Metadata extraction started:", job);
    } catch (error) {
      console.error("Failed to start metadata extraction:", error);
      alert("Failed to start metadata extraction");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewResults = (result: AIMetadataResult) => {
    // This would open a detailed view of the metadata results
    console.log("Viewing metadata results:", result);
  };

  const handleExportResults = async (result: AIMetadataResult) => {
    try {
      await galleryService.exportMetadataResults(result.download_id);
      console.log("Metadata results exported");
    } catch (error) {
      console.error("Failed to export metadata results:", error);
      alert("Failed to export metadata results");
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "processing":
        return "text-blue-600";
      case "failed":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "completed":
        return "✅";
      case "processing":
        return "🔄";
      case "failed":
        return "❌";
      case "pending":
        return "⏳";
      default:
        return "❓";
    }
  };

  return (
    <div class="ai-metadata-extractor space-y-6">
      {/* Configuration Section */}
      <Card class="p-6">
        <h2 class="text-xl font-semibold mb-4">AI Metadata Extraction</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Select Download</label>
            <select
              value={selectedDownload()}
              onChange={e => setSelectedDownload(e.currentTarget.value)}
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a download...</option>
              {/* This would be populated with actual downloads */}
              <option value="download-1">Download 1 - Gallery from example.com</option>
              <option value="download-2">Download 2 - User gallery from social.com</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Content Type</label>
            <select
              value={contentType()}
              onChange={e => setContentType(e.currentTarget.value as any)}
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="mixed">Mixed Content</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <h4 class="font-medium">Extraction Options</h4>

              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={extractTags()}
                  onChange={e => setExtractTags(e.currentTarget.checked)}
                  class="rounded"
                />
                <span class="text-sm">Extract Tags</span>
              </label>

              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={extractCaptions()}
                  onChange={e => setExtractCaptions(e.currentTarget.checked)}
                  class="rounded"
                />
                <span class="text-sm">Generate Captions</span>
              </label>

              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={extractObjects()}
                  onChange={e => setExtractObjects(e.currentTarget.checked)}
                  class="rounded"
                />
                <span class="text-sm">Detect Objects</span>
              </label>

              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={extractText()}
                  onChange={e => setExtractText(e.currentTarget.checked)}
                  class="rounded"
                />
                <span class="text-sm">Extract Text (OCR)</span>
              </label>

              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={extractColors()}
                  onChange={e => setExtractColors(e.currentTarget.checked)}
                  class="rounded"
                />
                <span class="text-sm">Analyze Colors</span>
              </label>

              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={extractEmotions()}
                  onChange={e => setExtractEmotions(e.currentTarget.checked)}
                  class="rounded"
                />
                <span class="text-sm">Detect Emotions</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Custom Analysis Prompts (one per line)</label>
            <textarea
              value={customPrompts()}
              onInput={e => setCustomPrompts(e.currentTarget.value)}
              placeholder="Enter custom analysis prompts..."
              rows={3}
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <Button onClick={handleStartExtraction} disabled={isProcessing() || !selectedDownload()} class="w-full">
            {isProcessing() ? "Starting Extraction..." : "Start AI Metadata Extraction"}
          </Button>
        </div>
      </Card>

      {/* Active Jobs */}
      <Show when={extractionJobs.length > 0}>
        <Card class="p-6">
          <h3 class="text-lg font-semibold mb-4">Extraction Jobs</h3>

          <div class="space-y-3">
            <For each={extractionJobs}>
              {job => (
                <div class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <span class="text-lg">{getStatusIcon(job.status)}</span>
                      <span class="font-medium">Download {job.download_id}</span>
                      <span class={`text-sm ${getStatusColor(job.status)}`}>{job.status}</span>
                    </div>
                    <span class="text-sm text-gray-600">{job.progress}% complete</span>
                  </div>

                  <Show when={job.status === "processing"}>
                    <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </Show>

                  <p class="text-sm text-gray-600">Created {new Date(job.created_at).toLocaleString()}</p>

                  <Show when={job.error}>
                    <p class="text-sm text-red-600 mt-2">Error: {job.error}</p>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Card>
      </Show>

      {/* Results */}
      <Show when={metadataResults.length > 0}>
        <Card class="p-6">
          <h3 class="text-lg font-semibold mb-4">Metadata Results</h3>

          <div class="space-y-4">
            <For each={metadataResults}>
              {result => (
                <div class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-medium">Download {result.download_id}</h4>
                    <div class="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewResults(result)}>
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExportResults(result)}>
                        Export
                      </Button>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>
                        <strong>Tags:</strong> {result.tags.length} found
                      </p>
                      <p>
                        <strong>Captions:</strong> {result.captions.length} generated
                      </p>
                      <p>
                        <strong>Objects:</strong> {result.objects.length} detected
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Colors:</strong> {result.dominant_colors.length} analyzed
                      </p>
                      <p>
                        <strong>Emotions:</strong> {result.emotions.length} detected
                      </p>
                      <p>
                        <strong>Processing Time:</strong> {result.processing_time}s
                      </p>
                    </div>
                  </div>

                  <Show when={result.tags.length > 0}>
                    <div class="mt-3">
                      <p class="text-sm font-medium mb-1">Top Tags:</p>
                      <div class="flex flex-wrap gap-1">
                        <For each={result.tags.slice(0, 10)}>
                          {tag => <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{tag}</span>}
                        </For>
                      </div>
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Card>
      </Show>
    </div>
  );
}
