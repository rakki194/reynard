"""
Search Engine: Advanced search capabilities combining semantic and keyword matching.

This service provides:
- Semantic search using vector embeddings
- Keyword-based search with BM25 scoring
- Hybrid search with Reciprocal Rank Fusion (RRF)
- Search result ranking and filtering
- Performance optimization and caching
"""

import asyncio
import logging
import re
import time
from collections import defaultdict, Counter
from typing import Any, Dict, List, Optional, Tuple
import math

logger = logging.getLogger("uvicorn")

# Optional imports for advanced search
try:
    from rank_bm25 import BM25Okapi

    BM25_AVAILABLE = True
except ImportError:
    BM25_AVAILABLE = False
    BM25Okapi = None

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity

    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    TfidfVectorizer = None
    cosine_similarity = None


class KeywordIndex:
    """Simple keyword index for fast keyword-based search."""

    def __init__(self):
        self.index: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        self.documents: List[Dict[str, Any]] = []
        self.bm25_index = None
        self._build_bm25_index()

    def add_document(self, doc_id: str, text: str, metadata: Dict[str, Any]) -> None:
        """Add a document to the keyword index."""
        doc = {
            "id": doc_id,
            "text": text,
            "metadata": metadata,
            "tokens": self._tokenize(text),
        }

        self.documents.append(doc)

        # Add to keyword index
        for token in doc["tokens"]:
            self.index[token].append(doc)

    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text for keyword indexing."""
        # Simple tokenization - in production, use more sophisticated tokenization
        text = text.lower()
        # Remove special characters and split
        tokens = re.findall(r"\b\w+\b", text)
        # Remove common stop words
        stop_words = {
            "the",
            "a",
            "an",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
            "is",
            "are",
            "was",
            "were",
            "be",
            "been",
            "have",
            "has",
            "had",
            "do",
            "does",
            "did",
            "will",
            "would",
            "could",
            "should",
            "this",
            "that",
            "these",
            "those",
            "i",
            "you",
            "he",
            "she",
            "it",
            "we",
            "they",
            "me",
            "him",
            "her",
            "us",
            "them",
        }
        return [token for token in tokens if token not in stop_words and len(token) > 2]

    def _build_bm25_index(self) -> None:
        """Build BM25 index for advanced keyword search."""
        if not BM25_AVAILABLE:
            logger.warning("BM25 not available, using simple keyword matching")
            return

        if self.documents:
            try:
                tokenized_docs = [doc["tokens"] for doc in self.documents]
                self.bm25_index = BM25Okapi(tokenized_docs)
            except Exception as e:
                logger.warning(f"Failed to build BM25 index: {e}")
                self.bm25_index = None

    def search_keywords(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search using keyword matching."""
        query_tokens = self._tokenize(query)

        if not query_tokens:
            return []

        # Simple keyword matching
        doc_scores = defaultdict(float)

        for token in query_tokens:
            if token in self.index:
                for doc in self.index[token]:
                    doc_scores[doc["id"]] += 1.0

        # Sort by score
        sorted_docs = sorted(doc_scores.items(), key=lambda x: x[1], reverse=True)

        results = []
        for doc_id, score in sorted_docs[:limit]:
            doc = next((d for d in self.documents if d["id"] == doc_id), None)
            if doc:
                results.append(
                    {
                        "content": doc["text"],
                        "score": score,
                        "type": "keyword",
                        "metadata": doc["metadata"],
                    }
                )

        return results

    def search_bm25(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search using BM25 scoring."""
        if not self.bm25_index:
            return self.search_keywords(query, limit)

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        try:
            scores = self.bm25_index.get_scores(query_tokens)

            # Get top results
            doc_scores = list(enumerate(scores))
            doc_scores.sort(key=lambda x: x[1], reverse=True)

            results = []
            for doc_idx, score in doc_scores[:limit]:
                if score > 0:
                    doc = self.documents[doc_idx]
                    results.append(
                        {
                            "content": doc["text"],
                            "score": score,
                            "type": "bm25",
                            "metadata": doc["metadata"],
                        }
                    )

            return results
        except Exception as e:
            logger.warning(f"BM25 search failed: {e}")
            return self.search_keywords(query, limit)


class SearchEngine:
    """Advanced search engine combining semantic and keyword matching."""

    def __init__(self, embedding_service, vector_store_service):
        self.embedding_service = embedding_service
        self.vector_store_service = vector_store_service
        self.keyword_index = KeywordIndex()

        # Configuration
        self.default_semantic_weight = 0.7
        self.default_keyword_weight = 0.3
        self.rrf_k = 60  # RRF parameter
        self.max_results = 100  # Maximum results to consider for fusion

        # Performance tracking
        self.search_stats = {
            "semantic_searches": 0,
            "keyword_searches": 0,
            "hybrid_searches": 0,
            "average_fusion_time_ms": 0.0,
        }

    async def semantic_search(
        self,
        query: str,
        limit: int = 10,
        dataset_id: Optional[str] = None,
        similarity_threshold: float = 0.0,
    ) -> List[Dict[str, Any]]:
        """Perform semantic search using embeddings."""
        try:
            start_time = time.time()

            # Generate query embedding
            query_embedding = await self.embedding_service.embed_text(query)

            # Perform vector similarity search
            results = await self.vector_store_service.similarity_search(
                query_embedding,
                limit=limit,
                dataset_id=dataset_id,
                similarity_threshold=similarity_threshold,
            )

            # Format results
            formatted_results = []
            for result in results:
                formatted_results.append(
                    {
                        "content": result.get("text", ""),
                        "score": result.get("similarity", 0.0),
                        "type": "semantic",
                        "metadata": result.get("metadata", {}),
                        "path": result.get("path", ""),
                        "title": result.get("title", ""),
                        "file_type": result.get("file_type", ""),
                    }
                )

            # Update stats
            self.search_stats["semantic_searches"] += 1

            search_time = (time.time() - start_time) * 1000
            logger.debug(
                f"Semantic search completed in {search_time:.2f}ms, found {len(formatted_results)} results"
            )

            return formatted_results

        except Exception as e:
            logger.error(f"Semantic search failed: {e}")
            return []

    async def keyword_search(
        self, query: str, limit: int = 10, use_bm25: bool = True
    ) -> List[Dict[str, Any]]:
        """Perform keyword-based search."""
        try:
            start_time = time.time()

            # Use BM25 if available, otherwise fallback to simple keyword matching
            if use_bm25 and BM25_AVAILABLE:
                results = self.keyword_index.search_bm25(query, limit)
            else:
                results = self.keyword_index.search_keywords(query, limit)

            # Update stats
            self.search_stats["keyword_searches"] += 1

            search_time = (time.time() - start_time) * 1000
            logger.debug(
                f"Keyword search completed in {search_time:.2f}ms, found {len(results)} results"
            )

            return results

        except Exception as e:
            logger.error(f"Keyword search failed: {e}")
            return []

    async def hybrid_search(
        self,
        query: str,
        limit: int = 10,
        semantic_weight: Optional[float] = None,
        keyword_weight: Optional[float] = None,
        dataset_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Combine semantic and keyword search with weighted fusion."""

        if semantic_weight is None:
            semantic_weight = self.default_semantic_weight
        if keyword_weight is None:
            keyword_weight = self.default_keyword_weight

        # Ensure weights sum to 1.0
        total_weight = semantic_weight + keyword_weight
        if total_weight > 0:
            semantic_weight /= total_weight
            keyword_weight /= total_weight

        start_time = time.time()

        # Parallel execution of both search types
        semantic_task = self.semantic_search(query, limit * 2, dataset_id)
        keyword_task = self.keyword_search(query, limit * 2)

        semantic_results, keyword_results = await asyncio.gather(
            semantic_task, keyword_task
        )

        # Fusion with Reciprocal Rank Fusion (RRF)
        fused_results = self._reciprocal_rank_fusion(
            semantic_results, keyword_results, semantic_weight, keyword_weight, limit
        )

        # Update performance stats
        fusion_time = (time.time() - start_time) * 1000
        self._update_search_stats(fusion_time)

        logger.debug(
            f"Hybrid search completed in {fusion_time:.2f}ms, found {len(fused_results)} results"
        )

        return fused_results

    def _reciprocal_rank_fusion(
        self,
        semantic_results: List[Dict],
        keyword_results: List[Dict],
        semantic_weight: float,
        keyword_weight: float,
        limit: int,
    ) -> List[Dict[str, Any]]:
        """Combine results using Reciprocal Rank Fusion algorithm."""

        # Create score maps
        semantic_scores = {}
        keyword_scores = {}

        # Assign RRF scores to semantic results
        for i, result in enumerate(semantic_results):
            doc_id = self._get_doc_id(result)
            semantic_scores[doc_id] = 1.0 / (self.rrf_k + i + 1)

        # Assign RRF scores to keyword results
        for i, result in enumerate(keyword_results):
            doc_id = self._get_doc_id(result)
            keyword_scores[doc_id] = 1.0 / (self.rrf_k + i + 1)

        # Combine scores
        combined_scores = {}
        all_docs = set(semantic_scores.keys()) | set(keyword_scores.keys())

        for doc_id in all_docs:
            semantic_score = semantic_scores.get(doc_id, 0)
            keyword_score = keyword_scores.get(doc_id, 0)

            combined_scores[doc_id] = (
                semantic_weight * semantic_score + keyword_weight * keyword_score
            )

        # Sort by combined score and return top results
        sorted_docs = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)

        # Reconstruct results with combined scores
        final_results = []
        for doc_id, score in sorted_docs[:limit]:
            # Find the original result (prefer semantic if available)
            result = None
            for r in semantic_results:
                if self._get_doc_id(r) == doc_id:
                    result = r.copy()
                    break

            if not result:
                for r in keyword_results:
                    if self._get_doc_id(r) == doc_id:
                        result = r.copy()
                        break

            if result:
                result["score"] = score
                result["type"] = "hybrid"
                final_results.append(result)

        self.search_stats["hybrid_searches"] += 1
        return final_results

    def _get_doc_id(self, result: Dict[str, Any]) -> str:
        """Extract document ID from result."""
        # Try different possible ID fields
        metadata = result.get("metadata", {})
        return (
            metadata.get("chunk_id")
            or metadata.get("document_id")
            or metadata.get("id")
            or str(hash(result.get("content", "")))
        )

    def _update_search_stats(self, fusion_time_ms: float) -> None:
        """Update search performance statistics."""
        current_avg = self.search_stats["average_fusion_time_ms"]
        total_searches = self.search_stats["hybrid_searches"]

        # Update running average
        if total_searches == 1:
            self.search_stats["average_fusion_time_ms"] = fusion_time_ms
        else:
            self.search_stats["average_fusion_time_ms"] = (
                current_avg * (total_searches - 1) + fusion_time_ms
            ) / total_searches

    def index_documents(self, documents: List[Dict[str, Any]]) -> None:
        """Index documents for keyword search."""
        for doc in documents:
            doc_id = doc.get("id", str(hash(doc.get("text", ""))))
            text = doc.get("text", "")
            metadata = doc.get("metadata", {})

            self.keyword_index.add_document(doc_id, text, metadata)

        # Rebuild BM25 index
        self.keyword_index._build_bm25_index()

        logger.info(f"Indexed {len(documents)} documents for keyword search")

    async def search_with_filters(
        self,
        query: str,
        search_type: str = "hybrid",
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Search with additional filters and options."""

        # Apply filters
        dataset_id = filters.get("dataset_id") if filters else None
        similarity_threshold = (
            filters.get("similarity_threshold", 0.0) if filters else 0.0
        )
        file_types = filters.get("file_types") if filters else None
        languages = filters.get("languages") if filters else None

        # Perform search based on type
        if search_type == "semantic":
            results = await self.semantic_search(
                query, limit, dataset_id, similarity_threshold
            )
        elif search_type == "keyword":
            results = await self.keyword_search(query, limit)
        else:  # hybrid
            results = await self.hybrid_search(query, limit, dataset_id=dataset_id)

        # Apply post-search filters
        if file_types:
            results = [r for r in results if r.get("file_type") in file_types]

        if languages:
            results = [
                r for r in results if r.get("metadata", {}).get("language") in languages
            ]

        return results

    def get_search_stats(self) -> Dict[str, Any]:
        """Get search engine statistics."""
        return {
            **self.search_stats,
            "documents_indexed": len(self.keyword_index.documents),
            "unique_keywords": len(self.keyword_index.index),
            "bm25_available": self.keyword_index.bm25_index is not None,
            "default_semantic_weight": self.default_semantic_weight,
            "default_keyword_weight": self.default_keyword_weight,
            "rrf_k": self.rrf_k,
            "bm25_available": BM25_AVAILABLE,
            "sklearn_available": SKLEARN_AVAILABLE,
        }

    def clear_index(self) -> None:
        """Clear the keyword index."""
        self.keyword_index = KeywordIndex()
        logger.info("Keyword index cleared")

    async def benchmark_search_performance(
        self, test_queries: List[str], iterations: int = 5
    ) -> Dict[str, Any]:
        """Benchmark search performance across different methods."""
        results = {"semantic_only": [], "keyword_only": [], "hybrid": []}

        for query in test_queries:
            # Test semantic search
            start_time = time.time()
            for _ in range(iterations):
                await self.semantic_search(query, 10)
            semantic_time = (time.time() - start_time) / iterations

            # Test keyword search
            start_time = time.time()
            for _ in range(iterations):
                await self.keyword_search(query, 10)
            keyword_time = (time.time() - start_time) / iterations

            # Test hybrid search
            start_time = time.time()
            for _ in range(iterations):
                await self.hybrid_search(query, 10)
            hybrid_time = (time.time() - start_time) / iterations

            results["semantic_only"].append(semantic_time * 1000)  # Convert to ms
            results["keyword_only"].append(keyword_time * 1000)
            results["hybrid"].append(hybrid_time * 1000)

        # Calculate averages
        benchmark_results = {}
        for method, times in results.items():
            benchmark_results[method] = {
                "average_ms": sum(times) / len(times),
                "min_ms": min(times),
                "max_ms": max(times),
                "total_queries": len(times) * iterations,
            }

        return benchmark_results
