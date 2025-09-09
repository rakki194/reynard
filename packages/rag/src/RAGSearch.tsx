/**
 * RAG Search Component
 *
 * A comprehensive search interface for RAG (Retrieval-Augmented Generation) systems
 * with EmbeddingGemma integration, 3D visualization, and advanced features.
 */

import { createSignal, createEffect, Show } from "solid-js";
import { Tabs, Button, Select, TextField } from "reynard-components";
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";

import { RAGTabPanels } from "./RAGTabPanels";
import { useRAGSearchComponent } from "./useRAGSearchComponent";
import { createRAGTabConfig } from "./tab-config";
import { RAG3DVisualizationModal } from "./components/RAG3DVisualizationModal";
import { RAGFileModal } from "./components/RAGFileModal";
import { RAGImageModal } from "./components/RAGImageModal";
import { RAGSearchHistory } from "./components/RAGSearchHistory";
import type { 
  RAGSearchProps, 
  RAGModality, 
  FileModalState, 
  ImageModalState, 
  ThreeDModalState,
  SearchHistoryItem,
  RAGQueryHit
} from "./types";
import "./styles.css";

// Helper function to get icon as JSX element
const getIcon = (name: string) => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    return <div innerHTML={icon as unknown as string} />;
  }
  return null;
};

export function RAGSearch(props: RAGSearchProps) {
  // Use component composable for initialization and state management
  const { ragState, handlers, activeTab, setActiveTab } = useRAGSearchComponent({ props });

  // Advanced features state
  const [modality, setModality] = createSignal<RAGModality>('docs');
  const [topK, setTopK] = createSignal<number>(20);

  // Modal states
  const [fileModalState, setFileModalState] = createSignal<FileModalState>({
    isOpen: false,
    filePath: '',
    fileName: '',
    fileContent: '',
  });

  const [imageModalState, setImageModalState] = createSignal<ImageModalState>({
    isOpen: false,
    imagePath: '',
    imageId: '',
    score: 0,
  });

  const [threeDModalState, setThreeDModalState] = createSignal<ThreeDModalState>({
    isOpen: false,
    searchQuery: '',
    searchResults: [],
  });

  // Search history state
  const [searchHistory, setSearchHistory] = createSignal<SearchHistoryItem[]>([]);

  // Enhanced search results with advanced features
  const [enhancedResults, setEnhancedResults] = createSignal<RAGQueryHit[]>([]);
  const [queryEmbedding, setQueryEmbedding] = createSignal<number[] | undefined>();

  // Get tab configuration
  const tabItems = createRAGTabConfig(!!props.showSearchHistory);

  // Enhanced search handler
  const handleAdvancedSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      // Perform search with current modality
      const results = await performRAGSearch(query, modality(), topK());
      setEnhancedResults(results);
      
      // Add to search history
      const historyItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query,
        modality: modality(),
        timestamp: new Date(),
        resultCount: results.length,
        topScore: results.length > 0 ? results[0].score : 0,
      };
      
      setSearchHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 items
      
      // Extract query embedding if available
      if (results.length > 0 && results[0].embedding_vector) {
        setQueryEmbedding(results[0].embedding_vector);
      }
      
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Mock search function (replace with actual API call)
  const performRAGSearch = async (query: string, modality: RAGModality, topK: number): Promise<RAGQueryHit[]> => {
    // This would be replaced with actual API call
    return Array.from({ length: Math.min(topK, 10) }, (_, i) => ({
      id: `result-${i}`,
      score: Math.random() * 0.4 + 0.6, // 0.6-1.0
      embedding_vector: Array.from({ length: 384 }, () => Math.random() * 2 - 1),
      file_path: modality === 'docs' ? `/path/to/document-${i}.txt` : undefined,
      image_path: modality === 'images' ? `/path/to/image-${i}.jpg` : undefined,
      image_id: modality === 'images' ? `image-${i}` : undefined,
      metadata: {
        title: `Result ${i + 1}`,
        source: `example-${modality}`,
      },
    }));
  };

  // Modal handlers
  const handleOpenFileModal = (filePath: string, fileName: string, fileContent: string, chunkIndex?: number, chunkText?: string) => {
    setFileModalState({
      isOpen: true,
      filePath,
      fileName,
      fileContent,
      chunkIndex,
      chunkText,
    });
  };

  const handleCloseFileModal = () => {
    setFileModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleOpenImageModal = (imagePath: string, imageId: string, score: number, metadata?: Record<string, unknown>) => {
    setImageModalState({
      isOpen: true,
      imagePath,
      imageId,
      score,
      imageMetadata: metadata,
    });
  };

  const handleCloseImageModal = () => {
    setImageModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleOpen3DModal = () => {
    setThreeDModalState({
      isOpen: true,
      searchQuery: ragState.query(),
      searchResults: enhancedResults(),
      queryEmbedding: queryEmbedding(),
    });
  };

  const handleClose3DModal = () => {
    setThreeDModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Search history handlers
  const handleSearchAgain = (query: string, modality: RAGModality) => {
    setModality(modality);
    ragState.setQuery(query);
    handleAdvancedSearch(query);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const handleRemoveHistoryItem = (id: string) => {
    setSearchHistory(prev => prev.filter(item => item.id !== id));
  };

  // Sync search query with suggestions
  createEffect(() => {
    const query = ragState.query();
    // Suggestions logic can be added here if needed
    console.log('Query changed:', query);
  });

  return (
    <div class={`rag-search ${props.className || ""}`}>
      {/* Advanced Search Controls */}
      <div class="rag-search-controls">
        <div class="search-input-group">
          <TextField
            placeholder="Search documents, images, code, or captions..."
            value={ragState.query()}
            onChange={ragState.setQuery}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAdvancedSearch(ragState.query());
              }
            }}
            fullWidth
          />
          
          <Button
            variant="primary"
            onClick={() => handleAdvancedSearch(ragState.query())}
            disabled={!ragState.query().trim()}
          >
            Search
          </Button>
        </div>

        <div class="search-options">
          <Select
            value={modality()}
            onChange={(value) => setModality(value as RAGModality)}
            options={[
              { value: 'docs', label: 'Documents' },
              { value: 'images', label: 'Images' },
              { value: 'code', label: 'Code' },
              { value: 'captions', label: 'Captions' },
            ]}
            size="sm"
          />
          
          <Select
            value={topK()}
            onChange={(value) => setTopK(Number(value))}
            options={[
              { value: 10, label: '10 results' },
              { value: 20, label: '20 results' },
              { value: 50, label: '50 results' },
              { value: 100, label: '100 results' },
            ]}
            size="sm"
          />
        </div>

        {/* Advanced Feature Buttons */}
        <div class="advanced-features">
          <Show when={props.show3DVisualization && enhancedResults().length > 0}>
            <Button
              variant="secondary"
              onClick={handleOpen3DModal}
            >
              3D Visualization
            </Button>
          </Show>
          
          <Show when={props.showSearchHistory}>
            <Button
              variant="secondary"
              onClick={() => setActiveTab('history')}
            >
              Search History
            </Button>
          </Show>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        items={tabItems}
        activeTab={activeTab()}
        onTabChange={setActiveTab}
        variant="default"
        fullWidth
      >
        <RAGTabPanels
          activeTab={activeTab()}
          ragState={ragState}
          handlers={{
            ...handlers,
            handleAdvancedSearch,
            handleOpenFileModal,
            handleOpenImageModal,
            enhancedResults: enhancedResults(),
            modality: modality(),
          }}
        />
        
        {/* Search History Tab */}
        <Show when={props.showSearchHistory && activeTab() === 'history'}>
          <div class="rag-tab-panel">
            <RAGSearchHistory
              searchHistory={searchHistory()}
              onSearchAgain={handleSearchAgain}
              onClearHistory={handleClearHistory}
              onRemoveItem={handleRemoveHistoryItem}
              showFilters={true}
              maxItems={50}
            />
          </div>
        </Show>
      </Tabs>

      {/* Modals */}
      <RAG3DVisualizationModal
        isOpen={threeDModalState().isOpen}
        onClose={handleClose3DModal}
        searchQuery={threeDModalState().searchQuery}
        searchResults={threeDModalState().searchResults}
        queryEmbedding={threeDModalState().queryEmbedding}
      />

      <RAGFileModal
        isOpen={fileModalState().isOpen}
        onClose={handleCloseFileModal}
        filePath={fileModalState().filePath}
        fileName={fileModalState().fileName}
        fileContent={fileModalState().fileContent}
        chunkIndex={fileModalState().chunkIndex}
        chunkText={fileModalState().chunkText}
        modality={modality()}
      />

      <RAGImageModal
        isOpen={imageModalState().isOpen}
        onClose={handleCloseImageModal}
        imagePath={imageModalState().imagePath}
        imageId={imageModalState().imageId}
        thumbnailPath={imageModalState().thumbnailPath}
        previewPath={imageModalState().previewPath}
        imageMetadata={imageModalState().imageMetadata}
        imageDimensions={imageModalState().imageDimensions}
        imageSize={imageModalState().imageSize}
        imageFormat={imageModalState().imageFormat}
        embeddingVector={imageModalState().embeddingVector}
        score={imageModalState().score}
      />
    </div>
  );
}
