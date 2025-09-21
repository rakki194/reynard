#!/usr/bin/env python3
"""
Minimal test to debug the RAG service initialization.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def test_vector_store():
    """Test vector store initialization."""
    try:
        from app.services.rag.core import VectorStoreService

        logger.info("Testing VectorStoreService...")
        config = {
            "rag_enabled": True,
            "pg_dsn": "postgresql://postgres@localhost:5432/reynard_rag",
        }

        service = VectorStoreService()
        result = await service.initialize(config)
        logger.info(f"VectorStoreService result: {result}")

        if result:
            await service.shutdown()

        return result
    except Exception as e:
        logger.error(f"VectorStoreService failed: {e}")
        return False


async def test_embedding_service():
    """Test embedding service initialization."""
    try:
        from app.services.rag.core import EmbeddingService

        logger.info("Testing EmbeddingService...")
        config = {
            "rag_enabled": True,
            "ollama_base_url": "http://localhost:11434",
            "rag_text_model": "embeddinggemma:latest",
        }

        service = EmbeddingService()
        result = await service.initialize(config)
        logger.info(f"EmbeddingService result: {result}")

        if result:
            await service.shutdown()

        return result
    except Exception as e:
        logger.error(f"EmbeddingService failed: {e}")
        return False


async def test_document_indexer():
    """Test document indexer initialization."""
    try:
        from app.services.rag.core import (
            DocumentIndexer,
            EmbeddingService,
            VectorStoreService,
        )

        logger.info("Testing DocumentIndexer...")
        config = {
            "rag_enabled": True,
            "pg_dsn": "postgresql://postgres@localhost:5432/reynard_rag",
            "ollama_base_url": "http://localhost:11434",
            "rag_text_model": "embeddinggemma:latest",
        }

        # Initialize dependencies
        vector_service = VectorStoreService()
        if not await vector_service.initialize(config):
            logger.error("Failed to initialize VectorStoreService")
            return False

        embedding_service = EmbeddingService()
        if not await embedding_service.initialize(config):
            logger.error("Failed to initialize EmbeddingService")
            return False

        # Initialize document indexer
        indexer = DocumentIndexer()
        result = await indexer.initialize(config, vector_service, embedding_service)
        logger.info(f"DocumentIndexer result: {result}")

        if result:
            await indexer.shutdown()
            await vector_service.shutdown()
            await embedding_service.shutdown()

        return result
    except Exception as e:
        logger.error(f"DocumentIndexer failed: {e}")
        return False


async def main():
    """Run minimal tests."""
    logger.info("🧪 Running minimal RAG service tests...")

    # Test each service individually
    tests = [
        ("VectorStoreService", test_vector_store),
        ("EmbeddingService", test_embedding_service),
        ("DocumentIndexer", test_document_indexer),
    ]

    results = {}
    for name, test_func in tests:
        logger.info(f"\n--- Testing {name} ---")
        try:
            result = await test_func()
            results[name] = result
            logger.info(f"{name}: {'✅ PASS' if result else '❌ FAIL'}")
        except Exception as e:
            logger.error(f"{name}: ❌ ERROR - {e}")
            results[name] = False

    # Summary
    logger.info("\n--- Test Summary ---")
    for name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{name}: {status}")

    all_passed = all(results.values())
    logger.info(
        f"\nOverall: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}"
    )

    return 0 if all_passed else 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
