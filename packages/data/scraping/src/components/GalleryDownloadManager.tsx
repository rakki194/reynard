import { createSignal, For, Show } from "solid-js";
import { useGalleryDownloads } from "../composables";
export const GalleryDownloadManager = props => {
  const {
    downloads,
    activeDownloads,
    completedDownloads,
    failedDownloads,
    isLoading,
    error,
    startDownload,
    cancelDownload,
    deleteDownload,
    refreshDownloads,
  } = useGalleryDownloads({
    onDownloadComplete: props.onDownloadComplete,
    onDownloadError: props.onDownloadError,
  });
  const [url, setUrl] = createSignal("");
  const [validationResult, setValidationResult] = createSignal(null);
  const [extractors, setExtractors] = createSignal([]);
  const [selectedExtractor, setSelectedExtractor] = createSignal(null);
  const [downloadOptions, setDownloadOptions] = createSignal({});
  const [isValidating, setIsValidating] = createSignal(false);
  const [isStarting, setIsStarting] = createSignal(false);
  const handleValidateUrl = async () => {
    if (!url().trim()) return;
    setIsValidating(true);
    try {
      // This would call the validation endpoint
      // const result = await validateUrl(url());
      // setValidationResult(result);
      // For now, simulate validation
      setValidationResult({
        isValid: true,
        extractor: {
          name: "generic",
          category: "generic",
          patterns: ["*"],
          available: true,
        },
      });
    } catch (err) {
      setValidationResult({
        isValid: false,
        error: err instanceof Error ? err.message : "Validation failed",
      });
    } finally {
      setIsValidating(false);
    }
  };
  const handleStartDownload = async () => {
    if (!url().trim() || !validationResult()?.isValid) return;
    setIsStarting(true);
    try {
      const options = {
        outputDirectory: downloadOptions().outputDirectory || "./downloads",
        filename: downloadOptions().filename || "{title}_{id}",
        maxConcurrent: downloadOptions().maxConcurrent || 5,
        ...downloadOptions(),
      };
      await startDownload(url(), options);
      setUrl("");
      setValidationResult(null);
      setDownloadOptions({});
    } catch (err) {
      console.error("Failed to start download:", err);
    } finally {
      setIsStarting(false);
    }
  };
  const handleCancelDownload = async jobId => {
    try {
      await cancelDownload(jobId);
    } catch (err) {
      console.error("Failed to cancel download:", err);
    }
  };
  const handleDeleteDownload = async jobId => {
    try {
      await deleteDownload(jobId);
    } catch (err) {
      console.error("Failed to delete download:", err);
    }
  };
  return (
    <div class="p-4 border rounded-lg shadow-sm bg-gray-800 text-white">
      <h2 class="text-xl font-semibold mb-4">Gallery Download Manager</h2>

      {/* URL Input and Validation */}
      <div class="mb-6 space-y-4">
        <div class="flex space-x-2">
          <input
            type="text"
            placeholder="Enter gallery URL (e.g., https://example.com/gallery)"
            value={url()}
            onInput={e => setUrl(e.currentTarget.value)}
            class="flex-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleValidateUrl}
            disabled={!url().trim() || isValidating()}
            class="px-4 py-2 rounded bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isValidating() ? "Validating..." : "Validate"}
          </button>
        </div>

        {/* Validation Result */}
        <Show when={validationResult()}>
          {result => (
            <div
              class={`p-3 rounded border ${
                result().isValid
                  ? "bg-green-900 border-green-600 text-green-100"
                  : "bg-red-900 border-red-600 text-red-100"
              }`}
            >
              <Show when={result().isValid} fallback={<p>❌ {result().error}</p>}>
                <div>
                  <p class="font-medium">✅ URL is valid</p>
                  <Show when={result().extractor}>
                    <p class="text-sm mt-1">
                      Supported by: <span class="font-mono">{result().extractor.name}</span>
                      {result().extractor.category && (
                        <span class="ml-2 text-gray-300">({result().extractor.category})</span>
                      )}
                    </p>
                  </Show>
                </div>
              </Show>
            </div>
          )}
        </Show>

        {/* Download Options */}
        <Show when={validationResult()?.isValid}>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-700 rounded">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Output Directory</label>
              <input
                type="text"
                value={downloadOptions().outputDirectory || ""}
                onInput={e => setDownloadOptions(prev => ({ ...prev, outputDirectory: e.currentTarget.value }))}
                placeholder="./downloads"
                class="w-full p-2 rounded bg-gray-600 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Filename Pattern</label>
              <input
                type="text"
                value={downloadOptions().filename || ""}
                onInput={e => setDownloadOptions(prev => ({ ...prev, filename: e.currentTarget.value }))}
                placeholder="{title}_{id}"
                class="w-full p-2 rounded bg-gray-600 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Max Concurrent</label>
              <input
                type="number"
                value={downloadOptions().maxConcurrent || ""}
                onInput={e => setDownloadOptions(prev => ({ ...prev, maxConcurrent: parseInt(e.currentTarget.value) }))}
                placeholder="5"
                min="1"
                max="10"
                class="w-full p-2 rounded bg-gray-600 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="flex items-end">
              <button
                onClick={handleStartDownload}
                disabled={!validationResult()?.isValid || isStarting()}
                class="w-full px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isStarting() ? "Starting..." : "Start Download"}
              </button>
            </div>
          </div>
        </Show>
      </div>

      {/* Error Display */}
      <Show when={error()}>
        <div class="mb-4 p-3 rounded bg-red-900 border border-red-600 text-red-100">
          <p class="font-medium">Error:</p>
          <p class="text-sm">{error()}</p>
        </div>
      </Show>

      {/* Downloads List */}
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium">Downloads</h3>
          <button
            onClick={refreshDownloads}
            disabled={isLoading()}
            class="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading() ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Active Downloads */}
        <Show when={activeDownloads().length > 0}>
          <div>
            <h4 class="text-md font-medium text-blue-400 mb-2">Active Downloads ({activeDownloads().length})</h4>
            <div class="space-y-2">
              <For each={activeDownloads()}>
                {download => (
                  <div class="p-3 bg-gray-700 rounded-md border border-gray-600">
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <p class="font-medium truncate">{download.url}</p>
                        <p class="text-sm text-gray-400">
                          Status: {download.status} - Progress: {download.progress?.percentage || 0}%
                        </p>
                        <Show when={download.progress?.currentFile}>
                          <p class="text-xs text-gray-500 truncate">Current: {download.progress.currentFile}</p>
                        </Show>
                      </div>
                      <div class="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleCancelDownload(download.id)}
                          class="px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <Show when={download.progress}>
                      <div class="mt-2 w-full bg-gray-600 rounded-full h-2">
                        <div
                          class="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${download.progress.percentage || 0}%` }}
                        />
                      </div>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>

        {/* Completed Downloads */}
        <Show when={completedDownloads().length > 0}>
          <div>
            <h4 class="text-md font-medium text-green-400 mb-2">Completed Downloads ({completedDownloads().length})</h4>
            <div class="space-y-2">
              <For each={completedDownloads()}>
                {download => (
                  <div class="p-3 bg-gray-700 rounded-md border border-gray-600">
                    <div class="flex justify-between items-center">
                      <div class="flex-1">
                        <p class="font-medium truncate">{download.url}</p>
                        <p class="text-sm text-gray-400">Completed - {download.result?.files_downloaded || 0} files</p>
                      </div>
                      <div class="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleDeleteDownload(download.id)}
                          class="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>

        {/* Failed Downloads */}
        <Show when={failedDownloads().length > 0}>
          <div>
            <h4 class="text-md font-medium text-red-400 mb-2">Failed Downloads ({failedDownloads().length})</h4>
            <div class="space-y-2">
              <For each={failedDownloads()}>
                {download => (
                  <div class="p-3 bg-gray-700 rounded-md border border-gray-600">
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <p class="font-medium truncate">{download.url}</p>
                        <p class="text-sm text-gray-400">Status: {download.status}</p>
                        <Show when={download.error}>
                          <p class="text-xs text-red-400">Error: {download.error}</p>
                        </Show>
                      </div>
                      <div class="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleDeleteDownload(download.id)}
                          class="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>

        {/* Empty State */}
        <Show when={downloads().length === 0}>
          <div class="text-center py-8 text-gray-400">
            <p>No downloads found.</p>
            <p class="text-sm mt-1">Enter a gallery URL above to start downloading.</p>
          </div>
        </Show>
      </div>
    </div>
  );
};
