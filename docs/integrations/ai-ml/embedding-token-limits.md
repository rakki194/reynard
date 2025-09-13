# Embedding Token Limits and Chunking

This document explains the fixes implemented to resolve Ollama embedding warnings related to token limits and chunking.

## Problem

When using RAG embeddings with Ollama, you may encounter these warnings:

```text
decode: cannot decode batches with this context (use llama_encode() instead)
time=2025-08-11T11:23:56.313+02:00 level=WARN source=runner.go:128 msg="truncating input prompt" limit=512 prompt=514 keep=1 new=512
```

These warnings occur because:

1. The chunking system was creating chunks that exceeded the embedding model's token limit (typically 512 tokens)
2. Ollama was truncating the input, which could lead to information loss
3. The "decode" warnings indicate that the input format was incompatible with the model's expectations

## Solution

### 1. New Embedding-Optimized Chunking

A new chunking function `chunk_document_for_embeddings()` has been added that:

- Respects strict token limits (default 512 tokens)
- Provides configurable minimum token counts and overlap ratios
- Includes intelligent chunking logic to ensure chunks never exceed the limit
- Adds metadata to track when chunking occurs

### 2. Model-Specific Token Limits

The embedding service now includes a registry of models with their token limits:

```python
self._registry = {
    "mxbai-embed-large": {"dim": 1024, "metric": "cosine", "max_tokens": 512},
    "nomic-embed-text": {"dim": 768, "metric": "cosine", "max_tokens": 512},
    "bge-m3": {"dim": 1024, "metric": "cosine", "max_tokens": 512},
    # ... more models
}
```

### 3. Configurable Chunking Parameters

New configuration options have been added to `AppConfig`:

- `rag_chunk_max_tokens`: Maximum tokens per chunk (default: 512)
- `rag_chunk_min_tokens`: Minimum tokens per chunk (default: 100)
- `rag_chunk_overlap_ratio`: Overlap ratio between chunks (default: 0.15)

### 4. Model-Specific Token Limits

You can configure different token limits for each model type:

- `rag_text_model_max_tokens`: Token limit for text embedding model (default: 512)
- `rag_code_model_max_tokens`: Token limit for code embedding model (default: 512)
- `rag_caption_model_max_tokens`: Token limit for caption embedding model (default: 512)

These settings override the general `rag_chunk_max_tokens` setting for their respective model types.

### 5. Input Validation and Intelligent Chunking

The embedding service now validates input texts before sending them to Ollama:

- Estimates token count for each text
- **Chunks texts that exceed the model's limit** (instead of truncating)
- Logs warnings when chunking occurs
- Attempts to break at word boundaries when possible
- Preserves all information by creating multiple chunks

### 6. Text Cleaning and Format Compatibility

The embedding service also cleans and normalizes text to prevent format-related issues:

- Removes null bytes and control characters that can cause decode errors
- Normalizes whitespace while preserving intentional line breaks
- Removes Unicode control characters (BOM, zero-width spaces, etc.)
- Limits text length to prevent extremely long inputs

## Configuration

### Environment Variables

You can configure the chunking parameters via environment variables:

```bash
export RAG_CHUNK_MAX_TOKENS=512
export RAG_CHUNK_MIN_TOKENS=100
export RAG_CHUNK_OVERLAP_RATIO=0.15
export RAG_TEXT_MODEL_MAX_TOKENS=512
export RAG_CODE_MODEL_MAX_TOKENS=512
export RAG_CAPTION_MODEL_MAX_TOKENS=512
```

### Configuration File

Add these settings to your `config.json`:

```json
{
  "rag_chunk_max_tokens": 512,
  "rag_chunk_min_tokens": 100,
  "rag_chunk_overlap_ratio": 0.15,
  "rag_text_model_max_tokens": 512,
  "rag_code_model_max_tokens": 512,
  "rag_caption_model_max_tokens": 512
}
```

### Frontend Settings

The RAG settings page now includes controls for:

- Max Tokens per Chunk
- Min Tokens per Chunk
- Chunk Overlap Ratio
- Text Model Token Limit
- Code Model Token Limit
- Caption Model Token Limit

## Model-Specific Token Limits

### How It Works

The system supports model-specific token limits that override the general `rag_chunk_max_tokens` setting:

1. **Model Detection**: The system automatically detects the model type based on:
   - The model name (e.g., "mxbai-embed-large" → text model)
   - Configuration mapping (e.g., `rag_text_model` setting)
   - Explicit model type parameter

2. **Limit Precedence**: Token limits are determined in this order:
   - Model-specific config limit (e.g., `rag_text_model_max_tokens`)
   - Model registry limit (hardcoded in the service)
   - General config limit (`rag_chunk_max_tokens`)
   - Default fallback (512 tokens)

3. **Safety**: The system always uses the most restrictive limit to prevent truncation warnings.

### Model Type Detection

The system automatically detects model types:

- **Text Models**: Models containing "text", "nomic", or "mxbai" in the name
- **Code Models**: Models containing "code" or "bge" in the name
- **Caption Models**: Models containing "caption" or "clip" in the name

You can also explicitly specify the model type when calling embedding functions.

### Configuration Examples

**Different limits for different model types:**

```json
{
  "rag_text_model_max_tokens": 512, // Text documents
  "rag_code_model_max_tokens": 1024, // Code files (longer context)
  "rag_caption_model_max_tokens": 256 // Captions (shorter context)
}
```

**Environment variables:**

```bash
export RAG_TEXT_MODEL_MAX_TOKENS=512
export RAG_CODE_MODEL_MAX_TOKENS=1024
export RAG_CAPTION_MODEL_MAX_TOKENS=256
```

## Usage

### Automatic Usage

The new chunking is automatically used by:

- `EmbeddingIndexService` for background ingestion
- `RAGService` for document ingestion
- All embedding operations that create chunks

### Manual Usage

You can use the new chunking function directly:

```python
from app.managers.chunking import chunk_document_for_embeddings

chunks = chunk_document_for_embeddings(
    text="Your document text here",
    max_tokens=512,
    min_tokens=100,
    overlap_ratio=0.15
)
```

## Model Compatibility

The system now supports various embedding models with their specific token limits:

| Model                  | Dimension | Token Limit | Notes                 |
| ---------------------- | --------- | ----------- | --------------------- |
| mxbai-embed-large      | 1024      | 512         | Default text model    |
| nomic-embed-text       | 768       | 512         | Default caption model |
| bge-m3                 | 1024      | 512         | Default code model    |
| all-MiniLM-L6-v2       | 384       | 256         | Compact model         |
| text-embedding-ada-002 | 1536      | 8191        | OpenAI model          |
| text-embedding-3-small | 1536      | 8191        | OpenAI model          |

## Monitoring

### Logs

The system logs warnings when chunking occurs:

```text
Text chunked from 514 to 2 chunks for model mxbai-embed-large
```

### Metrics

The embedding service tracks:

- Number of requests
- Number of errors
- Processing time per request
- Number of texts chunked

### Validation

You can verify that chunks respect token limits by checking the chunk metadata:

```python
for chunk in chunks:
    assert chunk["tokens"] <= max_tokens
    if chunk["metadata"].get("chunked"):
        print(f"Text was chunked into {len(chunks)} pieces")
```

## Migration

### Existing Data

Existing embeddings will continue to work, but new ingestions will use the optimized chunking.

### Reindexing

To reindex existing documents with the new chunking:

1. Use the `/api/rag/reindex` endpoint
2. Or delete and re-ingest documents

### Configuration Changes

When changing chunking parameters:

- New ingestions will use the new settings
- Existing embeddings remain unchanged
- Consider reindexing for consistency

## Troubleshooting

### Still Seeing Warnings

If you still see truncation warnings:

1. Check that `rag_chunk_max_tokens` is set to 512 or lower
2. Verify the model in use has the correct token limit
3. Check logs for chunking warnings

### Performance Issues

If chunking is too aggressive:

1. Increase `rag_chunk_min_tokens` for larger chunks
2. Decrease `rag_chunk_overlap_ratio` for less overlap
3. Monitor embedding service metrics

### Quality Issues

If retrieval quality decreases:

1. Increase `rag_chunk_overlap_ratio` for better context
2. Adjust `rag_chunk_min_tokens` for more meaningful chunks
3. Consider using a model with higher token limits

## Key Benefits

### Information Preservation

Unlike truncation, chunking preserves all information by creating multiple chunks:

- **No data loss**: All text content is preserved across chunks
- **Context continuity**: Overlap between chunks maintains context
- **Better retrieval**: More granular embeddings improve search quality

### Format Compatibility

Text cleaning prevents format-related issues:

- **No decode errors**: Removes problematic characters
- **Consistent formatting**: Normalizes whitespace and control characters
- **Robust processing**: Handles edge cases gracefully

### Performance Optimization

Intelligent chunking optimizes performance:

- **Efficient processing**: Only chunks when necessary
- **Balanced chunks**: Maintains reasonable chunk sizes
- **Overlap management**: Configurable overlap for context continuity
