/**
 * RAG Demo App - Reynard Framework Example
 * Demonstrates RAG system with EmbeddingGemma integration
 */

import { Component, createSignal, onMount, Show } from "solid-js";
import { ReynardProvider, useTheme } from "reynard-themes";
import "reynard-themes/themes.css";
import { Button, Card } from "reynard-components";
import { RAGSearch } from "reynard-rag";
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";
import "./styles.css";

// Helper function to get icon as JSX element
const getIcon = (name: string) => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    return <div innerHTML={icon} />;
  }
  return null;
};

// Types
interface RAGResult {
  chunk_id: string;
  document_id: string;
  text: string;
  similarity_score: number;
  rank: number;
  metadata: Record<string, any>;
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

interface _RAGStats {
  total_documents: number;
  total_chunks: number;
  chunks_with_embeddings: number;
  embedding_coverage: number;
  default_model: string;
  vector_db_enabled: boolean;
  codewolf_enabled: boolean;
  cache_size: number;
}

const RAGDemoApp: Component = () => {
  const [selectedResult, setSelectedResult] = createSignal<RAGResult | null>(null);
  const [apiStatus, setApiStatus] = createSignal<'checking' | 'connected' | 'error'>('checking');
  const [apiError, setApiError] = createSignal<string | null>(null);
  const { theme: _theme } = useTheme();

  // Check API connection on mount
  onMount(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/rag/health');
      if (response.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('error');
        setApiError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setApiStatus('error');
      setApiError(err instanceof Error ? err.message : 'Connection failed');
    }
  });

  const handleResultClick = (result: RAGResult) => {
    setSelectedResult(result);
  };

  const handleDocumentUpload = (document: RAGDocument) => {
    console.log('Document uploaded:', document);
  };

  const getStatusColor = () => {
    switch (apiStatus()) {
      case 'connected': return 'status-connected';
      case 'error': return 'status-error';
      default: return 'status-checking';
    }
  };

  const getStatusText = () => {
    switch (apiStatus()) {
      case 'connected': return 'Connected';
      case 'error': return 'Connection Error';
      default: return 'Checking...';
    }
  };


  return (
    <div class="rag-demo-app">
      {/* Header */}
      <header class="app-header">
        <div class="header-content">
          <div class="header-title">
            <div class="header-icon">{getIcon('server')}</div>
            <h1>RAG Demo</h1>
          </div>
          <p class="header-subtitle">
            Retrieval-Augmented Generation with EmbeddingGemma
          </p>
          
          {/* API Status */}
          <div class="api-status">
            <div class={`status-indicator ${getStatusColor()}`} />
            <span class={`status-text ${getStatusColor()}`}>
              API: {getStatusText()}
            </span>
          </div>

          <Show when={apiStatus() === 'error'}>
            <div class="error-alert">
              <strong>API Connection Failed:</strong> {apiError()}
              <br />
              Make sure the PawPrint RAG API is running on port 8000.
            </div>
          </Show>
        </div>
      </header>

      {/* Features */}
      <section class="features-section">
        <div class="features-grid">
          <Card variant="elevated" padding="lg" class="feature-card">
            <div class="feature-content">
              <div class="feature-icon brain-icon">{getIcon('server')}</div>
              <h3>EmbeddingGemma</h3>
              <p>Google's 300M parameter embedding model for state-of-the-art semantic search</p>
            </div>
          </Card>
          
          <Card variant="elevated" padding="lg" class="feature-card">
            <div class="feature-content">
              <div class="feature-icon database-icon">{getIcon('server')}</div>
              <h3>Vector Database</h3>
              <p>Integrated with PawPrint's existing vector storage and similarity search</p>
            </div>
          </Card>
          
          <Card variant="elevated" padding="lg" class="feature-card">
            <div class="feature-content">
              <div class="feature-icon code-icon">{getIcon('server')}</div>
              <h3>CodeWolf Integration</h3>
              <p>Enhanced code understanding with semantic code search and analysis</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <main class="main-content">
        <div class="content-grid">
          {/* RAG Search Interface */}
          <div class="search-section">
            <RAGSearch
              apiBaseUrl="http://localhost:8000"
              defaultModel="embeddinggemma:latest"
              maxResults={10}
              similarityThreshold={0.7}
              enableReranking={true}
              onResultClick={handleResultClick}
              onDocumentUpload={handleDocumentUpload}
              className="rag-search-container"
            />
          </div>

          {/* Sidebar */}
          <aside class="sidebar">
            {/* Selected Result Details */}
            <Show when={selectedResult()}>
              <Card variant="elevated" padding="lg" class="result-details-card">
                <div class="card-header">
                  <div class="card-icon">{getIcon('box')}</div>
                  <h3>Result Details</h3>
                </div>
                
                <div class="result-details">
                  <div class="detail-item">
                    <div class="detail-label">Similarity Score</div>
                    <div class="similarity-badge">
                      {(selectedResult()!.similarity_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">Rank</div>
                    <div class="rank-value">#{selectedResult()!.rank}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">Document Source</div>
                    <div class="source-code">
                      {selectedResult()!.metadata.document_source || 'Unknown'}
                    </div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">Chunk ID</div>
                    <div class="chunk-id">
                      {selectedResult()!.chunk_id}
                    </div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">Embedding Model</div>
                    <div class="model-name">{selectedResult()!.metadata.embedding_model || 'Unknown'}</div>
                  </div>
                </div>
              </Card>
            </Show>

            {/* Quick Actions */}
            <Card variant="elevated" padding="lg" class="actions-card">
              <div class="card-header">
                <div class="card-icon">{getIcon('refresh')}</div>
                <h3>Quick Actions</h3>
              </div>
              
              <div class="actions-list">
                <Button 
                  variant="secondary" 
                  fullWidth
                  leftIcon={getIcon('open')}
                  onClick={() => window.open('http://localhost:8000/docs', '_blank')}
                >
                  API Documentation
                </Button>
                
                <Button 
                  variant="secondary" 
                  fullWidth
                  leftIcon={getIcon('settings')}
                  onClick={() => window.open('http://localhost:8000/api/rag/health', '_blank')}
                >
                  Health Check
                </Button>
                
                <Button 
                  variant="secondary" 
                  fullWidth
                  leftIcon={getIcon('open')}
                  onClick={() => window.open('https://github.com/ollama/ollama', '_blank')}
                >
                  Ollama Setup
                </Button>
              </div>
            </Card>

            {/* Getting Started */}
            <Card variant="elevated" padding="lg" class="getting-started-card">
              <div class="card-header">
                <h3>Getting Started</h3>
              </div>
              
              <div class="steps-list">
                <div class="step-item">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <div class="step-title">Install Ollama</div>
                    <div class="step-description">Download from ollama.ai</div>
                  </div>
                </div>
                
                <div class="step-item">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <div class="step-title">Pull EmbeddingGemma</div>
                    <div class="step-description">Run: ollama pull embeddinggemma:latest</div>
                  </div>
                </div>
                
                <div class="step-item">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <div class="step-title">Start API</div>
                    <div class="step-description">Run the PawPrint RAG API</div>
                  </div>
                </div>
                
                <div class="step-item">
                  <div class="step-number">4</div>
                  <div class="step-content">
                    <div class="step-title">Upload & Search</div>
                    <div class="step-description">Upload documents and start searching!</div>
                  </div>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer class="app-footer">
        <p>
          Built with <span class="heart">♥</span> using Reynard, SolidJS, and EmbeddingGemma
        </p>
      </footer>
    </div>
  );
};

const App: Component = () => {
  return (
    <ReynardProvider>
      <RAGDemoApp />
    </ReynardProvider>
  );
};

export default App;
