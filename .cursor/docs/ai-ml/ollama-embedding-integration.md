# Ollama Embedding Integration Guide

_Comprehensive guide for integrating Ollama embedding models in RAG systems_

## Overview

This document provides a complete guide for integrating Ollama-based embedding models into RAG (Retrieval-Augmented Generation) systems. It covers setup, configuration, optimization, and best practices for using Ollama's embedding capabilities effectively.

## Ollama Embedding Models

### Available Models

Ollama supports several high-quality embedding models:

**Primary Models:**

- **EmbeddingGemma** (1024 dim, 512 tokens) - Google's 300M parameter model
- **nomic-embed-text** (768 dim, 2048 tokens) - Long context support
- **mxbai-embed-large** (1024 dim, 512 tokens) - Multilingual performance
- **bge-m3** (1024 dim, 512 tokens) - Strong multilingual capabilities

**Fallback Models:**

- **bge-large-en-v1.5** (1024 dim, 512 tokens)
- **bge-base-en-v1.5** (768 dim, 512 tokens)
- **bge-small-en-v1.5** (384 dim, 512 tokens)

### Model Selection Criteria

```python
def select_embedding_model(content_type: str, content_length: int) -> str:
    """Select optimal embedding model based on content characteristics."""

    if content_type == "code":
        return "embeddinggemma:latest"  # Best for technical content
    elif content_length > 1000:
        return "nomic-embed-text"  # Long context support
    elif content_type == "multilingual":
        return "mxbai-embed-large"  # Multilingual performance
    else:
        return "embeddinggemma:latest"  # General purpose
```

## Setup and Configuration

### 1. Ollama Installation

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Pull embedding models
ollama pull embeddinggemma
ollama pull nomic-embed-text
ollama pull mxbai-embed-large
```

### 2. Model Registry Configuration

```python
class EmbeddingService:
    def __init__(self):
        self._registry = {
            "embeddinggemma:latest": {
                "dim": 1024,
                "metric": "cosine",
                "max_tokens": 512,
                "provider": "ollama",
                "priority": 1,
                "use_case": "general_code"
            },
            "nomic-embed-text": {
                "dim": 768,
                "metric": "cosine",
                "max_tokens": 2048,
                "provider": "ollama",
                "priority": 2,
                "use_case": "long_context"
            },
            "mxbai-embed-large": {
                "dim": 1024,
                "metric": "cosine",
                "max_tokens": 512,
                "provider": "ollama",
                "priority": 3,
                "use_case": "multilingual"
            }
        }
```

### 3. Service Initialization

```python
async def initialize_embedding_service(config: dict) -> EmbeddingService:
    """Initialize embedding service with Ollama integration."""
    service = EmbeddingService()

    # Configure Ollama connection
    service._ollama_base_url = config.get("ollama_base_url", "http://localhost:11434")
    service._timeout_seconds = config.get("embedding_timeout_seconds", 30)
    service._max_retries = config.get("embedding_max_retries", 3)

    # Test Ollama connection
    if await service._test_ollama_connection():
        logger.info("Ollama embedding service initialized successfully")
        return service
    else:
        logger.warning("Ollama connection failed, using fallback models")
        return service
```

## API Integration

### Basic Embedding Generation

```python
async def embed_text(self, text: str, model: str = "embeddinggemma:latest") -> list[float]:
    """Generate embedding for a single text using Ollama."""
    try:
        import aiohttp

        async with aiohttp.ClientSession() as session:
            payload = {"model": model, "prompt": text}

            async with session.post(
                f"{self._ollama_base_url}/api/embed",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=self._timeout_seconds),
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    return result.get("embedding")
                else:
                    logger.warning(f"Ollama embedding failed: {response.status}")
                    return None
    except Exception as e:
        logger.warning(f"Ollama embedding error: {e}")
        return None
```

### Batch Processing

```python
async def embed_batch(self, texts: list[str], model: str = "embeddinggemma:latest") -> list[list[float]]:
    """Generate embeddings for a batch of texts."""
    # Ollama doesn't have native batch support, so process individually
    embeddings = []
    for text in texts:
        embedding = await self.embed_text(text, model)
        if embedding is None:
            return None
        embeddings.append(embedding)
    return embeddings
```

### Concurrent Processing

```python
async def embed_batch_concurrent(self, texts: list[str], model: str) -> list[list[float]]:
    """Generate embeddings with concurrent processing for better performance."""
    max_concurrent = min(8, len(texts), self._get_optimal_concurrency())
    semaphore = asyncio.Semaphore(max_concurrent)

    async def embed_single_with_retry(text: str, attempt: int = 0) -> list[float]:
        async with semaphore:
            try:
                return await self.embed_text(text, model)
            except Exception as e:
                if attempt < 3:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                    return await embed_single_with_retry(text, attempt + 1)
                raise e

    # Process in batches to avoid overwhelming Ollama
    batch_size = 16
    results = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        batch_tasks = [embed_single_with_retry(text) for text in batch]
        batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
        results.extend(batch_results)

    return results
```

## Performance Optimization

### 1. Connection Management

```python
class OllamaConnectionManager:
    """Manages Ollama connections with connection pooling."""

    def __init__(self, base_url: str, max_connections: int = 10):
        self.base_url = base_url
        self.connector = aiohttp.TCPConnector(limit=max_connections)
        self.session = None

    async def get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session with connection pooling."""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(connector=self.connector)
        return self.session

    async def close(self):
        """Close the session and connections."""
        if self.session and not self.session.closed:
            await self.session.close()
```

### 2. Caching Strategy

```python
class EmbeddingCache:
    """LRU cache for embeddings with hit rate monitoring."""

    def __init__(self, max_size: int = 1000):
        self.cache = OrderedDict()
        self.max_size = max_size
        self.hits = 0
        self.misses = 0

    def get(self, key: str) -> Optional[list[float]]:
        """Get embedding from cache."""
        if key in self.cache:
            # Move to end (most recently used)
            value = self.cache.pop(key)
            self.cache[key] = value
            self.hits += 1
            return value
        self.misses += 1
        return None

    def put(self, key: str, value: list[float]) -> None:
        """Put embedding in cache."""
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.max_size:
            self.cache.popitem(last=False)  # Remove least recently used
        self.cache[key] = value

    def get_hit_rate(self) -> float:
        """Get cache hit rate."""
        total = self.hits + self.misses
        return self.hits / total if total > 0 else 0.0
```

### 3. Rate Limiting

```python
class RateLimiter:
    """Rate limiter for Ollama requests."""

    def __init__(self, requests_per_second: int = 10):
        self.requests_per_second = requests_per_second
        self.semaphore = asyncio.Semaphore(requests_per_second)
        self.last_reset = time.time()

    async def acquire(self):
        """Acquire rate limit permit."""
        await self.semaphore.acquire()

        # Reset permits every second
        now = time.time()
        if now - self.last_reset >= 1.0:
            self.semaphore = asyncio.Semaphore(self.requests_per_second)
            self.last_reset = now
```

## Error Handling and Resilience

### 1. Retry Logic

```python
async def embed_with_retry(self, text: str, model: str, max_retries: int = 3) -> list[float]:
    """Generate embedding with exponential backoff retry logic."""
    for attempt in range(max_retries):
        try:
            embedding = await self.embed_text(text, model)
            if embedding is not None:
                return embedding
        except Exception as e:
            logger.warning(f"Embedding attempt {attempt + 1} failed: {e}")

            if attempt < max_retries - 1:
                delay = 2 ** attempt  # Exponential backoff
                await asyncio.sleep(delay)
            else:
                raise e

    return None
```

### 2. Fallback Strategy

```python
async def embed_with_fallback(self, text: str, primary_model: str) -> list[float]:
    """Generate embedding with fallback to alternative models."""
    # Try primary model first
    embedding = await self.embed_text(text, primary_model)
    if embedding is not None:
        return embedding

    # Try fallback models
    fallback_models = ["nomic-embed-text", "mxbai-embed-large", "bge-m3"]
    for model in fallback_models:
        if model != primary_model:
            embedding = await self.embed_text(text, model)
            if embedding is not None:
                logger.info(f"Used fallback model {model} for embedding")
                return embedding

    # If all models fail, return mock embedding
    logger.warning("All embedding models failed, returning mock embedding")
    return [0.1] * 1024  # Mock embedding
```

### 3. Health Monitoring

```python
async def health_check(self) -> dict:
    """Perform comprehensive health check of Ollama service."""
    health_status = {
        "ollama_available": False,
        "models_loaded": [],
        "response_time_ms": 0,
        "error_rate": 0
    }

    try:
        start_time = time.time()

        # Test basic connection
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self._ollama_base_url}/api/tags",
                timeout=aiohttp.ClientTimeout(total=5)
            ) as response:
                if response.status == 200:
                    health_status["ollama_available"] = True

                    # Get loaded models
                    data = await response.json()
                    health_status["models_loaded"] = [
                        model["name"] for model in data.get("models", [])
                    ]

        health_status["response_time_ms"] = (time.time() - start_time) * 1000

    except Exception as e:
        logger.warning(f"Health check failed: {e}")
        health_status["error_rate"] = 1.0

    return health_status
```

## Monitoring and Metrics

### 1. Performance Metrics

```python
class EmbeddingMetrics:
    """Collect and track embedding performance metrics."""

    def __init__(self):
        self.requests = 0
        self.errors = 0
        self.total_latency_ms = 0
        self.cache_hits = 0
        self.cache_misses = 0

    def record_request(self, latency_ms: float, success: bool, cache_hit: bool):
        """Record a single embedding request."""
        self.requests += 1
        self.total_latency_ms += latency_ms

        if success:
            if cache_hit:
                self.cache_hits += 1
            else:
                self.cache_misses += 1
        else:
            self.errors += 1

    def get_stats(self) -> dict:
        """Get current performance statistics."""
        avg_latency = self.total_latency_ms / self.requests if self.requests > 0 else 0
        error_rate = self.errors / self.requests if self.requests > 0 else 0
        cache_hit_rate = self.cache_hits / (self.cache_hits + self.cache_misses) if (self.cache_hits + self.cache_misses) > 0 else 0

        return {
            "total_requests": self.requests,
            "error_rate": error_rate,
            "average_latency_ms": avg_latency,
            "cache_hit_rate": cache_hit_rate,
            "throughput_per_second": self.requests / (self.total_latency_ms / 1000) if self.total_latency_ms > 0 else 0
        }
```

### 2. Resource Monitoring

```python
def get_system_resources() -> dict:
    """Get current system resource usage."""
    import psutil

    return {
        "cpu_percent": psutil.cpu_percent(),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_usage_percent": psutil.disk_usage('/').percent,
        "network_connections": len(psutil.net_connections())
    }

def get_optimal_concurrency() -> int:
    """Determine optimal concurrency based on system resources."""
    import psutil

    cpu_count = psutil.cpu_count()
    memory_gb = psutil.virtual_memory().total / (1024**3)

    # Conservative: 1 per 2GB RAM, max 8
    return min(8, max(2, int(memory_gb / 2)))
```

## Best Practices

### ✅ Do

1. **Use connection pooling** for better performance
2. **Implement caching** to reduce redundant requests
3. **Apply rate limiting** to prevent overwhelming Ollama
4. **Use exponential backoff** for retry logic
5. **Monitor performance metrics** continuously
6. **Implement health checks** for reliability
7. **Use appropriate model selection** based on content type
8. **Handle errors gracefully** with fallback strategies

### ❌ Don't

1. **Don't ignore rate limits** - Ollama can be overwhelmed
2. **Don't skip error handling** - Always have fallback plans
3. **Don't use blocking operations** - Use async/await properly
4. **Don't ignore resource monitoring** - Track system health
5. **Don't hardcode timeouts** - Make them configurable
6. **Don't skip caching** - Significant performance improvement
7. **Don't ignore model selection** - Choose appropriate models

## Troubleshooting

### Common Issues

**Issue**: Slow embedding generation
**Solutions**:

- Check system resources (CPU, memory)
- Implement caching
- Use concurrent processing
- Optimize batch sizes

**Issue**: Connection timeouts
**Solutions**:

- Increase timeout values
- Check Ollama service status
- Implement retry logic
- Use connection pooling

**Issue**: High error rates
**Solutions**:

- Check Ollama logs
- Verify model availability
- Implement fallback models
- Monitor system resources

### Performance Tuning

```python
# Optimal configuration for production
config = {
    "ollama_base_url": "http://localhost:11434",
    "embedding_timeout_seconds": 30,
    "embedding_max_retries": 3,
    "max_concurrent_requests": 8,
    "rate_limit_per_second": 10,
    "cache_size": 1000,
    "batch_size": 16
}
```

## Conclusion

Ollama provides an excellent foundation for embedding services in RAG systems. By following these integration guidelines, you can achieve optimal performance, reliability, and maintainability. The key is to implement proper error handling, caching, and monitoring while respecting Ollama's capabilities and limitations.

Remember that Ollama handles tokenization internally, so focus on optimizing the integration layer rather than trying to manage tokenization externally. This approach will give you the best results with the least complexity.
