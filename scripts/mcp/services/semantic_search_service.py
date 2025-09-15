#!/usr/bin/env python3
"""
Semantic Search Service
======================

Service for integrating RAG backend capabilities with MCP file search.
Provides semantic search through vector embeddings and document retrieval.
Follows the 100-line axiom and modular architecture principles.
"""

import logging
from pathlib import Path
from typing import Any

import aiohttp

logger = logging.getLogger(__name__)


class SemanticSearchService:
    """Integrates RAG backend for semantic search capabilities."""

    def __init__(self, project_root: Path | None = None):
        # Default to the Reynard project root
        if project_root is None:
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent.parent
        else:
            self.project_root = project_root

        # RAG backend configuration
        self._rag_base_url = "http://localhost:8000"  # Default Reynard backend URL
        self._timeout_seconds = 30
        self._max_retries = 3
        self._retry_delay = 1.0

        # Available embedding models
        self._embedding_models = {
            "code": "mxbai-embed-large",  # Best for code understanding
            "text": "bge-large-en-v1.5",  # Best for general text
            "multilingual": "bge-m3",  # Best for mixed content
        }

        # Search configuration
        self._default_top_k = 20
        self._default_similarity_threshold = 0.7

    async def initialize(self) -> bool:
        """Initialize connection to RAG backend."""
        try:
            # Test RAG backend connection using admin stats endpoint
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self._rag_base_url}/api/rag/admin/stats",
                    timeout=aiohttp.ClientTimeout(total=5),
                ) as response:
                    if response.status == 200:
                        logger.info("RAG backend connection successful")
                        return True
                    logger.warning(
                        f"RAG backend health check failed: {response.status}"
                    )
                    return False
        except Exception as e:
            logger.warning(f"RAG backend connection failed: {e}")
            return False

    async def semantic_search(
        self,
        query: str,
        search_type: str = "hybrid",
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
        top_k: int | None = None,
        similarity_threshold: float | None = None,
        model: str | None = None,
    ) -> dict[str, Any]:
        """Perform semantic search using RAG backend."""

        # Determine appropriate model
        if model is None:
            model = self._determine_model(query, file_types)

        # Set defaults
        top_k = top_k or self._default_top_k
        similarity_threshold = (
            similarity_threshold or self._default_similarity_threshold
        )

        try:
            # Prepare search request
            search_request = {
                "q": query,  # RAG backend expects 'q' field
                "modality": search_type,
                "top_k": top_k,
                "similarity_threshold": similarity_threshold,
                "enable_reranking": True,
                "filters": {
                    "file_types": file_types or [],
                    "directories": directories or [],
                    "model": model,
                },
            }

            # Execute search via RAG backend
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self._rag_base_url}/api/rag/query",
                    json=search_request,
                    timeout=aiohttp.ClientTimeout(total=self._timeout_seconds),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return self._process_rag_results(result, query, search_type)
                    error_text = await response.text()
                    logger.error(f"RAG search failed: {response.status} - {error_text}")
                    return {
                        "success": False,
                        "error": f"RAG backend error: {response.status}",
                        "query": query,
                    }

        except Exception as e:
            logger.exception("RAG semantic search failed")
            return {"success": False, "error": str(e), "query": query}

    async def embed_text(self, text: str, model: str | None = None) -> dict[str, Any]:
        """Generate embedding for text using RAG backend."""

        model = model or self._embedding_models["text"]

        try:
            # For now, we'll use the query endpoint to test embedding
            # The actual embed endpoint might not be implemented yet
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self._rag_base_url}/api/rag/query",
                    json={"q": text, "modality": "text", "top_k": 1},
                    timeout=aiohttp.ClientTimeout(total=self._timeout_seconds),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {
                            "success": True,
                            "embedding": result.get("embedding", []),
                            "model": model,
                            "dimensions": len(result.get("embedding", [])),
                        }
                    error_text = await response.text()
                    return {
                        "success": False,
                        "error": f"Embedding failed: {response.status} - {error_text}",
                    }

        except Exception as e:
            logger.exception("Text embedding failed")
            return {"success": False, "error": str(e)}

    async def index_documents(
        self,
        file_paths: list[str],
        model: str | None = None,
        chunk_size: int = 512,
        overlap: int = 50,
    ) -> dict[str, Any]:
        """Index documents for semantic search."""

        model = model or self._embedding_models["text"]

        try:
            index_request = {
                "file_paths": file_paths,
                "model": model,
                "chunk_size": chunk_size,
                "overlap": overlap,
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self._rag_base_url}/api/rag/ingest",
                    json=index_request,
                    timeout=aiohttp.ClientTimeout(
                        total=300
                    ),  # Longer timeout for indexing
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {
                            "success": True,
                            "indexed_files": result.get("indexed_files", 0),
                            "total_chunks": result.get("total_chunks", 0),
                            "model": model,
                        }
                    error_text = await response.text()
                    return {
                        "success": False,
                        "error": f"Indexing failed: {response.status} - {error_text}",
                    }

        except Exception as e:
            logger.exception("Document indexing failed")
            return {"success": False, "error": str(e)}

    def _determine_model(self, query: str, file_types: list[str] | None) -> str:
        """Determine the best embedding model based on query and file types."""

        # Check for code-specific indicators
        code_indicators = [
            "function",
            "class",
            "method",
            "import",
            "export",
            "async",
            "await",
            "interface",
            "type",
            "const",
            "let",
            "var",
            "def",
            "return",
        ]

        if any(indicator in query.lower() for indicator in code_indicators):
            return self._embedding_models["code"]

        # Check file types
        if file_types:
            code_extensions = [
                "py",
                "ts",
                "js",
                "tsx",
                "jsx",
                "vue",
                "go",
                "rs",
                "java",
                "cpp",
                "c",
            ]
            if any(ext in file_types for ext in code_extensions):
                return self._embedding_models["code"]

        # Check for multilingual content
        if any(ord(char) > 127 for char in query):  # Non-ASCII characters
            return self._embedding_models["multilingual"]

        # Default to text model
        return self._embedding_models["text"]

    def _process_rag_results(
        self, rag_result: dict[str, Any], query: str, search_type: str
    ) -> dict[str, Any]:
        """Process and format RAG backend results."""

        hits = rag_result.get("hits", [])
        processed_results = []

        for hit in hits:
            processed_result = {
                "file_path": hit.get("file_path", ""),
                "score": hit.get("score", 0.0),
                "match_type": "semantic",
                "context": hit.get("chunk_text", ""),
                "line_number": hit.get("chunk_index", 0),
                "snippet": self._extract_snippet(hit.get("chunk_text", "")),
                "metadata": hit.get("chunk_metadata", {}),
                "file_metadata": hit.get("file_metadata", {}),
            }
            processed_results.append(processed_result)

        return {
            "success": True,
            "query": query,
            "search_type": search_type,
            "total_results": len(processed_results),
            "results": processed_results,
            "rag_metadata": {
                "query_time": rag_result.get("query_time", 0),
                "embedding_time": rag_result.get("embedding_time", 0),
                "search_time": rag_result.get("search_time", 0),
                "model_used": rag_result.get("model_used", "unknown"),
            },
        }

    def _extract_snippet(self, text: str, max_length: int = 200) -> str:
        """Extract a meaningful snippet from text."""
        if len(text) <= max_length:
            return text

        # Try to find a good break point
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

    async def get_rag_stats(self) -> dict[str, Any]:
        """Get RAG backend statistics."""
        try:
            async with (
                aiohttp.ClientSession() as session,
                session.get(
                    f"{self._rag_base_url}/api/rag/admin/stats",
                    timeout=aiohttp.ClientTimeout(total=10),
                ) as response,
            ):
                if response.status == 200:
                    return await response.json()
                return {
                    "success": False,
                    "error": f"Stats request failed: {response.status}",
                }

        except Exception as e:
            logger.exception("Failed to get RAG stats")
            return {"success": False, "error": str(e)}
