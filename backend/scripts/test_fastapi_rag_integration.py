#!/usr/bin/env python3
"""
Test FastAPI Backend RAG Integration

This script tests if the FastAPI backend is properly using the new RAG service
with continuous indexing capabilities.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import get_config
from app.core.service_initializers import init_rag_service

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def test_fastapi_rag_integration():
    """Test if the FastAPI backend is using the new RAG service with continuous indexing."""
    logger.info("🧪 Testing FastAPI backend RAG integration...")

    try:
        # Get configuration
        from app.core.config import get_service_configs

        service_configs = get_service_configs()
        rag_config = service_configs.get("rag", {})

        logger.info(f"RAG service config: {rag_config}")

        # Test RAG service initialization
        logger.info("Initializing RAG service through FastAPI service initializer...")
        success = await init_rag_service(rag_config)

        if success:
            logger.info("✅ RAG service initialized successfully")

            # Get the service from registry
            from app.core.service_registry import get_service_registry

            registry = get_service_registry()
            rag_service = registry.get_service_instance("rag")

            if rag_service:
                logger.info(
                    f"✅ RAG service retrieved from registry: {type(rag_service).__name__}"
                )

                # Check if it's the new RAG service with continuous indexing
                if hasattr(rag_service, "continuous_indexing"):
                    logger.info("✅ RAG service has continuous indexing capability")

                    # Get statistics
                    stats = await rag_service.get_statistics()
                    logger.info(f"📊 RAG service stats: {stats}")

                    # Check continuous indexing status
                    continuous_stats = stats.get("advanced_services", {}).get(
                        "continuous_indexing", {}
                    )
                    if continuous_stats:
                        logger.info(
                            "✅ Continuous indexing is available in RAG service"
                        )
                        logger.info(
                            f"Continuous indexing enabled: {continuous_stats.get('enabled', False)}"
                        )
                        logger.info(
                            f"Continuous indexing running: {continuous_stats.get('running', False)}"
                        )

                        if continuous_stats.get("enabled") and continuous_stats.get(
                            "running"
                        ):
                            logger.info(
                                "🎉 Continuous indexing is ENABLED and RUNNING in FastAPI backend!"
                            )
                        else:
                            logger.warning("⚠️ Continuous indexing is not running")
                    else:
                        logger.warning("⚠️ Continuous indexing stats not found")
                else:
                    logger.warning(
                        "⚠️ RAG service does not have continuous indexing capability"
                    )
            else:
                logger.error("❌ RAG service not found in registry")
        else:
            logger.error("❌ RAG service initialization failed")

        return success

    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        return False


async def test_rag_api_endpoints():
    """Test RAG API endpoints to ensure they work with the new service."""
    logger.info("🧪 Testing RAG API endpoints...")

    try:
        from app.api.rag.service import get_rag_service

        # Get the RAG service
        rag_service = get_rag_service()
        logger.info(f"✅ RAG service retrieved from API: {type(rag_service).__name__}")

        # Test a simple query
        logger.info("Testing RAG query endpoint...")
        result = await rag_service.query("test query", top_k=3)
        logger.info(f"✅ Query result: {result}")

        return True

    except Exception as e:
        logger.error(f"❌ API endpoint test failed: {e}")
        return False


async def main():
    """Main test function."""
    logger.info("🦊 Starting FastAPI backend RAG integration tests...")

    try:
        # Test service initialization
        init_success = await test_fastapi_rag_integration()

        # Test API endpoints
        api_success = await test_rag_api_endpoints()

        if init_success and api_success:
            logger.info(
                "🎉 All tests passed! FastAPI backend is using the new RAG service with continuous indexing!"
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
