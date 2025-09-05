/**
 * RAG Search Component
 *
 * A comprehensive search interface for RAG (Retrieval-Augmented Generation) systems
 * with EmbeddingGemma integration.
 */

import { createSignal, createEffect, onMount, Show, For } from "solid-js";
import { createStore } from "solid-js/store";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Spinner } from "../ui/Spinner";
import { Alert } from "../ui/Alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { Slider } from "../ui/Slider";
import { Switch } from "../ui/Switch";
import { Label } from "../ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { FileUpload } from "../ui/FileUpload";
import { Progress } from "../ui/Progress";
import { Separator } from "../ui/Separator";
import {
  Search,
  Upload,
  FileText,
  Code,
  Database,
  Settings,
  Download,
  Trash2,
  Eye,
  Clock,
  Zap,
  Brain,
} from "lucide-solid";

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

  // Computed values
  const hasResults = () => results().length > 0;
  const currentStats = () => stats();

  return (
    <div class={`rag-search ${props.className || ""}`}>
      <Tabs value={activeTab()} onValueChange={setActiveTab}>
        <TabsList class="grid w-full grid-cols-4">
          <TabsTrigger value="search" class="flex items-center gap-2">
            <Search class="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="documents" class="flex items-center gap-2">
            <FileText class="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="upload" class="flex items-center gap-2">
            <Upload class="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="settings" class="flex items-center gap-2">
            <Settings class="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" class="space-y-4">
          <Card class="p-6">
            <div class="space-y-4">
              <div class="flex gap-2">
                <Input
                  value={query()}
                  onInput={(e) => setQuery(e.currentTarget.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question or search for information..."
                  class="flex-1"
                  disabled={isSearching()}
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching() || !query().trim()}
                  class="px-6"
                >
                  {isSearching() ? (
                    <Spinner class="h-4 w-4" />
                  ) : (
                    <Search class="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Show when={error()}>
                <Alert variant="destructive">{error()}</Alert>
              </Show>

              <Show when={queryResponse()}>
                <div class="flex items-center gap-4 text-sm text-muted-foreground">
                  <div class="flex items-center gap-1">
                    <Clock class="h-4 w-4" />
                    Query: {queryResponse()!.query_time.toFixed(2)}ms
                  </div>
                  <div class="flex items-center gap-1">
                    <Brain class="h-4 w-4" />
                    Embedding: {queryResponse()!.embedding_time.toFixed(2)}ms
                  </div>
                  <div class="flex items-center gap-1">
                    <Zap class="h-4 w-4" />
                    Search: {queryResponse()!.search_time.toFixed(2)}ms
                  </div>
                  <div class="flex items-center gap-1">
                    <Database class="h-4 w-4" />
                    {queryResponse()!.total_results} results
                  </div>
                </div>
              </Show>
            </div>
          </Card>

          <Show when={hasResults()}>
            <div class="space-y-3">
              <For each={results()}>
                {(result, index) => (
                  <Card
                    class="p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleResultClick(result)}
                  >
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <Badge variant="secondary">#{result.rank}</Badge>
                          <Badge variant="outline">
                            {result.metadata.embedding_model || "unknown"}
                          </Badge>
                          <span class="text-sm text-muted-foreground">
                            {result.metadata.document_source ||
                              "Unknown source"}
                          </span>
                        </div>
                        <Badge variant="default">
                          {(result.similarity_score * 100).toFixed(1)}%
                        </Badge>
                      </div>

                      <p class="text-sm leading-relaxed">{result.text}</p>

                      <div class="flex items-center gap-2 text-xs text-muted-foreground">
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
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" class="space-y-4">
          <Card class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">Documents</h3>
              <Button variant="outline" size="sm" onClick={loadDocuments}>
                Refresh
              </Button>
            </div>

            <div class="space-y-3">
              <For each={documents}>
                {(doc) => (
                  <Card class="p-4">
                    <div class="flex items-center justify-between">
                      <div class="space-y-1">
                        <h4 class="font-medium">{doc.title}</h4>
                        <div class="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{doc.document_type}</Badge>
                          <span>{doc.chunk_count} chunks</span>
                          <span>•</span>
                          <span>{doc.source}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye class="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDocument(doc.id)}
                        >
                          <Trash2 class="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </For>
            </div>
          </Card>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" class="space-y-4">
          <Card class="p-6">
            <h3 class="text-lg font-semibold mb-4">Upload Documents</h3>

            <FileUpload
              onFileSelect={uploadFile}
              accept=".txt,.md,.py,.js,.ts,.json,.yaml,.yml,.html"
              disabled={isUploading()}
            />

            <Show when={isUploading()}>
              <div class="mt-4">
                <Progress value={uploadProgress()} />
                <p class="text-sm text-muted-foreground mt-2">
                  Uploading and processing document...
                </p>
              </div>
            </Show>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" class="space-y-4">
          <Card class="p-6">
            <h3 class="text-lg font-semibold mb-4">Search Settings</h3>

            <div class="space-y-6">
              <div class="space-y-2">
                <Label>Embedding Model</Label>
                <Select
                  value={embeddingModel()}
                  onValueChange={setEmbeddingModel}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="embeddinggemma:latest">
                      EmbeddingGemma (Latest)
                    </SelectItem>
                    <SelectItem value="embeddinggemma:300m">
                      EmbeddingGemma (300M)
                    </SelectItem>
                    <SelectItem value="mxbai-embed-large">
                      MXBAI Embed Large
                    </SelectItem>
                    <SelectItem value="nomic-embed-text">
                      Nomic Embed Text
                    </SelectItem>
                    <SelectItem value="all-minilm">All-MiniLM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label>Max Results: {maxResults()}</Label>
                <Slider
                  value={[maxResults()]}
                  onValueChange={(value) => setMaxResults(value[0])}
                  min={1}
                  max={50}
                  step={1}
                />
              </div>

              <div class="space-y-2">
                <Label>
                  Similarity Threshold:{" "}
                  {(similarityThreshold() * 100).toFixed(0)}%
                </Label>
                <Slider
                  value={[similarityThreshold()]}
                  onValueChange={(value) => setSimilarityThreshold(value[0])}
                  min={0.1}
                  max={1.0}
                  step={0.05}
                />
              </div>

              <div class="flex items-center space-x-2">
                <Switch
                  checked={enableReranking()}
                  onCheckedChange={setEnableReranking}
                />
                <Label>Enable Reranking</Label>
              </div>
            </div>
          </Card>

          <Show when={currentStats()}>
            <Card class="p-6">
              <h3 class="text-lg font-semibold mb-4">System Statistics</h3>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div class="text-sm text-muted-foreground">
                    Total Documents
                  </div>
                  <div class="text-2xl font-bold">
                    {currentStats()!.total_documents}
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="text-sm text-muted-foreground">Total Chunks</div>
                  <div class="text-2xl font-bold">
                    {currentStats()!.total_chunks}
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="text-sm text-muted-foreground">
                    Embedding Coverage
                  </div>
                  <div class="text-2xl font-bold">
                    {(currentStats()!.embedding_coverage * 100).toFixed(1)}%
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="text-sm text-muted-foreground">Default Model</div>
                  <div class="text-sm font-mono">
                    {currentStats()!.default_model}
                  </div>
                </div>
              </div>
            </Card>
          </Show>
        </TabsContent>
      </Tabs>
    </div>
  );
}
