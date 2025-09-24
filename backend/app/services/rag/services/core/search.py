"""Hybrid Search Engine: Advanced search combining semantic and keyword matching.

This service provides a hybrid search engine that combines semantic similarity
search with keyword-based search for optimal retrieval performance.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import time
from typing import Any, Dict, List, Optional

from ...interfaces.base import BaseService, ServiceStatus
from ...interfaces.search import SearchProvider, SearchResult, SearchType

logger = logging.getLogger("uvicorn")

# Enable debug logging for RAG operations
DEBUG_RAG_OPERATIONS = True


class KeywordIndex:
    """Simple keyword index for fast keyword-based search."""

    def __init__(self):
        self.documents: Dict[str, Dict[str, Any]] = {}
        self.inverted_index: Dict[str, Dict[str, float]] = {}
        self.document_frequencies: Dict[str, int] = {}
        self.total_documents = 0

    def add_document(self, doc_id: str, text: str, metadata: Dict[str, Any]) -> None:
        """Add document to the keyword index."""
        self.documents[doc_id] = {
            "text": text,
            "metadata": metadata,
            "tokens": self._tokenize(text)
        }
        
        # Update inverted index
        for token in self.documents[doc_id]["tokens"]:
            if token not in self.inverted_index:
                self.inverted_index[token] = {}
            
            # Calculate TF-IDF score
            tf = self.documents[doc_id]["tokens"].count(token)
            self.inverted_index[token][doc_id] = tf
        
        self.total_documents = len(self.documents)
        self._update_document_frequencies()

    def _tokenize(self, text: str) -> List[str]:
        """Simple tokenization."""
        import re
        # Convert to lowercase and split on non-alphanumeric characters
        tokens = re.findall(r'\b\w+\b', text.lower())
        return tokens

    def _update_document_frequencies(self) -> None:
        """Update document frequencies for IDF calculation."""
        self.document_frequencies = {}
        for token in self.inverted_index:
            self.document_frequencies[token] = len(self.inverted_index[token])

    def search_keywords(self, query: str, limit: int = 10) -> List[SearchResult]:
        """Search using keyword matching."""
        query_tokens = self._tokenize(query)
        scores: Dict[str, float] = {}
        
        for token in query_tokens:
            if token in self.inverted_index:
                # Calculate TF-IDF score
                idf = 1.0 + (self.total_documents / (1.0 + self.document_frequencies[token]))
                
                for doc_id, tf in self.inverted_index[token].items():
                    if doc_id not in scores:
                        scores[doc_id] = 0.0
                    scores[doc_id] += tf * idf
        
        # Sort by score and return results
        sorted_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        results = []
        for doc_id, score in sorted_docs[:limit]:
            if doc_id in self.documents:
                doc = self.documents[doc_id]
                results.append(SearchResult(
                    id=doc_id,
                    text=doc["text"],
                    score=score,
                    metadata=doc["metadata"],
                    search_type=SearchType.KEYWORD
                ))
        
        return results


class HybridSearchEngine(BaseService, SearchProvider):
    """Hybrid search engine combining semantic and keyword search."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__("hybrid-search-engine", config)
        
        # Search configuration
        self.semantic_weight = self.config.get("semantic_weight", 0.7)
        self.keyword_weight = self.config.get("keyword_weight", 0.3)
        self.default_limit = self.config.get("default_limit", 10)
        
        # Components
        self.keyword_index = KeywordIndex()
        self.embedding_provider = None
        self.vector_store = None
        
        # Metrics
        self.metrics = {
            "searches_performed": 0,
            "semantic_searches": 0,
            "keyword_searches": 0,
            "hybrid_searches": 0,
            "average_search_time_ms": 0.0,
            "total_search_time_ms": 0.0,
        }

    async def initialize(self) -> bool:
        """Initialize the hybrid search engine."""
        try:
            self.update_status(ServiceStatus.INITIALIZING, "Initializing hybrid search engine")
            
            # Dependencies will be injected by the main service
            self.update_status(ServiceStatus.HEALTHY, "Hybrid search engine initialized")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize hybrid search engine: {e}")
            self.update_status(ServiceStatus.ERROR, f"Initialization failed: {e}")
            return False

    async def shutdown(self) -> None:
        """Shutdown the hybrid search engine."""
        try:
            self.update_status(ServiceStatus.SHUTTING_DOWN, "Shutting down hybrid search engine")
            
            # Clear keyword index
            self.keyword_index = KeywordIndex()
            
            self.update_status(ServiceStatus.SHUTDOWN, "Hybrid search engine shutdown complete")
            
        except Exception as e:
            self.logger.error(f"Error during shutdown: {e}")

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check."""
        try:
            # Check dependencies
            dependencies_healthy = True
            if self.embedding_provider and not self.embedding_provider.is_healthy():
                dependencies_healthy = False
            if self.vector_store and not self.vector_store.is_healthy():
                dependencies_healthy = False
            
            if dependencies_healthy:
                self.update_status(ServiceStatus.HEALTHY, "Service is healthy")
            else:
                self.update_status(ServiceStatus.DEGRADED, "Some dependencies are unhealthy")
            
            return {
                "status": self.status.value,
                "message": self.health.message,
                "last_updated": self.health.last_updated.isoformat(),
                "metrics": self.metrics,
                "dependencies": self.get_dependency_status(),
            }
            
        except Exception as e:
            self.logger.error(f"Health check failed: {e}")
            self.update_status(ServiceStatus.ERROR, f"Health check failed: {e}")
            return {
                "status": "error",
                "message": str(e),
                "last_updated": self.health.last_updated.isoformat(),
                "metrics": self.metrics,
                "dependencies": self.get_dependency_status(),
            }

    def set_dependencies(self, embedding_provider, vector_store) -> None:
        """Set service dependencies."""
        self.embedding_provider = embedding_provider
        self.vector_store = vector_store
        
        if embedding_provider:
            self.add_dependency("embedding_provider", embedding_provider)
        if vector_store:
            self.add_dependency("vector_store", vector_store)

    async def search(
        self,
        query: str,
        search_type: SearchType = SearchType.HYBRID,
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> List[SearchResult]:
        """Perform search with specified type."""
        if DEBUG_RAG_OPERATIONS:
            logger.info(f"🦊 [SEARCH] Starting {search_type.value} search for query: '{query[:50]}...'")
        
        if not self.is_healthy():
            logger.error("🚨 [SEARCH] Service is not healthy")
            raise RuntimeError("Search engine is not healthy")
        
        start_time = time.time()
        
        try:
            if search_type == SearchType.SEMANTIC:
                if DEBUG_RAG_OPERATIONS:
                    logger.info(f"🦊 [SEARCH] Performing semantic search")
                results = await self.semantic_search(query, limit, filters=filters, **kwargs)
            elif search_type == SearchType.KEYWORD:
                if DEBUG_RAG_OPERATIONS:
                    logger.info(f"🦊 [SEARCH] Performing keyword search")
                results = await self.keyword_search(query, limit, filters=filters, **kwargs)
            elif search_type == SearchType.HYBRID:
                if DEBUG_RAG_OPERATIONS:
                    logger.info(f"🦊 [SEARCH] Performing hybrid search")
                results = await self.hybrid_search(query, limit, filters=filters, **kwargs)
            else:
                logger.error(f"🚨 [SEARCH] Unsupported search type: {search_type}")
                raise ValueError(f"Unsupported search type: {search_type}")
            
            # Update metrics
            search_time = (time.time() - start_time) * 1000
            self.metrics["searches_performed"] += 1
            self.metrics["total_search_time_ms"] += search_time
            self.metrics["average_search_time_ms"] = (
                self.metrics["total_search_time_ms"] / self.metrics["searches_performed"]
            )
            
            if DEBUG_RAG_OPERATIONS:
                logger.info(f"🦊 [SEARCH] Search completed in {search_time:.2f}ms, found {len(results)} results")
            
            return results
            
        except Exception as e:
            logger.error(f"🚨 [SEARCH] Search failed: {e}")
            raise RuntimeError(f"Search failed: {e}")

    async def semantic_search(
        self,
        query: str,
        limit: int = 10,
        similarity_threshold: float = 0.0,
        filters: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> List[SearchResult]:
        """Perform semantic similarity search."""
        if not self.embedding_provider or not self.vector_store:
            raise RuntimeError("Embedding provider and vector store are required for semantic search")
        
        try:
            # Generate query embedding
            embedding_result = await self.embedding_provider.embed_text(query)
            query_embedding = embedding_result.embedding
            
            # Search vector store
            vector_results = await self.vector_store.similarity_search(
                query_embedding,
                limit=limit,
                similarity_threshold=similarity_threshold,
                filters=filters
            )
            
            # Convert to search results
            results = []
            for vector_result in vector_results:
                results.append(SearchResult(
                    id=vector_result.id,
                    text=vector_result.metadata.get("text", ""),
                    score=vector_result.similarity_score,
                    metadata=vector_result.metadata,
                    search_type=SearchType.SEMANTIC
                ))
            
            self.metrics["semantic_searches"] += 1
            return results
            
        except Exception as e:
            self.logger.error(f"Semantic search failed: {e}")
            raise RuntimeError(f"Semantic search failed: {e}")

    async def keyword_search(
        self,
        query: str,
        limit: int = 10,
        use_bm25: bool = True,
        filters: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> List[SearchResult]:
        """Perform keyword-based search."""
        try:
            # Perform keyword search
            results = self.keyword_index.search_keywords(query, limit)
            
            # Apply filters if provided
            if filters:
                filtered_results = []
                for result in results:
                    match = True
                    for key, value in filters.items():
                        if result.metadata.get(key) != value:
                            match = False
                            break
                    if match:
                        filtered_results.append(result)
                results = filtered_results
            
            self.metrics["keyword_searches"] += 1
            return results
            
        except Exception as e:
            self.logger.error(f"Keyword search failed: {e}")
            raise RuntimeError(f"Keyword search failed: {e}")

    async def hybrid_search(
        self,
        query: str,
        limit: int = 10,
        semantic_weight: float = 0.7,
        keyword_weight: float = 0.3,
        filters: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> List[SearchResult]:
        """Perform hybrid search combining semantic and keyword."""
        try:
            # Get semantic results
            semantic_results = await self.semantic_search(query, limit * 2, filters=filters)
            
            # Get keyword results
            keyword_results = await self.keyword_search(query, limit * 2, filters=filters)
            
            # Combine results using reciprocal rank fusion
            combined_results = self._reciprocal_rank_fusion(
                semantic_results,
                keyword_results,
                semantic_weight,
                keyword_weight,
                limit
            )
            
            self.metrics["hybrid_searches"] += 1
            return combined_results
            
        except Exception as e:
            self.logger.error(f"Hybrid search failed: {e}")
            raise RuntimeError(f"Hybrid search failed: {e}")

    def _reciprocal_rank_fusion(
        self,
        semantic_results: List[SearchResult],
        keyword_results: List[SearchResult],
        semantic_weight: float,
        keyword_weight: float,
        limit: int
    ) -> List[SearchResult]:
        """Combine results using reciprocal rank fusion."""
        scores: Dict[str, float] = {}
        
        # Add semantic scores
        for i, result in enumerate(semantic_results):
            doc_id = result.id
            if doc_id not in scores:
                scores[doc_id] = 0.0
            scores[doc_id] += semantic_weight * (1.0 / (i + 1))
        
        # Add keyword scores
        for i, result in enumerate(keyword_results):
            doc_id = result.id
            if doc_id not in scores:
                scores[doc_id] = 0.0
            scores[doc_id] += keyword_weight * (1.0 / (i + 1))
        
        # Sort by combined score
        sorted_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        # Create combined results
        combined_results = []
        for doc_id, score in sorted_docs[:limit]:
            # Find the result in either list
            result = None
            for r in semantic_results + keyword_results:
                if r.id == doc_id:
                    result = r
                    break
            
            if result:
                # Create new result with combined score
                combined_results.append(SearchResult(
                    id=result.id,
                    text=result.text,
                    score=score,
                    metadata=result.metadata,
                    search_type=SearchType.HYBRID
                ))
        
        return combined_results

    async def index_documents(
        self, 
        documents: List[Dict[str, Any]],
        **kwargs
    ) -> Dict[str, Any]:
        """Index documents for search."""
        if not documents:
            return {"indexed": 0, "errors": 0}
        
        indexed_count = 0
        error_count = 0
        
        try:
            for doc in documents:
                try:
                    # Add to keyword index
                    self.keyword_index.add_document(
                        doc["id"],
                        doc["text"],
                        doc.get("metadata", {})
                    )
                    indexed_count += 1
                    
                except Exception as e:
                    self.logger.error(f"Failed to index document {doc.get('id', 'unknown')}: {e}")
                    error_count += 1
            
            return {
                "indexed": indexed_count,
                "errors": error_count,
                "total": len(documents)
            }
            
        except Exception as e:
            self.logger.error(f"Failed to index documents: {e}")
            raise RuntimeError(f"Failed to index documents: {e}")

    async def update_document(
        self, 
        id: str, 
        document: Dict[str, Any],
        **kwargs
    ) -> bool:
        """Update an indexed document."""
        try:
            # Remove from keyword index
            if id in self.keyword_index.documents:
                del self.keyword_index.documents[id]
            
            # Add updated document
            self.keyword_index.add_document(
                id,
                document["text"],
                document.get("metadata", {})
            )
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to update document {id}: {e}")
            return False

    async def delete_document(self, id: str) -> bool:
        """Delete a document from the index."""
        try:
            if id in self.keyword_index.documents:
                del self.keyword_index.documents[id]
                return True
            return False
            
        except Exception as e:
            self.logger.error(f"Failed to delete document {id}: {e}")
            return False

    async def get_search_stats(self) -> Dict[str, Any]:
        """Get search service statistics."""
        return {
            "service_name": self.name,
            "status": self.status.value,
            "searches_performed": self.metrics["searches_performed"],
            "semantic_searches": self.metrics["semantic_searches"],
            "keyword_searches": self.metrics["keyword_searches"],
            "hybrid_searches": self.metrics["hybrid_searches"],
            "average_search_time_ms": self.metrics["average_search_time_ms"],
            "indexed_documents": len(self.keyword_index.documents),
            "index_tokens": len(self.keyword_index.inverted_index),
        }

    async def optimize_index(self) -> bool:
        """Optimize search index for better performance."""
        try:
            # Rebuild keyword index
            self.keyword_index._update_document_frequencies()
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to optimize index: {e}")
            return False

    async def clear_index(self) -> bool:
        """Clear all documents from the search index."""
        try:
            self.keyword_index = KeywordIndex()
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to clear index: {e}")
            return False

    # SearchProvider interface methods
    async def remove_documents(self, document_ids: List[str]) -> bool:
        """Remove documents from index."""
        try:
            for doc_id in document_ids:
                await self.delete_document(doc_id)
            return True
        except Exception as e:
            self.logger.error(f"Failed to remove documents: {e}")
            return False

    async def get_stats(self) -> Dict[str, Any]:
        """Get service statistics."""
        try:
            stats = await self.get_search_stats()
            return {
                "total_documents_indexed": stats.get("total_documents", 0),
                "total_queries_processed": stats.get("total_queries", 0),
                "average_query_time_ms": stats.get("average_query_time_ms", 0),
                "index_size_mb": stats.get("index_size_mb", 0),
                "uptime_seconds": time.time() - (self.startup_time or time.time()),
                "status": self.status.value,
                "last_updated": self.health.last_updated.isoformat() if self.health else None
            }
        except Exception as e:
            self.logger.error(f"Failed to get stats: {e}")
            return {"error": str(e), "status": self.status.value}
