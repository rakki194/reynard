"""PostgreSQL Vector Store: Vector storage using PostgreSQL with pgvector.

This service provides vector storage and similarity search using PostgreSQL
with the pgvector extension, offering high-performance vector operations.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import time
from typing import Any, Dict, List, Optional, Sequence

import asyncpg
from asyncpg import Connection, Pool

from ...interfaces.base import BaseService, ServiceStatus
from ...interfaces.vector_store import VectorStore, VectorDocument, VectorSearchResult

logger = logging.getLogger("uvicorn")

# Enable debug logging for RAG operations
DEBUG_RAG_OPERATIONS = True


class PostgreSQLVectorStore(BaseService, VectorStore):
    """PostgreSQL-based vector store with pgvector extension."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__("postgresql-vector-store", config)
        
        # Database configuration - parse from URL or use individual parameters
        database_url = self.config.get("rag_database_url")
        if database_url:
            # Parse the database URL
            import urllib.parse
            parsed = urllib.parse.urlparse(database_url)
            self.host = parsed.hostname or "localhost"
            self.port = parsed.port or 5432
            self.database = parsed.path.lstrip('/') or "reynard_rag"
            self.user = parsed.username or "postgres"
            self.password = parsed.password or ""
        else:
            # Fallback to individual parameters
            self.host = self.config.get("host", "localhost")
            self.port = self.config.get("port", 5432)
            self.database = self.config.get("database", "reynard_rag")
            self.user = self.config.get("user", "postgres")
            self.password = self.config.get("password", "")
        
        self.table_name = self.config.get("table_name", "document_embeddings")
        
        # Connection pool configuration
        self.min_connections = self.config.get("min_connections", 1)
        self.max_connections = self.config.get("max_connections", 10)
        self.pool: Optional[Pool] = None
        
        # Performance configuration
        self.similarity_threshold = self.config.get("similarity_threshold", 0.0)
        self.index_type = self.config.get("index_type", "ivfflat")
        self.index_lists = self.config.get("index_lists", 100)
        
        # Metrics
        self.metrics = {
            "stored_vectors": 0,
            "searches_performed": 0,
            "average_search_time_ms": 0.0,
            "total_search_time_ms": 0.0,
        }

    async def initialize(self) -> bool:
        """Initialize the PostgreSQL vector store."""
        try:
            self.update_status(ServiceStatus.INITIALIZING, "Initializing PostgreSQL vector store")
            
            # Create connection pool
            self.pool = await asyncpg.create_pool(
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.user,
                password=self.password,
                min_size=self.min_connections,
                max_size=self.max_connections,
            )
            
            # Test connection
            if not await self._test_connection():
                self.update_status(ServiceStatus.ERROR, "Failed to connect to PostgreSQL")
                return False
            
            # Initialize database schema
            if not await self._initialize_schema():
                self.update_status(ServiceStatus.ERROR, "Failed to initialize database schema")
                return False
            
            self.update_status(ServiceStatus.HEALTHY, "PostgreSQL vector store initialized")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize PostgreSQL vector store: {e}")
            self.update_status(ServiceStatus.ERROR, f"Initialization failed: {e}")
            return False

    async def shutdown(self) -> None:
        """Shutdown the PostgreSQL vector store."""
        try:
            self.update_status(ServiceStatus.SHUTTING_DOWN, "Shutting down PostgreSQL vector store")
            
            if self.pool:
                await self.pool.close()
                self.pool = None
            
            self.update_status(ServiceStatus.SHUTDOWN, "PostgreSQL vector store shutdown complete")
            
        except Exception as e:
            self.logger.error(f"Error during shutdown: {e}")

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check."""
        try:
            # Test connection
            is_healthy = await self._test_connection()
            
            if is_healthy:
                self.update_status(ServiceStatus.HEALTHY, "Service is healthy")
            else:
                self.update_status(ServiceStatus.ERROR, "Connection test failed")
            
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

    async def _test_connection(self) -> bool:
        """Test connection to PostgreSQL."""
        try:
            if not self.pool:
                return False
            
            async with self.pool.acquire() as conn:
                result = await conn.fetchval("SELECT 1")
                return result == 1
        except Exception:
            return False

    async def _initialize_schema(self) -> bool:
        """Initialize database schema and indexes."""
        try:
            async with self.pool.acquire() as conn:
                # Enable pgvector extension
                await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
                
                # Create table if not exists
                await conn.execute(f"""
                    CREATE TABLE IF NOT EXISTS {self.table_name} (
                        id TEXT PRIMARY KEY,
                        vector vector(768),
                        text TEXT NOT NULL,
                        metadata JSONB,
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP DEFAULT NOW()
                    )
                """)
                
                # Create vector similarity index
                await conn.execute(f"""
                    CREATE INDEX IF NOT EXISTS {self.table_name}_vector_idx 
                    ON {self.table_name} 
                    USING {self.index_type} (vector vector_cosine_ops) 
                    WITH (lists = {self.index_lists})
                """)
                
                # Create metadata index
                await conn.execute(f"""
                    CREATE INDEX IF NOT EXISTS {self.table_name}_metadata_idx 
                    ON {self.table_name} 
                    USING GIN (metadata)
                """)
                
                return True
                
        except Exception as e:
            self.logger.error(f"Failed to initialize schema: {e}")
            return False

    def _vector_literal(self, vector: Sequence[float]) -> str:
        """Convert vector to PostgreSQL literal format."""
        return f"[{','.join(map(str, vector))}]"

    async def store_vectors(
        self, 
        documents: List[VectorDocument],
        **kwargs
    ) -> Dict[str, Any]:
        """Store multiple vectors with metadata."""
        if not self.is_healthy():
            raise RuntimeError("Vector store is not healthy")
        
        if not documents:
            return {"stored": 0, "errors": 0}
        
        stored_count = 0
        error_count = 0
        
        try:
            async with self.pool.acquire() as conn:
                async with conn.transaction():
                    for doc in documents:
                        try:
                            await conn.execute(f"""
                                INSERT INTO {self.table_name} (id, vector, text, metadata, updated_at)
                                VALUES ($1, $2, $3, $4, NOW())
                                ON CONFLICT (id) 
                                DO UPDATE SET 
                                    vector = EXCLUDED.vector,
                                    text = EXCLUDED.text,
                                    metadata = EXCLUDED.metadata,
                                    updated_at = NOW()
                            """, 
                                doc.id,
                                self._vector_literal(doc.vector),
                                doc.text,
                                doc.metadata
                            )
                            stored_count += 1
                            
                        except Exception as e:
                            self.logger.error(f"Failed to store document {doc.id}: {e}")
                            error_count += 1
            
            self.metrics["stored_vectors"] += stored_count
            
            return {
                "stored": stored_count,
                "errors": error_count,
                "total": len(documents)
            }
            
        except Exception as e:
            self.logger.error(f"Failed to store vectors: {e}")
            raise RuntimeError(f"Failed to store vectors: {e}")

    async def similarity_search(
        self,
        query_vector: Sequence[float],
        limit: int = 10,
        similarity_threshold: float = 0.0,
        filters: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> List[VectorSearchResult]:
        """Perform similarity search using vector."""
        if DEBUG_RAG_OPERATIONS:
            logger.info(f"🦊 [VECTOR_STORE] Starting similarity search with limit: {limit}, threshold: {similarity_threshold}")
        
        if not self.is_healthy():
            logger.error("🚨 [VECTOR_STORE] Service is not healthy")
            raise RuntimeError("Vector store is not healthy")
        
        start_time = time.time()
        
        try:
            async with self.pool.acquire() as conn:
                if DEBUG_RAG_OPERATIONS:
                    logger.info(f"🦊 [VECTOR_STORE] Acquired database connection")
                
                # Build query with optional filters
                query = f"""
                    SELECT id, vector, text, metadata, 
                           1 - (vector <=> $1::vector) as similarity_score,
                           vector <=> $1::vector as distance
                    FROM {self.table_name}
                    WHERE 1 - (vector <=> $1::vector) >= $2
                """
                
                params = [self._vector_literal(query_vector), similarity_threshold]
                
                # Add metadata filters if provided
                if filters:
                    if DEBUG_RAG_OPERATIONS:
                        logger.info(f"🦊 [VECTOR_STORE] Applying filters: {filters}")
                    for key, value in filters.items():
                        query += f" AND metadata->>'{key}' = ${len(params) + 1}"
                        params.append(str(value))
                
                query += f" ORDER BY vector <=> $1::vector LIMIT ${len(params) + 1}"
                params.append(limit)
                
                if DEBUG_RAG_OPERATIONS:
                    logger.info(f"🦊 [VECTOR_STORE] Executing query with {len(params)} parameters")
                
                rows = await conn.fetch(query, *params)
                
                if DEBUG_RAG_OPERATIONS:
                    logger.info(f"🦊 [VECTOR_STORE] Query returned {len(rows)} results")
                
                results = []
                for row in rows:
                    results.append(VectorSearchResult(
                        id=row['id'],
                        vector=list(row['vector']),
                        metadata=row['metadata'] or {},
                        similarity_score=float(row['similarity_score']),
                        distance=float(row['distance'])
                    ))
                
                # Update metrics
                search_time = (time.time() - start_time) * 1000
                self.metrics["searches_performed"] += 1
                self.metrics["total_search_time_ms"] += search_time
                self.metrics["average_search_time_ms"] = (
                    self.metrics["total_search_time_ms"] / self.metrics["searches_performed"]
                )
                
                if DEBUG_RAG_OPERATIONS:
                    logger.info(f"🦊 [VECTOR_STORE] Search completed in {search_time:.2f}ms, found {len(results)} results")
                
                return results
                
        except Exception as e:
            logger.error(f"🚨 [VECTOR_STORE] Similarity search failed: {e}")
            raise RuntimeError(f"Similarity search failed: {e}")

    async def get_vector(self, id: str) -> Optional[VectorDocument]:
        """Retrieve a specific vector by ID."""
        if not self.is_healthy():
            raise RuntimeError("Vector store is not healthy")
        
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow(f"""
                    SELECT id, vector, text, metadata
                    FROM {self.table_name}
                    WHERE id = $1
                """, id)
                
                if row:
                    return VectorDocument(
                        id=row['id'],
                        vector=list(row['vector']),
                        text=row['text'],
                        metadata=row['metadata'] or {}
                    )
                return None
                
        except Exception as e:
            self.logger.error(f"Failed to get vector {id}: {e}")
            raise RuntimeError(f"Failed to get vector {id}: {e}")

    async def update_vector(
        self, 
        id: str, 
        vector: Optional[List[float]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> bool:
        """Update an existing vector."""
        if not self.is_healthy():
            raise RuntimeError("Vector store is not healthy")
        
        try:
            async with self.pool.acquire() as conn:
                # Build update query dynamically
                updates = []
                params = []
                param_count = 1
                
                if vector is not None:
                    updates.append(f"vector = ${param_count}::vector")
                    params.append(self._vector_literal(vector))
                    param_count += 1
                
                if metadata is not None:
                    updates.append(f"metadata = ${param_count}")
                    params.append(metadata)
                    param_count += 1
                
                if not updates:
                    return True  # Nothing to update
                
                updates.append(f"updated_at = NOW()")
                params.append(id)
                
                query = f"""
                    UPDATE {self.table_name}
                    SET {', '.join(updates)}
                    WHERE id = ${param_count}
                """
                
                result = await conn.execute(query, *params)
                return "UPDATE 1" in result
                
        except Exception as e:
            self.logger.error(f"Failed to update vector {id}: {e}")
            raise RuntimeError(f"Failed to update vector {id}: {e}")

    async def delete_vector(self, id: str) -> bool:
        """Delete a vector by ID."""
        if not self.is_healthy():
            raise RuntimeError("Vector store is not healthy")
        
        try:
            async with self.pool.acquire() as conn:
                result = await conn.execute(f"""
                    DELETE FROM {self.table_name}
                    WHERE id = $1
                """, id)
                
                return "DELETE 1" in result
                
        except Exception as e:
            self.logger.error(f"Failed to delete vector {id}: {e}")
            raise RuntimeError(f"Failed to delete vector {id}: {e}")

    async def delete_vectors(self, ids: List[str]) -> Dict[str, bool]:
        """Delete multiple vectors by IDs."""
        if not self.is_healthy():
            raise RuntimeError("Vector store is not healthy")
        
        results = {}
        
        try:
            async with self.pool.acquire() as conn:
                async with conn.transaction():
                    for doc_id in ids:
                        try:
                            result = await conn.execute(f"""
                                DELETE FROM {self.table_name}
                                WHERE id = $1
                            """, doc_id)
                            
                            results[doc_id] = "DELETE 1" in result
                            
                        except Exception as e:
                            self.logger.error(f"Failed to delete vector {doc_id}: {e}")
                            results[doc_id] = False
            
            return results
            
        except Exception as e:
            self.logger.error(f"Failed to delete vectors: {e}")
            raise RuntimeError(f"Failed to delete vectors: {e}")

    async def search_by_metadata(
        self,
        filters: Dict[str, Any],
        limit: int = 10,
        **kwargs
    ) -> List[VectorDocument]:
        """Search vectors by metadata filters."""
        if not self.is_healthy():
            raise RuntimeError("Vector store is not healthy")
        
        try:
            async with self.pool.acquire() as conn:
                # Build query with metadata filters
                query = f"SELECT id, vector, text, metadata FROM {self.table_name} WHERE 1=1"
                params = []
                param_count = 1
                
                for key, value in filters.items():
                    query += f" AND metadata->>'{key}' = ${param_count}"
                    params.append(str(value))
                    param_count += 1
                
                query += f" LIMIT ${param_count}"
                params.append(limit)
                
                rows = await conn.fetch(query, *params)
                
                results = []
                for row in rows:
                    results.append(VectorDocument(
                        id=row['id'],
                        vector=list(row['vector']),
                        text=row['text'],
                        metadata=row['metadata'] or {}
                    ))
                
                return results
                
        except Exception as e:
            self.logger.error(f"Metadata search failed: {e}")
            raise RuntimeError(f"Metadata search failed: {e}")

    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get collection statistics."""
        if not self.is_healthy():
            raise RuntimeError("Vector store is not healthy")
        
        try:
            async with self.pool.acquire() as conn:
                # Get document count
                count = await conn.fetchval(f"SELECT COUNT(*) FROM {self.table_name}")
                
                # Get index size
                index_size = await conn.fetchval(f"""
                    SELECT pg_size_pretty(pg_relation_size('{self.table_name}_vector_idx'))
                """)
                
                # Get table size
                table_size = await conn.fetchval(f"""
                    SELECT pg_size_pretty(pg_relation_size('{self.table_name}'))
                """)
                
                return {
                    "document_count": count,
                    "index_size": index_size,
                    "table_size": table_size,
                    "metrics": self.metrics,
                }
                
        except Exception as e:
            self.logger.error(f"Failed to get collection stats: {e}")
            raise RuntimeError(f"Failed to get collection stats: {e}")

    async def create_index(self, **kwargs) -> bool:
        """Create or rebuild vector index."""
        if not self.is_healthy():
            raise RuntimeError("Vector store is not healthy")
        
        try:
            async with self.pool.acquire() as conn:
                # Drop existing index
                await conn.execute(f"DROP INDEX IF EXISTS {self.table_name}_vector_idx")
                
                # Create new index
                await conn.execute(f"""
                    CREATE INDEX {self.table_name}_vector_idx 
                    ON {self.table_name} 
                    USING {self.index_type} (vector vector_cosine_ops) 
                    WITH (lists = {self.index_lists})
                """)
                
                return True
                
        except Exception as e:
            self.logger.error(f"Failed to create index: {e}")
            raise RuntimeError(f"Failed to create index: {e}")

    async def optimize_index(self) -> bool:
        """Optimize vector index for better performance."""
        if not self.is_healthy():
            raise RuntimeError("Vector store is not healthy")
        
        try:
            async with self.pool.acquire() as conn:
                # Analyze table for better query planning
                await conn.execute(f"ANALYZE {self.table_name}")
                
                # Vacuum to reclaim space
                await conn.execute(f"VACUUM {self.table_name}")
                
                return True
                
        except Exception as e:
            self.logger.error(f"Failed to optimize index: {e}")
            raise RuntimeError(f"Failed to optimize index: {e}")

    async def clear_collection(self) -> bool:
        """Clear all vectors from the collection."""
        if not self.is_healthy():
            raise RuntimeError("Vector store is not healthy")
        
        try:
            async with self.pool.acquire() as conn:
                await conn.execute(f"TRUNCATE TABLE {self.table_name}")
                return True
                
        except Exception as e:
            self.logger.error(f"Failed to clear collection: {e}")
            raise RuntimeError(f"Failed to clear collection: {e}")

    # Additional abstract method implementations
    async def store_documents(
        self, documents: List[VectorDocument]
    ) -> List[str]:
        """Store documents in the vector store."""
        if not self.is_healthy():
            raise RuntimeError("Vector store is not healthy")
        
        document_ids = []
        for doc in documents:
            # Convert VectorDocument to embedding format
            embedding_data = {
                "file_id": doc.id,
                "chunk_index": 0,
                "text": doc.content,
                "embedding": doc.embedding,
                "metadata": doc.metadata or {}
            }
            
            try:
                await self.insert_document_embeddings([embedding_data])
                document_ids.append(doc.id)
            except Exception as e:
                logger.error(f"🚨 [VECTOR_STORE] Failed to store document {doc.id}: {e}")
                raise
        
        return document_ids

    async def search_similar(
        self,
        query_embedding: List[float],
        limit: int = 10,
        threshold: float = 0.0,
    ) -> List[VectorSearchResult]:
        """Search for similar documents (alias for similarity_search)."""
        try:
            results = await self.similarity_search(
                query_embedding=query_embedding,
                limit=limit,
                similarity_threshold=threshold
            )
            
            # Convert results to VectorSearchResult objects
            vector_results = []
            for i, result in enumerate(results):
                # Create VectorDocument from result
                doc = VectorDocument(
                    id=result.get("file_id", ""),
                    content=result.get("text", ""),
                    embedding=result.get("vector", []),
                    metadata=result.get("metadata", {}),
                    created_at=result.get("created_at", ""),
                    updated_at=result.get("updated_at", "")
                )
                
                vector_result = VectorSearchResult(
                    document=doc,
                    similarity_score=result.get("similarity_score", 0.0),
                    rank=i + 1
                )
                vector_results.append(vector_result)
            
            return vector_results
        except Exception as e:
            logger.error(f"Failed to search similar documents: {e}")
            return []

    async def delete_documents(self, document_ids: List[str]) -> bool:
        """Delete documents by IDs."""
        if not self.is_healthy():
            raise RuntimeError("Vector store is not healthy")
        
        try:
            async with self.pool.acquire() as conn:
                for doc_id in document_ids:
                    await conn.execute(
                        "DELETE FROM document_embeddings WHERE file_id = $1",
                        doc_id
                    )
                logger.info(f"🦊 [VECTOR_STORE] Deleted {len(document_ids)} documents")
                return True
        except Exception as e:
            logger.error(f"🚨 [VECTOR_STORE] Failed to delete documents: {e}")
            return False

    async def get_document(self, document_id: str) -> Optional[VectorDocument]:
        """Get a document by ID."""
        if not self.is_healthy():
            raise RuntimeError("Vector store is not healthy")
        
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT * FROM document_embeddings WHERE file_id = $1 LIMIT 1",
                    document_id
                )
                
                if row:
                    return VectorDocument(
                        id=row['file_id'],
                        content=row['text'],
                        embedding=row['vector'],
                        metadata=row['metadata'] or {}
                    )
                return None
        except Exception as e:
            logger.error(f"🚨 [VECTOR_STORE] Failed to get document {document_id}: {e}")
            return None

    async def get_stats(self) -> Dict[str, Any]:
        """Get vector store statistics."""
        if not self.is_healthy():
            raise RuntimeError("Vector store is not healthy")
        
        try:
            async with self.pool.acquire() as conn:
                # Get total documents
                total_docs = await conn.fetchval("SELECT COUNT(DISTINCT file_id) FROM document_embeddings")
                
                # Get total chunks
                total_chunks = await conn.fetchval("SELECT COUNT(*) FROM document_embeddings")
                
                # Get database size
                db_size = await conn.fetchval("SELECT pg_size_pretty(pg_database_size(current_database()))")
                
                return {
                    "total_documents": total_docs or 0,
                    "total_chunks": total_chunks or 0,
                    "database_size": db_size or "unknown",
                    "status": self.status.value,
                    "last_updated": self.health.last_updated.isoformat()
                }
        except Exception as e:
            logger.error(f"🚨 [VECTOR_STORE] Failed to get stats: {e}")
            return {
                "error": str(e),
                "status": self.status.value
            }
