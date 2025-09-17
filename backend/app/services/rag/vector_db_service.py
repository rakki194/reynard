"""
VectorDBService: PostgreSQL + pgvector management for Reynard.

Responsibilities:
- Manage SQLAlchemy engine/connection for Postgres using pg_dsn from config
- Run migrations from scripts/db/*.sql when enabled
- Provide minimal query helpers for embeddings and retrieval
- Health and version/extension checks
"""

import logging
import time
from collections.abc import Sequence
from typing import Any

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

logger = logging.getLogger("uvicorn")


class VectorDBService:
    """PostgreSQL + pgvector service for RAG operations."""

    def __init__(self) -> None:
        self._engine: Engine | None = None
        self._enabled: bool = False
        self._dsn: str | None = None
        self._reconnect_on_error: bool = True
        self._last_ok_ts: float | None = None
        self._last_migration_ok: bool = False
        self._metrics: dict[str, Any] = {
            "last_knn_ms": 0.0,
            "last_hybrid_ms": 0.0,
            "ef_search": None,
        }

    async def initialize(self, config: dict[str, Any]) -> bool:
        """Initialize the vector database service."""
        try:
            self._enabled = config.get("rag_enabled", False)
            dsn = config.get("pg_dsn")

            if not self._enabled:
                logger.info("VectorDBService disabled by config (rag_enabled=False)")
                return True

            if not dsn:
                logger.warning("VectorDBService enabled but PG DSN not provided")
                return False

            # Create engine (synchronous SQLAlchemy)
            pool_pre_ping = config.get("pg_pool_pre_ping", True)
            self._dsn = dsn
            self._engine = create_engine(
                dsn, echo=False, future=True, pool_pre_ping=pool_pre_ping
            )

            # Verify connection
            with self._engine.connect() as conn:
                conn.execute(text("SELECT 1"))

            # Run migrations (idempotent)
            self._last_migration_ok = self._run_migrations()

            if not self._last_migration_ok:
                logger.error("VectorDBService migrations failed")
                return False

            self._last_ok_ts = time.time()
            logger.info("VectorDBService initialized successfully")
            return True

        except Exception as e:
            logger.error(f"VectorDBService initialization failed: {e}")
            return False

    def _run_migrations(self) -> bool:
        """Run database migrations."""
        try:
            from pathlib import Path

            # Get the migrations directory
            migrations_dir = (
                Path(__file__).parent.parent.parent.parent / "scripts" / "db"
            )

            if not migrations_dir.exists():
                logger.warning(f"Migrations directory not found: {migrations_dir}")
                return False

            # Run migrations in order
            migration_files = sorted(migrations_dir.glob("*.sql"))

            if not self._engine:
                logger.error("VectorDBService engine not initialized")
                return False

            with self._engine.connect() as conn:
                # Start a transaction for all migrations
                trans = conn.begin()
                try:
                    for migration_file in migration_files:
                        logger.info(f"Running migration: {migration_file.name}")
                        try:
                            with open(migration_file) as f:
                                migration_sql = f.read()

                            # Execute migration
                            conn.execute(text(migration_sql))
                            logger.info(
                                f"Migration {migration_file.name} completed successfully"
                            )

                        except Exception as e:
                            logger.error(f"Migration {migration_file.name} failed: {e}")
                            logger.error(f"SQL content: {migration_sql[:500]}...")
                            trans.rollback()
                            return False

                    # Commit all migrations if they all succeed
                    trans.commit()
                except Exception as e:
                    logger.error(f"Migration transaction failed: {e}")
                    trans.rollback()
                    return False

            logger.info("VectorDBService migrations completed successfully")
            return True

        except Exception as e:
            logger.error(f"VectorDBService migrations failed: {e}")
            return False

    async def health_check(self) -> bool:
        """Perform health check."""
        if not self._enabled or not self._engine:
            return True

        try:
            with self._engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            self._last_ok_ts = time.time()
            return True
        except Exception as e:
            logger.warning(f"VectorDBService health check failed: {e}")
            if self._reconnect_on_error:
                await self._reconnect()
            return False

    async def _reconnect(self) -> None:
        """Reconnect to the database."""
        try:
            if self._engine:
                self._engine.dispose()

            self._engine = create_engine(
                self._dsn, echo=False, future=True, pool_pre_ping=True
            )

            # Verify reconnection
            with self._engine.connect() as conn:
                conn.execute(text("SELECT 1"))

            self._last_ok_ts = time.time()
            logger.info("VectorDBService reconnected successfully")

        except Exception as e:
            logger.error(f"VectorDBService reconnection failed: {e}")

    def vector_literal(self, vector: Sequence[float]) -> str:
        """Convert vector to PostgreSQL literal format."""
        return f"[{','.join(map(str, vector))}]"

    async def insert_document_embeddings(
        self, embeddings: Sequence[dict[str, Any]]
    ) -> int:
        """Insert document embeddings into the database."""
        if not self._engine:
            raise RuntimeError("VectorDBService not initialized")

        total = 0
        with self._engine.connect() as conn:
            for emb in embeddings:
                try:
                    # TODO: Implement actual embedding insertion
                    # For now, just simulate
                    total += 1
                except Exception as e:
                    logger.error(f"Failed to insert embedding: {e}")
                    continue

        return total

    async def similar_document_chunks(
        self, embedding: Sequence[float], top_k: int = 20
    ) -> list[dict[str, Any]]:
        """Vector similarity search over rag_document_embeddings, cosine distance."""
        if not self._engine:
            raise RuntimeError("VectorDBService not initialized")

        vec = self.vector_literal(embedding)
        with self._engine.connect() as conn:
            # TODO: Implement actual similarity search
            # For now, return mock results
            results = []
            for i in range(min(top_k, 5)):
                results.append(
                    {
                        "chunk_id": f"chunk_{i}",
                        "model_id": "mxbai-embed-large",
                        "dim": len(embedding),
                        "score": 0.9 - (i * 0.1),
                        "chunk_index": i,
                        "chunk_text": f"Mock chunk text {i}",
                        "chunk_tokens": 100,
                        "chunk_metadata": {"source": "mock"},
                        "document_source": f"/mock/document_{i}.txt",
                        "document_content": f"Mock document content {i}",
                        "document_metadata": {"type": "mock"},
                    }
                )

        return results

    async def get_stats(self) -> dict[str, Any]:
        """Get vector database statistics."""
        if not self._engine:
            return {"error": "VectorDBService not initialized"}

        try:
            with self._engine.connect() as conn:
                # TODO: Implement actual statistics queries
                stats = {
                    "total_documents": 0,
                    "total_chunks": 0,
                    "chunks_with_embeddings": 0,
                    "embedding_coverage": 0.0,
                    "last_health_check": self._last_ok_ts,
                    "migrations_ok": self._last_migration_ok,
                }
                return stats
        except Exception as e:
            logger.error(f"Failed to get vector database stats: {e}")
            return {"error": str(e)}

    async def shutdown(self) -> None:
        """Shutdown the service."""
        if self._engine:
            self._engine.dispose()
            self._engine = None
        logger.info("VectorDBService shutdown complete")
