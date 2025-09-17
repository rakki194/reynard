# Embedding Optimization Strategies

_Advanced techniques for optimizing RAG embedding performance and quality_

## Overview

This document provides comprehensive strategies for optimizing embedding systems in RAG applications. It covers performance optimization, quality improvement, and scalability techniques based on current best practices and research findings.

## Performance Optimization

### 1. Concurrent Processing

**Challenge**: Sequential embedding generation is slow and inefficient.

**Solution**: Implement concurrent processing with proper resource management.

```python
class ConcurrentEmbeddingProcessor:
    """Optimized concurrent embedding processor with adaptive concurrency."""

    def __init__(self, max_concurrent: int = 8):
        self.max_concurrent = max_concurrent
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.rate_limiter = asyncio.Semaphore(10)  # 10 requests/second

    async def process_batch_concurrent(self, texts: list[str], model: str) -> list[list[float]]:
        """Process batch with concurrent execution and rate limiting."""
        async def embed_single_with_retry(text: str, attempt: int = 0) -> list[float]:
            async with self.semaphore:
                async with self.rate_limiter:
                    try:
                        return await self._embed_with_ollama(text, model)
                    except Exception as e:
                        if attempt < 3:
                            await asyncio.sleep(2 ** attempt)  # Exponential backoff
                            return await embed_single_with_retry(text, attempt + 1)
                        raise e

        # Process in sub-batches to avoid overwhelming the system
        batch_size = 16
        results = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_tasks = [embed_single_with_retry(text) for text in batch]
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            results.extend(batch_results)

        return results

    def _get_optimal_concurrency(self) -> int:
        """Determine optimal concurrency based on system resources."""
        import psutil

        cpu_count = psutil.cpu_count()
        memory_gb = psutil.virtual_memory().total / (1024**3)

        # Conservative: 1 per 2GB RAM, max 8
        return min(8, max(2, int(memory_gb / 2)))
```

**Expected Performance Gains**:

- **Throughput**: 2-10 embeddings/sec → 20-40 embeddings/sec
- **Latency**: 50% reduction in batch processing time
- **Resource Utilization**: Better CPU/memory efficiency

### 2. Intelligent Caching

**Challenge**: Redundant embedding generation wastes resources.

**Solution**: Implement multi-level caching with intelligent invalidation.

```python
class IntelligentEmbeddingCache:
    """Multi-level cache with semantic similarity detection."""

    def __init__(self, max_size: int = 1000):
        self.lru_cache = OrderedDict()
        self.semantic_cache = {}  # Hash-based semantic cache
        self.max_size = max_size
        self.hits = 0
        self.misses = 0

    def get_cache_key(self, text: str, model: str) -> str:
        """Generate cache key with content hash."""
        content_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
        return f"{model}:{content_hash}"

    def get(self, text: str, model: str) -> Optional[list[float]]:
        """Get embedding from cache with semantic similarity check."""
        cache_key = self.get_cache_key(text, model)

        # Check LRU cache first
        if cache_key in self.lru_cache:
            value = self.lru_cache.pop(cache_key)
            self.lru_cache[cache_key] = value
            self.hits += 1
            return value

        # Check semantic cache for similar content
        similar_embedding = self._find_similar_embedding(text, model)
        if similar_embedding:
            self.hits += 1
            return similar_embedding

        self.misses += 1
        return None

    def put(self, text: str, model: str, embedding: list[float]) -> None:
        """Store embedding in cache with eviction policy."""
        cache_key = self.get_cache_key(text, model)

        # Store in LRU cache
        if cache_key in self.lru_cache:
            self.lru_cache.pop(cache_key)
        elif len(self.lru_cache) >= self.max_size:
            self.lru_cache.popitem(last=False)

        self.lru_cache[cache_key] = embedding

        # Store in semantic cache
        self.semantic_cache[cache_key] = {
            'embedding': embedding,
            'text': text,
            'timestamp': time.time()
        }

    def _find_similar_embedding(self, text: str, model: str) -> Optional[list[float]]:
        """Find semantically similar embedding in cache."""
        # Simple similarity check based on text length and word overlap
        for cached_item in self.semantic_cache.values():
            if self._is_similar_text(text, cached_item['text']):
                return cached_item['embedding']
        return None

    def _is_similar_text(self, text1: str, text2: str) -> bool:
        """Check if two texts are similar enough to share embeddings."""
        # Simple similarity check - can be enhanced with more sophisticated algorithms
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())

        if len(words1) == 0 or len(words2) == 0:
            return False

        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))

        jaccard_similarity = intersection / union
        return jaccard_similarity > 0.8  # 80% similarity threshold
```

### 3. Batch Size Optimization

**Challenge**: Suboptimal batch sizes reduce throughput.

**Solution**: Dynamic batch sizing based on content characteristics.

```python
class AdaptiveBatchProcessor:
    """Adaptive batch processor that optimizes batch sizes dynamically."""

    def __init__(self):
        self.performance_history = []
        self.optimal_batch_sizes = {}

    def get_optimal_batch_size(self, model: str, content_type: str) -> int:
        """Determine optimal batch size based on model and content type."""
        key = f"{model}:{content_type}"

        if key in self.optimal_batch_sizes:
            return self.optimal_batch_sizes[key]

        # Default batch sizes based on content type
        default_sizes = {
            "code": 8,      # Smaller batches for code (more complex)
            "documentation": 16,  # Medium batches for docs
            "text": 24,     # Larger batches for simple text
            "mixed": 12     # Conservative for mixed content
        }

        return default_sizes.get(content_type, 16)

    def adapt_batch_size(self, model: str, content_type: str,
                        actual_throughput: float, target_throughput: float):
        """Adapt batch size based on performance metrics."""
        key = f"{model}:{content_type}"
        current_size = self.optimal_batch_sizes.get(key, 16)

        if actual_throughput < target_throughput * 0.8:
            # Increase batch size if performance is low
            new_size = min(current_size * 1.5, 32)
        elif actual_throughput > target_throughput * 1.2:
            # Decrease batch size if performance is too high (may cause errors)
            new_size = max(current_size * 0.8, 4)
        else:
            new_size = current_size

        self.optimal_batch_sizes[key] = int(new_size)
        return int(new_size)
```

## Quality Optimization

### 1. Model Selection Strategy

**Challenge**: Using the wrong model for specific content types.

**Solution**: Intelligent model selection based on content characteristics.

```python
class IntelligentModelSelector:
    """Select optimal embedding model based on content analysis."""

    def __init__(self):
        self.model_capabilities = {
            "embeddinggemma:latest": {
                "strengths": ["code", "technical", "general"],
                "max_tokens": 512,
                "dimensions": 1024,
                "performance_score": 0.9
            },
            "nomic-embed-text": {
                "strengths": ["long_context", "documentation", "multilingual"],
                "max_tokens": 2048,
                "dimensions": 768,
                "performance_score": 0.85
            },
            "mxbai-embed-large": {
                "strengths": ["multilingual", "general", "code"],
                "max_tokens": 512,
                "dimensions": 1024,
                "performance_score": 0.88
            }
        }

    def select_model(self, text: str, content_type: str = None) -> str:
        """Select optimal model based on text characteristics."""
        if content_type:
            return self._select_by_content_type(content_type)

        # Analyze text characteristics
        text_length = len(text)
        word_count = len(text.split())
        has_code = self._contains_code(text)
        is_multilingual = self._is_multilingual(text)

        # Model selection logic
        if has_code and text_length <= 512 * 4:  # Within EmbeddingGemma limits
            return "embeddinggemma:latest"
        elif text_length > 1000 * 4:  # Long text
            return "nomic-embed-text"
        elif is_multilingual:
            return "mxbai-embed-large"
        else:
            return "embeddinggemma:latest"  # Default

    def _select_by_content_type(self, content_type: str) -> str:
        """Select model based on content type."""
        type_mapping = {
            "code": "embeddinggemma:latest",
            "documentation": "nomic-embed-text",
            "multilingual": "mxbai-embed-large",
            "general": "embeddinggemma:latest"
        }
        return type_mapping.get(content_type, "embeddinggemma:latest")

    def _contains_code(self, text: str) -> bool:
        """Detect if text contains code."""
        code_indicators = ['def ', 'class ', 'import ', 'function', '()', '{}', '[]']
        return any(indicator in text for indicator in code_indicators)

    def _is_multilingual(self, text: str) -> bool:
        """Detect if text contains multiple languages."""
        # Simple heuristic - can be enhanced with language detection
        non_ascii_chars = sum(1 for char in text if ord(char) > 127)
        return non_ascii_chars > len(text) * 0.1  # 10% non-ASCII threshold
```

### 2. Chunking Optimization

**Challenge**: Poor chunking reduces embedding quality and retrieval accuracy.

**Solution**: Semantic-aware chunking with context preservation.

```python
class SemanticChunker:
    """Advanced chunking with semantic boundary detection."""

    def __init__(self, tokenizer_service):
        self.tokenizer = tokenizer_service
        self.overlap_ratio = 0.15  # 15% overlap

    def chunk_text_semantic(self, text: str, model: str) -> list[dict]:
        """Chunk text using semantic boundaries."""
        max_tokens = self.tokenizer.get_max_tokens(model)
        optimal_tokens = int(max_tokens * 0.8)  # 80% safety margin

        # Split by semantic boundaries (paragraphs, sentences)
        semantic_units = self._split_by_semantic_boundaries(text)

        chunks = []
        current_chunk = ""
        current_tokens = 0

        for unit in semantic_units:
            unit_tokens = self.tokenizer.estimate_tokens_accurate(unit, model)

            # If adding this unit would exceed limits, finalize current chunk
            if current_tokens + unit_tokens > optimal_tokens and current_chunk:
                chunks.append(self._create_chunk(current_chunk, model))

                # Start new chunk with overlap
                overlap_text = self._get_overlap_text(current_chunk, model)
                current_chunk = overlap_text + unit
                current_tokens = self.tokenizer.estimate_tokens_accurate(current_chunk, model)
            else:
                current_chunk += unit
                current_tokens += unit_tokens

        # Add final chunk
        if current_chunk:
            chunks.append(self._create_chunk(current_chunk, model))

        return chunks

    def _split_by_semantic_boundaries(self, text: str) -> list[str]:
        """Split text by semantic boundaries (paragraphs, sentences)."""
        # Split by paragraphs first
        paragraphs = text.split('\n\n')

        units = []
        for paragraph in paragraphs:
            if len(paragraph.strip()) == 0:
                continue

            # Split long paragraphs by sentences
            sentences = self._split_by_sentences(paragraph)
            units.extend(sentences)

        return units

    def _split_by_sentences(self, text: str) -> list[str]:
        """Split text by sentence boundaries."""
        import re

        # Simple sentence splitting - can be enhanced with NLP libraries
        sentence_endings = r'[.!?]+'
        sentences = re.split(sentence_endings, text)

        # Reattach punctuation
        result = []
        for i, sentence in enumerate(sentences):
            if sentence.strip():
                if i < len(sentences) - 1:
                    # Find the punctuation that was split off
                    match = re.search(sentence_endings, text[text.find(sentence) + len(sentence):])
                    if match:
                        sentence += match.group()
                result.append(sentence.strip())

        return result

    def _get_overlap_text(self, chunk: str, model: str) -> str:
        """Get overlap text from the end of a chunk."""
        max_overlap_tokens = int(self.tokenizer.get_max_tokens(model) * self.overlap_ratio)

        # Binary search for optimal overlap
        left, right = 0, len(chunk)
        best_overlap = ""

        while left <= right:
            mid = (left + right) // 2
            overlap_text = chunk[-mid:] if mid > 0 else ""
            overlap_tokens = self.tokenizer.estimate_tokens_accurate(overlap_text, model)

            if overlap_tokens <= max_overlap_tokens:
                best_overlap = overlap_text
                left = mid + 1
            else:
                right = mid - 1

        return best_overlap + "\n\n"  # Add separator

    def _create_chunk(self, text: str, model: str) -> dict:
        """Create a chunk dictionary with metadata."""
        return {
            'text': text.strip(),
            'tokens': self.tokenizer.estimate_tokens_accurate(text, model),
            'model': model,
            'timestamp': time.time()
        }
```

## Scalability Optimization

### 1. Distributed Processing

**Challenge**: Single-node processing limits scalability.

**Solution**: Implement distributed embedding generation.

```python
class DistributedEmbeddingProcessor:
    """Distributed embedding processor for large-scale processing."""

    def __init__(self, worker_nodes: list[str]):
        self.worker_nodes = worker_nodes
        self.current_node_index = 0

    async def process_distributed_batch(self, texts: list[str], model: str) -> list[list[float]]:
        """Process batch across multiple worker nodes."""
        # Split texts across worker nodes
        texts_per_node = len(texts) // len(self.worker_nodes)
        node_assignments = []

        for i, node in enumerate(self.worker_nodes):
            start_idx = i * texts_per_node
            end_idx = start_idx + texts_per_node if i < len(self.worker_nodes) - 1 else len(texts)
            node_assignments.append((node, texts[start_idx:end_idx]))

        # Process on each node concurrently
        tasks = []
        for node, node_texts in node_assignments:
            task = self._process_on_node(node, node_texts, model)
            tasks.append(task)

        # Collect results
        results = await asyncio.gather(*tasks)

        # Flatten results
        all_embeddings = []
        for node_results in results:
            all_embeddings.extend(node_results)

        return all_embeddings

    async def _process_on_node(self, node: str, texts: list[str], model: str) -> list[list[float]]:
        """Process texts on a specific worker node."""
        # Implementation would depend on your distributed architecture
        # This is a placeholder for the actual distributed processing logic
        pass
```

### 2. Streaming Processing

**Challenge**: Large datasets don't fit in memory.

**Solution**: Implement streaming processing for large-scale data.

```python
class StreamingEmbeddingProcessor:
    """Streaming processor for large-scale embedding generation."""

    def __init__(self, batch_size: int = 100, max_memory_mb: int = 1000):
        self.batch_size = batch_size
        self.max_memory_mb = max_memory_mb
        self.processed_count = 0

    async def process_stream(self, text_stream, model: str, output_stream):
        """Process streaming text data with memory management."""
        batch = []
        current_memory_mb = 0

        async for text in text_stream:
            batch.append(text)
            current_memory_mb += len(text.encode()) / (1024 * 1024)

            # Process batch when it reaches size or memory limit
            if len(batch) >= self.batch_size or current_memory_mb >= self.max_memory_mb:
                embeddings = await self._process_batch(batch, model)

                # Stream results
                for embedding in embeddings:
                    await output_stream.put(embedding)

                # Reset batch
                batch = []
                current_memory_mb = 0
                self.processed_count += len(embeddings)

        # Process remaining items
        if batch:
            embeddings = await self._process_batch(batch, model)
            for embedding in embeddings:
                await output_stream.put(embedding)
            self.processed_count += len(embeddings)

    async def _process_batch(self, batch: list[str], model: str) -> list[list[float]]:
        """Process a single batch of texts."""
        # Implementation would use your embedding service
        pass
```

## Monitoring and Optimization

### 1. Performance Monitoring

```python
class EmbeddingPerformanceMonitor:
    """Monitor and optimize embedding performance."""

    def __init__(self):
        self.metrics = {
            'requests': 0,
            'errors': 0,
            'total_latency': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'throughput_history': []
        }

    def record_request(self, latency_ms: float, success: bool, cache_hit: bool):
        """Record performance metrics for a request."""
        self.metrics['requests'] += 1
        self.metrics['total_latency'] += latency_ms

        if success:
            if cache_hit:
                self.metrics['cache_hits'] += 1
            else:
                self.metrics['cache_misses'] += 1
        else:
            self.metrics['errors'] += 1

    def get_performance_summary(self) -> dict:
        """Get current performance summary."""
        if self.metrics['requests'] == 0:
            return {}

        avg_latency = self.metrics['total_latency'] / self.metrics['requests']
        error_rate = self.metrics['errors'] / self.metrics['requests']
        cache_hit_rate = self.metrics['cache_hits'] / (self.metrics['cache_hits'] + self.metrics['cache_misses'])

        return {
            'total_requests': self.metrics['requests'],
            'average_latency_ms': avg_latency,
            'error_rate': error_rate,
            'cache_hit_rate': cache_hit_rate,
            'throughput_per_second': self.metrics['requests'] / (self.metrics['total_latency'] / 1000)
        }

    def get_optimization_recommendations(self) -> list[str]:
        """Get recommendations for performance optimization."""
        recommendations = []
        summary = self.get_performance_summary()

        if summary.get('error_rate', 0) > 0.05:  # 5% error rate
            recommendations.append("High error rate detected - check system resources and retry logic")

        if summary.get('cache_hit_rate', 0) < 0.3:  # 30% cache hit rate
            recommendations.append("Low cache hit rate - consider increasing cache size or improving cache keys")

        if summary.get('average_latency_ms', 0) > 1000:  # 1 second
            recommendations.append("High latency detected - consider concurrent processing or model optimization")

        return recommendations
```

## Best Practices Summary

### ✅ Performance Optimization

1. **Use concurrent processing** with proper resource management
2. **Implement intelligent caching** with semantic similarity detection
3. **Optimize batch sizes** based on content characteristics
4. **Apply rate limiting** to prevent system overload
5. **Monitor performance metrics** continuously
6. **Use connection pooling** for better resource utilization

### ✅ Quality Optimization

1. **Select appropriate models** based on content type
2. **Use semantic chunking** with context preservation
3. **Implement overlap strategies** for better continuity
4. **Validate embedding quality** with similarity metrics
5. **Use model-specific optimizations** when available

### ✅ Scalability Optimization

1. **Implement distributed processing** for large-scale operations
2. **Use streaming processing** for memory-efficient operations
3. **Apply horizontal scaling** strategies
4. **Monitor resource usage** and scale accordingly
5. **Implement graceful degradation** under high load

## Conclusion

Embedding optimization requires a multi-faceted approach that balances performance, quality, and scalability. By implementing these strategies systematically, you can achieve significant improvements in throughput, accuracy, and resource utilization.

The key is to start with the most impactful optimizations (concurrent processing, caching) and then add more sophisticated techniques (semantic chunking, distributed processing) as your system grows and requirements become more complex.

Remember to monitor performance continuously and adapt your optimization strategies based on real-world usage patterns and system behavior.
