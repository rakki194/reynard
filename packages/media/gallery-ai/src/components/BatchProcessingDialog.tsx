/**
 * Batch Processing Dialog Component
 *
 * Dialog for managing batch annotation operations with progress tracking.
 * Provides a user-friendly interface for processing multiple images.
 */
import { Show, For, createSignal, createEffect, onMount } from "solid-js";
import { Button } from "reynard-components-core";
import { useAIGalleryContext } from "../composables/useGalleryAI";
export const BatchProcessingDialog = props => {
  const ai = useAIGalleryContext();
  const [selectedGenerator, setSelectedGenerator] = createSignal("");
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [progress, setProgress] = createSignal(null);
  const [results, setResults] = createSignal([]);
  const [error, setError] = createSignal(null);
  const [showResults, setShowResults] = createSignal(false);
  // Initialize with default generator
  onMount(() => {
    if (props.availableGenerators.length > 0) {
      setSelectedGenerator(props.availableGenerators[0]);
    }
  });
  // Watch for progress updates from AI state
  createEffect(() => {
    const aiProgress = ai.aiState().batchProgress;
    if (aiProgress) {
      setProgress(aiProgress);
    }
  });
  // Handle batch processing start
  const handleStartProcessing = async () => {
    if (!selectedGenerator() || isProcessing()) return;
    setIsProcessing(true);
    setError(null);
    setResults([]);
    setShowResults(false);
    try {
      const batchResults = await ai.batchAnnotate(props.items, selectedGenerator());
      setResults(batchResults);
      setShowResults(true);
      props.onComplete?.(batchResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Batch processing failed";
      setError(errorMessage);
      props.onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };
  // Handle dialog close
  const handleClose = () => {
    if (isProcessing()) {
      // Ask for confirmation if processing is in progress
      if (confirm("Processing is in progress. Are you sure you want to close?")) {
        setIsProcessing(false);
        setProgress(null);
        props.onClose();
      }
    } else {
      props.onClose();
    }
  };
  // Get processing status text
  const getStatusText = () => {
    if (isProcessing() && progress()) {
      return `Processing ${progress().current} (${progress().completed}/${progress().total})`;
    }
    if (isProcessing()) {
      return "Starting batch processing...";
    }
    if (error()) {
      return "Processing failed";
    }
    if (results().length > 0) {
      return "Processing completed";
    }
    return "Ready to process";
  };
  // Get success count
  const getSuccessCount = () => {
    return results().filter(result => result.success).length;
  };
  // Get failure count
  const getFailureCount = () => {
    return results().filter(result => !result.success).length;
  };
  return (
    <Show when={props.visible}>
      <div class="batch-processing-dialog-overlay" onClick={handleClose}>
        <div class={`batch-processing-dialog ${props.class || ""}`} onClick={e => e.stopPropagation()}>
          <div class="batch-processing-dialog__header">
            <h2 class="batch-processing-dialog__title">Batch Processing</h2>
            <button class="batch-processing-dialog__close" onClick={handleClose} disabled={isProcessing()}>
              ×
            </button>
          </div>

          <div class="batch-processing-dialog__content">
            {/* Configuration Section */}
            <Show when={!isProcessing() && !showResults()}>
              <div class="batch-processing-dialog__config">
                <div class="batch-processing-dialog__info">
                  <p class="batch-processing-dialog__item-count">Processing {props.items.length} items</p>
                </div>

                <div class="batch-processing-dialog__generator-selector">
                  <label class="batch-processing-dialog__label">Generator:</label>
                  <select
                    value={selectedGenerator()}
                    onChange={e => setSelectedGenerator(e.currentTarget.value)}
                    class="batch-processing-dialog__select"
                    title="Select caption generator for batch processing"
                  >
                    <For each={props.availableGenerators}>
                      {generator => <option value={generator}>{getGeneratorDisplayName(generator)}</option>}
                    </For>
                  </select>
                </div>

                <div class="batch-processing-dialog__actions">
                  <Button
                    variant="primary"
                    onClick={handleStartProcessing}
                    disabled={!selectedGenerator()}
                    class="batch-processing-dialog__start-btn"
                  >
                    Start Processing
                  </Button>
                  <Button variant="ghost" onClick={handleClose} class="batch-processing-dialog__cancel-btn">
                    Cancel
                  </Button>
                </div>
              </div>
            </Show>

            {/* Processing Section */}
            <Show when={isProcessing()}>
              <div class="batch-processing-dialog__processing">
                <div class="batch-processing-dialog__status">
                  <span class="batch-processing-dialog__status-text">{getStatusText()}</span>
                </div>

                <Show when={progress()}>
                  <div class="batch-processing-dialog__progress">
                    <div class="batch-processing-dialog__progress-bar">
                      <div
                        class="batch-processing-dialog__progress-fill"
                        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                        style={`--progress-width: ${progress().percentage}%`}
                      />
                    </div>
                    <span class="batch-processing-dialog__progress-text">{progress().percentage.toFixed(1)}%</span>
                  </div>
                </Show>

                <div class="batch-processing-dialog__current-item">
                  <Show when={progress()?.current}>
                    <span class="batch-processing-dialog__current-text">Current: {progress().current}</span>
                  </Show>
                </div>
              </div>
            </Show>

            {/* Results Section */}
            <Show when={showResults()}>
              <div class="batch-processing-dialog__results">
                <div class="batch-processing-dialog__summary">
                  <h3 class="batch-processing-dialog__summary-title">Processing Complete</h3>
                  <div class="batch-processing-dialog__summary-stats">
                    <div class="batch-processing-dialog__stat">
                      <span class="batch-processing-dialog__stat-label">Total:</span>
                      <span class="batch-processing-dialog__stat-value">{results().length}</span>
                    </div>
                    <div class="batch-processing-dialog__stat batch-processing-dialog__stat--success">
                      <span class="batch-processing-dialog__stat-label">Success:</span>
                      <span class="batch-processing-dialog__stat-value">{getSuccessCount()}</span>
                    </div>
                    <div class="batch-processing-dialog__stat batch-processing-dialog__stat--error">
                      <span class="batch-processing-dialog__stat-label">Failed:</span>
                      <span class="batch-processing-dialog__stat-value">{getFailureCount()}</span>
                    </div>
                  </div>
                </div>

                <Show when={getFailureCount() > 0}>
                  <div class="batch-processing-dialog__failures">
                    <h4 class="batch-processing-dialog__failures-title">Failed Items:</h4>
                    <div class="batch-processing-dialog__failures-list">
                      <For each={results().filter(result => !result.success)}>
                        {result => (
                          <div class="batch-processing-dialog__failure-item">
                            <span class="batch-processing-dialog__failure-name">{result.imagePath}</span>
                            <span class="batch-processing-dialog__failure-error">{result.error}</span>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>

                <div class="batch-processing-dialog__actions">
                  <Button variant="primary" onClick={handleClose} class="batch-processing-dialog__done-btn">
                    Done
                  </Button>
                </div>
              </div>
            </Show>

            {/* Error Section */}
            <Show when={error()}>
              <div class="batch-processing-dialog__error">
                <div class="batch-processing-dialog__error-icon">❌</div>
                <div class="batch-processing-dialog__error-message">{error()}</div>
                <div class="batch-processing-dialog__actions">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setError(null);
                      setShowResults(false);
                    }}
                    class="batch-processing-dialog__retry-btn"
                  >
                    Try Again
                  </Button>
                  <Button variant="ghost" onClick={handleClose} class="batch-processing-dialog__cancel-btn">
                    Close
                  </Button>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};
/**
 * Get display name for a generator
 */
function getGeneratorDisplayName(generator) {
  const displayNames = {
    jtp2: "JTP2 (Furry Tags)",
    wdv3: "WDv3 (Anime Tags)",
    joy: "JoyCaption (Detailed)",
    florence2: "Florence2 (General)",
  };
  return displayNames[generator] || generator;
}
