#!/usr/bin/env python3
"""
Semantic Search Service

Advanced semantic search using chromadb and faiss for prompt refinement research.
Replaces the pseudo-code semantic_search() functions with actual implementations.

🦊 Fox approach: Intelligent vector search with strategic similarity matching
"""

import asyncio
import logging
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
import json
import time

# Optional imports with fallbacks
try:
    import chromadb
    from chromadb.config import Settings

    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False
    chromadb = None

try:
    import faiss

    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    faiss = None

try:
    from sentence_transformers import SentenceTransformer

    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    SentenceTransformer = None

logger = logging.getLogger(__name__)


@dataclass
class SearchResult:
    """Result of semantic search operation."""

    content: str
    score: float
    metadata: Dict[str, Any]
    source: str
    timestamp: float


class SemanticSearchService:
    """
    Advanced semantic search service using chromadb and faiss.

    Provides vector-based similarity search for prompt refinement research.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize the semantic search service."""
        self.config = config or {}

        # Configuration
        self.embedding_model = self.config.get("embedding_model", "all-MiniLM-L6-v2")
        self.collection_name = self.config.get("collection_name", "prompt_refinement")
        self.similarity_threshold = self.config.get("similarity_threshold", 0.7)
        self.max_results = self.config.get("max_results", 20)

        # Storage paths
        self.data_dir = Path(self.config.get("data_dir", "./data/semantic_search"))
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Initialize components
        self.embedding_model_instance: Optional[SentenceTransformer] = None
        self.chroma_client: Optional[chromadb.ClientAPI] = None
        self.chroma_collection: Optional[chromadb.Collection] = None
        self.faiss_index: Optional[faiss.Index] = None
        self.vector_store: Dict[str, Any] = {}

        self._initialized = False

    async def initialize(self) -> bool:
        """Initialize the semantic search service."""
        try:
            # Initialize embedding model
            if SENTENCE_TRANSFORMERS_AVAILABLE:
                self.embedding_model_instance = SentenceTransformer(
                    self.embedding_model
                )
                logger.info(f"Loaded embedding model: {self.embedding_model}")
            else:
                logger.warning("sentence-transformers not available, using fallback")

            # Initialize ChromaDB
            if CHROMADB_AVAILABLE:
                self.chroma_client = chromadb.PersistentClient(
                    path=str(self.data_dir / "chromadb"),
                    settings=Settings(anonymized_telemetry=False),
                )

                # Get or create collection
                try:
                    self.chroma_collection = self.chroma_client.get_collection(
                        name=self.collection_name
                    )
                except ValueError:
                    self.chroma_collection = self.chroma_client.create_collection(
                        name=self.collection_name,
                        metadata={"description": "Prompt refinement semantic search"},
                    )

                logger.info("ChromaDB initialized successfully")
            else:
                logger.warning("ChromaDB not available, using fallback storage")

            # Initialize FAISS index
            if FAISS_AVAILABLE and self.embedding_model_instance:
                embedding_dim = (
                    self.embedding_model_instance.get_sentence_embedding_dimension()
                )
                self.faiss_index = faiss.IndexFlatIP(
                    embedding_dim
                )  # Inner product for cosine similarity
                logger.info(f"FAISS index initialized with dimension {embedding_dim}")
            else:
                logger.warning("FAISS not available, using fallback similarity")

            # Load existing data
            await self._load_existing_data()

            self._initialized = True
            logger.info("Semantic search service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize semantic search service: {e}")
            return False

    async def research_related_concepts(
        self, query: str, key_concepts: List[str]
    ) -> Dict[str, Any]:
        """
        Research related concepts using semantic search.

        Replaces the pseudo-code semantic_search() function.
        """
        if not self._initialized:
            await self.initialize()

        logger.info(f"Researching related concepts for query: {query}")

        # Generate search queries
        search_queries = self._generate_semantic_queries(query, key_concepts)

        # Perform semantic searches
        search_results = []
        for search_query in search_queries:
            results = await self.semantic_search(
                search_query,
                limit=self.max_results,
                similarity_threshold=self.similarity_threshold,
            )
            search_results.extend(results)

        # Deduplicate and rank results
        unique_results = self._deduplicate_results(search_results)
        ranked_results = self._rank_results(unique_results, query)

        # Extract related concepts
        related_concepts = self._extract_related_concepts(ranked_results)

        return {
            "query": query,
            "key_concepts": key_concepts,
            "search_queries": search_queries,
            "search_results": ranked_results,
            "related_concepts": related_concepts,
            "concept_relationships": self._analyze_concept_relationships(
                ranked_results
            ),
        }

    async def semantic_search(
        self,
        query: str,
        limit: int = 10,
        similarity_threshold: float = 0.7,
        metadata_filter: Optional[Dict[str, Any]] = None,
    ) -> List[SearchResult]:
        """
        Perform semantic search using vector similarity.

        Replaces the pseudo-code semantic_search() function.
        """
        if not self._initialized:
            await self.initialize()

        logger.info(f"Performing semantic search for: {query}")

        try:
            # Generate query embedding
            query_embedding = await self._generate_embedding(query)

            # Search using ChromaDB if available
            if self.chroma_collection:
                results = await self._search_chromadb(
                    query_embedding, limit, similarity_threshold, metadata_filter
                )
            # Fallback to FAISS
            elif self.faiss_index is not None:
                results = await self._search_faiss(
                    query_embedding, limit, similarity_threshold
                )
            # Fallback to simple similarity
            else:
                results = await self._search_fallback(
                    query, limit, similarity_threshold
                )

            logger.info(f"Found {len(results)} semantic search results")
            return results

        except Exception as e:
            logger.error(f"Semantic search failed: {e}")
            return []

    async def add_documents(
        self, documents: List[Dict[str, Any]], batch_size: int = 100
    ) -> bool:
        """
        Add documents to the semantic search index.

        Args:
            documents: List of documents with 'content', 'metadata', and 'id' fields
            batch_size: Number of documents to process in each batch
        """
        if not self._initialized:
            await self.initialize()

        logger.info(f"Adding {len(documents)} documents to semantic search index")

        try:
            # Process documents in batches
            for i in range(0, len(documents), batch_size):
                batch = documents[i : i + batch_size]
                await self._add_document_batch(batch)

            logger.info("Successfully added all documents to semantic search index")
            return True

        except Exception as e:
            logger.error(f"Failed to add documents: {e}")
            return False

    def _generate_semantic_queries(
        self, query: str, key_concepts: List[str]
    ) -> List[str]:
        """Generate semantic search queries."""
        queries = [query]  # Original query

        # Add concept-specific queries
        for concept in key_concepts[:3]:  # Limit to top 3 concepts
            queries.append(f"{concept} {query}")
            queries.append(f"related to {concept}")
            queries.append(f"similar to {concept}")

        # Add expansion queries
        expansion_terms = ["tutorial", "guide", "example", "best practice", "how to"]
        for term in expansion_terms[:2]:  # Limit to 2 expansion terms
            queries.append(f"{query} {term}")

        return list(set(queries))  # Remove duplicates

    async def _generate_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for text."""
        if self.embedding_model_instance:
            # Use sentence transformers
            embedding = self.embedding_model_instance.encode(text)
            return embedding.astype(np.float32)
        else:
            # Fallback to simple hash-based embedding
            return self._generate_fallback_embedding(text)

    def _generate_fallback_embedding(self, text: str) -> np.ndarray:
        """Generate fallback embedding using simple hash."""
        # Simple hash-based embedding (not recommended for production)
        words = text.lower().split()
        embedding = np.zeros(384)  # Standard embedding dimension

        for word in words:
            word_hash = hash(word) % 384
            embedding[word_hash] += 1

        # Normalize
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm

        return embedding.astype(np.float32)

    async def _search_chromadb(
        self,
        query_embedding: np.ndarray,
        limit: int,
        similarity_threshold: float,
        metadata_filter: Optional[Dict[str, Any]] = None,
    ) -> List[SearchResult]:
        """Search using ChromaDB."""
        try:
            # Convert numpy array to list for ChromaDB
            query_embedding_list = query_embedding.tolist()

            # Perform search
            results = self.chroma_collection.query(
                query_embeddings=[query_embedding_list],
                n_results=limit,
                where=metadata_filter,
            )

            # Convert results to SearchResult objects
            search_results = []
            if results["documents"] and results["documents"][0]:
                for i, (doc, metadata, distance) in enumerate(
                    zip(
                        results["documents"][0],
                        results["metadatas"][0],
                        results["distances"][0],
                    )
                ):
                    # Convert distance to similarity score
                    similarity_score = 1.0 - distance

                    if similarity_score >= similarity_threshold:
                        search_results.append(
                            SearchResult(
                                content=doc,
                                score=similarity_score,
                                metadata=metadata or {},
                                source=metadata.get("source", "unknown"),
                                timestamp=time.time(),
                            )
                        )

            return search_results

        except Exception as e:
            logger.error(f"ChromaDB search failed: {e}")
            return []

    async def _search_faiss(
        self, query_embedding: np.ndarray, limit: int, similarity_threshold: float
    ) -> List[SearchResult]:
        """Search using FAISS."""
        try:
            if self.faiss_index.ntotal == 0:
                return []

            # Perform search
            query_embedding = query_embedding.reshape(1, -1)
            scores, indices = self.faiss_index.search(query_embedding, limit)

            # Convert results to SearchResult objects
            search_results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx >= 0 and score >= similarity_threshold:
                    # Get document from vector store
                    doc_id = f"doc_{idx}"
                    if doc_id in self.vector_store:
                        doc_data = self.vector_store[doc_id]
                        search_results.append(
                            SearchResult(
                                content=doc_data["content"],
                                score=float(score),
                                metadata=doc_data.get("metadata", {}),
                                source=doc_data.get("source", "unknown"),
                                timestamp=time.time(),
                            )
                        )

            return search_results

        except Exception as e:
            logger.error(f"FAISS search failed: {e}")
            return []

    async def _search_fallback(
        self, query: str, limit: int, similarity_threshold: float
    ) -> List[SearchResult]:
        """Fallback search using simple text similarity."""
        try:
            query_words = set(query.lower().split())
            search_results = []

            # Search through stored documents
            for doc_id, doc_data in self.vector_store.items():
                content = doc_data["content"]
                content_words = set(content.lower().split())

                # Calculate simple Jaccard similarity
                intersection = len(query_words.intersection(content_words))
                union = len(query_words.union(content_words))
                similarity = intersection / union if union > 0 else 0

                if similarity >= similarity_threshold:
                    search_results.append(
                        SearchResult(
                            content=content,
                            score=similarity,
                            metadata=doc_data.get("metadata", {}),
                            source=doc_data.get("source", "unknown"),
                            timestamp=time.time(),
                        )
                    )

            # Sort by score and limit results
            search_results.sort(key=lambda x: x.score, reverse=True)
            return search_results[:limit]

        except Exception as e:
            logger.error(f"Fallback search failed: {e}")
            return []

    async def _add_document_batch(self, documents: List[Dict[str, Any]]) -> None:
        """Add a batch of documents to the index."""
        try:
            # Extract content and metadata
            contents = [doc["content"] for doc in documents]
            metadatas = [doc.get("metadata", {}) for doc in documents]
            ids = [doc.get("id", f"doc_{i}") for i, doc in enumerate(documents)]

            # Generate embeddings
            if self.embedding_model_instance:
                embeddings = self.embedding_model_instance.encode(contents)
                embeddings = embeddings.astype(np.float32)
            else:
                embeddings = [
                    self._generate_fallback_embedding(content) for content in contents
                ]

            # Add to ChromaDB if available
            if self.chroma_collection:
                self.chroma_collection.add(
                    documents=contents,
                    metadatas=metadatas,
                    ids=ids,
                    embeddings=(
                        embeddings.tolist()
                        if hasattr(embeddings, "tolist")
                        else embeddings
                    ),
                )

            # Add to FAISS if available
            if self.faiss_index is not None:
                if hasattr(embeddings, "tolist"):
                    self.faiss_index.add(embeddings)
                else:
                    embedding_matrix = np.vstack(embeddings)
                    self.faiss_index.add(embedding_matrix)

            # Add to fallback storage
            for i, doc in enumerate(documents):
                doc_id = ids[i]
                self.vector_store[doc_id] = {
                    "content": doc["content"],
                    "metadata": doc.get("metadata", {}),
                    "source": doc.get("source", "unknown"),
                }

            logger.info(f"Added batch of {len(documents)} documents")

        except Exception as e:
            logger.error(f"Failed to add document batch: {e}")
            raise

    def _deduplicate_results(self, results: List[SearchResult]) -> List[SearchResult]:
        """Remove duplicate results based on content similarity."""
        unique_results = []
        seen_contents = set()

        for result in results:
            # Simple deduplication based on content hash
            content_hash = hash(result.content[:100])  # Use first 100 chars
            if content_hash not in seen_contents:
                seen_contents.add(content_hash)
                unique_results.append(result)

        return unique_results

    def _rank_results(
        self, results: List[SearchResult], query: str
    ) -> List[SearchResult]:
        """Rank results by relevance to the query."""
        # Sort by score (already done in search methods)
        return sorted(results, key=lambda x: x.score, reverse=True)

    def _extract_related_concepts(self, results: List[SearchResult]) -> List[str]:
        """Extract related concepts from search results."""
        concepts = set()

        for result in results:
            # Extract concepts from content
            content_words = result.content.lower().split()

            # Filter for potential concepts (longer words, not common words)
            common_words = {
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
                "may",
                "might",
                "can",
                "this",
                "that",
                "these",
                "those",
            }

            for word in content_words:
                if len(word) > 4 and word not in common_words and word.isalpha():
                    concepts.add(word)

        return list(concepts)[:15]  # Limit to 15 concepts

    def _analyze_concept_relationships(
        self, results: List[SearchResult]
    ) -> Dict[str, List[str]]:
        """Analyze relationships between concepts."""
        relationships = {}

        # Simple co-occurrence analysis
        concept_pairs = {}

        for result in results:
            content_words = result.content.lower().split()
            concepts = [
                word for word in content_words if len(word) > 4 and word.isalpha()
            ]

            # Find concept pairs
            for i, concept1 in enumerate(concepts):
                for concept2 in concepts[i + 1 : i + 5]:  # Look at next 4 words
                    pair = tuple(sorted([concept1, concept2]))
                    concept_pairs[pair] = concept_pairs.get(pair, 0) + 1

        # Build relationships
        for (concept1, concept2), count in concept_pairs.items():
            if count > 1:  # Only include pairs that co-occur multiple times
                if concept1 not in relationships:
                    relationships[concept1] = []
                relationships[concept1].append(concept2)

        return relationships

    async def _load_existing_data(self) -> None:
        """Load existing data from storage."""
        try:
            # Load from JSON fallback storage
            fallback_file = self.data_dir / "vector_store.json"
            if fallback_file.exists():
                with open(fallback_file, "r") as f:
                    self.vector_store = json.load(f)
                logger.info(
                    f"Loaded {len(self.vector_store)} documents from fallback storage"
                )

        except Exception as e:
            logger.warning(f"Failed to load existing data: {e}")

    async def save_data(self) -> None:
        """Save data to persistent storage."""
        try:
            # Save fallback storage
            fallback_file = self.data_dir / "vector_store.json"
            with open(fallback_file, "w") as f:
                json.dump(self.vector_store, f, indent=2)

            logger.info("Saved semantic search data to persistent storage")

        except Exception as e:
            logger.error(f"Failed to save data: {e}")

    async def initialize(self) -> bool:
        """Initialize the semantic search service."""
        try:
            await self._load_existing_data()
            logger.info("Semantic search service initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize semantic search service: {e}")
            return False

    async def research_related_concepts(
        self, query: str, key_concepts: List[str] = None
    ) -> Dict[str, Any]:
        """
        Research related concepts using semantic search.

        Enhanced version that accepts key concepts for better research.
        """
        logger.debug(
            f"Researching related concepts for: {query} with concepts: {key_concepts}"
        )

        # Perform semantic search
        search_results = await self.semantic_search(query, limit=5)

        # Extract related concepts from results
        related_concepts = []
        for result in search_results:
            # Simple concept extraction from content
            content = result.get("content", "")
            words = content.lower().split()
            for word in words:
                if len(word) > 4 and word not in [
                    "this",
                    "that",
                    "with",
                    "from",
                    "they",
                    "have",
                ]:
                    related_concepts.append(word)

        # Add key concepts if provided
        if key_concepts:
            related_concepts.extend(key_concepts)

        return {
            "query": query,
            "search_results": search_results,
            "related_concepts": list(set(related_concepts))[
                :10
            ],  # Remove duplicates and limit
            "concept_count": len(related_concepts),
        }

    async def close(self):
        """Close the semantic search service."""
        try:
            await self.save_data()

            if self.chroma_client:
                # ChromaDB doesn't need explicit closing
                pass

            logger.info("Semantic search service closed")

        except Exception as e:
            logger.error(f"Error closing semantic search service: {e}")
