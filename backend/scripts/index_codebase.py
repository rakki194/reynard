#!/usr/bin/env python3
"""Codebase Indexing Script for Reynard RAG System

This script indexes the Reynard codebase into the PostgreSQL/pgvector database
for semantic search and code intelligence.

Usage:
    python scripts/index_codebase.py [--scan-only] [--force] [--verbose]
"""

import argparse
import asyncio
import logging
import sys
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import get_config
from app.services.rag.services.core.embedding import OllamaEmbeddingService
from app.services.rag.services.core.document_processor import ASTDocumentProcessor
from app.services.rag.services.core.vector_store import PostgreSQLVectorStore

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


async def main():
    """Main indexing function."""
    parser = argparse.ArgumentParser(description="Index Reynard codebase for RAG")
    parser.add_argument(
        "--scan-only", action="store_true", help="Only scan, don't index",
    )
    parser.add_argument("--force", action="store_true", help="Force re-indexing")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    logger.info("🦊 Starting Reynard codebase indexing...")

    try:
        # Get configuration
        config = get_config()
        # Create rag config manually
        rag_config = {
            "rag_enabled": True,
            "rag_database_url": "postgresql://postgres@localhost:5432/reynard_rag",
            "ollama_base_url": "http://localhost:11434",
            "rag_text_model": "sentence-transformers/all-MiniLM-L6-v2",
            "rag_code_model": "microsoft/codebert-base",
            "rag_ingest_batch_size_text": 16,
            "rag_chunk_max_tokens": 512,
            "rag_chunk_min_tokens": 100,
            "rag_chunk_overlap_ratio": 0.15,
            "rag_ingest_concurrency": 2,
            "rag_ingest_max_attempts": 5,
            "rag_ingest_backoff_base_s": 0.5,
            "rag_query_rate_limit_per_minute": 60,
            "rag_ingest_rate_limit_per_minute": 10,
        }

        # Initialize services
        logger.info("Initializing services...")

        # Vector DB Service
        vector_db = PostgreSQLVectorStore(rag_config)
        vector_success = await vector_db.initialize()
        if not vector_success:
            logger.error("Failed to initialize VectorDB service")
            return 1

        # Embedding Service
        embedding_service = OllamaEmbeddingService(rag_config)
        embedding_success = await embedding_service.initialize()
        if not embedding_success:
            logger.error("Failed to initialize Embedding service")
            return 1

        # Document Processor
        document_processor = ASTDocumentProcessor(rag_config)
        processor_success = await document_processor.initialize()
        if not processor_success:
            logger.error("Failed to initialize Document Processor")
            return 1

        # Codebase Scanner
        from app.services.rag.services.core.codebase_scanner import CodebaseScanner
        codebase_scanner = CodebaseScanner(rag_config)

        logger.info("✅ All services initialized successfully")

        # Get current stats
        stats = await document_processor.get_stats()
        logger.info(f"Current database stats: {stats}")

        if args.scan_only:
            logger.info("🔍 Scanning codebase (scan-only mode)...")
            async for item in codebase_scanner.scan_codebase():
                if item["type"] == "file":
                    logger.info(
                        f"Found: {item['data']['path']} ({item['data']['file_type']})",
                    )
                elif item["type"] == "progress":
                    logger.info(item["message"])
                elif item["type"] == "complete":
                    logger.info(f"✅ {item['message']}")
                elif item["type"] == "error":
                    logger.error(f"❌ {item['error']}")
                    return 1
        else:
            logger.info("📚 Indexing codebase...")
            indexed_count = 0
            failed_count = 0

            async for item in codebase_scanner.scan_and_index(
                document_processor=document_processor,
                vector_store=vector_store,
                embedding_service=embedding_service
            ):
                if item["type"] == "progress":
                    indexed_count = item.get("indexed", 0)
                    failed_count = item.get("failed", 0)
                    logger.info(f"Progress: {item['message']}")
                elif item["type"] == "complete":
                    indexed_count = item.get("indexed", 0)
                    failed_count = item.get("failed", 0)
                    logger.info(f"✅ {item['message']}")
                elif item["type"] == "error":
                    logger.error(f"❌ {item['error']}")
                    return 1

            logger.info(
                f"🎉 Indexing complete! Indexed: {indexed_count}, Failed: {failed_count}",
            )

        # Get final stats
        final_stats = await document_processor.get_stats()
        logger.info(f"Final database stats: {final_stats}")

        # Test embedding generation
        logger.info("🧪 Testing embedding generation...")
        test_texts = [
            "function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0); }",
            "class UserService { async getUser(id) { return await this.db.findUser(id); } }",
            "This is a documentation file explaining the API endpoints.",
        ]

        for i, text in enumerate(test_texts):
            try:
                embedding = await embedding_service.embed_text(
                    text, "sentence-transformers/all-MiniLM-L6-v2",
                )
                logger.info(f"Generated embedding {i+1}: {len(embedding)} dimensions")
            except Exception as e:
                logger.warning(f"Failed to generate embedding {i+1}: {e}")

        # Get embedding service stats
        embedding_stats = await embedding_service.get_stats()
        logger.info(f"Embedding service stats: {embedding_stats}")

        logger.info("🦊 Reynard codebase indexing completed successfully!")
        return 0

    except Exception as e:
        logger.error(f"❌ Indexing failed: {e}")
        return 1

    finally:
        # Cleanup
        try:
            if "vector_db" in locals():
                await vector_db.shutdown()
            if "embedding_service" in locals():
                await embedding_service.shutdown()
            if "document_processor" in locals():
                await document_processor.shutdown()
        except Exception as e:
            logger.warning(f"Cleanup error: {e}")


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
