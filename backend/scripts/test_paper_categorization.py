#!/usr/bin/env python3
"""
Test Paper Categorization System
===============================

Simple test script to verify the paper categorization system works correctly
with the downloaded union-find papers.

🦊 Fox approach: We test our categorization system with the cunning precision
of a fox, ensuring it works perfectly with the existing RAG infrastructure!
"""

import asyncio
import json
import logging
import sys
from pathlib import Path

# Add the backend app to the path
sys.path.append(str(Path(__file__).parent.parent))

from app.config.rag_config import get_rag_config
from app.services.rag.services.core.document_categorization import (
    DocumentCategorizationService,
)
from app.services.rag.services.core.paper_indexing_integration import (
    PaperIndexingIntegration,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def test_categorization_service():
    """Test the document categorization service."""

    logger.info("Testing Document Categorization Service...")

    # Initialize service
    config = get_rag_config().to_dict()
    categorization_service = DocumentCategorizationService(config)

    success = await categorization_service.initialize()
    if not success:
        logger.error("Failed to initialize categorization service")
        return False

    # Test with sample paper metadata
    test_metadata = {
        "paper_id": "test-union-find-001",
        "title": "Efficient Union-Find Data Structure for Connected Components",
        "abstract": "We present an improved union-find data structure that efficiently handles disjoint set operations. Our algorithm uses path compression and union by rank to achieve near-constant time complexity for union and find operations.",
        "authors": ["John Doe", "Jane Smith"],
        "categories": ["cs.DS", "cs.DM"],
        "published_date": "2024-01-01",
    }

    # Categorize the test paper
    category = await categorization_service.categorize_paper_from_metadata(
        test_metadata
    )

    if category:
        logger.info(f"✅ Test categorization successful!")
        logger.info(f"   Primary domain: {category.primary_domain.value}")
        logger.info(f"   Confidence: {category.confidence:.2f}")
        logger.info(f"   Keywords: {category.keywords[:5]}")
        logger.info(f"   Reasoning: {category.reasoning}")
        return True
    else:
        logger.error("❌ Test categorization failed")
        return False


async def test_paper_indexing_integration():
    """Test the paper indexing integration service."""

    logger.info("Testing Paper Indexing Integration...")

    # Initialize service
    config = get_rag_config().to_dict()
    integration_service = PaperIndexingIntegration(config)

    success = await integration_service.initialize()
    if not success:
        logger.error("Failed to initialize paper indexing integration")
        return False

    # Test with sample paper metadata
    test_metadata = {
        "paper_id": "test-union-find-002",
        "title": "Advanced Algorithms for Minimum Spanning Trees",
        "abstract": "This paper presents new algorithms for computing minimum spanning trees using union-find data structures. We show improved performance over existing methods.",
        "authors": ["Alice Johnson", "Bob Wilson"],
        "categories": ["cs.DS", "cs.AL"],
        "published_date": "2024-01-02",
        "pdf_path": "/path/to/test.pdf",
    }

    # Process the test paper
    result = await integration_service.process_paper_for_rag(
        paper_id=test_metadata["paper_id"], metadata=test_metadata, force_reprocess=True
    )

    if "error" not in result:
        logger.info(f"✅ Test paper processing successful!")
        logger.info(f"   Paper ID: {result['paper_id']}")
        logger.info(f"   RAG Ready: {result['rag_ready']['searchable']}")

        if "categorization" in result:
            cat = result["categorization"]
            logger.info(f"   Primary domain: {cat['primary_domain']}")
            logger.info(f"   Confidence: {cat['confidence']:.2f}")

        return True
    else:
        logger.error(f"❌ Test paper processing failed: {result['error']}")
        return False


async def test_with_real_papers():
    """Test with real downloaded papers."""

    logger.info("Testing with real downloaded papers...")

    # Check if papers exist
    # Get project root and papers directory
    current_file = Path(__file__)
    project_root = (
        current_file.parent.parent.parent
    )  # scripts -> backend -> project root
    papers_dir = project_root / "backend" / "data" / "papers" / "arxiv"
    if not papers_dir.exists():
        logger.warning("Papers directory does not exist, skipping real paper test")
        return True

    # Find metadata files
    metadata_files = list(papers_dir.rglob("metadata.json"))
    if not metadata_files:
        logger.warning("No metadata files found, skipping real paper test")
        return True

    logger.info(f"Found {len(metadata_files)} papers to test")

    # Initialize services
    config = get_rag_config().to_dict()
    categorization_service = DocumentCategorizationService(config)
    integration_service = PaperIndexingIntegration(config)

    await categorization_service.initialize()
    await integration_service.initialize()

    # Test with first few papers
    test_count = min(5, len(metadata_files))
    successful_tests = 0

    for i, metadata_file in enumerate(metadata_files[:test_count]):
        try:
            # Load metadata
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)

            paper_id = metadata.get('paper_id', metadata_file.parent.name)
            logger.info(f"Testing paper {i+1}/{test_count}: {paper_id}")

            # Test categorization
            category = await categorization_service.categorize_paper_from_metadata(
                metadata
            )

            if category:
                logger.info(
                    f"   ✅ Categorized: {category.primary_domain.value} (confidence: {category.confidence:.2f})"
                )
                successful_tests += 1
            else:
                logger.warning(f"   ⚠️  Failed to categorize: {paper_id}")

        except Exception as e:
            logger.error(f"   ❌ Error testing {metadata_file}: {e}")

    logger.info(
        f"Real paper test completed: {successful_tests}/{test_count} successful"
    )
    return successful_tests > 0


async def main():
    """Run all tests."""

    logger.info("🦊 Starting Paper Categorization System Tests")
    logger.info("=" * 60)

    tests = [
        ("Document Categorization Service", test_categorization_service),
        ("Paper Indexing Integration", test_paper_indexing_integration),
        ("Real Papers Test", test_with_real_papers),
    ]

    results = []

    for test_name, test_func in tests:
        logger.info(f"\n🧪 Running: {test_name}")
        logger.info("-" * 40)

        try:
            result = await test_func()
            results.append((test_name, result))

            if result:
                logger.info(f"✅ {test_name}: PASSED")
            else:
                logger.error(f"❌ {test_name}: FAILED")

        except Exception as e:
            logger.error(f"❌ {test_name}: ERROR - {e}")
            results.append((test_name, False))

    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("🦊 TEST SUMMARY")
    logger.info("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        logger.info(f"{test_name}: {status}")

    logger.info(f"\nOverall: {passed}/{total} tests passed")

    if passed == total:
        logger.info(
            "🎉 All tests passed! The categorization system is working correctly."
        )
        return True
    else:
        logger.error("⚠️  Some tests failed. Please check the logs for details.")
        return False


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
