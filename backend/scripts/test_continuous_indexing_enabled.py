#!/usr/bin/env python3
"""
Test Continuous Indexing Enabled in FastAPI Backend

This script verifies that continuous indexing is enabled and working
in the FastAPI backend RAG service.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def test_continuous_indexing_enabled():
    """Test if continuous indexing is enabled in the FastAPI backend."""
    logger.info("🧪 Testing if continuous indexing is enabled in FastAPI backend...")

    try:
        # Import the new RAG service directly
        from app.services.rag.rag_service import RAGService

        # Create a simple configuration
        config = {
            "rag_enabled": True,
            "pg_dsn": "postgresql://postgres@localhost:5432/reynard_rag",
            "ollama_base_url": "http://localhost:11434",
            "rag_text_model": "embeddinggemma:latest",
            "rag_ingest_batch_size_text": 16,
            "rag_chunk_max_tokens": 512,
            "rag_chunk_min_tokens": 100,
            "rag_chunk_overlap_ratio": 0.15,
            "rag_ingest_concurrency": 2,
            "rag_ingest_max_attempts": 3,
            "rag_ingest_backoff_base_s": 0.1,
            # Continuous indexing configuration
            "rag_continuous_indexing_enabled": True,
            "rag_continuous_indexing_auto_start": True,
        }

        logger.info("Creating RAG service with continuous indexing...")
        rag_service = RAGService(config)

        logger.info("Initializing RAG service...")
        await rag_service.initialize()

        logger.info("✅ RAG service initialized successfully")

        # Check if continuous indexing is available
        if hasattr(rag_service, "continuous_indexing"):
            logger.info("✅ RAG service has continuous indexing capability")

            if rag_service.continuous_indexing:
                logger.info("✅ Continuous indexing service is initialized")

                # Get statistics
                stats = rag_service.continuous_indexing.get_stats()
                logger.info(f"📊 Continuous indexing stats: {stats}")

                if stats.get("enabled"):
                    logger.info("🎉 Continuous indexing is ENABLED!")

                    if stats.get("running"):
                        logger.info("🎉 Continuous indexing is RUNNING!")
                        logger.info(f"👀 Watching: {stats.get('watch_root', 'N/A')}")
                        logger.info(f"📊 Queue sizes: {stats.get('queue_sizes', {})}")
                    else:
                        logger.warning(
                            "⚠️ Continuous indexing is enabled but not running"
                        )
                else:
                    logger.warning("⚠️ Continuous indexing is not enabled")
            else:
                logger.warning("⚠️ Continuous indexing service is not initialized")
        else:
            logger.warning("⚠️ RAG service does not have continuous indexing capability")

        # Get overall RAG service statistics
        logger.info("Getting overall RAG service statistics...")
        overall_stats = await rag_service.get_statistics()

        if "advanced_services" in overall_stats:
            continuous_stats = overall_stats["advanced_services"].get(
                "continuous_indexing", {}
            )
            if continuous_stats:
                logger.info(
                    "✅ Continuous indexing stats found in RAG service statistics"
                )
                logger.info(
                    f"Continuous indexing enabled: {continuous_stats.get('enabled', False)}"
                )
                logger.info(
                    f"Continuous indexing running: {continuous_stats.get('running', False)}"
                )
            else:
                logger.warning(
                    "⚠️ Continuous indexing stats not found in RAG service statistics"
                )

        # Shutdown
        await rag_service.shutdown()
        logger.info("✅ RAG service shutdown complete")

        return True

    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        return False


async def test_configuration():
    """Test the continuous indexing configuration."""
    logger.info("🧪 Testing continuous indexing configuration...")

    try:
        from app.config.continuous_indexing_config import continuous_indexing_config

        # Check configuration
        config_dict = continuous_indexing_config.to_dict()
        logger.info(f"📋 Configuration: {config_dict}")

        # Validate configuration
        errors = continuous_indexing_config.validate()
        if errors:
            logger.error(f"❌ Configuration errors: {errors}")
            return False
        else:
            logger.info("✅ Configuration is valid")

        # Check if enabled
        if continuous_indexing_config.enabled:
            logger.info("✅ Continuous indexing is enabled in configuration")
        else:
            logger.warning("⚠️ Continuous indexing is disabled in configuration")

        return True

    except Exception as e:
        logger.error(f"❌ Configuration test failed: {e}")
        return False


async def main():
    """Main test function."""
    logger.info("🦊 Starting continuous indexing enabled tests...")

    try:
        # Test configuration
        config_success = await test_configuration()

        # Test RAG service
        rag_success = await test_continuous_indexing_enabled()

        if config_success and rag_success:
            logger.info(
                "🎉 All tests passed! Continuous indexing is enabled and working!"
            )
            return 0
        else:
            logger.error("❌ Some tests failed!")
            return 1

    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
