/**
 * RAG Search Component
 *
 * A comprehensive search interface for RAG (Retrieval-Augmented Generation) systems
 * with EmbeddingGemma integration using Reynard conventions.
 */

import { createSignal, onMount } from "solid-js";
import { Tabs, TabPanel } from "reynard-components";
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";

import { RAGApiService } from "./api-service";
import { SearchTab } from "./SearchTab";
import { DocumentsTab } from "./DocumentsTab";
import { UploadTab } from "./UploadTab";
import { SettingsTab } from "./SettingsTab";
import { useRAGSearchState } from "./useRAGSearchState";
import { useRAGSearchHandlers } from "./useRAGSearchHandlers";
import type { 
  RAGSearchProps, 
  TabItem 
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
  // Create API service
  const apiService = new RAGApiService({
    basePath: props.apiBaseUrl || "http://localhost:8000"
  });

  // Use RAG search state composable
  const ragState = useRAGSearchState({
    apiService,
    defaultModel: props.defaultModel || "embeddinggemma:latest",
    maxResults: props.maxResults || 10,
    similarityThreshold: props.similarityThreshold || 0.7,
    enableReranking: props.enableReranking || false
  });

  // UI state
  const [activeTab, setActiveTab] = createSignal("search");

  // Load initial data
  onMount(() => {
    ragState.loadDocuments();
    ragState.loadStats();
  });

  // Event handlers
  const handlers = useRAGSearchHandlers({
    onResultClick: props.onResultClick,
    onDocumentUpload: props.onDocumentUpload,
    apiBaseUrl: props.apiBaseUrl,
    uploadFile: ragState.uploadFile,
    search: () => ragState.search(ragState.query())
  });

  const tabItems: TabItem[] = [
    { id: "search", label: "Search", icon: getIcon("search") },
    { id: "documents", label: "Documents", icon: getIcon("box") },
    { id: "upload", label: "Upload", icon: getIcon("upload") },
    { id: "settings", label: "Settings", icon: getIcon("settings") },
  ];

  return (
    <div class={`rag-search ${props.className || ""}`}>
      <Tabs
        items={tabItems}
        activeTab={activeTab()}
        onTabChange={setActiveTab}
        variant="default"
        fullWidth
      >
        {/* Search Tab */}
        <TabPanel tabId="search" activeTab={activeTab()}>
          <SearchTab
            query={ragState.query()}
            onQueryChange={ragState.setQuery}
            onSearch={handlers.handleSearch}
            onKeyPress={handlers.handleKeyPress}
            isSearching={ragState.isSearching()}
            error={ragState.error()}
            results={ragState.results()}
            queryResponse={ragState.queryResponse()}
            onResultClick={handlers.handleResultClick}
          />
        </TabPanel>

        {/* Documents Tab */}
        <TabPanel tabId="documents" activeTab={activeTab()}>
          <DocumentsTab
            documents={ragState.documents}
            onRefresh={ragState.loadDocuments}
            onDeleteDocument={ragState.deleteDocument}
          />
        </TabPanel>

        {/* Upload Tab */}
        <TabPanel tabId="upload" activeTab={activeTab()}>
          <UploadTab
            isUploading={ragState.isUploading()}
            uploadProgress={ragState.uploadProgress()}
            onFileSelect={handlers.handleFileSelect}
          />
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel tabId="settings" activeTab={activeTab()}>
          <SettingsTab
            embeddingModel={ragState.embeddingModel()}
            onEmbeddingModelChange={ragState.setEmbeddingModel}
            maxResults={ragState.maxResults()}
            onMaxResultsChange={ragState.setMaxResults}
            similarityThreshold={ragState.similarityThreshold()}
            onSimilarityThresholdChange={ragState.setSimilarityThreshold}
            enableReranking={ragState.enableReranking()}
            onEnableRerankingChange={ragState.setEnableReranking}
            stats={ragState.stats()}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
}
