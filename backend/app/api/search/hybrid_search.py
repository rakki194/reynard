"""
Hybrid Search Module
===================

Handles hybrid search functionality that combines semantic and syntax search
for comprehensive code exploration.
"""

import asyncio
import logging
import time
from typing import Any, Dict, List

from .models import HybridSearchRequest, SearchResponse, SearchResult, SemanticSearchRequest, SyntaxSearchRequest

logger = logging.getLogger(__name__)


class HybridSearchHandler:
    """Handles hybrid search operations combining semantic and syntax search."""

    def __init__(self, search_service: Any, semantic_handler: Any, syntax_handler: Any) -> None:
        """Initialize the hybrid search handler."""
        self.search_service = search_service
        self.semantic_handler = semantic_handler
        self.syntax_handler = syntax_handler

    async def search(self, request: HybridSearchRequest) -> SearchResponse:
        """Perform hybrid search combining semantic and syntax search with caching."""
        start_time = time.time()
        cache_key = self.search_service._generate_cache_key(request, "hybrid")

        try:
            # Check cache first
            cached_result = await self.search_service._get_cached_result(cache_key)
            if cached_result:
                self.search_service._metrics.record_search(time.time() - start_time, cache_hit=True)
                logger.debug(f"Cache hit for hybrid search: {request.query[:50]}...")
                return cached_result

            # Create semantic and syntax requests
            semantic_req = SemanticSearchRequest(
                query=request.query,
                max_results=int(request.max_results * request.semantic_weight),
                file_types=request.file_types,
                directories=request.directories,
                similarity_threshold=request.similarity_threshold,
            )

            syntax_req = SyntaxSearchRequest(
                query=request.query,
                max_results=int(request.max_results * request.syntax_weight),
                file_types=request.file_types,
                directories=request.directories,
                case_sensitive=request.case_sensitive,
                whole_word=request.whole_word,
                context_lines=request.context_lines,
            )

            # Run both searches in parallel for better performance
            semantic_task = asyncio.create_task(self.semantic_handler.search(semantic_req))
            syntax_task = asyncio.create_task(self.syntax_handler.search(syntax_req))

            semantic_response, syntax_response = await asyncio.gather(
                semantic_task, syntax_task, return_exceptions=True
            )

            # Handle exceptions from parallel tasks
            if isinstance(semantic_response, Exception):
                logger.warning("Semantic search failed in hybrid: %s", semantic_response)
                semantic_response = SearchResponse(
                    success=False, query=request.query, total_results=0, results=[], 
                    search_time=0, error=str(semantic_response)
                )
            
            if isinstance(syntax_response, Exception):
                logger.warning("Syntax search failed in hybrid: %s", syntax_response)
                syntax_response = SearchResponse(
                    success=False, query=request.query, total_results=0, results=[], 
                    search_time=0, error=str(syntax_response)
                )

            # Combine results - now both are guaranteed to be SearchResponse objects
            combined_results = self._combine_search_results(
                semantic_response, syntax_response, request
            )

            search_response = SearchResponse(
                success=True,
                query=request.query,
                total_results=len(combined_results),
                results=combined_results,
                search_time=time.time() - start_time,
                search_strategies=["semantic", "syntax", "hybrid"],
            )
            
            # Cache the result
            await self.search_service._cache_result(cache_key, search_response, ttl=1800)  # 30 minutes for hybrid search
            self.search_service._metrics.record_search(time.time() - start_time, cache_hit=False)
            return search_response

        except Exception as e:
            logger.exception("Hybrid search failed")
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

    def _combine_search_results(
        self,
        semantic_response: SearchResponse,
        syntax_response: SearchResponse,
        request: HybridSearchRequest,
    ) -> List[SearchResult]:
        """Combine results from semantic and syntax search."""
        combined = []
        seen_files = set()

        # Add semantic results with weight
        for result in semantic_response.results:
            if isinstance(result, Exception):
                continue

            file_line_key = f"{result.file_path}:{result.line_number}"
            if file_line_key not in seen_files:
                result.score *= request.semantic_weight
                result.match_type = "hybrid_semantic"
                combined.append(result)
                seen_files.add(file_line_key)

        # Add syntax results with weight
        for result in syntax_response.results:
            if isinstance(result, Exception):
                continue

            file_line_key = f"{result.file_path}:{result.line_number}"
            if file_line_key not in seen_files:
                result.score *= request.syntax_weight
                result.match_type = "hybrid_syntax"
                combined.append(result)
                seen_files.add(file_line_key)

        # Sort by score and limit results
        combined.sort(key=lambda x: x.score, reverse=True)
        return combined[:request.max_results]
