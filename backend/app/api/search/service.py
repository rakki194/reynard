"""
Optimized Search Service
=======================

High-performance search service with intelligent caching, connection pooling,
and comprehensive optimization features enabled by default.
"""

import asyncio
import hashlib
import json
import logging
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import aiohttp
import numpy as np
from sentence_transformers import SentenceTransformer

# Import BM25 for fallback
try:
    from rank_bm25 import BM25Okapi

    BM25_AVAILABLE = True
except ImportError:
    BM25Okapi = None
    BM25_AVAILABLE = False

# Import optimization modules - enabled by default
try:
    from app.core.cache_optimizer import IntelligentCacheManager
    from app.core.database_optimizer import (
        DatabasePerformanceMonitor,
        OptimizedDatabaseConnection,
    )
    from app.core.optimization_config import (
        get_cache_config,
        get_http_config,
        get_optimization_config,
    )

    OPTIMIZATION_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("✅ Optimization modules imported successfully")
except ImportError as e:
    logger = logging.getLogger(__name__)
    logger.warning("⚠️ Optimization modules not available: %s", e)
    IntelligentCacheManager = None
    OptimizedDatabaseConnection = None
    DatabasePerformanceMonitor = None
    OPTIMIZATION_AVAILABLE = False

from .models import (
    HybridSearchRequest,
    IndexRequest,
    IndexResponse,
    QuerySuggestion,
    SearchRequest,
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

    def get_metrics(self) -> Dict[str, Any]:
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
    """
    Optimized search service with intelligent caching and performance monitoring.

    Features:
    - Redis-based intelligent caching with compression
    - HTTP connection pooling for external requests
    - Performance metrics and monitoring
    - Parallel processing for hybrid searches
    - Fallback mechanisms for reliability
    """

    def __init__(self):
        """Initialize the optimized search service."""
        # Model management
        self._models: Dict[str, Any] = {}
        self._default_model = "all-MiniLM-L6-v2"

        # Performance metrics
        self._metrics = SearchMetrics()

        # Legacy cache for backward compatibility
        self._search_cache: Dict[str, Any] = {}
        self._cache_max_size = 1000

        # Connection pooling for HTTP requests - configured by default
        self._http_session: Optional[aiohttp.ClientSession] = None
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
                        self._cache_manager = IntelligentCacheManager(
                            redis_url=cache_config["redis_url"],
                            max_connections=cache_config["max_connections"],
                            default_ttl=cache_config["default_ttl"],
                            enable_metrics=cache_config["enable_metrics"],
                            compression_threshold=cache_config["compression_threshold"],
                        )
                        await self._cache_manager.initialize()
                        logger.info(
                            "✅ Redis cache manager initialized successfully with optimized settings"
                        )
                    else:
                        logger.info("ℹ️ Cache optimization disabled by configuration")

                    # Initialize database connection (if needed)
                    # self._db_connection = OptimizedDatabaseConnection("postgresql+asyncpg://...")
                    # await self._db_connection.initialize()

                except Exception as e:
                    logger.warning(
                        "⚠️ Failed to initialize optimization components: %s", e
                    )
                    if cache_config.get("fallback_to_legacy", True):
                        logger.info("Continuing with legacy caching")
                    else:
                        raise
            else:
                logger.warning(
                    "⚠️ Optimization components not available - using legacy implementation"
                )

            # Load default embedding model
            await self._load_model(self._default_model)

            # Test RAG backend connection (non-blocking)
            asyncio.create_task(self._test_rag_connection())

            logger.info("✅ Optimized search service initialized successfully")
            return True

        except Exception as e:
            logger.exception("Failed to initialize search service")
            return False

    async def close(self):
        """Close the search service and cleanup resources."""
        try:
            if self._http_session:
                await self._http_session.close()

            if OPTIMIZATION_AVAILABLE and hasattr(self, "_cache_manager"):
                await self._cache_manager.close()

            logger.info("✅ Search service closed successfully")
        except Exception as e:
            logger.error(f"❌ Error closing search service: {e}")

    def _generate_cache_key(
        self,
        request: Union[SemanticSearchRequest, SyntaxSearchRequest, HybridSearchRequest],
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
        return f"search:{search_type}:{hashlib.md5(key_string.encode()).hexdigest()}"

    async def _get_cached_result(self, cache_key: str) -> Optional[SearchResponse]:
        """Get cached search result."""
        if OPTIMIZATION_AVAILABLE and hasattr(self, "_cache_manager"):
            try:
                cached_data = await self._cache_manager.get(cache_key)
                if cached_data:
                    # Deserialize the cached SearchResponse
                    return SearchResponse(**cached_data)
            except Exception as e:
                logger.warning(f"Cache retrieval failed: {e}")

        # Fallback to legacy cache
        return self._search_cache.get(cache_key)

    async def _cache_result(
        self, cache_key: str, result: SearchResponse, ttl: int = 3600
    ):
        """Cache search result."""
        if OPTIMIZATION_AVAILABLE and hasattr(self, "_cache_manager"):
            try:
                # Serialize the SearchResponse for caching
                cache_data = result.dict()
                await self._cache_manager.set(cache_key, cache_data, ttl=ttl)
            except Exception as e:
                logger.warning(f"Cache storage failed: {e}")

        # Fallback to legacy cache
        if len(self._search_cache) >= self._cache_max_size:
            # Remove oldest entry
            oldest_key = next(iter(self._search_cache))
            del self._search_cache[oldest_key]

        self._search_cache[cache_key] = result

    async def _load_model(self, model_name: str):
        """Load a sentence transformer model."""
        try:
            if model_name not in self._models:
                logger.info(f"Loading model: {model_name}")
                self._models[model_name] = SentenceTransformer(model_name)
                logger.info(f"✅ Model {model_name} loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")

    async def _test_rag_connection(self):
        """Test RAG backend connection (non-blocking)."""
        try:
            if self._http_session:
                async with self._http_session.get(
                    "http://localhost:8001/health", timeout=5
                ) as response:
                    if response.status == 200:
                        logger.info("✅ RAG backend connection successful")
                    else:
                        logger.warning(
                            f"RAG backend health check failed: {response.status}"
                        )
        except Exception as e:
            logger.debug(f"RAG backend not available: {e}")

    async def _search_via_rag(self, request: SemanticSearchRequest) -> Dict[str, Any]:
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
                else:
                    return {
                        "success": False,
                        "error": f"RAG service returned status {response.status}",
                    }

        except Exception as e:
            return {"success": False, "error": f"RAG service not available: {e}"}

    def _format_rag_response(
        self, rag_result: Dict[str, Any], query: str, start_time: float
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
                    )
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
        self, request: SemanticSearchRequest, start_time: float
    ) -> SearchResponse:
        """Perform local semantic search using sentence transformers."""
        try:
            # Get relevant files
            files = await self._get_relevant_files(
                request.file_types, request.directories
            )
            if not files:
                return SearchResponse(
                    success=True,
                    query=request.query,
                    total_results=0,
                    results=[],
                    search_time=time.time() - start_time,
                    search_strategies=["sentence_transformer"],
                )

            # Load model if not already loaded
            if self._default_model not in self._models:
                await self._load_model(self._default_model)

            model = self._models[self._default_model]

            # Generate embeddings
            query_embedding = model.encode([request.query])
            file_embeddings = []
            file_contents = []

            for file_path in files:
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        if len(content.strip()) > 0:
                            file_embeddings.append(model.encode([content]))
                            file_contents.append((file_path, content))
                except Exception as e:
                    logger.debug(f"Could not read file {file_path}: {e}")
                    continue

            if not file_embeddings:
                return SearchResponse(
                    success=True,
                    query=request.query,
                    total_results=0,
                    results=[],
                    search_time=time.time() - start_time,
                    search_strategies=["sentence_transformer"],
                )

            # Calculate similarities
            similarities = []
            for i, file_embedding in enumerate(file_embeddings):
                similarity = np.dot(query_embedding[0], file_embedding[0]) / (
                    np.linalg.norm(query_embedding[0])
                    * np.linalg.norm(file_embedding[0])
                )
                if similarity >= request.similarity_threshold:
                    similarities.append((similarity, i))

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
                    )
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
                    rag_result, request.query, start_time
                )
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
            elif "RAG service not available" in str(rag_result.get("error", "")):
                logger.info("RAG service not available, using local search")

            # Fallback to local semantic search
            result = await self._local_semantic_search(request, start_time)
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
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
    ) -> List[Path]:
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
                request.file_types, request.directories
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
                                    )
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
        self, semantic_response: SearchResponse, syntax_response: SearchResponse
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
                semantic_response.search_time, syntax_response.search_time
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
            elif semantic_response.success:
                return semantic_response
            elif syntax_response.success:
                return syntax_response
            else:
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
                semantic_task, syntax_task, return_exceptions=True
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
                semantic_response, syntax_response
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
        """Index the codebase for search."""
        try:
            # Get relevant files
            files = await self._get_relevant_files(
                request.file_types, request.directories
            )

            # Load model if not already loaded
            if self._default_model not in self._models:
                await self._load_model(self._default_model)

            model = self._models[self._default_model]

            # Process files
            indexed_files = 0
            total_size = 0

            for file_path in files:
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        if len(content.strip()) > 0:
                            # Generate embedding for the file
                            embedding = model.encode([content])
                            total_size += len(content)
                            indexed_files += 1
                except Exception as e:
                    logger.debug(f"Could not index file {file_path}: {e}")
                    continue

            return IndexResponse(
                success=True,
                indexed_files=indexed_files,
                total_size=total_size,
                message=f"Successfully indexed {indexed_files} files",
            )

        except Exception as e:
            logger.exception("Indexing failed")
            return IndexResponse(
                success=False,
                indexed_files=0,
                total_size=0,
                error=str(e),
            )

    async def get_search_stats(self) -> Dict[str, Any]:
        """Get search statistics."""
        try:
            stats = {
                "search_count": self._metrics.total_searches,
                "avg_search_time": self._metrics.avg_search_time,
                "cache_hit_rate": self._metrics.cache_hit_rate,
                "total_search_time": self._metrics.total_search_time,
                "models_loaded": list(self._models.keys()),
                "cache_size": len(self._search_cache),
                "optimization_available": OPTIMIZATION_AVAILABLE,
            }

            # Add cache manager stats if available
            if OPTIMIZATION_AVAILABLE and hasattr(self, "_cache_manager"):
                try:
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
                "models_loaded": [],
                "cache_size": 0,
                "optimization_available": OPTIMIZATION_AVAILABLE,
                "error": str(e),
            }

    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get detailed performance metrics."""
        return {
            "search_metrics": self._metrics.get_metrics(),
            "cache_status": {
                "redis_available": OPTIMIZATION_AVAILABLE
                and hasattr(self, "_cache_manager"),
                "legacy_cache_size": len(self._search_cache),
                "cache_max_size": self._cache_max_size,
            },
            "optimization_status": {
                "optimization_available": OPTIMIZATION_AVAILABLE,
                "http_connection_pooling": self._http_session is not None,
                "models_loaded": list(self._models.keys()),
            },
        }

    async def clear_cache(self) -> Dict[str, Any]:
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

            # Clear legacy cache
            self._search_cache.clear()
            cleared_count += 1

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
        self, query: str, limit: int = 5
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

    def _generate_code_suggestions(self, query: str) -> List[Dict[str, Any]]:
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
                        }
                    )

        return suggestions

    def _generate_synonym_suggestions(self, query: str) -> List[Dict[str, Any]]:
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
                        }
                    )

        return suggestions


# Backward compatibility alias
SearchService = OptimizedSearchService
