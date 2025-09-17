/**
 * RAG Settings Component
 * Configuration for Retrieval-Augmented Generation system
 */

import { Component, Show, createSignal, createEffect } from "solid-js";
import { Button, TextField, Select } from "reynard-components";
import { Toggle } from "./Toggle";
import { Button } from "./Button";
import { useSettings } from "../composables/useSettings";
import type { SettingDefinition } from "../types";

export interface RAGSettingsProps {
  /** Settings instance */
  settings?: ReturnType<typeof useSettings>;
  /** Custom class name */
  class?: string;
}

export const RAGSettings: Component<RAGSettingsProps> = props => {
  const settings = props.settings || useSettings();
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);

  // RAG configuration state
  const [ragEnabled, setRagEnabled] = createSignal(false);
  const [databaseUrl, setDatabaseUrl] = createSignal("");
  const [embeddingModel, setEmbeddingModel] = createSignal("nomic-embed-text");
  const [chunkSize, setChunkSize] = createSignal(1000);
  const [chunkOverlap, setChunkOverlap] = createSignal(200);
  const [topK, setTopK] = createSignal(10);
  const [similarityThreshold, setSimilarityThreshold] = createSignal(0.7);
  const [enableStreaming, setEnableStreaming] = createSignal(true);
  const [enableCaching, setEnableCaching] = createSignal(true);
  const [cacheSize, setCacheSize] = createSignal(1000);

  // Load settings on mount
  createEffect(() => {
    loadRAGSettings();
  });

  const loadRAGSettings = async () => {
    setIsLoading(true);
    try {
      // Load RAG settings from the settings system
      setRagEnabled(settings.getSetting("rag.enabled") || false);
      setDatabaseUrl(settings.getSetting("rag.database_url") || "");
      setEmbeddingModel(settings.getSetting("rag.embedding_model") || "nomic-embed-text");
      setChunkSize(settings.getSetting("rag.chunk_size") || 1000);
      setChunkOverlap(settings.getSetting("rag.chunk_overlap") || 200);
      setTopK(settings.getSetting("rag.top_k") || 10);
      setSimilarityThreshold(settings.getSetting("rag.similarity_threshold") || 0.7);
      setEnableStreaming(settings.getSetting("rag.enable_streaming") || true);
      setEnableCaching(settings.getSetting("rag.enable_caching") || true);
      setCacheSize(settings.getSetting("rag.cache_size") || 1000);
    } catch (error) {
      console.error("Failed to load RAG settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRAGSettings = async () => {
    setIsSaving(true);
    try {
      await settings.setSetting("rag.enabled", ragEnabled());
      await settings.setSetting("rag.database_url", databaseUrl());
      await settings.setSetting("rag.embedding_model", embeddingModel());
      await settings.setSetting("rag.chunk_size", chunkSize());
      await settings.setSetting("rag.chunk_overlap", chunkOverlap());
      await settings.setSetting("rag.top_k", topK());
      await settings.setSetting("rag.similarity_threshold", similarityThreshold());
      await settings.setSetting("rag.enable_streaming", enableStreaming());
      await settings.setSetting("rag.enable_caching", enableCaching());
      await settings.setSetting("rag.cache_size", cacheSize());

      await settings.saveSettings();
    } catch (error) {
      console.error("Failed to save RAG settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    // TODO: Implement connection testing
    console.log("Testing RAG database connection...");
  };

  const embeddingModels = [
    { value: "nomic-embed-text", label: "Nomic Embed Text" },
    { value: "all-MiniLM-L6-v2", label: "All-MiniLM-L6-v2" },
    { value: "all-mpnet-base-v2", label: "All-MPNet-Base-v2" },
    {
      value: "sentence-transformers/all-MiniLM-L12-v2",
      label: "MiniLM-L12-v2",
    },
  ];

  return (
    <div class={`rag-settings ${props.class || ""}`}>
      <div class="settings-section">
        <h3>RAG System Configuration</h3>
        <p class="settings-description">
          Configure Retrieval-Augmented Generation settings for document search and processing.
        </p>

        <Show when={isLoading()}>
          <div class="loading-state">Loading RAG configuration...</div>
        </Show>

        <Show when={!isLoading()}>
          {/* Core RAG Settings */}
          <div class="setting-group">
            <h4>Core Settings</h4>
            <p class="setting-description">Basic RAG functionality and database configuration.</p>

            <div class="setting-row">
              <Button
                checked={ragEnabled()}
                onChange={setRagEnabled}
                label="Enable RAG"
                helperText="Enable RAG functionality for document search and processing"
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Database Connection String"
                value={databaseUrl()}
                onChange={setDatabaseUrl}
                placeholder="postgresql://user:pass@host:5432/dbname"
                helperText="PostgreSQL connection string for vector database"
              />
            </div>

            <div class="setting-row">
              <Button variant="secondary" onClick={testConnection} disabled={!databaseUrl()}>
                Test Connection
              </Button>
            </div>
          </div>

          {/* Embedding Configuration */}
          <div class="setting-group">
            <h4>Embedding Configuration</h4>
            <p class="setting-description">Configure embedding models and processing parameters.</p>

            <div class="setting-row">
              <Select
                label="Embedding Model"
                value={embeddingModel()}
                onChange={setEmbeddingModel}
                options={embeddingModels}
                helperText="Select the embedding model for text vectorization"
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Chunk Size"
                type="number"
                value={chunkSize()}
                onChange={e => setChunkSize(parseInt(e.target.value) || 1000)}
                helperText="Maximum number of characters per document chunk"
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Chunk Overlap"
                type="number"
                value={chunkOverlap()}
                onChange={e => setChunkOverlap(parseInt(e.target.value) || 200)}
                helperText="Number of characters to overlap between chunks"
              />
            </div>
          </div>

          {/* Search Configuration */}
          <div class="setting-group">
            <h4>Search Configuration</h4>
            <p class="setting-description">Configure search parameters and result filtering.</p>

            <div class="setting-row">
              <TextField
                label="Top K Results"
                type="number"
                value={topK()}
                onChange={e => setTopK(parseInt(e.target.value) || 10)}
                helperText="Maximum number of results to return per search"
              />
            </div>

            <div class="setting-row">
              <TextField
                label="Similarity Threshold"
                type="number"
                step="0.1"
                value={similarityThreshold()}
                onChange={value => setSimilarityThreshold(parseFloat(value) || 0.7)}
                helperText="Minimum similarity score for search results (0.0 - 1.0)"
              />
            </div>
          </div>

          {/* Performance Settings */}
          <div class="setting-group">
            <h4>Performance Settings</h4>
            <p class="setting-description">Configure performance optimization and caching.</p>

            <div class="setting-row">
              <Button
                checked={enableStreaming()}
                onChange={setEnableStreaming}
                label="Enable Streaming"
                helperText="Enable streaming responses for better performance"
              />
            </div>

            <div class="setting-row">
              <Button
                checked={enableCaching()}
                onChange={setEnableCaching}
                label="Enable Caching"
                helperText="Cache embedding results for faster subsequent searches"
              />
            </div>

            <Show when={enableCaching()}>
              <div class="setting-row">
                <TextField
                  label="Cache Size"
                  type="number"
                  value={cacheSize()}
                  onChange={e => setCacheSize(parseInt(e.target.value) || 1000)}
                  helperText="Maximum number of items to cache"
                />
              </div>
            </Show>
          </div>

          {/* Actions */}
          <div class="settings-actions">
            <Button variant="primary" onClick={saveRAGSettings} loading={isSaving()} disabled={isSaving()}>
              Save RAG Settings
            </Button>
          </div>
        </Show>
      </div>
    </div>
  );
};
