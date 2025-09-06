/**
 * RAG Search Component
 *
 * A comprehensive search interface for RAG (Retrieval-Augmented Generation) systems
 * with EmbeddingGemma integration using Reynard conventions.
 */

import { createSignal, onMount, Show, For } from "solid-js";
import { createStore } from "solid-js/store";
import { Button, Card, TextField, Select, Tabs, TabPanel } from "reynard-components";
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";

// Helper function to get icon as JSX element
const getIcon = (name: string) => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    return <div innerHTML={icon} />;
  }
  return null;
};
import "./styles.css";

// Types
interface RAGResult {
  chunk_id: string;
  document_id: string;
  text: string;
  similarity_score: number;
  rank: number;
  metadata: {
    chunk_length?: number;
    document_source?: string;
    embedding_model?: string;
    [key: string]: any;
  };
}

interface RAGQueryResponse {
  query: string;
  results: RAGResult[];
  total_results: number;
  query_time: number;
  embedding_time: number;
  search_time: number;
  metadata: {
    embedding_model?: string;
    reranked?: boolean;
    chunks_searched?: number;
  };
}

interface RAGDocument {
  id: string;
  title: string;
  source: string;
  document_type: string;
  created_at: string;
  updated_at: string;
  chunk_count: number;
  metadata: Record<string, any>;
}

interface RAGStats {
  total_documents: number;
  total_chunks: number;
  chunks_with_embeddings: number;
  embedding_coverage: number;
  default_model: string;
  vector_db_enabled: boolean;
  codewolf_enabled: boolean;
  cache_size: number;
}

interface RAGSearchProps {
  apiBaseUrl?: string;
  defaultModel?: string;
  maxResults?: number;
  similarityThreshold?: number;
  enableReranking?: boolean;
  onResultClick?: (result: RAGResult) => void;
  onDocumentUpload?: (document: RAGDocument) => void;
  className?: string;
}

export function RAGSearch(props: RAGSearchProps) {
  // Signals
  const [query, setQuery] = createSignal("");
  const [isSearching, setIsSearching] = createSignal(false);
  const [results, setResults] = createSignal<RAGResult[]>([]);
  const [queryResponse, setQueryResponse] =
    createSignal<RAGQueryResponse | null>(null);
  const [documents, setDocuments] = createStore<RAGDocument[]>([]);
  const [stats, setStats] = createSignal<RAGStats | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [activeTab, setActiveTab] = createSignal("search");

  // Search settings
  const [embeddingModel, setEmbeddingModel] = createSignal(
    props.defaultModel || "embeddinggemma:latest",
  );
  const [maxResults, setMaxResults] = createSignal(props.maxResults || 10);
  const [similarityThreshold, setSimilarityThreshold] = createSignal(
    props.similarityThreshold || 0.7,
  );
  const [enableReranking, setEnableReranking] = createSignal(
    props.enableReranking || false,
  );

  // Upload state
  const [isUploading, setIsUploading] = createSignal(false);
  const [uploadProgress, setUploadProgress] = createSignal(0);

  const apiBaseUrl = props.apiBaseUrl || "http://localhost:8000";

  // Load initial data
  onMount(() => {
    loadDocuments();
    loadStats();
  });

  // API functions
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error("API call failed:", err);
      throw err;
    }
  };

  const searchRAG = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await apiCall("/api/rag/query", {
        method: "POST",
        body: JSON.stringify({
          query: searchQuery,
          embedding_model: embeddingModel(),
          max_results: maxResults(),
          similarity_threshold: similarityThreshold(),
          rerank: enableReranking(),
        }),
      });

      setResults(response.results);
      setQueryResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await apiCall("/api/rag/documents");
      setDocuments(response);
    } catch (err) {
      console.error("Failed to load documents:", err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiCall("/api/rag/stats");
      setStats(response);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("generate_embeddings", "true");

      const response = await fetch(`${apiBaseUrl}/api/rag/ingest/file`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      setUploadProgress(100);

      // Reload documents and stats
      await loadDocuments();
      await loadStats();

      props.onDocumentUpload?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      await apiCall(`/api/rag/documents/${documentId}`, {
        method: "DELETE",
      });

      await loadDocuments();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  // Event handlers
  const handleSearch = () => {
    searchRAG(query());
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleResultClick = (result: RAGResult) => {
    props.onResultClick?.(result);
  };

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  // Computed values
  const hasResults = () => results().length > 0;
  const currentStats = () => stats();

  const tabItems = [
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
          <div class="search-tab-content">
            <Card variant="elevated" padding="lg">
              <div class="search-form">
                <div class="search-input-group">
                  <TextField
                    value={query()}
                    onInput={(e) => setQuery(e.currentTarget.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question or search for information..."
                    fullWidth
                    disabled={isSearching()}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching() || !query().trim()}
                    leftIcon={getIcon("search")}
                    loading={isSearching()}
                  >
                    Search
                  </Button>
                </div>

                <Show when={error()}>
                  <div class="error-message">{error()}</div>
                </Show>

                <Show when={queryResponse()}>
                  <div class="query-stats">
                    <div class="stat-item">
                      <div class="stat-icon">{getIcon("refresh")}</div>
                      <span>
                        Query: {queryResponse()!.query_time.toFixed(2)}ms
                      </span>
                    </div>
                    <div class="stat-item">
                      <div class="stat-icon">{getIcon("server")}</div>
                      <span>
                        Embedding: {queryResponse()!.embedding_time.toFixed(2)}
                        ms
                      </span>
                    </div>
                    <div class="stat-item">
                      <div class="stat-icon">{getIcon("refresh")}</div>
                      <span>
                        Search: {queryResponse()!.search_time.toFixed(2)}ms
                      </span>
                    </div>
                    <div class="stat-item">
                      <div class="stat-icon">{getIcon("server")}</div>
                      <span>{queryResponse()!.total_results} results</span>
                    </div>
                  </div>
                </Show>
              </div>
            </Card>

            <Show when={hasResults()}>
              <div class="results-list">
                <For each={results()}>
                  {(result) => (
                    <Card
                      variant="elevated"
                      padding="md"
                      interactive
                      onClick={() => handleResultClick(result)}
                    >
                      <div class="result-item">
                        <div class="result-header">
                          <div class="result-badges">
                            <span class="rank-badge">#{result.rank}</span>
                            <span class="model-badge">
                              {result.metadata.embedding_model || "unknown"}
                            </span>
                            <span class="source-badge">
                              {result.metadata.document_source ||
                                "Unknown source"}
                            </span>
                          </div>
                          <span class="similarity-score">
                            {(result.similarity_score * 100).toFixed(1)}%
                          </span>
                        </div>

                        <p class="result-text">{result.text}</p>

                        <div class="result-meta">
                          <span>Chunk ID: {result.chunk_id}</span>
                          <span>•</span>
                          <span>{result.metadata.chunk_length || 0} chars</span>
                        </div>
                      </div>
                    </Card>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </TabPanel>

        {/* Documents Tab */}
        <TabPanel tabId="documents" activeTab={activeTab()}>
          <div class="documents-tab-content">
            <Card variant="elevated" padding="lg">
              <div class="documents-header">
                <h3>Documents</h3>
                <Button variant="secondary" size="sm" onClick={loadDocuments}>
                  Refresh
                </Button>
              </div>

              <div class="documents-list">
                <For each={documents}>
                  {(doc) => (
                    <Card variant="outlined" padding="md">
                      <div class="document-item">
                        <div class="document-info">
                          <h4>{doc.title}</h4>
                          <div class="document-meta">
                            <span class="type-badge">{doc.document_type}</span>
                            <span>{doc.chunk_count} chunks</span>
                            <span>•</span>
                            <span>{doc.source}</span>
                          </div>
                        </div>
                        <div class="document-actions">
                          <Button variant="ghost" size="sm" iconOnly>
                            {getIcon("eye")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            onClick={() => deleteDocument(doc.id)}
                          >
                            {getIcon("delete")}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </For>
              </div>
            </Card>
          </div>
        </TabPanel>

        {/* Upload Tab */}
        <TabPanel tabId="upload" activeTab={activeTab()}>
          <div class="upload-tab-content">
            <Card variant="elevated" padding="lg">
              <h3>Upload Documents</h3>

              <div class="upload-area">
                <input
                  type="file"
                  id="file-upload"
                  accept=".txt,.md,.py,.js,.ts,.json,.yaml,.yml,.html"
                  onChange={handleFileSelect}
                  disabled={isUploading()}
                  class="hidden"
                />
                <label for="file-upload" class="upload-label">
                  <div class="upload-icon">{getIcon("upload")}</div>
                  <span>Click to upload or drag and drop</span>
                  <small>
                    Supports: .txt, .md, .py, .js, .ts, .json, .yaml, .html
                  </small>
                </label>
              </div>

              <Show when={isUploading()}>
                <div class="upload-progress">
                  <div class="upload-progress-bar">
                    <div
                      class="upload-progress-fill"
                      style={`--progress-width: ${uploadProgress()}%`}
                    />
                  </div>
                  <p>Uploading and processing document...</p>
                </div>
              </Show>
            </Card>
          </div>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel tabId="settings" activeTab={activeTab()}>
          <div class="settings-tab-content">
            <Card variant="elevated" padding="lg">
              <h3>Search Settings</h3>

              <div class="settings-form">
                <div class="setting-group">
                  <label>Embedding Model</label>
                  <Select
                    value={embeddingModel()}
                    onChange={(e) => setEmbeddingModel(e.currentTarget.value)}
                    options={[
                      {
                        value: "embeddinggemma:latest",
                        label: "EmbeddingGemma (Latest)",
                      },
                      {
                        value: "embeddinggemma:300m",
                        label: "EmbeddingGemma (300M)",
                      },
                      {
                        value: "mxbai-embed-large",
                        label: "MXBAI Embed Large",
                      },
                      { value: "nomic-embed-text", label: "Nomic Embed Text" },
                      { value: "all-minilm", label: "All-MiniLM" },
                    ]}
                    fullWidth
                  />
                </div>

                <div class="setting-group">
                  <label>Max Results: {maxResults()}</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={maxResults()}
                    onInput={(e) =>
                      setMaxResults(parseInt(e.currentTarget.value))
                    }
                    class="range-slider"
                    title="Maximum number of search results"
                    aria-label="Maximum number of search results"
                  />
                </div>

                <div class="setting-group">
                  <label>
                    Similarity Threshold:{" "}
                    {(similarityThreshold() * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={similarityThreshold()}
                    onInput={(e) =>
                      setSimilarityThreshold(parseFloat(e.currentTarget.value))
                    }
                    class="range-slider"
                    title="Similarity threshold for search results"
                    aria-label="Similarity threshold for search results"
                  />
                </div>

                <div class="setting-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      checked={enableReranking()}
                      onChange={(e) =>
                        setEnableReranking(e.currentTarget.checked)
                      }
                    />
                    Enable Reranking
                  </label>
                </div>
              </div>
            </Card>

            <Show when={currentStats()}>
              <Card variant="elevated" padding="lg">
                <h3>System Statistics</h3>

                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-label">Total Documents</div>
                    <div class="stat-value">
                      {currentStats()!.total_documents}
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-label">Total Chunks</div>
                    <div class="stat-value">{currentStats()!.total_chunks}</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-label">Embedding Coverage</div>
                    <div class="stat-value">
                      {(currentStats()!.embedding_coverage * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-label">Default Model</div>
                    <div class="stat-model">
                      {currentStats()!.default_model}
                    </div>
                  </div>
                </div>
              </Card>
            </Show>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
