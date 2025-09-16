/**
 * Batch Download Manager Component
 *
 * Manages batch downloads with priority queues, progress tracking, and real-time updates.
 * Provides interface for creating, monitoring, and controlling batch downloads.
 */

import { Button, Card, TextField } from "reynard-components";
import { For, Show, createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { useGalleryWebSocket } from "../composables/useGalleryWebSocket";
import { GalleryService } from "../services/GalleryService";
import { ProgressTracker } from "./ProgressTracker";

export interface BatchDownload {
  batch_id: string;
  name: string;
  total_items: number;
  status: string;
  created_at: string;
  completed_items?: number;
  failed_items?: number;
}

export interface BatchDownloadItem {
  id: string;
  url: string;
  status: string;
  priority: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
  retry_count: number;
}

export interface BatchDownloadRequest {
  name: string;
  urls: string[];
  options?: Record<string, any>;
  priority?: string;
  settings?: Record<string, any>;
}

export function BatchDownloadManager() {
  const [urls, setUrls] = createSignal<string>("");
  const [batchName, setBatchName] = createSignal<string>("");
  const [priority, setPriority] = createSignal<string>("normal");
  const [isCreating, setIsCreating] = createSignal<boolean>(false);
  const [batches, setBatches] = createStore<BatchDownload[]>([]);
  const [selectedBatch, setSelectedBatch] = createSignal<string | null>(null);
  const [batchItems, setBatchItems] = createStore<BatchDownloadItem[]>([]);

  const galleryService = new GalleryService();
  const { connected, subscribe, unsubscribe, getProgress, getActiveDownloads } = useGalleryWebSocket();

  // Load batches on mount
  createEffect(async () => {
    try {
      const batchList = await galleryService.getBatchDownloads();
      setBatches(batchList);
    } catch (error) {
      console.error("Failed to load batches:", error);
    }
  });

  // Subscribe to WebSocket updates for active downloads
  createEffect(() => {
    const activeDownloads = getActiveDownloads();
    activeDownloads.forEach(download => {
      subscribe(download.download_id);
    });
  });

  const handleCreateBatch = async () => {
    const urlList = urls()
      .split("\n")
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urlList.length === 0) {
      alert("Please enter at least one URL");
      return;
    }

    setIsCreating(true);
    try {
      const request: BatchDownloadRequest = {
        name: batchName() || `Batch Download ${urlList.length} items`,
        urls: urlList,
        priority: priority(),
        options: {
          output_directory: "./downloads",
          max_concurrent: 3,
        },
        settings: {
          retry_failed: true,
          max_retries: 3,
        },
      };

      const batch = await galleryService.createBatchDownload(request);
      setBatches(prev => [batch, ...prev]);

      // Clear form
      setUrls("");
      setBatchName("");
      setPriority("normal");

      console.log("Batch created:", batch);
    } catch (error) {
      console.error("Failed to create batch:", error);
      alert("Failed to create batch download");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelBatch = async (batchId: string) => {
    try {
      await galleryService.cancelBatchDownload(batchId);
      setBatches(prev => prev.map(batch => (batch.batch_id === batchId ? { ...batch, status: "cancelled" } : batch)));
      console.log("Batch cancelled:", batchId);
    } catch (error) {
      console.error("Failed to cancel batch:", error);
      alert("Failed to cancel batch download");
    }
  };

  const handleRetryBatch = async (batchId: string) => {
    try {
      await galleryService.retryBatchDownload(batchId);
      console.log("Batch retry initiated:", batchId);
    } catch (error) {
      console.error("Failed to retry batch:", error);
      alert("Failed to retry batch download");
    }
  };

  const handleSelectBatch = async (batchId: string) => {
    setSelectedBatch(batchId);
    try {
      // Load batch items (this would be a new API endpoint)
      // For now, we'll simulate it
      const items: BatchDownloadItem[] = [];
      setBatchItems(items);
    } catch (error) {
      console.error("Failed to load batch items:", error);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "downloading":
        return "text-blue-600";
      case "failed":
        return "text-red-600";
      case "cancelled":
        return "text-gray-600";
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
      case "downloading":
        return "⬇️";
      case "failed":
        return "❌";
      case "cancelled":
        return "⏹️";
      case "pending":
        return "⏳";
      default:
        return "❓";
    }
  };

  return (
    <div class="batch-download-manager space-y-6">
      {/* Create Batch Section */}
      <Card class="p-6">
        <h2 class="text-xl font-semibold mb-4">Create Batch Download</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Batch Name</label>
            <TextField
              value={batchName()}
              onInput={e => setBatchName(e.currentTarget.value)}
              placeholder="Enter batch name (optional)"
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">URLs (one per line)</label>
            <textarea
              value={urls()}
              onInput={e => setUrls(e.currentTarget.value)}
              placeholder="Enter URLs, one per line..."
              rows={6}
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Priority</label>
            <select
              value={priority()}
              onChange={e => setPriority(e.currentTarget.value)}
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <Button onClick={handleCreateBatch} disabled={isCreating() || urls().trim().length === 0} class="w-full">
            {isCreating() ? "Creating..." : "Create Batch Download"}
          </Button>
        </div>
      </Card>

      {/* WebSocket Status */}
      <Card class="p-4">
        <div class="flex items-center space-x-2">
          <div class={`w-3 h-3 rounded-full ${connected() ? "bg-green-500" : "bg-red-500"}`} />
          <span class="text-sm">WebSocket: {connected() ? "Connected" : "Disconnected"}</span>
        </div>
      </Card>

      {/* Active Downloads */}
      <Show when={getActiveDownloads().length > 0}>
        <Card class="p-6">
          <h3 class="text-lg font-semibold mb-4">Active Downloads</h3>
          <div class="space-y-4">
            <For each={getActiveDownloads()}>
              {download => (
                <div class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium">{download.url}</span>
                    <span class="text-sm text-gray-600">{download.status}</span>
                  </div>
                  <ProgressTracker download={download} />
                </div>
              )}
            </For>
          </div>
        </Card>
      </Show>

      {/* Batch List */}
      <Card class="p-6">
        <h3 class="text-lg font-semibold mb-4">Batch Downloads</h3>

        <Show when={batches.length === 0}>
          <p class="text-gray-500 text-center py-8">No batch downloads yet</p>
        </Show>

        <Show when={batches.length > 0}>
          <div class="space-y-3">
            <For each={batches}>
              {batch => (
                <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-1">
                        <span class="text-lg">{getStatusIcon(batch.status)}</span>
                        <h4 class="font-medium">{batch.name}</h4>
                        <span class={`text-sm ${getStatusColor(batch.status)}`}>{batch.status}</span>
                      </div>
                      <p class="text-sm text-gray-600">
                        {batch.total_items} items • Created {new Date(batch.created_at).toLocaleString()}
                      </p>
                      <Show when={batch.completed_items !== undefined || batch.failed_items !== undefined}>
                        <p class="text-sm text-gray-500">
                          Completed: {batch.completed_items || 0} • Failed: {batch.failed_items || 0}
                        </p>
                      </Show>
                    </div>

                    <div class="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleSelectBatch(batch.batch_id)}>
                        Details
                      </Button>

                      <Show when={batch.status === "downloading" || batch.status === "pending"}>
                        <Button size="sm" variant="destructive" onClick={() => handleCancelBatch(batch.batch_id)}>
                          Cancel
                        </Button>
                      </Show>

                      <Show when={batch.status === "completed" && (batch.failed_items || 0) > 0}>
                        <Button size="sm" variant="outline" onClick={() => handleRetryBatch(batch.batch_id)}>
                          Retry Failed
                        </Button>
                      </Show>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Card>

      {/* Batch Details */}
      <Show when={selectedBatch()}>
        <Card class="p-6">
          <h3 class="text-lg font-semibold mb-4">Batch Details</h3>
          <p class="text-gray-500">Batch item details would be displayed here</p>
        </Card>
      </Show>
    </div>
  );
}
