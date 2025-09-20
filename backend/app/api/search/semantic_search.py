"""
Semantic Search Module
=====================

Handles semantic search functionality using vector embeddings and RAG backend.
"""

import logging
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from .models import SearchResponse, SearchResult, SemanticSearchRequest
from .ignore_utils import create_ignore_parser

# Optional import for BM25
try:
    from rank_bm25 import BM25Okapi
    BM25_AVAILABLE = True
except ImportError:
    BM25Okapi = None
    BM25_AVAILABLE = False

logger = logging.getLogger(__name__)


class SemanticSearchHandler:
    """Handles semantic search operations."""

    def __init__(self, search_service: Any) -> None:
        """Initialize the semantic search handler."""
        self.search_service = search_service

    async def search(self, request: SemanticSearchRequest) -> SearchResponse:
        """Perform semantic search using vector embeddings with caching."""
        start_time = time.time()
        cache_key = self.search_service._generate_cache_key(request, "semantic")

        try:
            # Check cache first
            cached_result = await self.search_service._get_cached_result(cache_key)
            if cached_result:
                self.search_service._metrics.record_search(time.time() - start_time, cache_hit=True)  # type: ignore[attr-defined]
                logger.debug(f"Cache hit for semantic search: {request.query[:50]}...")
                return cached_result  # type: ignore[return-value]

            # Try RAG backend first
            rag_result = await self._search_via_rag(request)
            if rag_result.get("success"):
                result = self._format_rag_response(rag_result, request.query, start_time)
                await self.search_service._cache_result(cache_key, result)
                self.search_service._metrics.record_search(time.time() - start_time, cache_hit=False)  # type: ignore[attr-defined]
                return result
            elif "RAG service not available" in str(rag_result.get("error", "")):
                logger.info("RAG service not available, using local search")

            # Fallback to local semantic search
            result = await self._local_semantic_search(request, start_time)
            await self.search_service._cache_result(cache_key, result)
            self.search_service._metrics.record_search(time.time() - start_time, cache_hit=False)
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
            self.search_service._metrics.record_search(time.time() - start_time, cache_hit=False)
            return error_result

    async def _search_via_rag(self, request: SemanticSearchRequest) -> dict[str, Any]:
        """Search via RAG service."""
        try:
            from app.core.service_registry import get_service_registry
            
            registry = get_service_registry()
            rag_service = registry.get_service_instance("rag")
            
            if rag_service is None:
                return {"success": False, "error": "RAG service not available"}
            
            # Use the RAG service directly
            result = await rag_service.query(
                query=request.query,
                modality=request.search_type,
                top_k=request.max_results,
                similarity_threshold=request.similarity_threshold,
                enable_reranking=False
            )
            
            return {"success": True, "data": result}

        except Exception as e:
            return {"success": False, "error": str(e)}

    def _format_rag_response(
        self, rag_result: dict[str, Any], query: str, start_time: float
    ) -> SearchResponse:
        """Format RAG backend response."""
        data = rag_result["data"]
        hits = data.get("hits", [])

        results = []
        for hit in hits:
            results.append(
                SearchResult(
                    file_path=hit.get("file_path", ""),
                    line_number=hit.get("chunk_index", 0),
                    content=hit.get("chunk_text", ""),
                    score=hit.get("score", 0.0),
                    match_type="semantic",
                    context=hit.get("chunk_text", ""),
                    snippet=self._extract_snippet(hit.get("chunk_text", "")),
                    metadata=hit.get("chunk_metadata", {}),
                )
            )

        return SearchResponse(
            success=True,
            query=query,
            total_results=len(results),
            results=results,
            search_time=time.time() - start_time,
            search_strategies=["rag_backend"],
        )

    async def _local_semantic_search(
        self, request: SemanticSearchRequest, start_time: float
    ) -> SearchResponse:
        """Fallback local semantic search using BM25."""
        try:
            # Use BM25 for local semantic search when RAG backend is unavailable
            if not BM25_AVAILABLE:
                return SearchResponse(
                    success=False,
                    query=request.query,
                    total_results=0,
                    results=[],
                    search_time=time.time() - start_time,
                    error="BM25 not available for local search",
                )

            # Get all relevant files
            files = await self._get_relevant_files(request)
            if not files:
                return SearchResponse(
                    success=True,
                    query=request.query,
                    total_results=0,
                    results=[],
                    search_time=time.time() - start_time,
                    search_strategies=["local_bm25"],
                )

            # Prepare documents for BM25
            documents = []
            file_paths = []
            for file_path in files:
                try:
                    content = await self._read_file_content(file_path)
                    if content:
                        documents.append(content.split())
                        file_paths.append(file_path)
                except Exception:
                    continue

            if not documents:
                return SearchResponse(
                    success=True,
                    query=request.query,
                    total_results=0,
                    results=[],
                    search_time=time.time() - start_time,
                    search_strategies=["local_bm25"],
                )

            # Create BM25 index
            bm25 = BM25Okapi(documents)

            # Search using BM25
            query_tokens = request.query.lower().split()
            scores = bm25.get_scores(query_tokens)

            # Create results
            results = []
            for i, (file_path, score) in enumerate(zip(file_paths, scores, strict=True)):
                if score > request.similarity_threshold:
                    # Find the best matching line
                    content = " ".join(documents[i])
                    best_line = self._find_best_matching_line(content, request.query)

                    results.append(
                        SearchResult(
                            file_path=str(file_path),
                            line_number=best_line["line_number"],
                            content=best_line["content"],
                            score=float(score),
                            match_type="bm25",
                            context=best_line["context"],
                            snippet=self._extract_snippet(best_line["content"]),
                        )
                    )

            # Sort by score and limit results
            results.sort(key=lambda x: x.score, reverse=True)
            results = results[:request.max_results]

            return SearchResponse(
                success=True,
                query=request.query,
                total_results=len(results),
                results=results,
                search_time=time.time() - start_time,
                search_strategies=["local_bm25"],
            )

        except Exception as e:
            logger.exception("Local BM25 search failed")
            return SearchResponse(
                success=False,
                query=request.query,
                total_results=0,
                results=[],
                search_time=time.time() - start_time,
                error="Local BM25 search failed: %s" % str(e),
            )

    def _extract_snippet(self, text: str, max_length: int = 200) -> str:
        """Extract a meaningful snippet from text."""
        if len(text) <= max_length:
            return text

        words = text.split()
        snippet_words = []
        current_length = 0

        for word in words:
            if current_length + len(word) + 1 > max_length:
                break
            snippet_words.append(word)
            current_length += len(word) + 1

        snippet = " ".join(snippet_words)
        if len(snippet) < len(text):
            snippet += "..."

        return snippet

    async def _get_relevant_files(self, request: SemanticSearchRequest) -> List[Path]:
        """Get relevant files based on file types and directories, respecting ignore files."""
        files = []

        # Create ignore file parser
        ignore_parser = create_ignore_parser(self.search_service.project_root)

        # Determine search directories
        if request.directories:
            search_dirs = []
            for dir_path in request.directories:
                # If it's an absolute path, use it as-is
                if Path(dir_path).is_absolute():
                    search_dirs.append(Path(dir_path))
                else:
                    # If it's relative, make it relative to project root
                    search_dirs.append(self.search_service.project_root / dir_path)
        else:
            search_dirs = [self.search_service.project_root]

        for search_path in search_dirs:
            if not search_path.exists():
                continue

            # Get file types to search
            file_types = request.file_types or ["py", "ts", "tsx", "js", "jsx", "md"]
            patterns = [f"*.{ft}" if not ft.startswith('*') else ft for ft in file_types]

            for pattern in patterns:
                for file_path in search_path.rglob(pattern):
                    # Skip directories
                    if file_path.is_dir():
                        continue
                    
                    # Check if file should be ignored
                    if ignore_parser.should_ignore(file_path):
                        continue
                    
                    # Skip hidden files (additional safety)
                    if any(part.startswith('.') for part in file_path.parts):
                        if file_path.name not in ['.cursorignore', '.gitignore']:
                            continue
                    
                    files.append(file_path)

        return files[:1000]  # Limit to prevent memory issues

    async def _read_file_content(self, file_path: Path) -> str | None:
        """Read file content safely."""
        try:
            if not file_path.exists() or not file_path.is_file():
                return None

            # Skip binary files and very large files
            if file_path.stat().st_size > 1024 * 1024:  # 1MB limit
                return None

            return file_path.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            return None

    def _find_best_matching_line(self, content: str, query: str) -> Dict[str, Any]:
        """Find the best matching line in content for the query."""
        lines = content.split('\n')
        query_lower = query.lower()

        best_score = 0
        best_line = 0
        best_content = ""

        for i, line in enumerate(lines):
            line_lower = line.lower()
            # Simple scoring based on query word matches
            score = sum(1 for word in query_lower.split() if word in line_lower)

            if score > best_score:
                best_score = score
                best_line = i + 1
                best_content = line.strip()

        # Get context around the best line
        context_start = max(0, best_line - 3)
        context_end = min(len(lines), best_line + 2)
        context = '\n'.join(lines[context_start:context_end])

        return {
            "line_number": best_line,
            "content": best_content,
            "context": context
        }
