"""
Unified Search Service
=====================

Main search service that integrates all search capabilities including semantic,
syntax, hybrid, and natural language search with intelligent caching.
"""

import logging
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from .models import (
    HybridSearchRequest,
    IndexRequest,
    IndexResponse,
    SearchResponse,
    SearchStats,
    SemanticSearchRequest,
    SuggestionsResponse,
    SyntaxSearchRequest,
)
from .semantic_search import SemanticSearchHandler
from .syntax_search import SyntaxSearchHandler
from .hybrid_search import HybridSearchHandler
from .nlp_processor import NaturalLanguageProcessor
from .ignore_utils import create_ignore_parser

logger = logging.getLogger(__name__)


class SearchService:
    """Unified search service with all search capabilities."""

    def __init__(self, project_root: Path | None = None):
        """Initialize the unified search service."""
        if project_root is None:
            current_dir = Path(__file__).parent
            self.project_root = (
                current_dir.parent.parent.parent.parent
            )  # Points to reynard/backend
        else:
            self.project_root = project_root

        # Initialize search handlers
        self.semantic_handler = SemanticSearchHandler(self)
        self.syntax_handler = SyntaxSearchHandler(self)
        self.hybrid_handler = HybridSearchHandler(
            self, self.semantic_handler, self.syntax_handler
        )

        # Initialize NLP processor
        self.nlp_processor = NaturalLanguageProcessor()

        # Natural language search configuration
        self._nlp_enabled = True
        self._query_expansion_enabled = True
        self._intent_detection_enabled = True
        self._confidence_threshold = 0.6

    async def initialize(self) -> bool:
        """Initialize the unified search service."""
        try:
            logger.info("Unified search service initialized successfully")
            return True

        except Exception:
            logger.exception("Failed to initialize unified search service")
            return False

    async def close(self):
        """Close the search service and cleanup resources."""
        try:
            logger.info("Search service closed successfully")
        except Exception as e:
            logger.error(f"Error closing search service: {e}")

    def _generate_cache_key(self, request: Any, search_type: str) -> str:
        """Generate a cache key for the search request."""
        import hashlib

        request_data = {
            "query": request.query,
            "max_results": getattr(request, "max_results", 20),
            "file_types": getattr(request, "file_types", []),
            "directories": getattr(request, "directories", []),
            "search_type": search_type,
        }

        # Add additional parameters based on search type
        if hasattr(request, "similarity_threshold"):
            request_data["similarity_threshold"] = request.similarity_threshold
        if hasattr(request, "case_sensitive"):
            request_data["case_sensitive"] = request.case_sensitive
        if hasattr(request, "whole_word"):
            request_data["whole_word"] = request.whole_word

        # Create hash
        request_str = str(sorted(request_data.items()))
        return hashlib.md5(request_str.encode()).hexdigest()

    async def _get_cached_result(self, cache_key: str) -> Optional[SearchResponse]:
        """Get cached search result."""
        return None  # Simplified for now

    async def _cache_result(
        self, cache_key: str, result: SearchResponse, ttl: int = 3600
    ):
        """Cache search result."""
        pass  # Simplified for now

    @property
    def _metrics(self):
        """Get search metrics."""
        from dataclasses import dataclass
        from datetime import datetime

        @dataclass
        class SearchMetrics:
            total_searches: int = 0
            cache_hits: int = 0
            cache_misses: int = 0
            average_search_time_ms: float = 0.0
            total_search_time_ms: float = 0.0
            last_reset: datetime = None

            def __post_init__(self):
                if self.last_reset is None:
                    self.last_reset = datetime.now()

            @property
            def cache_hit_rate(self) -> float:
                total_requests = self.cache_hits + self.cache_misses
                return (
                    (self.cache_hits / total_requests * 100)
                    if total_requests > 0
                    else 0.0
                )

            def record_search(self, search_time_ms: float, cache_hit: bool = False):
                self.total_searches += 1
                self.total_search_time_ms += search_time_ms
                self.average_search_time_ms = (
                    self.total_search_time_ms / self.total_searches
                )

                if cache_hit:
                    self.cache_hits += 1
                else:
                    self.cache_misses += 1

        if not hasattr(self, "_search_metrics"):
            self._search_metrics = SearchMetrics()
        return self._search_metrics

    async def semantic_search(self, request: SemanticSearchRequest) -> SearchResponse:
        """Perform semantic search using vector embeddings."""
        return await self.semantic_handler.search(request)

    async def syntax_search(self, request: SyntaxSearchRequest) -> SearchResponse:
        """Perform syntax-based search using ripgrep."""
        return await self.syntax_handler.search(request)

    async def hybrid_search(self, request: HybridSearchRequest) -> SearchResponse:
        """Perform hybrid search combining semantic and syntax search."""
        return await self.hybrid_handler.search(request)

    async def natural_language_search(
        self,
        query: str,
        max_results: int = 20,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
        enable_expansion: bool = True,
        confidence_threshold: float = 0.6,
    ) -> SearchResponse:
        """Perform natural language search with intelligent query processing."""
        start_time = time.time()

        # Check if NLP is enabled
        if not self._nlp_enabled:
            return SearchResponse(
                success=False,
                query=query,
                total_results=0,
                results=[],
                search_time=time.time() - start_time,
                error="Natural Language Processing is disabled.",
            )

        try:
            # Process the natural language query
            processed_query = self.nlp_processor.process_query(query)

            # Check confidence threshold
            if processed_query["confidence"] < confidence_threshold:
                logger.warning(
                    f"Low confidence query: {query} (confidence: {processed_query['confidence']})"
                )

            # Determine search strategy based on processed query
            search_strategy = processed_query["search_strategy"]

            # Execute search based on strategy
            if search_strategy == "semantic":
                return await self._execute_semantic_nlp_search(
                    processed_query, max_results, start_time
                )
            elif search_strategy == "syntax":
                return await self._execute_syntax_nlp_search(
                    processed_query, max_results, start_time
                )
            elif search_strategy == "hybrid":
                return await self._execute_hybrid_nlp_search(
                    processed_query, max_results, start_time
                )
            else:
                # Fallback to general search
                return await self._execute_general_nlp_search(
                    processed_query, max_results, start_time
                )

        except Exception as e:
            logger.exception("Natural language search failed")
            return SearchResponse(
                success=False,
                query=query,
                total_results=0,
                results=[],
                search_time=time.time() - start_time,
                error=str(e),
            )

    async def intelligent_search(
        self,
        query: str,
        max_results: int = 20,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
        search_modes: Optional[List[str]] = None,
    ) -> SearchResponse:
        """Perform intelligent search that automatically chooses the best approach."""
        start_time = time.time()

        try:
            # Process the query to determine if it's natural language
            processed_query = self.nlp_processor.process_query(query)

            # Determine if this is a natural language query
            is_natural_language = self._is_natural_language_query(
                query, processed_query
            )

            if is_natural_language:
                # Use natural language search
                return await self.natural_language_search(
                    query=query,
                    max_results=max_results,
                    file_types=file_types,
                    directories=directories,
                )
            else:
                # Use traditional search with query expansion
                return await self._execute_expanded_search(
                    query, max_results, file_types, directories, start_time
                )

        except Exception as e:
            logger.exception("Intelligent search failed")
            return SearchResponse(
                success=False,
                query=query,
                total_results=0,
                results=[],
                search_time=time.time() - start_time,
                error=str(e),
            )

    async def contextual_search(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None,
        max_results: int = 20,
    ) -> SearchResponse:
        """Perform contextual search with additional context information."""
        start_time = time.time()

        try:
            # Enhance query with context
            enhanced_query = self._enhance_query_with_context(query, context)

            # Process the enhanced query
            processed_query = self.nlp_processor.process_query(enhanced_query)

            # Determine file filters based on context
            file_filters = self._determine_contextual_filters(context)

            # Execute search with contextual information
            return await self.natural_language_search(
                query=enhanced_query,
                max_results=max_results,
                file_types=file_filters.get("file_types"),
                directories=file_filters.get("directories"),
            )

        except Exception as e:
            logger.exception("Contextual search failed")
            return SearchResponse(
                success=False,
                query=query,
                total_results=0,
                results=[],
                search_time=time.time() - start_time,
                error=str(e),
            )

    async def get_intelligent_suggestions(
        self, query: str, max_suggestions: int = 5
    ) -> SuggestionsResponse:
        """Get intelligent query suggestions based on natural language processing."""
        try:
            # Get suggestions from NLP processor
            nlp_suggestions = self.nlp_processor.generate_search_suggestions(query)

            # Get traditional suggestions
            traditional_suggestions = await self.get_query_suggestions(
                query, max_suggestions
            )

            # Convert QuerySuggestion objects to dictionaries
            traditional_suggestions_dict = [
                {"suggestion": s.suggestion, "confidence": s.confidence, "type": s.type}
                for s in traditional_suggestions.suggestions
            ]

            # Combine and rank suggestions
            combined_suggestions = self._combine_suggestions(
                nlp_suggestions, traditional_suggestions_dict, max_suggestions
            )

            # Convert to QuerySuggestion objects
            from .models import QuerySuggestion

            query_suggestions = [
                QuerySuggestion(
                    suggestion=s["suggestion"],
                    confidence=s["confidence"],
                    type=s["type"],
                )
                for s in combined_suggestions
            ]

            return SuggestionsResponse(
                success=True,
                query=query,
                suggestions=query_suggestions,
            )

        except Exception as e:
            logger.exception("Failed to get intelligent suggestions")
            return SuggestionsResponse(
                success=False,
                query=query,
                suggestions=[],
                error=str(e),
            )

    async def index_codebase(self, request: IndexRequest) -> IndexResponse:
        """Index the codebase for search."""
        start_time = time.time()

        try:
            # Try RAG backend indexing first
            rag_result = await self._index_via_rag(request)
            if rag_result.get("success"):
                return IndexResponse(
                    success=True,
                    indexed_files=rag_result.get("indexed_files", 0),
                    total_chunks=rag_result.get("total_chunks", 0),
                    index_time=time.time() - start_time,
                    model_used=rag_result.get("model_used", "unknown"),
                )

            # Fallback to local indexing
            return await self._local_index_codebase(request, start_time)

        except Exception as e:
            logger.exception("Codebase indexing failed")
            return IndexResponse(
                success=False,
                indexed_files=0,
                total_chunks=0,
                index_time=time.time() - start_time,
                error=str(e),
            )

    async def get_search_stats(self) -> SearchStats:
        """Get comprehensive search statistics."""
        try:
            # Try to get stats from RAG backend
            rag_stats = await self._get_rag_stats()
            if rag_stats.get("success"):
                rag_data = rag_stats.get("data", {})
                return SearchStats(
                    total_files_indexed=rag_data.get("total_files", 0),
                    total_chunks=rag_data.get("total_chunks", 0),
                    index_size_mb=rag_data.get("index_size_mb", 0.0),
                    last_indexed=rag_data.get("last_indexed"),
                    search_count=0,  # Will be updated when metrics are available
                    avg_search_time=0.0,
                    cache_hit_rate=0.0,
                )

            # Fallback to local stats
            return SearchStats(
                total_files_indexed=0,
                total_chunks=0,
                index_size_mb=0.0,
                last_indexed=None,
                search_count=0,
                avg_search_time=0.0,
                cache_hit_rate=0.0,
            )

        except Exception:
            logger.exception("Failed to get search stats")
            return SearchStats(
                total_files_indexed=0,
                total_chunks=0,
                index_size_mb=0.0,
                last_indexed=None,
                search_count=0,
                avg_search_time=0.0,
                cache_hit_rate=0.0,
            )

    async def get_query_suggestions(
        self, query: str, max_suggestions: int = 5
    ) -> SuggestionsResponse:
        """Get intelligent query suggestions."""
        try:
            suggestions = []

            # Code-specific suggestions
            code_suggestions = self._generate_code_suggestions(query)
            suggestions.extend(code_suggestions[:max_suggestions])

            # Synonym suggestions
            synonym_suggestions = self._generate_synonym_suggestions(query)
            suggestions.extend(
                synonym_suggestions[: max_suggestions - len(suggestions)]
            )

            return SuggestionsResponse(
                success=True, query=query, suggestions=suggestions
            )

        except Exception as e:
            logger.exception("Failed to generate query suggestions")
            return SuggestionsResponse(
                success=False, query=query, suggestions=[], error=str(e)
            )

    # Private helper methods

    async def _execute_semantic_nlp_search(
        self, processed_query: Dict[str, Any], max_results: int, start_time: float
    ) -> SearchResponse:
        """Execute semantic search with NLP processing."""
        # Create semantic search request
        semantic_request = SemanticSearchRequest(
            query=processed_query["normalized_query"],
            max_results=max_results,
            file_types=processed_query["file_filters"]["file_types"],
            directories=processed_query["file_filters"]["directories"],
            similarity_threshold=0.7,
            search_type="semantic",
        )

        # Execute semantic search
        result = await self.semantic_search(semantic_request)

        # Enhance results with NLP metadata
        result.search_strategies = ["semantic", "nlp_processed"]

        return result

    async def _execute_syntax_nlp_search(
        self, processed_query: Dict[str, Any], max_results: int, start_time: float
    ) -> SearchResponse:
        """Execute syntax search with NLP processing."""
        # Create syntax search request
        syntax_request = SyntaxSearchRequest(
            query=processed_query["normalized_query"],
            max_results=max_results,
            file_types=processed_query["file_filters"]["file_types"],
            directories=processed_query["file_filters"]["directories"],
            case_sensitive=False,
            whole_word=False,
            context_lines=2,
        )

        # Execute syntax search
        result = await self.syntax_search(syntax_request)

        # Enhance results with NLP metadata
        result.search_strategies = ["syntax", "nlp_processed"]

        return result

    async def _execute_hybrid_nlp_search(
        self, processed_query: Dict[str, Any], max_results: int, start_time: float
    ) -> SearchResponse:
        """Execute hybrid search with NLP processing."""
        # Create hybrid search request
        hybrid_request = HybridSearchRequest(
            query=processed_query["normalized_query"],
            max_results=max_results,
            file_types=processed_query["file_filters"]["file_types"],
            directories=processed_query["file_filters"]["directories"],
            semantic_weight=0.6,
            syntax_weight=0.4,
            similarity_threshold=0.7,
        )

        # Execute hybrid search
        result = await self.hybrid_search(hybrid_request)

        # Enhance results with NLP metadata
        result.search_strategies = ["hybrid", "nlp_processed"]

        return result

    async def _execute_general_nlp_search(
        self, processed_query: Dict[str, Any], max_results: int, start_time: float
    ) -> SearchResponse:
        """Execute general search with NLP processing."""
        # Try multiple search strategies and combine results
        results = []

        # Semantic search
        try:
            semantic_result = await self._execute_semantic_nlp_search(
                processed_query, max_results // 2, start_time
            )
            if semantic_result.success:
                results.extend(semantic_result.results)
        except Exception:
            pass

        # Syntax search
        try:
            syntax_result = await self._execute_syntax_nlp_search(
                processed_query, max_results // 2, start_time
            )
            if syntax_result.success:
                results.extend(syntax_result.results)
        except Exception:
            pass

        # Remove duplicates and limit results
        unique_results = self._deduplicate_results(results)
        limited_results = unique_results[:max_results]

        return SearchResponse(
            success=True,
            query=processed_query["original_query"],
            total_results=len(limited_results),
            results=limited_results,
            search_time=time.time() - start_time,
            search_strategies=["general", "nlp_processed"],
        )

    async def _execute_expanded_search(
        self,
        query: str,
        max_results: int,
        file_types: Optional[List[str]],
        directories: Optional[List[str]],
        start_time: float,
    ) -> SearchResponse:
        """Execute search with query expansion."""
        # Expand the query
        expanded_terms = self.nlp_processor._expand_query(query)

        # Execute searches for each expanded term
        all_results = []
        for term in expanded_terms[:3]:  # Limit to top 3 expansions
            try:
                # Create semantic search request
                semantic_request = SemanticSearchRequest(
                    query=term,
                    max_results=max_results // len(expanded_terms),
                    file_types=file_types,
                    directories=directories,
                    similarity_threshold=0.6,
                )

                result = await self.semantic_search(semantic_request)
                if result.success:
                    all_results.extend(result.results)

            except Exception:
                continue

        # Remove duplicates and limit results
        unique_results = self._deduplicate_results(all_results)
        limited_results = unique_results[:max_results]

        return SearchResponse(
            success=True,
            query=query,
            total_results=len(limited_results),
            results=limited_results,
            search_time=time.time() - start_time,
            search_strategies=["expanded", "semantic"],
        )

    def _is_natural_language_query(
        self, query: str, processed_query: Dict[str, Any]
    ) -> bool:
        """Determine if a query is natural language."""
        # Check for natural language indicators
        natural_language_indicators = [
            "how",
            "what",
            "where",
            "when",
            "why",
            "which",
            "who",
            "find",
            "show",
            "get",
            "search",
            "look",
            "locate",
            "function that",
            "class that",
            "method that",
            "error handling",
            "authentication",
            "configuration",
        ]

        query_lower = query.lower()

        # Check for natural language indicators
        if any(indicator in query_lower for indicator in natural_language_indicators):
            return True

        # Check for high confidence NLP processing
        if processed_query["confidence"] > 0.7:
            return True

        # Check for specific intent detection
        if processed_query["intent"] != "general_search":
            return True

        return False

    def _enhance_query_with_context(
        self, query: str, context: Optional[Dict[str, Any]]
    ) -> str:
        """Enhance query with contextual information."""
        if not context:
            return query

        enhanced_parts = [query]

        # Add file context
        if "file_path" in context:
            file_path = context["file_path"]
            if file_path:
                enhanced_parts.append(f"in file {file_path}")

        # Add function context
        if "function_name" in context:
            function_name = context["function_name"]
            if function_name:
                enhanced_parts.append(f"related to {function_name}")

        # Add class context
        if "class_name" in context:
            class_name = context["class_name"]
            if class_name:
                enhanced_parts.append(f"in class {class_name}")

        return " ".join(enhanced_parts)

    def _determine_contextual_filters(
        self, context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Determine file filters based on context."""
        if not context:
            return {"file_types": None, "directories": None}

        file_types = None
        directories = None

        # Determine file types from context
        if "file_path" in context:
            file_path = context["file_path"]
            if file_path:
                file_ext = Path(file_path).suffix.lstrip(".")
                if file_ext:
                    file_types = [file_ext]

        # Determine directories from context
        if "file_path" in context:
            file_path = context["file_path"]
            if file_path:
                file_dir = str(Path(file_path).parent)
                directories = [file_dir]

        return {"file_types": file_types, "directories": directories}

    def _combine_suggestions(
        self,
        nlp_suggestions: List[Dict[str, Any]],
        traditional_suggestions: List[Dict[str, Any]],
        max_suggestions: int,
    ) -> List[Dict[str, Any]]:
        """Combine NLP and traditional suggestions."""
        combined = []

        # Add NLP suggestions first (higher priority)
        for suggestion in nlp_suggestions:
            combined.append(
                {
                    "suggestion": suggestion["suggestion"],
                    "confidence": suggestion["confidence"],
                    "type": suggestion["type"],
                    "source": "nlp",
                }
            )

        # Add traditional suggestions
        for suggestion in traditional_suggestions:
            combined.append(
                {
                    "suggestion": suggestion["suggestion"],
                    "confidence": suggestion.get("confidence", 0.5),
                    "type": suggestion.get("type", "traditional"),
                    "source": "traditional",
                }
            )

        # Sort by confidence and limit
        combined.sort(key=lambda x: x["confidence"], reverse=True)
        return combined[:max_suggestions]

    def _deduplicate_results(self, results: List[Any]) -> List[Any]:
        """Remove duplicate results based on file path and line number."""
        seen = set()
        unique_results = []

        for result in results:
            key = f"{result.file_path}:{result.line_number}"
            if key not in seen:
                seen.add(key)
                unique_results.append(result)

        return unique_results

    def _generate_code_suggestions(self, query: str) -> List[Dict[str, Any]]:
        """Generate code-specific query suggestions."""
        suggestions = []
        query_lower = query.lower()

        # Code pattern suggestions
        if "function" in query_lower:
            suggestions.append(
                {
                    "suggestion": "def " + query.replace("function", "").strip(),
                    "confidence": 0.8,
                    "type": "pattern",
                }
            )

        if "class" in query_lower:
            suggestions.append(
                {
                    "suggestion": "class " + query.replace("class", "").strip(),
                    "confidence": 0.8,
                    "type": "pattern",
                }
            )

        return suggestions

    def _generate_synonym_suggestions(self, query: str) -> List[Dict[str, Any]]:
        """Generate synonym-based query suggestions."""
        synonyms = {
            "function": ["def", "method", "procedure"],
            "class": ["type", "object", "struct"],
            "import": ["require", "include", "from"],
            "error": ["exception", "bug", "issue"],
            "test": ["spec", "unit", "mock"],
        }

        suggestions = []
        query_lower = query.lower()

        for word, syns in synonyms.items():
            if word in query_lower:
                for syn in syns:
                    suggestions.append(
                        {
                            "suggestion": query.replace(word, syn),
                            "confidence": 0.6,
                            "type": "synonym",
                        }
                    )

        return suggestions

    async def _index_via_rag(self, request: IndexRequest) -> Dict[str, Any]:
        """Index via RAG service."""
        try:
            from app.core.service_registry import get_service_registry

            registry = get_service_registry()
            rag_service = registry.get_service_instance("rag")

            if rag_service is None:
                return {"success": False, "error": "RAG service not available"}

            # For now, return a placeholder response since indexing is not fully implemented
            return {
                "success": True,
                "data": {
                    "indexed_files": 0,
                    "total_chunks": 0,
                    "model_used": "placeholder",
                },
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _get_rag_stats(self) -> Dict[str, Any]:
        """Get stats from RAG service."""
        try:
            from app.core.service_registry import get_service_registry

            registry = get_service_registry()
            rag_service = registry.get_service_instance("rag")

            if rag_service is None:
                return {"success": False, "error": "RAG service not available"}

            # Get stats from the RAG service
            stats = await rag_service.get_stats()
            return {"success": True, "data": stats}

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _local_index_codebase(
        self, request: IndexRequest, start_time: float
    ) -> IndexResponse:
        """Fallback local codebase indexing with ignore file support."""
        try:
            indexed_files = 0
            total_chunks = 0
            ignored_files = 0

            # Determine the root directory to index
            if request.project_root:
                root_path = Path(request.project_root)
            else:
                root_path = self.project_root

            # Create ignore file parser
            ignore_parser = create_ignore_parser(root_path)
            ignore_stats = ignore_parser.get_ignore_stats()
            logger.info(f"Ignore file stats: {ignore_stats}")

            # Get file extensions to index
            file_extensions = request.file_types or ["py", "ts", "tsx", "js", "jsx"]

            # Get directories to index
            directories = request.directories or []

            # If no directories specified, index the entire project
            if not directories:
                search_paths = [root_path]
            else:
                search_paths = [root_path / dir_path for dir_path in directories]

            # Index files
            for search_path in search_paths:
                if not search_path.exists():
                    continue

                for file_path in search_path.rglob("*"):
                    # Skip directories
                    if file_path.is_dir():
                        continue

                    # Check if file should be ignored
                    if ignore_parser.should_ignore(file_path):
                        ignored_files += 1
                        continue

                    # Skip hidden files and directories (additional safety)
                    if any(part.startswith(".") for part in file_path.parts):
                        # But allow .cursorignore and .gitignore themselves
                        if file_path.name not in [".cursorignore", ".gitignore"]:
                            ignored_files += 1
                            continue

                    # Check file extension
                    if file_path.suffix.lstrip(".") in file_extensions:
                        try:
                            # Read file content to count chunks
                            with open(file_path, "r", encoding="utf-8") as f:
                                content = f.read()

                            # Simple chunking: split by lines and group into chunks
                            lines = content.split("\n")
                            chunk_size = request.chunk_size or 50
                            chunks = [
                                lines[i : i + chunk_size]
                                for i in range(0, len(lines), chunk_size)
                            ]

                            indexed_files += 1
                            total_chunks += len(chunks)

                        except Exception as e:
                            logger.warning(f"Failed to index {file_path}: {e}")
                            continue

            logger.info(
                f"Indexing completed: {indexed_files} files indexed, {ignored_files} files ignored"
            )

            return IndexResponse(
                success=True,
                indexed_files=indexed_files,
                total_chunks=total_chunks,
                index_time=time.time() - start_time,
                model_used="local",
            )

        except Exception as e:
            logger.exception("Local indexing failed")
            return IndexResponse(
                success=False,
                indexed_files=0,
                total_chunks=0,
                index_time=time.time() - start_time,
                model_used="local",
                error=str(e),
            )
