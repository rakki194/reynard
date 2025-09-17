/**
 * AI Gallery Example
 *
 * Comprehensive example showing how to use the AI-enhanced gallery system.
 * Demonstrates caption generation, batch processing, and smart features.
 */
import { createSignal } from "solid-js";
import { AIGalleryProvider, AIGalleryGrid, AIImageViewer, useGalleryAI, } from "reynard-gallery-ai";
// Sample gallery data
const sampleGalleryData = {
    items: [
        {
            id: "1",
            name: "sample-image-1.jpg",
            path: "/images/sample-image-1.jpg",
            type: "image/jpeg",
            size: 1024000,
            modified: new Date(),
            metadata: {
                hasCaption: false,
                aiProcessed: false,
            },
        },
        {
            id: "2",
            name: "sample-image-2.jpg",
            path: "/images/sample-image-2.jpg",
            type: "image/jpeg",
            size: 2048000,
            modified: new Date(),
            metadata: {
                hasCaption: true,
                aiProcessed: true,
            },
        },
        {
            id: "3",
            name: "sample-folder",
            path: "/images/sample-folder",
            type: "folder",
        },
    ],
    currentPath: "/images",
};
// AI Gallery configuration
const aiConfig = {
    defaultGenerator: "jtp2",
    autoGenerateOnUpload: false,
    batchSettings: {
        maxConcurrent: 3,
        retryFailed: true,
        maxRetries: 2,
        progressInterval: 1000,
    },
    captionSettings: {
        postProcessing: true,
        forceRegeneration: false,
        generatorConfigs: {
            jtp2: { threshold: 0.2 },
            wdv3: { threshold: 0.3 },
            joy: { maxLength: 200 },
            florence2: { task: "caption" },
        },
    },
    uiPreferences: {
        showAIIndicators: true,
        showProgress: true,
        autoExpandCaptionEditor: false,
        showBatchControls: true,
    },
};
// AI Gallery callbacks
const aiCallbacks = {
    onCaptionGenerationStart: (item, generator) => {
        console.log(`Starting caption generation for ${item.name} with ${generator}`);
    },
    onCaptionGenerationComplete: (item, result) => {
        console.log(`Caption generated for ${item.name}:`, result.caption);
    },
    onCaptionGenerationError: (item, error) => {
        console.error(`Caption generation failed for ${item.name}:`, error);
    },
    onBatchProcessingStart: (items, generator) => {
        console.log(`Starting batch processing for ${items.length} items with ${generator}`);
    },
    onBatchProcessingProgress: (progress) => {
        console.log(`Batch progress: ${progress.completed}/${progress.total}`);
    },
    onBatchProcessingComplete: (results) => {
        console.log(`Batch processing completed: ${results.length} results`);
    },
    onBatchProcessingError: (error) => {
        console.error(`Batch processing failed:`, error);
    },
    onAIConfigChange: (config) => {
        console.log("AI configuration changed:", config);
    },
};
// Main AI Gallery Example Component
export const AIGalleryExample = () => {
    const [galleryData, setGalleryData] = createSignal(sampleGalleryData);
    const [selectedItem, setSelectedItem] = createSignal(null);
    const [showImageViewer, setShowImageViewer] = createSignal(false);
    // Handle item selection
    const handleItemClick = (item) => {
        if (item.type !== "folder") {
            setSelectedItem(item);
            setShowImageViewer(true);
        }
    };
    // Handle image viewer close
    const handleImageViewerClose = () => {
        setShowImageViewer(false);
        setSelectedItem(null);
    };
    // Handle caption save
    const handleCaptionSave = async (captionData) => {
        console.log("Saving caption:", captionData);
        // Here you would typically save to your backend
        return Promise.resolve();
    };
    // Handle caption delete
    const handleCaptionDelete = async (captionType) => {
        console.log("Deleting caption:", captionType);
        // Here you would typically delete from your backend
        return Promise.resolve();
    };
    return (<AIGalleryProvider initialConfig={aiConfig} callbacks={aiCallbacks} persistState={true} storageKey="ai-gallery-example">
      <div class="ai-gallery-example">
        <h1>AI-Enhanced Gallery Example</h1>

        <div class="ai-gallery-example__content">
          {/* AI Gallery Grid */}
          <div class="ai-gallery-example__grid">
            <AIGalleryGrid items={galleryData().items} viewConfig={{ viewMode: "grid", itemSize: "medium" }} selectionState={{ selectedIds: new Set() }} loading={false} emptyMessage="No files found" aiProps={{
            showAIIndicators: true,
            showCaptionPreviews: true,
            showBatchControls: true,
            availableGenerators: ["jtp2", "wdv3", "joy", "florence2"],
        }} onItemClick={handleItemClick} onItemDoubleClick={handleItemClick} onSelectionChange={(item, mode) => {
            console.log("Selection changed:", item.name, mode);
        }} onContextMenu={(item, x, y) => {
            console.log("Context menu:", item.name, x, y);
        }}/>
          </div>

          {/* AI Image Viewer */}
          <Show when={showImageViewer() && selectedItem()}>
            <div class="ai-gallery-example__viewer">
              <AIImageViewer imageInfo={selectedItem()} captions={{}} aiProps={{
            enableCaptionEditing: true,
            availableGenerators: ["jtp2", "wdv3", "joy", "florence2"],
            showGenerationControls: true,
            autoGenerateOnOpen: false,
            defaultGenerator: "jtp2",
        }} onClose={handleImageViewerClose} onCaptionSave={handleCaptionSave} onCaptionDelete={handleCaptionDelete} onCaptionGenerate={async (generator) => {
            console.log("Generating caption with:", generator);
        }}/>
            </div>
          </Show>
        </div>

        {/* AI Status Display */}
        <AIGalleryStatus />
      </div>
    </AIGalleryProvider>);
};
// AI Gallery Status Component
const AIGalleryStatus = () => {
    const ai = useGalleryAI();
    return (<div class="ai-gallery-status">
      <h3>AI Gallery Status</h3>

      <div class="ai-gallery-status__info">
        <div class="ai-gallery-status__item">
          <span class="ai-gallery-status__label">AI Enabled:</span>
          <span class={`ai-gallery-status__value ${ai.aiState().aiEnabled ? "ai-gallery-status__value--enabled" : "ai-gallery-status__value--disabled"}`}>
            {ai.aiState().aiEnabled ? "Yes" : "No"}
          </span>
        </div>

        <div class="ai-gallery-status__item">
          <span class="ai-gallery-status__label">Selected Generator:</span>
          <span class="ai-gallery-status__value">
            {ai.aiState().selectedGenerator}
          </span>
        </div>

        <div class="ai-gallery-status__item">
          <span class="ai-gallery-status__label">Available Generators:</span>
          <span class="ai-gallery-status__value">
            {ai.getAvailableGenerators().join(", ")}
          </span>
        </div>

        <div class="ai-gallery-status__item">
          <span class="ai-gallery-status__label">Operation Status:</span>
          <span class={`ai-gallery-status__value ai-gallery-status__value--${ai.aiState().operationStatus}`}>
            {ai.aiState().operationStatus}
          </span>
        </div>

        <Show when={ai.aiState().isGenerating}>
          <div class="ai-gallery-status__item">
            <span class="ai-gallery-status__label">Generating:</span>
            <span class="ai-gallery-status__value ai-gallery-status__value--generating">
              Yes
            </span>
          </div>
        </Show>

        <Show when={ai.aiState().batchProgress}>
          <div class="ai-gallery-status__item">
            <span class="ai-gallery-status__label">Batch Progress:</span>
            <span class="ai-gallery-status__value">
              {ai.aiState().batchProgress?.completed} /{" "}
              {ai.aiState().batchProgress?.total}
            </span>
          </div>
        </Show>

        <Show when={ai.aiState().lastError}>
          <div class="ai-gallery-status__item">
            <span class="ai-gallery-status__label">Last Error:</span>
            <span class="ai-gallery-status__value ai-gallery-status__value--error">
              {ai.aiState().lastError}
            </span>
          </div>
        </Show>
      </div>

      <div class="ai-gallery-status__actions">
        <button onClick={() => ai.setAIEnabled(!ai.aiState().aiEnabled)} class="ai-gallery-status__toggle-btn">
          {ai.aiState().aiEnabled ? "Disable AI" : "Enable AI"}
        </button>

        <button onClick={() => ai.clearAIState()} class="ai-gallery-status__clear-btn">
          Clear AI State
        </button>
      </div>
    </div>);
};
export default AIGalleryExample;
