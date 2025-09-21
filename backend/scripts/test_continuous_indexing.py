#!/usr/bin/env python3
"""
Test Continuous Indexing Functionality

This script tests the continuous indexing system to ensure it's working properly.
"""

import argparse
import asyncio
import logging
import sys
import time
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.rag import RAGService
from app.config.continuous_indexing_config import continuous_indexing_config

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def test_continuous_indexing():
    """Test the continuous indexing functionality."""
    logger.info("🧪 Testing continuous indexing functionality...")

    try:
        # RAG configuration with continuous indexing enabled
        rag_config = {
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

        # Initialize RAG service
        logger.info("Initializing RAG service with continuous indexing...")
        rag_service = RAGService(rag_config)

        if not await rag_service.initialize():
            logger.error("Failed to initialize RAG service")
            return False

        logger.info("✅ RAG service initialized successfully")

        # Check if continuous indexing is running
        stats = await rag_service.get_statistics()
        continuous_indexing_stats = stats.get("advanced_services", {}).get(
            "continuous_indexing", {}
        )

        if continuous_indexing_stats.get("enabled"):
            logger.info("✅ Continuous indexing is enabled")
            logger.info(f"📊 Continuous indexing stats: {continuous_indexing_stats}")

            if continuous_indexing_stats.get("running"):
                logger.info("✅ Continuous indexing is running")
            else:
                logger.warning("⚠️ Continuous indexing is enabled but not running")
        else:
            logger.warning("⚠️ Continuous indexing is not enabled")

        # Test configuration
        logger.info("🔧 Testing configuration...")
        config_dict = continuous_indexing_config.to_dict()
        logger.info(f"Configuration: {config_dict}")

        # Validate configuration
        errors = continuous_indexing_config.validate()
        if errors:
            logger.error(f"Configuration errors: {errors}")
        else:
            logger.info("✅ Configuration is valid")

        # Test file filtering
        logger.info("🔍 Testing file filtering...")
        test_files = [
            Path("/home/kade/runeset/reynard/test_prompt_refinement_scripts.py"),
            Path("/home/kade/runeset/reynard/backend/node_modules/test.js"),
            Path("/home/kade/runeset/reynard/backend/__pycache__/test.pyc"),
            Path("/home/kade/runeset/reynard/README.md"),
        ]

        for test_file in test_files:
            should_watch = continuous_indexing_config.should_watch_file(test_file)
            should_include = continuous_indexing_config.should_include_file(test_file)
            logger.info(
                f"File {test_file.name}: watch={should_watch}, include={should_include}"
            )

        # Test search functionality
        logger.info("🔍 Testing search functionality...")
        try:
            results = await rag_service.search("authentication system", limit=3)
            logger.info(f"✅ Search test successful: {len(results)} results")
        except Exception as e:
            logger.warning(f"Search test failed: {e}")

        # Keep running for a bit to test continuous indexing
        logger.info("⏱️ Running for 30 seconds to test continuous indexing...")
        await asyncio.sleep(30)

        # Get final stats
        final_stats = await rag_service.get_statistics()
        final_continuous_stats = final_stats.get("advanced_services", {}).get(
            "continuous_indexing", {}
        )
        logger.info(f"📊 Final continuous indexing stats: {final_continuous_stats}")

        # Shutdown
        await rag_service.shutdown()
        logger.info("✅ Test completed successfully")
        return True

    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        return False


async def test_configuration():
    """Test the continuous indexing configuration."""
    logger.info("🔧 Testing continuous indexing configuration...")

    try:
        # Test configuration loading
        config_dict = continuous_indexing_config.to_dict()
        logger.info(f"Configuration loaded: {config_dict}")

        # Test validation
        errors = continuous_indexing_config.validate()
        if errors:
            logger.error(f"Configuration validation errors: {errors}")
            return False
        else:
            logger.info("✅ Configuration validation passed")

        # Test file filtering
        test_cases = [
            (
                "/home/kade/runeset/reynard/test_prompt_refinement_scripts.py",
                True,
                True,
            ),
            ("/home/kade/runeset/reynard/backend/node_modules/test.js", False, False),
            ("/home/kade/runeset/reynard/backend/__pycache__/test.pyc", False, False),
            ("/home/kade/runeset/reynard/README.md", True, True),
            ("/home/kade/runeset/reynard/package.json", True, True),
        ]

        for file_path, expected_watch, expected_include in test_cases:
            test_file = Path(file_path)
            should_watch = continuous_indexing_config.should_watch_file(test_file)
            should_include = continuous_indexing_config.should_include_file(test_file)

            if should_watch == expected_watch and should_include == expected_include:
                logger.info(
                    f"✅ {test_file.name}: watch={should_watch}, include={should_include}"
                )
            else:
                logger.error(
                    f"❌ {test_file.name}: expected watch={expected_watch}, include={expected_include}, got watch={should_watch}, include={should_include}"
                )
                return False

        logger.info("✅ Configuration test completed successfully")
        return True

    except Exception as e:
        logger.error(f"❌ Configuration test failed: {e}")
        return False


async def main():
    """Main test function."""
    parser = argparse.ArgumentParser(
        description="Test continuous indexing functionality"
    )
    parser.add_argument(
        "--config-only", action="store_true", help="Test only configuration"
    )
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    logger.info("🦊 Starting continuous indexing tests...")

    try:
        if args.config_only:
            # Test only configuration
            success = await test_configuration()
        else:
            # Test full functionality
            config_success = await test_configuration()
            if not config_success:
                logger.error("Configuration test failed, aborting")
                return 1

            success = await test_continuous_indexing()

        if success:
            logger.info("🎉 All tests passed!")
            return 0
        else:
            logger.error("❌ Tests failed!")
            return 1

    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
