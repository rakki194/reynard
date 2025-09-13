# RAG Backend Implementation Guide

_Comprehensive Retrieval-Augmented Generation system for Reynard with PostgreSQL + pgvector integration_

## Overview

The Reynard RAG backend provides a complete retrieval-augmented generation system built on PostgreSQL with
pgvector extensions. The system supports multi-modal embeddings (text, code, captions, images),
streaming document ingestion, and sophisticated vector similarity search with HNSW indexing for optimal performance.

## Architecture

### Service Layer Architecture

The RAG system is built on a modular service architecture with clear separation of concerns:

```
backend/app/services/rag/
├── vector_db_service.py      # PostgreSQL + pgvector management
├── embedding_service.py      # Ollama embedding generation
└── indexing_service.py       # Document ingestion orchestration
```

### API Layer Structure

The API layer provides a clean REST interface with comprehensive endpoint coverage:

```
backend/app/api/rag/
├── router.py                 # Main router combining all endpoints
├── endpoints.py              # Core search endpoints
├── ingest.py                 # Document ingestion endpoints
├── admin.py                  # Administrative endpoints
├── models.py                 # Pydantic request/response models
└── service.py                # Business logic orchestration
```

### Database Schema

The system uses a sophisticated PostgreSQL schema with pgvector extensions:

#### Core Tables

- **`rag_documents`**: Source documents with metadata
- **`rag_document_chunks`**: Text chunks with token counts
- **`rag_document_embeddings`**: Text embeddings (1024 dimensions)
- **`rag_code_embeddings`**: Code-specific embeddings
- **`rag_caption_embeddings`**: Caption embeddings
- **`rag_image_embeddings`**: CLIP image embeddings (768 dimensions)

#### Vector Indexes

HNSW (Hierarchical Navigable Small World) indexes provide efficient vector similarity search:

```sql
-- Document embeddings with cosine distance
CREATE INDEX idx_document_embeddings_hnsw
ON rag_document_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m=16, ef_construction=200);
```

## API Endpoints

See [Shared API Patterns](./shared/api-patterns.md) for common request/response structures and error handling.

### Core Search Operations

#### `POST /api/rag/query`

Perform semantic search with advanced filtering options.

**Request Model:**

```typescript
interface RAGQueryRequest {
  q: string; // Search query
  modality?: string; // Search modality (docs, code, captions, images)
  top_k?: number; // Number of results (default: 20)
  similarity_threshold?: number; // Minimum similarity score (default: 0.0)
  enable_reranking?: boolean; // Enable result reranking (default: false)
}
```

**Response Model:**

```typescript
interface RAGQueryResponse {
  hits: RAGQueryHit[]; // Search results
  total: number; // Total number of results
  query_time?: number; // Query processing time (seconds)
  embedding_time?: number; // Embedding generation time (seconds)
  search_time?: number; // Vector search time (seconds)
  metadata?: Record<string, any>; // Additional metadata
}
```

### Document Ingestion

#### `POST /api/rag/ingest`

Ingest documents with batch processing and progress tracking.

**Request Model:**

```typescript
interface RAGIngestRequest {
  items: RAGIngestItem[]; // Documents to ingest
  model?: string; // Embedding model to use
  batch_size?: number; // Batch size for processing (default: 16)
  force_reindex?: boolean; // Force reindexing of existing documents
}
```

#### `POST /api/rag/ingest/stream`

Stream document ingestion with real-time progress updates.

### Administrative Operations

Standard admin endpoints following [Shared API Patterns](./shared/api-patterns.md):

- `GET /api/rag/admin/stats` - System statistics
- `GET /api/rag/admin/indexing-status` - Indexing queue status
- `POST /api/rag/admin/rebuild-index` - Rebuild vector indexes
- `POST /api/rag/admin/clear-cache` - Clear system caches

## Configuration

### Environment Variables

The system supports comprehensive configuration through environment variables:

```bash
# Core Configuration
RAG_ENABLED=true
PG_DSN=postgresql://user:password@localhost:5432/reynard_rag
OLLAMA_BASE_URL=http://localhost:11434

# Model Configuration
RAG_TEXT_MODEL=mxbai-embed-large
RAG_CODE_MODEL=bge-m3
RAG_CAPTION_MODEL=nomic-embed-text
RAG_CLIP_MODEL=ViT-L-14/openai

# Performance Tuning
RAG_CHUNK_MAX_TOKENS=512
RAG_CHUNK_MIN_TOKENS=100
RAG_CHUNK_OVERLAP_RATIO=0.15
RAG_INGEST_BATCH_SIZE_TEXT=16
RAG_INGEST_CONCURRENCY=2

# Rate Limiting
RAG_QUERY_RATE_LIMIT_PER_MINUTE=60
RAG_INGEST_RATE_LIMIT_PER_MINUTE=10
```

### Model Registry

The system maintains a comprehensive model registry with dimension and performance characteristics:

```python
_model_registry = {
    "mxbai-embed-large": {"dim": 1024, "metric": "cosine", "max_tokens": 512},
    "nomic-embed-text": {"dim": 768, "metric": "cosine", "max_tokens": 512},
    "bge-m3": {"dim": 1024, "metric": "cosine", "max_tokens": 512},
    "bge-large-en-v1.5": {"dim": 1024, "metric": "cosine", "max_tokens": 512},
    "bge-base-en-v1.5": {"dim": 768, "metric": "cosine", "max_tokens": 512},
    "bge-small-en-v1.5": {"dim": 384, "metric": "cosine", "max_tokens": 512},
    "all-MiniLM-L6-v2": {"dim": 384, "metric": "cosine", "max_tokens": 256},
    "all-mpnet-base-v2": {"dim": 768, "metric": "cosine", "max_tokens": 384},
}
```

## Service Implementation Details

### VectorDBService

The `VectorDBService` manages PostgreSQL connections and vector operations:

**Key Features:**

- Connection pooling with health monitoring
- Automatic migration execution
- Vector similarity search with cosine distance
- Comprehensive error handling and reconnection logic

**Core Methods:**

```python
async def similar_document_chunks(
    self, embedding: Sequence[float], top_k: int = 20
) -> List[Dict[str, Any]]:
    """Vector similarity search with HNSW indexing"""

async def insert_document_embeddings(
    self, embeddings: Sequence[Dict[str, Any]]
) -> int:
    """Batch insert embeddings with transaction safety"""
```

### EmbeddingService

The `EmbeddingService` provides Ollama integration for embedding generation:

**Key Features:**

- Batch embedding generation with caching
- Model registry with dimension validation
- Connection health monitoring
- Fallback mechanisms for service unavailability

**Core Methods:**

```python
async def embed_text(
    self, text: str, model: str = "mxbai-embed-large"
) -> List[float]:
    """Generate embedding for single text with caching"""

async def embed_batch(
    self, texts: List[str], model: str = "mxbai-embed-large"
) -> List[List[float]]:
    """Batch embedding generation with performance optimization"""
```

### EmbeddingIndexService

The `EmbeddingIndexService` orchestrates document ingestion with advanced queue management:

**Key Features:**

- Asynchronous queue processing with worker pools
- Exponential backoff retry logic
- Dead letter queue for failed items
- Real-time metrics and monitoring
- Pause/resume functionality

**Core Methods:**

```python
async def ingest_documents(
    self, items: List[Dict[str, Any]], model: Optional[str] = None
) -> AsyncGenerator[Dict[str, Any], None]:
    """Stream document ingestion with progress tracking"""

async def get_stats(self) -> Dict[str, Any]:
    """Comprehensive service statistics and health metrics"""
```

## Installation and Setup

See [Shared Installation Guides](./shared/installation-guides.md) for detailed setup instructions.

### Prerequisites

1. **PostgreSQL with pgvector** - See shared installation guide
2. **Ollama** - See shared installation guide for embedding generation
3. **Python environment** - See shared installation guide

### Database Setup

1. **Create database**:

   ```sql
   CREATE DATABASE reynard_rag;
   ```

2. **Run migrations**:
   The system automatically runs migrations on startup:
   - `001_pgvector.sql` - Enable pgvector extension
   - `002_embeddings.sql` - Create RAG tables and indexes
   - `003_indexes.sql` - Create HNSW vector indexes

### Configuration

See [Shared Configuration Examples](./shared/configuration-examples.md) for environment setup.

**Key environment variables:**

```env
PG_DSN=postgresql://username:password@localhost:5432/reynard_rag
OLLAMA_BASE_URL=http://localhost:11434
RAG_ENABLED=true
```

### Running the Backend

```bash
# Start the FastAPI server
python main.py

# The RAG API will be available at:
# http://localhost:8000/api/rag/
```

## Frontend Integration

The RAG backend integrates seamlessly with the existing Reynard RAG frontend package:

```typescript
import { useRAG } from "reynard-rag";

const rag = useRAG({
  authFetch: myAuthFetch,
  queryUrl: "/api/rag/query",
  ingestUrl: "/api/rag/ingest",
  adminUrl: "/api/rag/admin",
});

// Perform semantic search
const results = await rag.query({
  q: "machine learning algorithms",
  modality: "docs",
  top_k: 10,
  similarity_threshold: 0.7,
});

// Ingest documents with streaming progress
await rag.ingestDocuments(
  [{ source: "doc1.txt", content: "document content" }],
  {
    model: "mxbai-embed-large",
    batch_size: 16,
    force_reindex: false,
  },
);
```

## Performance Considerations

### Vector Search Optimization

- **HNSW Indexes**: Optimized for high-dimensional vector similarity search
- **Batch Processing**: Efficient batch embedding generation and insertion
- **Connection Pooling**: SQLAlchemy connection pooling for database efficiency
- **Caching**: In-memory caching for embedding results and model metadata

### Scalability Features

- **Asynchronous Processing**: Non-blocking document ingestion with worker pools
- **Queue Management**: Configurable concurrency limits and retry policies
- **Rate Limiting**: Built-in rate limiting to prevent system overload
- **Health Monitoring**: Comprehensive health checks and metrics collection

### Memory Management

- **Chunking Strategy**: Configurable chunk sizes with overlap ratios
- **Batch Sizes**: Optimized batch sizes for different content types
- **Cache Management**: Intelligent caching with size limits and TTL

## Security and Error Handling

### Input Validation

- **Pydantic Models**: Comprehensive request/response validation
- **SQL Injection Protection**: Parameterized queries with SQLAlchemy
- **Rate Limiting**: Per-endpoint rate limiting with configurable thresholds

### Error Handling

- **Graceful Degradation**: Fallback to mock data when external services unavailable
- **Retry Logic**: Exponential backoff with configurable retry limits
- **Dead Letter Queue**: Failed items moved to dead letter for manual review
- **Health Checks**: Regular health checks for all service dependencies

### Authentication Integration

- **JWT Integration**: Seamless integration with existing JWT authentication
- **Protected Endpoints**: Administrative endpoints require authentication
- **User Context**: User-specific rate limiting and access controls

## Monitoring and Observability

### Metrics Available

- **Query Performance**: Latency, throughput, and success rates
- **Embedding Statistics**: Generation times, cache hit rates, model usage
- **Indexing Metrics**: Queue depth, processing rates, failure counts
- **System Health**: Service availability, connection status, error rates

### Health Endpoints

- `/api/rag/admin/stats` - Comprehensive system statistics
- `/api/rag/admin/indexing-status` - Real-time queue and processing status
- Individual service health checks with detailed diagnostics

### Logging

- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Performance Logging**: Detailed timing information for optimization
- **Error Tracking**: Comprehensive error logging with stack traces
- **Audit Logging**: Security-relevant operations and access patterns

## Testing

### Unit Testing

```bash
# Test RAG service functionality
python test_rag_api.py

# Test with mock data (no external dependencies)
python -c "
import asyncio
from app.api.rag.service import get_rag_service

async def test():
    service = get_rag_service()
    await service.initialize()
    result = await service.query('test query')
    print(f'Query result: {len(result[\"hits\"])} hits')

asyncio.run(test())
"
```

### API Testing

```bash
# Test search endpoint
curl -X POST "http://localhost:8000/api/rag/query" \
  -H "Content-Type: application/json" \
  -d '{"q": "test query", "top_k": 5}'

# Test ingestion endpoint
curl -X POST "http://localhost:8000/api/rag/ingest" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"source": "test.txt", "content": "test content"}]}'

# Test stats endpoint
curl -X GET "http://localhost:8000/api/rag/admin/stats"
```

## Troubleshooting

### Common Issues

#### Issue: Database Connection Failures

**Symptoms**: Service initialization fails with connection errors
**Causes**: Incorrect DSN, PostgreSQL not running, pgvector not installed
**Solutions**:

1. Verify PostgreSQL is running: `systemctl status postgresql`
2. Check pgvector installation: `SELECT * FROM pg_extension WHERE extname = 'vector';`
3. Validate DSN format and credentials

#### Issue: Ollama Connection Timeouts

**Symptoms**: Embedding generation fails with timeout errors
**Causes**: Ollama service not running, network connectivity issues
**Solutions**:

1. Start Ollama service: `ollama serve`
2. Test connection: `curl http://localhost:11434/api/tags`
3. Pull required models: `ollama pull mxbai-embed-large`

#### Issue: Slow Query Performance

**Symptoms**: High query latency, slow response times
**Causes**: Missing indexes, large result sets, inefficient queries
**Solutions**:

1. Verify HNSW indexes are created: Check `003_indexes.sql` execution
2. Optimize query parameters: Reduce `top_k`, increase `similarity_threshold`
3. Monitor database performance: Check query execution plans

### Debug Mode

Enable detailed logging for troubleshooting:

```python
import logging
logging.getLogger("uvicorn").setLevel(logging.DEBUG)
logging.getLogger("app.services.rag").setLevel(logging.DEBUG)
```

### Performance Monitoring

Monitor system performance with built-in metrics:

```bash
# Get comprehensive system stats
curl -X GET "http://localhost:8000/api/rag/admin/stats"

# Monitor indexing queue
curl -X GET "http://localhost:8000/api/rag/admin/indexing-status"
```

## Best Practices

### Document Ingestion

- **Batch Processing**: Use appropriate batch sizes (16-32 items) for optimal performance
- **Chunking Strategy**: Configure chunk sizes based on content type and use case
- **Model Selection**: Choose embedding models based on content type and performance requirements
- **Progress Monitoring**: Use streaming endpoints for large document sets

### Query Optimization

- **Similarity Thresholds**: Set appropriate thresholds to filter low-quality results
- **Result Limiting**: Use reasonable `top_k` values to balance performance and relevance
- **Modality Filtering**: Use modality parameters to search specific content types
- **Caching**: Leverage embedding caching for repeated queries

### System Maintenance

- **Regular Index Rebuilding**: Rebuild indexes periodically for optimal performance
- **Cache Management**: Monitor cache usage and clear when necessary
- **Health Monitoring**: Set up monitoring for all service dependencies
- **Backup Strategy**: Implement regular database backups for production deployments

## Conclusion

The Reynard RAG backend provides a production-ready retrieval-augmented generation system with
sophisticated vector search capabilities, comprehensive API coverage, and
robust error handling. The modular architecture enables easy extension and customization while
maintaining high performance and reliability.

Key strengths include:

- **Multi-modal Support**: Text, code, caption, and image embeddings
- **Production-Ready**: Comprehensive error handling, monitoring, and security
- **High Performance**: HNSW indexing and optimized batch processing
- **Developer-Friendly**: Clean API design with comprehensive documentation
- **Scalable Architecture**: Asynchronous processing with configurable concurrency

The system is ready for immediate integration with the existing Reynard frontend packages and
provides a solid foundation for advanced RAG applications.
