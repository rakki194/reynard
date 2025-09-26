"""Optimized Search Service
=======================

High-performance search service with intelligent caching, connection pooling,
and comprehensive optimization features enabled by default.
"""

import asyncio
import contextlib
import hashlib
import json
import logging
import time
from pathlib import Path
from typing import Any

import aiohttp
import numpy as np

# Import embedding service instead of direct sentence transformers
from app.services.rag.services.core.embedding import EmbeddingService

# Import optimization modules - enabled by default
try:
    from app.core.cache_optimizer import CacheManager
    from app.core.optimization_config import (
        get_cache_config,
        get_http_config,
    )

    OPTIMIZATION_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("✅ Optimization modules imported successfully")
except ImportError as e:
    logger = logging.getLogger(__name__)
    logger.warning("⚠️ Optimization modules not available: %s", e)
    CacheManager = None
    OPTIMIZATION_AVAILABLE = False

from .models import (
    HybridSearchRequest,
    IndexRequest,
    IndexResponse,
    QuerySuggestion,
    SearchResponse,
    SearchResult,
    SemanticSearchRequest,
    SuggestionsResponse,
    SyntaxSearchRequest,
)

logger = logging.getLogger(__name__)


class SearchMetrics:
    """Performance metrics for search operations."""

    def __init__(self):
        self.total_searches = 0
        self.cache_hits = 0
        self.cache_misses = 0
        self.total_search_time = 0.0
        self.avg_search_time = 0.0
        self.cache_hit_rate = 0.0

    def record_search(self, search_time: float, cache_hit: bool = False):
        """Record a search operation."""
        self.total_searches += 1
        self.total_search_time += search_time
        self.avg_search_time = self.total_search_time / self.total_searches

        if cache_hit:
            self.cache_hits += 1
        else:
            self.cache_misses += 1

        if self.total_searches > 0:
            self.cache_hit_rate = self.cache_hits / self.total_searches

    def get_metrics(self) -> dict[str, Any]:
        """Get current metrics."""
        return {
            "total_searches": self.total_searches,
            "cache_hits": self.cache_hits,
            "cache_misses": self.cache_misses,
            "avg_search_time_ms": round(self.avg_search_time * 1000, 2),
            "cache_hit_rate": round(self.cache_hit_rate * 100, 2),
            "total_search_time": round(self.total_search_time, 2),
        }


class OptimizedSearchService:
    """Optimized search service with intelligent caching and performance monitoring.

    Features:
    - Redis-based intelligent caching with compression
    - HTTP connection pooling for external requests
    - Performance metrics and monitoring
    - Parallel processing for hybrid searches
    - Fallback mechanisms for reliability
    """

    def __init__(self):
        """Initialize the optimized search service."""
        # Embedding service for generating embeddings
        self._embedding_service: EmbeddingService | None = None

        # Performance metrics
        self._metrics = SearchMetrics()

        # Cache system - Redis only, no legacy fallback

        # Connection pooling for HTTP requests - configured by default
        self._http_session: aiohttp.ClientSession | None = None
        if OPTIMIZATION_AVAILABLE:
            http_config = get_http_config()
            self._session_connector = aiohttp.TCPConnector(
                limit=http_config["connection_limit"],
                limit_per_host=http_config["connection_limit_per_host"],
                ttl_dns_cache=http_config["dns_cache_ttl"],
                use_dns_cache=http_config["enable_dns_cache"],
            )
            self._timeout_seconds = http_config["timeout_seconds"]
        else:
            # Fallback configuration
            self._session_connector = aiohttp.TCPConnector(
                limit=100,
                limit_per_host=30,
                ttl_dns_cache=300,
                use_dns_cache=True,
            )
            self._timeout_seconds = 30

    async def initialize(self) -> bool:
        """Initialize the optimized search service."""
        try:
            # Initialize HTTP session with connection pooling
            self._http_session = aiohttp.ClientSession(
                connector=self._session_connector,
                timeout=aiohttp.ClientTimeout(total=self._timeout_seconds),
            )

            # Initialize optimization components - enabled by default
            if OPTIMIZATION_AVAILABLE:
                try:
                    # Get cache configuration
                    cache_config = get_cache_config()

                    if cache_config["enabled"]:
                        # Initialize Redis cache manager with optimized settings
                        self._cache_manager = CacheManager(
                            redis_url=cache_config["redis_url"],
                            max_connections=cache_config["max_connections"],
                            default_ttl=cache_config["default_ttl"],
                            enable_metrics=cache_config["enable_metrics"],
                            compression_threshold=cache_config["compression_threshold"],
                        )
                        await self._cache_manager.initialize()
                        logger.info(
                            "✅ Redis cache manager initialized successfully with optimized settings",
                        )
                    else:
                        logger.info("ℹ️ Cache optimization disabled by configuration")

                    # Initialize database connection (if needed)
                    # self._db_connection = OptimizedDatabaseConnection("postgresql+asyncpg://...")
                    # await self._db_connection.initialize()

                except Exception as e:
                    logger.warning(
                        "⚠️ Failed to initialize optimization components: %s",
                        e,
                    )
                    if cache_config.get("fallback_to_legacy", True):
                        logger.info("Continuing with legacy caching")
                    else:
                        raise
            else:
                logger.warning(
                    "⚠️ Optimization components not available - using legacy implementation",
                )

            # Initialize embedding service with AI service
            from app.core.service_registry import get_service_registry

            service_registry = get_service_registry()
            ai_service = service_registry.get_service_instance("ai_service")

            self._embedding_service = EmbeddingService(ai_service)
            # Get embedding configuration
            embedding_config = {
                "rag_enabled": True,
                "embedding_backends": {
                    "enabled": True,
                    "allow_fallback": True,
                    "default_backend": "ollama",
                    "mock_mode": False,
                },
            }
            await self._embedding_service.initialize()

            # Test RAG backend connection (non-blocking)
            self._rag_connection_task = asyncio.create_task(self._test_rag_connection())

            logger.info("✅ Optimized search service initialized successfully")
        except Exception:
            logger.exception("Failed to initialize search service")
        else:
            return True
        return False

    async def close(self):
        """Close the search service and cleanup resources."""
        try:
            # Cancel RAG connection task if it exists
            if hasattr(self, "_rag_connection_task"):
                self._rag_connection_task.cancel()
                with contextlib.suppress(asyncio.CancelledError):
                    await self._rag_connection_task

            if self._http_session:
                await self._http_session.close()

            if self._embedding_service:
                await self._embedding_service.close()

            if OPTIMIZATION_AVAILABLE and hasattr(self, "_cache_manager"):
                await self._cache_manager.close()

            logger.info("✅ Search service closed successfully")
        except Exception:
            logger.exception("❌ Error closing search service")

    def _generate_cache_key(
        self,
        request: SemanticSearchRequest | SyntaxSearchRequest | HybridSearchRequest,
        search_type: str,
    ) -> str:
        """Generate a cache key for the request."""
        # Create a deterministic key based on request parameters
        key_data = {
            "type": search_type,
            "query": request.query,
            "limit": getattr(request, "max_results", 20),
            "threshold": getattr(request, "similarity_threshold", 0.7),
            "file_types": getattr(request, "file_types", None),
            "directories": getattr(request, "directories", None),
        }

        # Remove None values and sort for consistency
        key_data = {k: v for k, v in key_data.items() if v is not None}
        key_string = json.dumps(key_data, sort_keys=True)

        # Create hash for shorter key
        return f"search:{search_type}:{hashlib.sha256(key_string.encode()).hexdigest()}"

    async def _get_cached_result(self, cache_key: str) -> SearchResponse | None:
        """Get cached search result."""
        if OPTIMIZATION_AVAILABLE and hasattr(self, "_cache_manager"):
            try:
                cached_data = await self._cache_manager.get(cache_key)
                if cached_data:
                    # Deserialize the cached SearchResponse
                    return SearchResponse(**cached_data)
            except Exception as e:
                logger.warning("Cache retrieval failed: %s", e)

        # No legacy cache fallback - Redis only
        return None

    async def _cache_result(
        self,
        cache_key: str,
        result: SearchResponse,
        ttl: int = 3600,
    ):
        """Cache search result."""
        if OPTIMIZATION_AVAILABLE and hasattr(self, "_cache_manager"):
            try:
                # Serialize the SearchResponse for caching
                cache_data = result.dict()
                await self._cache_manager.set(cache_key, cache_data, ttl=ttl)
            except Exception as e:
                logger.warning(f"Cache storage failed: {e}")

        # No legacy cache fallback - Redis only

    async def _test_rag_connection(self):
        """Test RAG backend connection (non-blocking)."""
        try:
            if self._http_session:
                async with self._http_session.get(
                    "http://localhost:8001/health",
                    timeout=5,
                ) as response:
                    if response.status == 200:
                        logger.info("✅ RAG backend connection successful")
                    else:
                        logger.warning(
                            f"RAG backend health check failed: {response.status}",
                        )
        except Exception as e:
            logger.debug(f"RAG backend not available: {e}")

    async def _search_via_rag(self, request: SemanticSearchRequest) -> dict[str, Any]:
        """Search via RAG backend."""
        try:
            if not self._http_session:
                return {"success": False, "error": "HTTP session not available"}

            payload = {
                "query": request.query,
                "limit": request.max_results,
                "threshold": request.similarity_threshold,
                "file_types": request.file_types,
                "directories": request.directories,
            }

            async with self._http_session.post(
                "http://localhost:8001/api/rag/query",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=10),
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    return {"success": True, "data": result}
                return {
                    "success": False,
                    "error": f"RAG service returned status {response.status}",
                }

        except Exception as e:
            return {"success": False, "error": f"RAG service not available: {e}"}

    def _format_rag_response(
        self,
        rag_result: dict[str, Any],
        query: str,
        start_time: float,
    ) -> SearchResponse:
        """Format RAG response as SearchResponse."""
        try:
            data = rag_result["data"]
            results = []

            for item in data.get("results", []):
                results.append(
                    SearchResult(
                        file_path=item.get("file_path", ""),
                        content=item.get("content", ""),
                        score=item.get("score", 0.0),
                        line_number=item.get("line_number", 0),
                        match_type="rag",
                        context=item.get("context", ""),
                    ),
                )

            return SearchResponse(
                success=True,
                query=query,
                total_results=len(results),
                results=results,
                search_time=time.time() - start_time,
                search_strategies=["rag"],
            )
        except Exception as e:
            logger.error(f"Failed to format RAG response: {e}")
            return SearchResponse(
                success=False,
                query=query,
                total_results=0,
                results=[],
                search_time=time.time() - start_time,
                error=str(e),
            )

    async def _local_semantic_search(
        self,
        request: SemanticSearchRequest,
        start_time: float,
    ) -> SearchResponse:
        """Perform local semantic search using embedding service."""
        try:
            # Check if embedding service is available
            if not self._embedding_service:
                return SearchResponse(
                    success=False,
                    query=request.query,
                    total_results=0,
                    results=[],
                    search_time=time.time() - start_time,
                    error="Embedding service not available",
                )

            # Get relevant files
            files = await self._get_relevant_files(
                request.file_types,
                request.directories,
            )
            if not files:
                return SearchResponse(
                    success=True,
                    query=request.query,
                    total_results=0,
                    results=[],
                    search_time=time.time() - start_time,
                    search_strategies=["embedding_service"],
                )

            # Generate query embedding using the embedding service
            query_embedding_result = await self._embedding_service.generate_embeddings(
                [request.query],
            )
            if not query_embedding_result.success:
                return SearchResponse(
                    success=False,
                    query=request.query,
                    total_results=0,
                    results=[],
                    search_time=time.time() - start_time,
                    error=f"Failed to generate query embedding: {query_embedding_result.error}",
                )

            query_embedding = query_embedding_result.embeddings[0]

            # Process files in batches for better performance
            batch_size = 16  # Process 16 files at a time for optimal performance
            file_embeddings = []
            file_contents = []

            logger.info(
                f"Processing {len(files)} files in batches of {batch_size} for semantic search",
            )

            for i in range(0, len(files), batch_size):
                batch_files = files[i : i + batch_size]
                batch_contents = []
                batch_paths = []

                # Read batch of files
                for file_path in batch_files:
                    try:
                        with open(file_path, encoding="utf-8") as f:
                            content = f.read()
                            if len(content.strip()) > 0:
                                batch_contents.append(content)
                                batch_paths.append(file_path)
                    except Exception as e:
                        logger.debug(f"Could not read file {file_path}: {e}")
                        continue

                # Process batch with embeddings
                if batch_contents:
                    try:
                        # Generate embeddings for the entire batch using embedding service
                        batch_embeddings_result = (
                            await self._embedding_service.generate_embeddings(
                                batch_contents,
                            )
                        )
                        if not batch_embeddings_result.success:
                            logger.warning(
                                f"Failed to generate embeddings for batch {i // batch_size + 1}: {batch_embeddings_result.error}",
                            )
                            continue

                        # Store embeddings and content
                        for j, (file_path, content) in enumerate(
                            zip(batch_paths, batch_contents, strict=True),
                        ):
                            file_embeddings.append(
                                batch_embeddings_result.embeddings[j],
                            )
                            file_contents.append((file_path, content))

                    except Exception as e:
                        logger.warning(
                            f"Failed to process batch {i // batch_size + 1}: {e}",
                        )
                        continue

            if not file_embeddings:
                return SearchResponse(
                    success=True,
                    query=request.query,
                    total_results=0,
                    results=[],
                    search_time=time.time() - start_time,
                    search_strategies=["embedding_service"],
                )

            # Calculate similarities using vectorized operations for better performance
            similarities = []
            if file_embeddings:
                try:
                    # Convert to numpy arrays for vectorized operations
                    query_vec = np.array(query_embedding[0])

                    # Extract embeddings and ensure proper shape
                    embeddings_list = []
                    for emb in file_embeddings:
                        if hasattr(emb, "__len__") and len(emb) > 0:
                            embeddings_list.append(emb[0])
                        else:
                            embeddings_list.append(emb)

                    # Convert to 2D numpy array
                    file_embeddings_array = np.array(embeddings_list)

                    # Ensure we have the right shape
                    if file_embeddings_array.ndim == 1:
                        file_embeddings_array = file_embeddings_array.reshape(1, -1)

                    # Vectorized cosine similarity calculation
                    query_norm = np.linalg.norm(query_vec)
                    file_norms = np.linalg.norm(file_embeddings_array, axis=1)

                    # Calculate cosine similarities for all files at once
                    cosine_similarities = np.dot(file_embeddings_array, query_vec) / (
                        query_norm * file_norms
                    )

                    # Filter by threshold and create results
                    for i, similarity in enumerate(cosine_similarities):
                        # Ensure similarity is a scalar value - handle numpy arrays properly
                        try:
                            if hasattr(similarity, "item"):
                                sim_value = float(similarity.item())
                            elif isinstance(similarity, np.ndarray):
                                sim_value = float(similarity.flat[0])
                            elif (
                                hasattr(similarity, "__len__") and len(similarity) == 1
                            ):
                                sim_value = float(similarity[0])
                            else:
                                sim_value = float(similarity)
                        except (ValueError, TypeError) as conv_error:
                            logger.debug(
                                f"Failed to convert similarity to float: {conv_error}, skipping",
                            )
                            continue

                        if sim_value >= request.similarity_threshold:
                            similarities.append((sim_value, i))

                except Exception as e:
                    logger.warning(
                        f"Vectorized similarity calculation failed, falling back to loop: {e}",
                    )
                    # Fallback to loop-based calculation
                    for i, file_embedding in enumerate(file_embeddings):
                        similarity = np.dot(query_embedding[0], file_embedding[0]) / (
                            np.linalg.norm(query_embedding[0])
                            * np.linalg.norm(file_embedding[0])
                        )
                        # Ensure similarity is a scalar value
                        try:
                            if hasattr(similarity, "item"):
                                sim_value = float(similarity.item())
                            elif isinstance(similarity, np.ndarray):
                                sim_value = float(similarity.flat[0])
                            else:
                                sim_value = float(similarity)
                        except (ValueError, TypeError) as conv_error:
                            logger.debug(
                                f"Failed to convert similarity to float in fallback: {conv_error}, skipping",
                            )
                            continue

                        if sim_value >= request.similarity_threshold:
                            similarities.append((sim_value, i))

            # Sort by similarity
            similarities.sort(key=lambda x: x[0], reverse=True)

            # Format results
            results = []
            for similarity, idx in similarities[: request.max_results]:
                file_path, content = file_contents[idx]
                results.append(
                    SearchResult(
                        file_path=str(file_path),
                        content=(
                            content[:500] + "..." if len(content) > 500 else content
                        ),
                        score=float(similarity),
                        line_number=0,
                        match_type="semantic",
                        context=(
                            content[:200] + "..." if len(content) > 200 else content
                        ),
                    ),
                )

            return SearchResponse(
                success=True,
                query=request.query,
                total_results=len(results),
                results=results,
                search_time=time.time() - start_time,
                search_strategies=["sentence_transformer"],
            )

        except Exception as e:
            logger.exception("Local semantic search failed")
            return SearchResponse(
                success=False,
                query=request.query,
                total_results=0,
                results=[],
                search_time=time.time() - start_time,
                error=str(e),
            )

    async def semantic_search(self, request: SemanticSearchRequest) -> SearchResponse:
        """Perform optimized semantic search using vector embeddings with caching."""
        start_time = time.time()
        cache_key = self._generate_cache_key(request, "semantic")

        try:
            # Check cache first
            cached_result = await self._get_cached_result(cache_key)
            if cached_result:
                self._metrics.record_search(time.time() - start_time, cache_hit=True)
                logger.debug("Cache hit for semantic search: %s...", request.query[:50])
                return cached_result

            # Try RAG backend first
            rag_result = await self._search_via_rag(request)
            if rag_result.get("success"):
                result = self._format_rag_response(
                    rag_result,
                    request.query,
                    start_time,
                )
                # Only cache successful results, not errors
                if result.success:
                    # Cache with configured TTL
                    if OPTIMIZATION_AVAILABLE:
                        from app.core.optimization_config import get_search_config

                        search_config = get_search_config()
                        cache_ttl = search_config["cache_ttl_semantic"]
                    else:
                        cache_ttl = 3600  # 1 hour fallback
                    await self._cache_result(cache_key, result, ttl=cache_ttl)
                self._metrics.record_search(time.time() - start_time, cache_hit=False)
                return result
            if "RAG service not available" in str(rag_result.get("error", "")):
                logger.info("RAG service not available, using local search")

            # Fallback to local semantic search
            result = await self._local_semantic_search(request, start_time)
            # Only cache successful results, not errors
            if result.success:
                # Cache with configured TTL
                if OPTIMIZATION_AVAILABLE:
                    from app.core.optimization_config import get_search_config

                    search_config = get_search_config()
                    cache_ttl = search_config["cache_ttl_semantic"]
                else:
                    cache_ttl = 3600  # 1 hour fallback
                await self._cache_result(cache_key, result, ttl=cache_ttl)
            self._metrics.record_search(time.time() - start_time, cache_hit=False)
            return result

        except Exception as e:
            logger.exception("Semantic search failed")
            error_result = SearchResponse(
                success=False,
                query=request.query,
                total_results=0,
                results=[],
                search_time=time.time() - start_time,
                error=str(e),
            )
            self._metrics.record_search(time.time() - start_time, cache_hit=False)
            return error_result

    async def _get_relevant_files(
        self,
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
    ) -> list[Path]:
        """Get relevant files for search."""
        try:
            # Start from the project root
            project_root = Path(__file__).parent.parent.parent.parent.parent
            files = []

            # Define search directories
            search_dirs = (
                directories if directories else ["packages", "examples", "templates"]
            )

            for search_dir in search_dirs:
                dir_path = project_root / search_dir
                if dir_path.exists():
                    # Define file extensions
                    extensions = (
                        file_types
                        if file_types
                        else [".py", ".ts", ".tsx", ".js", ".jsx", ".md"]
                    )

                    for ext in extensions:
                        pattern = f"**/*{ext}"
                        files.extend(dir_path.glob(pattern))

            # Filter out common directories to ignore
            ignore_dirs = {
                "__pycache__",
                "node_modules",
                ".git",
                ".venv",
                "venv",
                "dist",
                "build",
            }
            filtered_files = []

            for file_path in files:
                if not any(ignore_dir in file_path.parts for ignore_dir in ignore_dirs):
                    filtered_files.append(file_path)

            return filtered_files

        except Exception as e:
            logger.error(f"Error getting relevant files: {e}")
            return []

    async def syntax_search(self, request: SyntaxSearchRequest) -> SearchResponse:
        """Perform optimized syntax search using ripgrep with caching."""
        start_time = time.time()
        cache_key = self._generate_cache_key(request, "syntax")

        try:
            # Check cache first
            cached_result = await self._get_cached_result(cache_key)
            if cached_result:
                self._metrics.record_search(time.time() - start_time, cache_hit=True)
                logger.debug("Cache hit for syntax search: %s...", request.query[:50])
                return cached_result

            # Get relevant files
            files = await self._get_relevant_files(
                request.file_types,
                request.directories,
            )
            if not files:
                return SearchResponse(
                    success=True,
                    query=request.query,
                    total_results=0,
                    results=[],
                    search_time=time.time() - start_time,
                    search_strategies=["ripgrep"],
                )

            # Use ripgrep for syntax search
            import subprocess

            # Build ripgrep command
            cmd = ["rg", "--json", "--max-count", str(request.max_results)]

            if request.file_types:
                for file_type in request.file_types:
                    cmd.extend(["--type", file_type.replace(".", "")])

            if request.directories:
                cmd.extend(request.directories)
            else:
                cmd.extend(["packages", "examples", "templates"])

            cmd.append(request.query)

            # Execute ripgrep
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent.parent.parent.parent,
                check=False,
            )

            # Parse results
            results = []
            if result.returncode == 0:
                for line in result.stdout.strip().split("\n"):
                    if line:
                        try:
                            data = json.loads(line)
                            if data.get("type") == "match":
                                match_data = data.get("data", {})
                                path = match_data.get("path", {})
                                lines = match_data.get("lines", {})

                                results.append(
                                    SearchResult(
                                        file_path=path.get("text", ""),
                                        content=lines.get("text", ""),
                                        score=1.0,  # ripgrep doesn't provide scores
                                        line_number=match_data.get("line_number", 0),
                                        match_type="syntax",
                                        context=lines.get("text", ""),
                                    ),
                                )
                        except json.JSONDecodeError:
                            continue

            search_response = SearchResponse(
                success=True,
                query=request.query,
                total_results=len(results),
                results=results,
                search_time=time.time() - start_time,
                search_strategies=["ripgrep"],
            )

            # Cache the result with configured TTL
            if OPTIMIZATION_AVAILABLE:
                from app.core.optimization_config import get_search_config

                search_config = get_search_config()
                cache_ttl = search_config["cache_ttl_syntax"]
            else:
                cache_ttl = 1800  # 30 minutes fallback
            await self._cache_result(cache_key, search_response, ttl=cache_ttl)
            self._metrics.record_search(time.time() - start_time, cache_hit=False)
            return search_response

        except Exception as e:
            logger.exception("Syntax search failed")
            return SearchResponse(
                success=False,
                query=request.query,
                total_results=0,
                results=[],
                search_time=time.time() - start_time,
                error=str(e),
            )

    def _combine_search_results(
        self,
        semantic_response: SearchResponse,
        syntax_response: SearchResponse,
    ) -> SearchResponse:
        """Combine semantic and syntax search results."""
        try:
            # Combine results from both searches
            all_results = []

            # Add semantic results with adjusted scores
            for result in semantic_response.results:
                # Create new SearchResult with adjusted score
                adjusted_result = SearchResult(
                    file_path=result.file_path,
                    content=result.content,
                    score=result.score * 0.7,  # Weight semantic results
                    line_number=result.line_number,
                    match_type="semantic",
                    context=result.context,
                    snippet=result.snippet,
                    metadata=result.metadata,
                )
                all_results.append(adjusted_result)

            # Add syntax results with adjusted scores
            for result in syntax_response.results:
                # Create new SearchResult with adjusted score
                adjusted_result = SearchResult(
                    file_path=result.file_path,
                    content=result.content,
                    score=result.score * 0.3,  # Weight syntax results
                    line_number=result.line_number,
                    match_type="syntax",
                    context=result.context,
                    snippet=result.snippet,
                    metadata=result.metadata,
                )
                all_results.append(adjusted_result)

            # Remove duplicates based on file_path and content
            seen = set()
            unique_results = []
            for result in all_results:
                key = (
                    result.file_path,
                    result.content[:100],
                )  # Use first 100 chars for deduplication
                if key not in seen:
                    seen.add(key)
                    unique_results.append(result)

            # Sort by score
            unique_results.sort(key=lambda x: x.score, reverse=True)

            # Calculate combined search time
            combined_time = max(
                semantic_response.search_time,
                syntax_response.search_time,
            )

            return SearchResponse(
                success=True,
                query=semantic_response.query,
                total_results=len(unique_results),
                results=unique_results,
                search_time=combined_time,
                search_strategies=["semantic", "syntax", "hybrid"],
            )

        except Exception as e:
            logger.error(f"Failed to combine search results: {e}")
            # Return the better of the two responses
            if semantic_response.success and syntax_response.success:
                return (
                    semantic_response
                    if len(semantic_response.results) > len(syntax_response.results)
                    else syntax_response
                )
            if semantic_response.success:
                return semantic_response
            if syntax_response.success:
                return syntax_response
            return SearchResponse(
                success=False,
                query=semantic_response.query,
                total_results=0,
                results=[],
                search_time=time.time(),
                error="Both semantic and syntax searches failed",
            )

    async def hybrid_search(self, request: HybridSearchRequest) -> SearchResponse:
        """Perform optimized hybrid search combining semantic and syntax search with caching."""
        start_time = time.time()
        cache_key = self._generate_cache_key(request, "hybrid")

        try:
            # Check cache first
            cached_result = await self._get_cached_result(cache_key)
            if cached_result:
                self._metrics.record_search(time.time() - start_time, cache_hit=True)
                logger.debug("Cache hit for hybrid search: %s...", request.query[:50])
                return cached_result

            # Create requests for both search types
            semantic_request = SemanticSearchRequest(
                query=request.query,
                max_results=request.max_results,
                similarity_threshold=request.similarity_threshold,
                file_types=request.file_types,
                directories=request.directories,
            )

            syntax_request = SyntaxSearchRequest(
                query=request.query,
                max_results=request.max_results,
                file_types=request.file_types,
                directories=request.directories,
            )

            # Run both searches in parallel
            semantic_task = asyncio.create_task(self.semantic_search(semantic_request))
            syntax_task = asyncio.create_task(self.syntax_search(syntax_request))

            # Wait for both to complete
            semantic_response, syntax_response = await asyncio.gather(
                semantic_task,
                syntax_task,
                return_exceptions=True,
            )

            # Handle exceptions from parallel tasks
            if isinstance(semantic_response, Exception):
                logger.error(f"Semantic search failed: {semantic_response}")
                semantic_response = SearchResponse(
                    success=False,
                    query=request.query,
                    total_results=0,
                    results=[],
                    search_time=0,
                    error=str(semantic_response),
                )

            if isinstance(syntax_response, Exception):
                logger.error(f"Syntax search failed: {syntax_response}")
                syntax_response = SearchResponse(
                    success=False,
                    query=request.query,
                    total_results=0,
                    results=[],
                    search_time=0,
                    error=str(syntax_response),
                )

            # Combine results
            search_response = self._combine_search_results(
                semantic_response,
                syntax_response,
            )

            # Cache the result with configured TTL
            if OPTIMIZATION_AVAILABLE:
                from app.core.optimization_config import get_search_config

                search_config = get_search_config()
                cache_ttl = search_config["cache_ttl_hybrid"]
            else:
                cache_ttl = 1800  # 30 minutes fallback
            await self._cache_result(cache_key, search_response, ttl=cache_ttl)
            self._metrics.record_search(time.time() - start_time, cache_hit=False)
            return search_response

        except Exception as e:
            logger.exception("Hybrid search failed")
            return SearchResponse(
                success=False,
                query=request.query,
                total_results=0,
                results=[],
                search_time=time.time() - start_time,
                error=str(e),
            )

    async def index_codebase(self, request: IndexRequest) -> IndexResponse:
        """Index the codebase for search with batch processing."""
        start_time = time.time()

        try:
            # Get relevant files
            files = await self._get_relevant_files(
                request.file_types,
                request.directories,
            )

            # Check if embedding service is available
            if not self._embedding_service:
                return IndexResponse(
                    success=False,
                    indexed_files=0,
                    total_chunks=0,
                    index_time=time.time() - start_time,
                    model_used="embedding_service",
                    error="Embedding service not available",
                )

            # Process files in batches for better performance
            indexed_files = 0
            total_chunks = 0
            batch_size = 16  # Process 16 files at a time for optimal performance
            chunk_size = request.chunk_size or 512

            logger.info(
                f"Starting batch indexing of {len(files)} files with batch size {batch_size}",
            )

            for i in range(0, len(files), batch_size):
                batch_files = files[i : i + batch_size]
                batch_contents = []
                batch_paths = []

                # Read batch of files
                for file_path in batch_files:
                    try:
                        with open(file_path, encoding="utf-8") as f:
                            content = f.read()
                            if len(content.strip()) > 0:
                                batch_contents.append(content)
                                batch_paths.append(file_path)

                                # Calculate chunks for this file
                                file_chunks = max(1, len(content) // chunk_size)
                                total_chunks += file_chunks
                    except Exception as e:
                        logger.debug(f"Could not read file {file_path}: {e}")
                        continue

                # Process batch with embeddings
                if batch_contents:
                    try:
                        # Generate embeddings for the entire batch using embedding service
                        batch_embeddings_result = (
                            await self._embedding_service.generate_embeddings(
                                batch_contents,
                            )
                        )
                        if batch_embeddings_result.success:
                            indexed_files += len(batch_contents)
                        else:
                            logger.warning(
                                f"Failed to generate embeddings for batch {i // batch_size + 1}: {batch_embeddings_result.error}",
                            )

                        # Log progress
                        if (i + batch_size) % (batch_size * 10) == 0:
                            logger.info(
                                f"Indexed {i + len(batch_contents)}/{len(files)} files",
                            )

                    except Exception as e:
                        logger.warning(
                            f"Failed to process batch {i // batch_size + 1}: {e}",
                        )
                        continue

            index_time = time.time() - start_time
            logger.info(
                f"Indexing completed: {indexed_files} files, {total_chunks} chunks in {index_time:.2f}s",
            )

            return IndexResponse(
                success=True,
                indexed_files=indexed_files,
                total_chunks=total_chunks,
                index_time=index_time,
                model_used="embedding_service",
            )

        except Exception as e:
            logger.exception("Indexing failed")
            index_time = time.time() - start_time
            return IndexResponse(
                success=False,
                indexed_files=0,
                total_chunks=0,
                index_time=index_time,
                model_used="embedding_service",
                error=str(e),
            )

    async def get_search_stats(self) -> dict[str, Any]:
        """Get search statistics."""
        try:
            stats = {
                "search_count": self._metrics.total_searches,
                "avg_search_time": self._metrics.avg_search_time,
                "cache_hit_rate": self._metrics.cache_hit_rate,
                "total_search_time": self._metrics.total_search_time,
                "embedding_service_available": self._embedding_service is not None,
                "cache_size": 0,  # Redis only, no local cache
                "optimization_available": OPTIMIZATION_AVAILABLE,
            }

            # Add cache manager stats if available
            if OPTIMIZATION_AVAILABLE and hasattr(self, "_cache_manager"):
                try:
                    # Get cache stats if the method exists
                    if hasattr(self._cache_manager, "get_stats"):
                        cache_stats = await self._cache_manager.get_stats()
                        stats["cache_manager_stats"] = cache_stats
                except Exception as e:
                    logger.debug(f"Could not get cache manager stats: {e}")

            return stats

        except Exception as e:
            logger.error(f"Failed to get search stats: {e}")
            return {
                "search_count": 0,
                "avg_search_time": 0,
                "cache_hit_rate": 0,
                "total_search_time": 0,
                "embedding_service_available": False,
                "cache_size": 0,  # Redis only, no local cache
                "optimization_available": OPTIMIZATION_AVAILABLE,
                "error": str(e),
            }

    def get_performance_metrics(self) -> dict[str, Any]:
        """Get detailed performance metrics."""
        return {
            "search_metrics": self._metrics.get_metrics(),
            "cache_status": {
                "redis_available": OPTIMIZATION_AVAILABLE
                and hasattr(self, "_cache_manager"),
                "legacy_cache_size": 0,  # Redis only, no legacy cache
                "cache_max_size": 0,  # Redis only, no local cache
            },
            "optimization_status": {
                "optimization_available": OPTIMIZATION_AVAILABLE,
                "http_connection_pooling": self._http_session is not None,
                "embedding_service_available": self._embedding_service is not None,
            },
        }

    async def clear_cache(self) -> dict[str, Any]:
        """Clear all caches."""
        try:
            cleared_count = 0

            # Clear Redis cache if available
            if OPTIMIZATION_AVAILABLE and hasattr(self, "_cache_manager"):
                try:
                    # Clear the search namespace
                    await self._cache_manager.clear_namespace("search")
                    cleared_count += 1
                except Exception as e:
                    logger.warning(f"Failed to clear Redis cache: {e}")

            # No legacy cache to clear - Redis only

            return {
                "success": True,
                "cleared_caches": cleared_count,
                "message": f"Cleared {cleared_count} cache(s)",
            }

        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    async def get_query_suggestions(
        self,
        query: str,
        limit: int = 5,
    ) -> SuggestionsResponse:
        """Get query suggestions based on the input query."""
        try:
            suggestions = []

            # Generate code-related suggestions
            code_suggestions = self._generate_code_suggestions(query)
            suggestions.extend(code_suggestions)

            # Generate synonym suggestions
            synonym_suggestions = self._generate_synonym_suggestions(query)
            suggestions.extend(synonym_suggestions)

            # Limit and format suggestions
            limited_suggestions = suggestions[:limit]
            suggestion_objects = [
                QuerySuggestion(
                    suggestion=suggestion["text"],
                    type=suggestion["type"],
                    confidence=suggestion["confidence"],
                )
                for suggestion in limited_suggestions
            ]

            return SuggestionsResponse(
                success=True,
                query=query,
                suggestions=suggestion_objects,
                total_suggestions=len(suggestion_objects),
            )

        except Exception as e:
            logger.error(f"Failed to get query suggestions: {e}")
            return SuggestionsResponse(
                success=False,
                query=query,
                suggestions=[],
                total_suggestions=0,
                error=str(e),
            )

    def _generate_code_suggestions(self, query: str) -> list[dict[str, Any]]:
        """Generate code-related suggestions."""
        suggestions = []

        # Common programming terms
        code_terms = {
            "function": ["method", "procedure", "routine", "handler"],
            "class": ["object", "type", "entity", "model"],
            "variable": ["var", "parameter", "argument", "field"],
            "import": ["include", "require", "use", "from"],
            "export": ["return", "yield", "output", "result"],
            "async": ["await", "promise", "future", "coroutine"],
            "error": ["exception", "fault", "bug", "issue"],
            "test": ["spec", "unit", "integration", "e2e"],
        }

        query_lower = query.lower()
        for term, related in code_terms.items():
            if term in query_lower:
                for related_term in related:
                    suggestions.append(
                        {
                            "text": query.replace(term, related_term),
                            "type": "code_synonym",
                            "confidence": 0.8,
                        },
                    )

        return suggestions

    def _generate_synonym_suggestions(self, query: str) -> list[dict[str, Any]]:
        """Generate synonym-based suggestions."""
        suggestions = []

        # Simple synonym mapping
        synonyms = {
            "find": ["search", "locate", "discover", "detect"],
            "search": ["find", "look", "seek", "query"],
            "get": ["fetch", "retrieve", "obtain", "acquire"],
            "create": ["make", "build", "generate", "construct"],
            "update": ["modify", "change", "edit", "revise"],
            "delete": ["remove", "destroy", "eliminate", "clear"],
        }

        words = query.lower().split()
        for word in words:
            if word in synonyms:
                for synonym in synonyms[word]:
                    new_query = query.replace(word, synonym)
                    suggestions.append(
                        {
                            "text": new_query,
                            "type": "synonym",
                            "confidence": 0.7,
                        },
                    )

        return suggestions


# Backward compatibility alias
SearchService = OptimizedSearchService
