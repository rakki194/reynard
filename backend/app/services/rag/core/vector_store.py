"""
Vector Store Service: PostgreSQL + pgvector management for embeddings.

This service provides:
- Vector similarity search with HNSW indexing
- Document embedding storage and retrieval
- Connection management and health monitoring
- Database migrations and schema management
- Performance optimization and monitoring
"""

import logging
import time
from collections.abc import Sequence
from typing import Any, Dict, List, Optional

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

logger = logging.getLogger("uvicorn")


class VectorStoreService:
    """PostgreSQL + pgvector service for vector operations."""

    def __init__(self) -> None:
        self._engine: Optional[Engine] = None
        self._enabled: bool = False
        self._dsn: Optional[str] = None
        
        # Performance metrics
        self._metrics: Dict[str, Any] = {
            "queries": 0,
            "inserts": 0,
            "errors": 0,
            "last_query_ms": 0.0,
            "connection_retries": 0,
        }

    async def initialize(self, config: Dict[str, Any]) -> bool:
        """Initialize the vector store service."""
        try:
            self._enabled = config.get("rag_enabled", False)
            self._dsn = config.get("pg_dsn")

            if not self._enabled:
                logger.info("VectorStoreService disabled by config")
                return True

            if not self._dsn:
                logger.warning("VectorStoreService enabled but PG DSN not provided")
                return False

            # Create engine with optimized settings
            self._engine = create_engine(
                self._dsn,
                echo=False,
                future=True,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                pool_recycle=3600,
            )

            # Test connection and run migrations
            if not await self._test_connection():
                return False

            if not self._run_migrations():
                logger.warning("Some migrations may have failed, but continuing...")

            logger.info("VectorStoreService initialized successfully")
            return True

        except Exception as e:
            logger.error(f"VectorStoreService initialization failed: {e}")
            return False

    async def _test_connection(self) -> bool:
        """Test database connection and verify pgvector extension."""
        try:
            with self._engine.connect() as conn:
                # Test basic connection
                conn.execute(text("SELECT 1"))
                
                # Check pgvector extension
                result = conn.execute(text("""
                    SELECT EXISTS(
                        SELECT 1 FROM pg_extension WHERE extname = 'vector'
                    )
                """)).fetchone()
                
                if not result[0]:
                    logger.error("pgvector extension not found. Please install it first.")
                    return False
                
                # Check version
                version_result = conn.execute(text("SELECT extversion FROM pg_extension WHERE extname = 'vector'")).fetchone()
                if version_result:
                    logger.info(f"pgvector version: {version_result[0]}")
                
                return True

        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False

    def _run_migrations(self) -> bool:
        """Run database migrations to set up required tables and indexes."""
        try:
            with self._engine.connect() as conn:
                # Check if unified repository schema exists
                result = conn.execute(text("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = 'datasets'
                    )
                """)).fetchone()
                
                if result and result[0]:
                    logger.info("Unified repository schema detected, skipping table creation")
                    # Just ensure the metadata index exists for compatibility
                    try:
                        conn.execute(text("""
                            CREATE INDEX IF NOT EXISTS embeddings_metadata_idx ON embeddings USING GIN(metadata);
                        """))
                        conn.commit()
                        logger.info("Compatibility indexes created successfully")
                        return True
                    except Exception as idx_error:
                        logger.warning(f"Could not create compatibility index: {idx_error}")
                        return True  # Continue anyway
                else:
                    logger.info("Creating legacy schema for backward compatibility")
                    # Create datasets table
                    conn.execute(text("""
                        CREATE TABLE IF NOT EXISTS datasets (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            name VARCHAR(255) NOT NULL,
                            version VARCHAR(50) NOT NULL,
                            description TEXT,
                            created_at TIMESTAMP DEFAULT NOW(),
                            updated_at TIMESTAMP DEFAULT NOW(),
                            UNIQUE(name, version)
                        )
                    """))

                    # Create files table
                    conn.execute(text("""
                        CREATE TABLE IF NOT EXISTS files (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
                            path VARCHAR(1000) NOT NULL,
                            file_type VARCHAR(50),
                            modality VARCHAR(50),
                            size BIGINT,
                            hash VARCHAR(64),
                            mime_type VARCHAR(100),
                            metadata JSONB,
                            title VARCHAR(500),
                            description TEXT,
                            language VARCHAR(50),
                            encoding VARCHAR(50),
                            word_count INTEGER,
                            last_modified TIMESTAMP,
                            checksum VARCHAR(64),
                            created_at TIMESTAMP DEFAULT NOW(),
                            updated_at TIMESTAMP DEFAULT NOW(),
                            UNIQUE(dataset_id, path)
                        )
                    """))

                    # Create embeddings table with vector column
                    conn.execute(text("""
                        CREATE TABLE IF NOT EXISTS embeddings (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            file_id UUID REFERENCES files(id) ON DELETE CASCADE,
                            chunk_index INTEGER,
                            chunk_text TEXT,
                            embedding VECTOR(1024),  -- Adjust dimension as needed
                            metadata JSONB,
                            created_at TIMESTAMP DEFAULT NOW(),
                            updated_at TIMESTAMP DEFAULT NOW()
                        )
                    """))

                    # Create HNSW index for fast similarity search
                    conn.execute(text("""
                        CREATE INDEX IF NOT EXISTS embeddings_embedding_hnsw_idx 
                        ON embeddings USING hnsw (embedding vector_cosine_ops)
                        WITH (m = 16, ef_construction = 64)
                    """))

                    # Create additional indexes for performance
                    conn.execute(text("""
                        CREATE INDEX IF NOT EXISTS files_dataset_id_idx ON files(dataset_id);
                        CREATE INDEX IF NOT EXISTS files_path_idx ON files(path);
                        CREATE INDEX IF NOT EXISTS embeddings_file_id_idx ON embeddings(file_id);
                        CREATE INDEX IF NOT EXISTS embeddings_metadata_idx ON embeddings USING GIN(metadata);
                    """))

                    conn.commit()
                    logger.info("Legacy database migrations completed successfully")
                    return True

        except Exception as e:
            logger.error(f"Migration failed: {e}")
            return False

    def vector_literal(self, vector: Sequence[float]) -> str:
        """Convert vector to PostgreSQL literal format."""
        return f"[{','.join(map(str, vector))}]"

    async def insert_document_embeddings(self, embeddings: Sequence[Dict[str, Any]]) -> int:
        """Insert document embeddings into the database."""
        if not self._enabled or not self._engine:
            return 0

        try:
            start_time = time.time()
            
            with self._engine.connect() as conn:
                inserted_count = 0
                
                for embedding_data in embeddings:
                    # Insert embedding
                    result = conn.execute(text("""
                        INSERT INTO embeddings (
                            file_id, chunk_index, chunk_text, embedding, metadata
                        ) VALUES (
                            :file_id, :chunk_index, :chunk_text, :embedding, :metadata
                        )
                        ON CONFLICT (file_id, chunk_index) DO UPDATE SET
                            chunk_text = EXCLUDED.chunk_text,
                            embedding = EXCLUDED.embedding,
                            metadata = EXCLUDED.metadata,
                            updated_at = NOW()
                        RETURNING id
                    """), {
                        'file_id': embedding_data.get('file_id'),
                        'chunk_index': embedding_data.get('chunk_index', 0),
                        'chunk_text': embedding_data.get('chunk_text', ''),
                        'embedding': self.vector_literal(embedding_data.get('embedding', [])),
                        'metadata': embedding_data.get('metadata', {})
                    })
                    
                    if result.fetchone():
                        inserted_count += 1
                
                conn.commit()
                
                # Update metrics
                self._metrics["inserts"] += 1
                self._metrics["last_query_ms"] = (time.time() - start_time) * 1000
                
                logger.debug(f"Inserted {inserted_count} embeddings")
                return inserted_count

        except Exception as e:
            logger.error(f"Failed to insert embeddings: {e}")
            self._metrics["errors"] += 1
            return 0

    async def similarity_search(self, 
                              query_embedding: Sequence[float], 
                              limit: int = 20,
                              dataset_id: Optional[str] = None,
                              similarity_threshold: float = 0.0) -> List[Dict[str, Any]]:
        """Perform similarity search using vector cosine similarity."""
        if not self._enabled or not self._engine:
            return []

        try:
            start_time = time.time()
            
            with self._engine.connect() as conn:
                # Build query with optional dataset filter
                base_query = """
                    SELECT 
                        e.id,
                        e.chunk_text,
                        e.metadata,
                        f.path,
                        f.title,
                        f.file_type,
                        f.metadata as file_metadata,
                        1 - (e.embedding <=> :query_embedding) as similarity
                    FROM embeddings e
                    JOIN files f ON e.file_id = f.id
                """
                
                where_conditions = ["1 - (e.embedding <=> :query_embedding) > :threshold"]
                params = {
                    'query_embedding': self.vector_literal(query_embedding),
                    'threshold': similarity_threshold,
                    'limit': limit
                }
                
                if dataset_id:
                    where_conditions.append("f.dataset_id = :dataset_id")
                    params['dataset_id'] = dataset_id
                
                query = f"""
                    {base_query}
                    WHERE {' AND '.join(where_conditions)}
                    ORDER BY e.embedding <=> :query_embedding
                    LIMIT :limit
                """
                
                result = conn.execute(text(query), params)
                
                results = []
                for row in result:
                    results.append({
                        'id': str(row[0]),
                        'text': row[1],
                        'metadata': row[2] or {},
                        'path': row[3],
                        'title': row[4],
                        'file_type': row[5],
                        'file_metadata': row[6] or {},
                        'similarity': float(row[7])
                    })
                
                # Update metrics
                self._metrics["queries"] += 1
                self._metrics["last_query_ms"] = (time.time() - start_time) * 1000
                
                return results

        except Exception as e:
            logger.error(f"Similarity search failed: {e}")
            self._metrics["errors"] += 1
            return []

    async def get_document_chunks(self, file_id: str) -> List[Dict[str, Any]]:
        """Get all chunks for a specific document."""
        if not self._enabled or not self._engine:
            return []

        try:
            with self._engine.connect() as conn:
                result = conn.execute(text("""
                    SELECT 
                        e.id,
                        e.chunk_index,
                        e.chunk_text,
                        e.metadata,
                        e.created_at
                    FROM embeddings e
                    WHERE e.file_id = :file_id
                    ORDER BY e.chunk_index
                """), {'file_id': file_id})
                
                chunks = []
                for row in result:
                    chunks.append({
                        'id': str(row[0]),
                        'chunk_index': row[1],
                        'text': row[2],
                        'metadata': row[3] or {},
                        'created_at': row[4]
                    })
                
                return chunks

        except Exception as e:
            logger.error(f"Failed to get document chunks: {e}")
            return []

    async def delete_document(self, file_id: str) -> bool:
        """Delete a document and all its embeddings."""
        if not self._enabled or not self._engine:
            return False

        try:
            with self._engine.connect() as conn:
                # Delete embeddings first (due to foreign key constraint)
                conn.execute(text("DELETE FROM embeddings WHERE file_id = :file_id"), 
                           {'file_id': file_id})
                
                # Delete file
                result = conn.execute(text("DELETE FROM files WHERE id = :file_id"), 
                                    {'file_id': file_id})
                
                conn.commit()
                
                return result.rowcount > 0

        except Exception as e:
            logger.error(f"Failed to delete document: {e}")
            return False

    async def get_dataset_stats(self, dataset_id: str) -> Dict[str, Any]:
        """Get statistics for a specific dataset."""
        if not self._enabled or not self._engine:
            return {}

        try:
            with self._engine.connect() as conn:
                # Get file count
                file_count_result = conn.execute(text("""
                    SELECT COUNT(*) FROM files WHERE dataset_id = :dataset_id
                """), {'dataset_id': dataset_id}).fetchone()
                
                # Get embedding count
                embedding_count_result = conn.execute(text("""
                    SELECT COUNT(*) FROM embeddings e
                    JOIN files f ON e.file_id = f.id
                    WHERE f.dataset_id = :dataset_id
                """), {'dataset_id': dataset_id}).fetchone()
                
                # Get total size
                size_result = conn.execute(text("""
                    SELECT COALESCE(SUM(size), 0) FROM files WHERE dataset_id = :dataset_id
                """), {'dataset_id': dataset_id}).fetchone()
                
                return {
                    'dataset_id': dataset_id,
                    'file_count': file_count_result[0] if file_count_result else 0,
                    'embedding_count': embedding_count_result[0] if embedding_count_result else 0,
                    'total_size_bytes': size_result[0] if size_result else 0
                }

        except Exception as e:
            logger.error(f"Failed to get dataset stats: {e}")
            return {}

    async def health_check(self) -> bool:
        """Perform health check."""
        if not self._enabled:
            return True

        try:
            if not self._engine:
                return False

            with self._engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True

        except Exception as e:
            logger.warning(f"VectorStoreService health check failed: {e}")
            return False

    async def get_stats(self) -> Dict[str, Any]:
        """Get vector store statistics."""
        if not self._enabled or not self._engine:
            return {"enabled": False}

        try:
            with self._engine.connect() as conn:
                # Get total counts
                file_count_result = conn.execute(text("SELECT COUNT(*) FROM files")).fetchone()
                embedding_count_result = conn.execute(text("SELECT COUNT(*) FROM embeddings")).fetchone()
                dataset_count_result = conn.execute(text("SELECT COUNT(*) FROM datasets")).fetchone()
                
                return {
                    "enabled": self._enabled,
                    "dsn_configured": self._dsn is not None,
                    "total_files": file_count_result[0] if file_count_result else 0,
                    "total_embeddings": embedding_count_result[0] if embedding_count_result else 0,
                    "total_datasets": dataset_count_result[0] if dataset_count_result else 0,
                    "metrics": self._metrics.copy(),
                    "engine_pool_size": self._engine.pool.size() if self._engine else 0,
                    "engine_checked_in": self._engine.pool.checkedin() if self._engine else 0,
                    "engine_checked_out": self._engine.pool.checkedout() if self._engine else 0,
                }

        except Exception as e:
            logger.error(f"Failed to get stats: {e}")
            return {"enabled": self._enabled, "error": str(e)}

    async def shutdown(self) -> None:
        """Shutdown the service."""
        if self._engine:
            self._engine.dispose()
            self._engine = None
        logger.info("VectorStoreService shutdown complete")
