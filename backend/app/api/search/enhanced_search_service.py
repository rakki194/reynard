"""
Enhanced Search Service
======================

Advanced search service that integrates natural language processing
with semantic search capabilities for comprehensive code exploration.
"""

import logging
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from .models import (
    HybridSearchRequest,
    SearchResponse,
    SearchResult,
    SemanticSearchRequest,
    SuggestionsResponse,
    SyntaxSearchRequest,
)
from .natural_language_processor import NaturalLanguageProcessor
from .service import SearchService

logger = logging.getLogger(__name__)


class EnhancedSearchService(SearchService):
    """Enhanced search service with natural language processing capabilities."""

    def __init__(self, project_root: Path | None = None):
        """Initialize the enhanced search service."""
        super().__init__(project_root)
        self.nlp_processor = NaturalLanguageProcessor()
        
        # Natural language search configuration
        self._nlp_enabled = True
        self._query_expansion_enabled = True
        self._intent_detection_enabled = True
        self._confidence_threshold = 0.6

    async def natural_language_search(
        self,
        query: str,
        max_results: int = 20,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
        enable_expansion: bool = True,
        confidence_threshold: float = 0.6,
    ) -> SearchResponse:
        """
        Perform natural language search with intelligent query processing.
        
        Args:
            query: Natural language search query
            max_results: Maximum number of results to return
            file_types: File extensions to search in
            directories: Directories to search in
            enable_expansion: Whether to enable query expansion
            confidence_threshold: Minimum confidence threshold for results
            
        Returns:
            Search results with natural language understanding
        """
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
                logger.warning(f"Low confidence query: {query} (confidence: {processed_query['confidence']})")
            
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
        """
        Perform intelligent search that automatically chooses the best approach.
        
        Args:
            query: Search query (natural language or structured)
            max_results: Maximum number of results to return
            file_types: File extensions to search in
            directories: Directories to search in
            search_modes: Specific search modes to use
            
        Returns:
            Intelligent search results combining multiple strategies
        """
        start_time = time.time()
        
        try:
            # Process the query to determine if it's natural language
            processed_query = self.nlp_processor.process_query(query)
            
            # Determine if this is a natural language query
            is_natural_language = self._is_natural_language_query(query, processed_query)
            
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
        """
        Perform contextual search with additional context information.
        
        Args:
            query: Search query
            context: Additional context (file path, function name, etc.)
            max_results: Maximum number of results to return
            
        Returns:
            Contextual search results
        """
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
            traditional_suggestions = await self.get_query_suggestions(query, max_suggestions)
            
            # Combine and rank suggestions
            combined_suggestions = self._combine_suggestions(
                nlp_suggestions, traditional_suggestions.suggestions, max_suggestions
            )
            
            # Convert to QuerySuggestion objects
            from .models import QuerySuggestion
            query_suggestions = [
                QuerySuggestion(
                    suggestion=s["suggestion"],
                    confidence=s["confidence"],
                    suggestion_type=s["type"]
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

    def _is_natural_language_query(self, query: str, processed_query: Dict[str, Any]) -> bool:
        """Determine if a query is natural language."""
        # Check for natural language indicators
        natural_language_indicators = [
            "how", "what", "where", "when", "why", "which", "who",
            "find", "show", "get", "search", "look", "locate",
            "function that", "class that", "method that",
            "error handling", "authentication", "configuration",
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
            combined.append({
                "suggestion": suggestion["suggestion"],
                "confidence": suggestion["confidence"],
                "type": suggestion["type"],
                "source": "nlp",
            })
        
        # Add traditional suggestions
        for suggestion in traditional_suggestions:
            combined.append({
                "suggestion": suggestion["suggestion"],
                "confidence": suggestion.get("confidence", 0.5),
                "type": suggestion.get("type", "traditional"),
                "source": "traditional",
            })
        
        # Sort by confidence and limit
        combined.sort(key=lambda x: x["confidence"], reverse=True)
        return combined[:max_suggestions]

    def _deduplicate_results(self, results: List[SearchResult]) -> List[SearchResult]:
        """Remove duplicate results based on file path and line number."""
        seen = set()
        unique_results = []
        
        for result in results:
            key = f"{result.file_path}:{result.line_number}"
            if key not in seen:
                seen.add(key)
                unique_results.append(result)
        
        return unique_results

    async def analyze_query(self, query: str) -> Dict[str, Any]:
        """Analyze a query and return detailed information about it."""
        if not self._nlp_enabled:
            return {
                "intent": "general_search",
                "entities": [],
                "expanded_terms": [],
                "confidence": 0.0,
                "error": "Natural Language Processing is disabled."
            }
        
        return self.nlp_processor.process_query(query)

    async def get_intelligent_suggestions(self, query: str, max_suggestions: int = 5) -> Dict[str, Any]:
        """Get intelligent search suggestions based on the query."""
        if not self._nlp_enabled:
            return {
                "suggestions": [],
                "error": "Natural Language Processing is disabled."
            }
        
        # Use the NLP processor to generate suggestions
        suggestions = self.nlp_processor.generate_search_suggestions(query)
        
        return {
            "suggestions": suggestions[:max_suggestions]
        }

    async def search_with_examples(
        self, 
        query: str, 
        examples: List[str], 
        max_results: int = 20
    ) -> SearchResponse:
        """Search with example queries to enhance results."""
        if not self._nlp_enabled:
            return SearchResponse(
                success=False,
                query=query,
                total_results=0,
                results=[],
                search_time=0.0,
                error="Natural Language Processing is disabled.",
            )
        
        # Enhance the query with examples
        enhanced_query = f"{query} examples: {', '.join(examples)}"
        
        # Use natural language search with the enhanced query
        return await self.natural_language_search(enhanced_query, max_results)

    async def enhanced_search_health_check(self) -> Dict[str, Any]:
        """Perform health check for enhanced search capabilities."""
        return {
            "nlp_enabled": self._nlp_enabled,
            "query_expansion_enabled": self._query_expansion_enabled,
            "intent_detection_enabled": self._intent_detection_enabled,
            "status": "healthy" if self._nlp_enabled else "disabled",
            "confidence_threshold": self._confidence_threshold,
        }
