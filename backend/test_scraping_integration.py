#!/usr/bin/env python3
"""Test script for the new scraping components integration."""

import asyncio
import logging
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.services.scraping.extractors import (
    ArsTechnicaScraper,
    MultiTierExtractor,
    WordPressScraper,
    IntelligentContentFilter,
)
from app.services.scraping.models import ScrapingType

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_arstechnica_scraper():
    """Test the Ars Technica scraper."""
    logger.info("Testing Ars Technica scraper...")
    
    scraper = ArsTechnicaScraper()
    
    try:
        # Initialize the scraper
        if not await scraper.initialize():
            logger.error("Failed to initialize Ars Technica scraper")
            return False
        
        # Test URL handling
        test_url = "https://arstechnica.com/gadgets/2024/01/test-article/"
        can_handle = await scraper.can_handle_url(test_url)
        logger.info(f"Can handle Ars Technica URL: {can_handle}")
        
        # Test API availability
        api_available = await scraper._test_api_availability()
        logger.info(f"WordPress API available: {api_available}")
        
        # Shutdown
        await scraper.shutdown()
        logger.info("Ars Technica scraper test completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Ars Technica scraper test failed: {e}")
        return False


async def test_wordpress_scraper():
    """Test the WordPress scraper."""
    logger.info("Testing WordPress scraper...")
    
    scraper = WordPressScraper("https://arstechnica.com")
    
    try:
        # Initialize the scraper
        if not await scraper.initialize():
            logger.error("Failed to initialize WordPress scraper")
            return False
        
        # Test URL handling
        test_url = "https://arstechnica.com/gadgets/2024/01/test-article/"
        can_handle = await scraper.can_handle_url(test_url)
        logger.info(f"Can handle WordPress URL: {can_handle}")
        
        # Test API availability
        api_available = await scraper._test_api_availability()
        logger.info(f"WordPress API available: {api_available}")
        
        # Shutdown
        await scraper.shutdown()
        logger.info("WordPress scraper test completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"WordPress scraper test failed: {e}")
        return False


async def test_multi_tier_extractor():
    """Test the multi-tier extractor."""
    logger.info("Testing multi-tier extractor...")
    
    extractor = MultiTierExtractor()
    
    try:
        # Initialize the extractor
        if not await extractor.initialize():
            logger.error("Failed to initialize multi-tier extractor")
            return False
        
        # Test site-specific strategy detection
        test_urls = [
            "https://arstechnica.com/gadgets/2024/01/test-article/",
            "https://twitter.com/user/status/123456789",
            "https://reddit.com/r/technology/comments/abc123/",
            "https://example.com/some-article",
        ]
        
        for url in test_urls:
            strategy = extractor._get_site_specific_strategy(url)
            logger.info(f"Strategy for {url}: {strategy}")
        
        # Get extraction stats
        stats = extractor.get_extraction_stats()
        logger.info(f"Extraction stats: {stats}")
        
        # Shutdown
        await extractor.shutdown()
        logger.info("Multi-tier extractor test completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Multi-tier extractor test failed: {e}")
        return False


async def test_intelligent_content_filter():
    """Test the intelligent content filter."""
    logger.info("Testing intelligent content filter...")
    
    filter_instance = IntelligentContentFilter()
    
    try:
        # Test content filtering
        test_content = """
        This is a test article with some content.
        
        It has multiple paragraphs and should be filtered properly.
        
        Navigation menu items should be removed.
        Advertisement content should be filtered out.
        
        The main article content should remain.
        """
        
        result = await filter_instance.filter_content(test_content, source="test.com")
        
        logger.info(f"Filtering result:")
        logger.info(f"  Quality score: {result.quality_score}")
        logger.info(f"  Processing time: {result.processing_time:.3f}s")
        logger.info(f"  Original length: {result.metadata.get('original_length', 0)}")
        logger.info(f"  Filtered length: {result.metadata.get('filtered_length', 0)}")
        logger.info(f"  Compression ratio: {result.metadata.get('compression_ratio', 0):.1%}")
        
        logger.info("Intelligent content filter test completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Intelligent content filter test failed: {e}")
        return False


async def main():
    """Run all tests."""
    logger.info("Starting scraping integration tests...")
    
    tests = [
        test_arstechnica_scraper,
        test_wordpress_scraper,
        test_multi_tier_extractor,
        test_intelligent_content_filter,
    ]
    
    results = []
    for test in tests:
        try:
            result = await test()
            results.append(result)
        except Exception as e:
            logger.error(f"Test {test.__name__} failed with exception: {e}")
            results.append(False)
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    logger.info(f"\nTest Summary: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("All tests passed! Integration is working correctly.")
        return 0
    else:
        logger.error("Some tests failed. Check the logs above for details.")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
