/**
 * RAG Search Container Component
 *
 * Main orchestration component that coordinates all RAG functionality.
 * Replaces the monolithic RAGSearch.tsx while maintaining the same API.
 */
import { createSignal, createEffect, onMount } from "solid-js";
import { RAGSearchInterface } from "./components/RAGSearchInterface";
import { RAGModalManager } from "./components/RAGModalManager";
import { useRAGSearchComponent } from "./useRAGSearchComponent";
import { useRAGDocuments } from "./composables/useRAGDocuments";
import { useRAGSearch } from "./composables/useRAGSearch";
import { useRAGSettings } from "./composables/useRAGSettings";
import { useRAGHistory } from "./composables/useRAGHistory";
import { RAGApiService } from "./api-service";
import type { RAGSearchProps, RAGModality, FileModalState, ImageModalState, ThreeDModalState } from "./types";
import "./styles.css";

export function RAGSearchContainer(props: RAGSearchProps) {
  // Initialize API service
  const apiService = new RAGApiService({ basePath: props.apiBaseUrl || "/api" });

  // Initialize composables
  const documents = useRAGDocuments({ apiService });
  const search = useRAGSearch({
    apiService,
    maxResults: props.maxResults || 20,
    similarityThreshold: props.similarityThreshold || 0.7,
    enableReranking: props.enableReranking || false,
  });
  const settings = useRAGSettings({
    defaultModel: props.defaultModel || "embeddinggemma:latest",
    maxResults: props.maxResults || 20,
    similarityThreshold: props.similarityThreshold || 0.7,
    enableReranking: props.enableReranking || false,
  });
  const history = useRAGHistory();

  // Use existing component composable for compatibility
  const { ragState, handlers, activeTab, setActiveTab } = useRAGSearchComponent({ props });

  // Modal states
  const [fileModalState, setFileModalState] = createSignal<FileModalState>({
    isOpen: false,
    filePath: "",
    fileName: "",
    fileContent: "",
    chunkIndex: 0,
    chunkText: "",
  });

  const [imageModalState, setImageModalState] = createSignal<ImageModalState>({
    isOpen: false,
    imagePath: "",
    imageId: "",
    score: 0,
    thumbnailPath: "",
    previewPath: "",
    imageMetadata: {},
    imageDimensions: { width: 0, height: 0 },
    imageSize: 0,
    imageFormat: "unknown",
    embeddingVector: [],
  });

  const [threeDModalState, setThreeDModalState] = createSignal<ThreeDModalState>({
    isOpen: false,
    searchQuery: "",
    searchResults: [],
    queryEmbedding: [],
  });

  // Search state
  const [modality, setModality] = createSignal<RAGModality>("docs");
  const [topK, setTopK] = createSignal(20);

  // Modal handlers
  const handleFileModalOpen = (filePath: string, fileName: string, content: string) => {
    setFileModalState({
      isOpen: true,
      filePath,
      fileName,
      fileContent: content,
      chunkIndex: 0,
      chunkText: content,
    });
  };

  const handleFileModalClose = () => {
    setFileModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleImageModalOpen = (imagePath: string, imageId: string, score: number) => {
    setImageModalState({
      isOpen: true,
      imagePath,
      imageId,
      score,
      thumbnailPath: imagePath,
      previewPath: imagePath,
      imageMetadata: {},
      imageDimensions: { width: 0, height: 0 },
      imageSize: 0,
      imageFormat: "unknown",
      embeddingVector: [],
    });
  };

  const handleImageModalClose = () => {
    setImageModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handle3DModalOpen = (query: string, results: any[]) => {
    setThreeDModalState({
      isOpen: true,
      searchQuery: query,
      searchResults: results,
      queryEmbedding: [],
    });
  };

  const handle3DModalClose = () => {
    setThreeDModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Search handler
  const handleSearch = async (query: string, searchModality: RAGModality, searchTopK: number) => {
    await search.performSearch(query, searchModality, searchTopK);

    // Add to history
    const results = search.results();
    history.addSearchToHistory(
      query,
      searchModality,
      results.length,
      results.length > 0 ? results[0].similarity_score : 0
    );
  };

  // Initialize on mount
  onMount(() => {
    documents.loadDocuments();
    history.loadHistoryFromStorage();
  });

  // Save history when it changes
  createEffect(() => {
    history.saveHistoryToStorage();
  });

  return (
    <div class={`rag-search-container ${props.className || ""}`}>
      <RAGSearchInterface
        props={props}
        activeTab={activeTab()}
        setActiveTab={setActiveTab}
        modality={modality}
        setModality={setModality}
        topK={topK}
        setTopK={setTopK}
        onSearch={handleSearch}
        onFileModalOpen={handleFileModalOpen}
        onImageModalOpen={handleImageModalOpen}
        on3DModalOpen={handle3DModalOpen}
        ragState={{
          ...ragState,
          documents: documents.documents,
          stats: documents.stats,
          results: search.results,
          isSearching: search.isSearching,
          queryTime: search.queryTime,
          error: search.error,
          embeddingModel: settings.embeddingModel,
          maxResults: settings.maxResults,
          similarityThreshold: settings.similarityThreshold,
          enableReranking: settings.enableReranking,
        }}
      />

      <RAGModalManager
        fileModalState={fileModalState}
        setFileModalState={setFileModalState}
        imageModalState={imageModalState}
        setImageModalState={setImageModalState}
        threeDModalState={threeDModalState}
        setThreeDModalState={setThreeDModalState}
        onFileModalClose={handleFileModalClose}
        onImageModalClose={handleImageModalClose}
        on3DModalClose={handle3DModalClose}
      />
    </div>
  );
}
