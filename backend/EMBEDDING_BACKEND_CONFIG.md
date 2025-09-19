# Embedding Backend Configuration Guide

This guide explains how to configure and disable different embedding backends in the Reynard RAG system.

## Overview

The Reynard backend now supports granular control over embedding backends, allowing you to easily enable/disable specific providers like Ollama, Sentence Transformers, OpenAI, and Hugging Face without affecting the entire embedding service.

## Environment Variables

The embedding backend configuration system works seamlessly with `.env` files! Simply add the configuration variables to your `.env` file and they will be automatically loaded.

### Using .env Files

1. **Copy the example file:**

   ```bash
   cp backend/env.example backend/.env
   ```

2. **Edit your .env file** with the desired configuration:

   ```bash
   # Disable Sentence Transformers
   EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED=false

   # Enable mock mode for testing
   EMBEDDING_MOCK_MODE=true
   ```

3. **The system automatically loads** all environment variables from the `.env` file

### Global Backend Control

```bash
# Enable/disable all embedding backends
EMBEDDING_BACKENDS_ENABLED=true

# Enable mock mode (all backends disabled, returns mock embeddings)
EMBEDDING_MOCK_MODE=false

# Allow fallback between backends
EMBEDDING_ALLOW_FALLBACK=true

# Default backend to use (ollama, sentence_transformers, openai, huggingface)
EMBEDDING_DEFAULT_BACKEND=ollama
```

### Ollama Backend Configuration

```bash
# Enable/disable Ollama backend
EMBEDDING_OLLAMA_ENABLED=true

# Ollama server URL
OLLAMA_BASE_URL=http://localhost:11434

# Ollama-specific settings
EMBEDDING_OLLAMA_TIMEOUT=30
EMBEDDING_OLLAMA_MAX_RETRIES=3
EMBEDDING_OLLAMA_RETRY_DELAY=1.0
EMBEDDING_OLLAMA_MAX_CONCURRENT=8
EMBEDDING_OLLAMA_BATCH_SIZE=16
EMBEDDING_OLLAMA_DEFAULT_MODEL=embeddinggemma:latest
```

### Sentence Transformers Backend Configuration

```bash
# Enable/disable Sentence Transformers backend
EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED=true

# Sentence Transformers-specific settings
EMBEDDING_SENTENCE_TRANSFORMERS_TIMEOUT=30
EMBEDDING_SENTENCE_TRANSFORMERS_MAX_RETRIES=3
EMBEDDING_SENTENCE_TRANSFORMERS_RETRY_DELAY=1.0
EMBEDDING_SENTENCE_TRANSFORMERS_MAX_CONCURRENT=4
EMBEDDING_SENTENCE_TRANSFORMERS_BATCH_SIZE=8
EMBEDDING_SENTENCE_TRANSFORMERS_DEFAULT_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### OpenAI Backend Configuration (Future)

```bash
# Enable/disable OpenAI backend
EMBEDDING_OPENAI_ENABLED=false

# OpenAI API key
OPENAI_API_KEY=your-api-key-here

# OpenAI-specific settings
EMBEDDING_OPENAI_TIMEOUT=30
EMBEDDING_OPENAI_MAX_RETRIES=3
EMBEDDING_OPENAI_RETRY_DELAY=1.0
EMBEDDING_OPENAI_MAX_CONCURRENT=5
EMBEDDING_OPENAI_BATCH_SIZE=10
EMBEDDING_OPENAI_DEFAULT_MODEL=text-embedding-3-small
```

### Hugging Face Backend Configuration (Future)

```bash
# Enable/disable Hugging Face backend
EMBEDDING_HUGGINGFACE_ENABLED=false

# Hugging Face API key
HUGGINGFACE_API_KEY=your-api-key-here

# Hugging Face-specific settings
EMBEDDING_HUGGINGFACE_TIMEOUT=30
EMBEDDING_HUGGINGFACE_MAX_RETRIES=3
EMBEDDING_HUGGINGFACE_RETRY_DELAY=1.0
EMBEDDING_HUGGINGFACE_MAX_CONCURRENT=4
EMBEDDING_HUGGINGFACE_BATCH_SIZE=8
EMBEDDING_HUGGINGFACE_DEFAULT_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

## Configuration Examples

### Quick .env File Examples

**Disable Sentence Transformers (.env):**

```bash
EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED=false
EMBEDDING_OLLAMA_ENABLED=true
```

**Disable Ollama (.env):**

```bash
EMBEDDING_OLLAMA_ENABLED=false
EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED=true
```

**Mock Mode for Testing (.env):**

```bash
EMBEDDING_MOCK_MODE=true
```

**Disable All Backends (.env):**

```bash
EMBEDDING_BACKENDS_ENABLED=false
```

### Example 1: Disable Sentence Transformers

To disable Sentence Transformers and only use Ollama:

```bash
EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED=false
EMBEDDING_OLLAMA_ENABLED=true
```

### Example 2: Disable Ollama

To disable Ollama and only use Sentence Transformers:

```bash
EMBEDDING_OLLAMA_ENABLED=false
EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED=true
```

### Example 3: Mock Mode for Testing

To disable all backends and use mock embeddings:

```bash
EMBEDDING_MOCK_MODE=true
```

### Example 4: Disable All Backends

To completely disable embedding backends:

```bash
EMBEDDING_BACKENDS_ENABLED=false
```

### Example 5: Production Setup with Fallback

For production with Ollama as primary and Sentence Transformers as fallback:

```bash
EMBEDDING_OLLAMA_ENABLED=true
EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED=true
EMBEDDING_ALLOW_FALLBACK=true
EMBEDDING_DEFAULT_BACKEND=ollama
```

## Backend Priority

Backends are used in priority order (lower number = higher priority):

1. **Ollama** (priority 1) - Primary local embedding service
2. **Sentence Transformers** (priority 2) - Fallback local embedding service
3. **OpenAI** (priority 3) - Cloud-based embedding service
4. **Hugging Face** (priority 4) - Cloud-based embedding service

## Fallback Behavior

When `EMBEDDING_ALLOW_FALLBACK=true` (default), the system will:

1. Try the highest priority enabled backend
2. If that fails, try the next highest priority enabled backend
3. Continue until all backends are exhausted
4. If all backends fail, return mock embeddings

## Mock Mode

When `EMBEDDING_MOCK_MODE=true`:

- All backends are effectively disabled
- The system returns mock embeddings for all requests
- Useful for testing and development without requiring actual embedding services
- Mock embeddings are deterministic and consistent

## Health Checks

The system automatically tests backend connectivity during initialization:

- **Ollama**: Tests connection to `/api/tags` endpoint
- **Sentence Transformers**: Tests model loading
- **OpenAI**: Tests API key validity (when implemented)
- **Hugging Face**: Tests API key validity (when implemented)

## Monitoring

You can monitor backend status through the embedding service stats endpoint:

```python
stats = await embedding_service.get_stats()
print(stats["backend_config"]["enabled_backends"])
print(stats["backend_config"]["backend_details"])
```

## Troubleshooting

### Common Issues

1. **No backends available**: Check that at least one backend is enabled
2. **Ollama connection failed**: Verify Ollama is running and accessible
3. **Sentence Transformers not loading**: Check that the library is installed
4. **All backends failing**: Check network connectivity and API keys

### Debug Mode

Enable debug logging to see detailed backend testing:

```bash
DEBUG=true
```

### Validation

The system validates configuration on startup and will raise errors for:

- Invalid timeout values
- Missing required API keys
- Invalid backend configurations
- No enabled backends (unless in mock mode)

## Migration from Legacy Configuration

The new system is backward compatible with existing configuration. Legacy settings are automatically mapped to the new backend configuration system.

### Legacy to New Mapping

- `RAG_ENABLED` → `EMBEDDING_BACKENDS_ENABLED`
- `OLLAMA_BASE_URL` → Used by Ollama backend
- `RAG_INGEST_BATCH_SIZE_TEXT` → Used by all backends
- `RAG_MAX_CONCURRENT_REQUESTS` → Used by all backends

## Future Backends

The system is designed to easily support additional backends:

1. **Cohere**: Add `cohere` provider
2. **Azure OpenAI**: Add `azure_openai` provider
3. **AWS Bedrock**: Add `bedrock` provider
4. **Custom APIs**: Add custom provider implementations

Each new backend follows the same configuration pattern with environment variables prefixed by `EMBEDDING_{BACKEND_NAME}_`.
