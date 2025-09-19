"""
Enhanced Semantic Search Tools
=============================

Advanced MCP tools for natural language semantic search capabilities.
Integrates with the backend's enhanced search service for comprehensive
code exploration using natural language queries.
"""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

import aiohttp

logger = logging.getLogger(__name__)


class EnhancedSemanticSearchEngine:
    """
    Enhanced semantic search engine with natural language processing.
    
    Provides advanced semantic search capabilities using natural language
    queries and intelligent query processing.
    """

    def __init__(self, project_root: Path | None = None):
        # Default to the Reynard project root
        if project_root is None:
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent.parent.parent
        else:
            self.project_root = project_root

        # Backend configuration
        self._backend_base_url = "http://localhost:8000"
        self._timeout_seconds = 30
        self._max_retries = 3

    async def natural_language_search(
        self,
        query: str,
        max_results: int = 20,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
        enable_expansion: bool = True,
        confidence_threshold: float = 0.6,
    ) -> Dict[str, Any]:
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
        try:
            # Prepare search request
            search_request = {
                "query": query,
                "max_results": max_results,
                "file_types": file_types or [],
                "directories": directories or [],
                "enable_expansion": enable_expansion,
                "confidence_threshold": confidence_threshold,
            }

            # Execute search via backend
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self._backend_base_url}/api/search/natural-language",
                    json=search_request,
                    timeout=aiohttp.ClientTimeout(total=self._timeout_seconds),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return self._process_search_results(result, query)
                    error_text = await response.text()
                    logger.error(f"Natural language search failed: {response.status} - {error_text}")
                    return {
                        "success": False,
                        "error": f"Backend error: {response.status}",
                        "query": query,
                    }

        except Exception as e:
            logger.exception("Natural language search failed")
            return {"success": False, "error": str(e), "query": query}

    async def intelligent_search(
        self,
        query: str,
        max_results: int = 20,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
        search_modes: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
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
        try:
            # Prepare search request
            search_request = {
                "query": query,
                "max_results": max_results,
                "file_types": file_types or [],
                "directories": directories or [],
                "search_modes": search_modes or [],
            }

            # Execute search via backend
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self._backend_base_url}/api/search/intelligent",
                    json=search_request,
                    timeout=aiohttp.ClientTimeout(total=self._timeout_seconds),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return self._process_search_results(result, query)
                    error_text = await response.text()
                    logger.error(f"Intelligent search failed: {response.status} - {error_text}")
                    return {
                        "success": False,
                        "error": f"Backend error: {response.status}",
                        "query": query,
                    }

        except Exception as e:
            logger.exception("Intelligent search failed")
            return {"success": False, "error": str(e), "query": query}

    async def contextual_search(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None,
        max_results: int = 20,
    ) -> Dict[str, Any]:
        """
        Perform contextual search with additional context information.
        
        Args:
            query: Search query
            context: Additional context (file path, function name, etc.)
            max_results: Maximum number of results to return
            
        Returns:
            Contextual search results
        """
        try:
            # Prepare search request
            search_request = {
                "query": query,
                "context": context or {},
                "max_results": max_results,
            }

            # Execute search via backend
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self._backend_base_url}/api/search/contextual",
                    json=search_request,
                    timeout=aiohttp.ClientTimeout(total=self._timeout_seconds),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return self._process_search_results(result, query)
                    error_text = await response.text()
                    logger.error(f"Contextual search failed: {response.status} - {error_text}")
                    return {
                        "success": False,
                        "error": f"Backend error: {response.status}",
                        "query": query,
                    }

        except Exception as e:
            logger.exception("Contextual search failed")
            return {"success": False, "error": str(e), "query": query}

    async def analyze_query(self, query: str) -> Dict[str, Any]:
        """
        Analyze a query to understand its intent and structure.
        
        Args:
            query: Query to analyze
            
        Returns:
            Query analysis with intent, entities, and suggestions
        """
        try:
            # Execute query analysis via backend
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self._backend_base_url}/api/search/analyze-query",
                    params={"query": query},
                    timeout=aiohttp.ClientTimeout(total=self._timeout_seconds),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result
                    error_text = await response.text()
                    logger.error(f"Query analysis failed: {response.status} - {error_text}")
                    return {
                        "success": False,
                        "error": f"Backend error: {response.status}",
                        "query": query,
                    }

        except Exception as e:
            logger.exception("Query analysis failed")
            return {"success": False, "error": str(e), "query": query}

    async def get_intelligent_suggestions(
        self, query: str, max_suggestions: int = 5
    ) -> Dict[str, Any]:
        """
        Get intelligent query suggestions based on natural language processing.
        
        Args:
            query: Query to get suggestions for
            max_suggestions: Maximum number of suggestions
            
        Returns:
            Intelligent query suggestions
        """
        try:
            # Execute suggestions request via backend
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self._backend_base_url}/api/search/suggestions/intelligent",
                    params={
                        "query": query,
                        "max_suggestions": max_suggestions,
                    },
                    timeout=aiohttp.ClientTimeout(total=self._timeout_seconds),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result
                    error_text = await response.text()
                    logger.error(f"Intelligent suggestions failed: {response.status} - {error_text}")
                    return {
                        "success": False,
                        "error": f"Backend error: {response.status}",
                        "query": query,
                    }

        except Exception as e:
            logger.exception("Intelligent suggestions failed")
            return {"success": False, "error": str(e), "query": query}

    async def health_check(self) -> Dict[str, Any]:
        """Check the health of the enhanced semantic search service."""
        try:
            # Check backend health
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self._backend_base_url}/api/search/health/natural-language",
                    timeout=aiohttp.ClientTimeout(total=10),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result
                    return {
                        "success": False,
                        "error": f"Backend health check failed: {response.status}",
                    }

        except Exception as e:
            logger.exception("Health check failed")
            return {"success": False, "error": str(e)}

    def _process_search_results(self, result: Dict[str, Any], query: str) -> Dict[str, Any]:
        """Process and format search results from the backend."""
        if not result.get("success"):
            return result

        # Extract results
        results = result.get("results", [])
        processed_results = []

        for item in results:
            processed_result = {
                "file_path": item.get("file_path", ""),
                "line_number": item.get("line_number", 0),
                "content": item.get("content", ""),
                "score": item.get("score", 0.0),
                "match_type": item.get("match_type", "unknown"),
                "context": item.get("context", ""),
                "snippet": item.get("snippet", ""),
                "metadata": item.get("metadata", {}),
            }
            processed_results.append(processed_result)

        return {
            "success": True,
            "query": query,
            "total_results": len(processed_results),
            "results": processed_results,
            "search_time": result.get("search_time", 0.0),
            "search_strategies": result.get("search_strategies", []),
            "metadata": result.get("metadata", {}),
        }

    async def search_with_examples(
        self, query: str, max_results: int = 10
    ) -> Dict[str, Any]:
        """
        Search with example queries to demonstrate capabilities.
        
        Args:
            query: Search query
            max_results: Maximum number of results to return
            
        Returns:
            Search results with example queries
        """
        # Example queries for demonstration
        example_queries = [
            "find authentication function",
            "show error handling code",
            "where is user validation implemented",
            "class that handles database connections",
            "function that processes API requests",
            "configuration settings for the application",
            "test cases for user management",
            "import statements for external libraries",
        ]

        # Perform the search
        search_result = await self.intelligent_search(
            query=query,
            max_results=max_results,
        )

        # Add example queries to the result
        search_result["example_queries"] = example_queries
        search_result["query_type"] = "natural_language" if any(
            word in query.lower() for word in ["find", "show", "where", "how"]
        ) else "structured"

        return search_result


