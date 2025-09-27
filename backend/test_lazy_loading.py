#!/usr/bin/env python3
"""🦊 Test Lazy Loading Memory Savings
===================================

Test script to demonstrate the memory savings from lazy loading implementation.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import sys
import time
import psutil
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

logger = logging.getLogger(__name__)


def get_memory_mb() -> float:
    """Get current memory usage in MB."""
    process = psutil.Process()
    return process.memory_info().rss / 1024 / 1024


def log_memory(phase: str):
    """Log current memory usage."""
    memory_mb = get_memory_mb()
    logger.info(f"📊 {phase}: {memory_mb:.1f}MB")


async def test_traditional_import():
    """Test traditional import approach."""
    logger.info("🧪 Testing Traditional Import Approach")
    logger.info("=" * 50)
    
    # Initial memory
    log_memory("initial")
    
    # Import RAG service (heavy)
    logger.info("Importing RAG service...")
    from app.services.rag.rag_service import RAGService
    log_memory("rag_service_imported")
    
    # Import other heavy modules
    logger.info("Importing pandas...")
    import pandas as pd
    log_memory("pandas_imported")
    
    logger.info("Importing numpy...")
    import numpy as np
    log_memory("numpy_imported")
    
    # Create RAG service
    logger.info("Creating RAG service...")
    config = {
        "rag_enabled": True,
        "embedding_model": "embeddinggemma:latest",
        "vector_store": "chroma",
    }
    rag_service = RAGService(config)
    log_memory("rag_service_created")
    
    # Initialize RAG service (this would be heavy)
    logger.info("Initializing RAG service...")
    # await rag_service.initialize()  # Skip actual initialization for demo
    log_memory("rag_service_initialized")
    
    return rag_service


async def test_lazy_loading():
    """Test lazy loading approach."""
    logger.info("\n🧪 Testing Lazy Loading Approach")
    logger.info("=" * 50)
    
    # Initial memory
    log_memory("initial")
    
    # Import lazy RAG service (light)
    logger.info("Importing lazy RAG service...")
    from app.services.rag.lazy_rag_service import LazyRAGService
    log_memory("lazy_rag_service_imported")
    
    # Create lazy RAG service (light)
    logger.info("Creating lazy RAG service...")
    config = {
        "rag_enabled": True,
        "embedding_model": "embeddinggemma:latest",
        "vector_store": "chroma",
    }
    lazy_rag_service = LazyRAGService(config)
    log_memory("lazy_rag_service_created")
    
    # Use the service (this triggers lazy loading)
    logger.info("Using lazy RAG service (triggering lazy loading)...")
    try:
        # This would trigger the lazy loading
        # embedding = await lazy_rag_service.embed_text("test")
        logger.info("Lazy loading triggered (simulated)")
        log_memory("lazy_loading_triggered")
    except Exception as e:
        logger.info(f"Lazy loading simulation: {e}")
        log_memory("lazy_loading_triggered")
    
    return lazy_rag_service


async def compare_approaches():
    """Compare traditional vs lazy loading approaches."""
    logger.info("🚀 Comparing Traditional vs Lazy Loading")
    logger.info("=" * 60)
    
    # Test traditional approach
    traditional_start = get_memory_mb()
    await test_traditional_import()
    traditional_end = get_memory_mb()
    traditional_growth = traditional_end - traditional_start
    
    # Small delay
    await asyncio.sleep(1)
    
    # Test lazy loading approach
    lazy_start = get_memory_mb()
    await test_lazy_loading()
    lazy_end = get_memory_mb()
    lazy_growth = lazy_end - lazy_start
    
    # Compare results
    logger.info("\n📊 Comparison Results")
    logger.info("=" * 60)
    logger.info(f"Traditional Approach:")
    logger.info(f"  Start: {traditional_start:.1f}MB")
    logger.info(f"  End: {traditional_end:.1f}MB")
    logger.info(f"  Growth: {traditional_growth:.1f}MB")
    
    logger.info(f"\nLazy Loading Approach:")
    logger.info(f"  Start: {lazy_start:.1f}MB")
    logger.info(f"  End: {lazy_end:.1f}MB")
    logger.info(f"  Growth: {lazy_growth:.1f}MB")
    
    if traditional_growth > lazy_growth:
        savings = traditional_growth - lazy_growth
        savings_percent = (savings / traditional_growth) * 100
        logger.info(f"\n💡 Memory Savings:")
        logger.info(f"  Absolute: {savings:.1f}MB")
        logger.info(f"  Percentage: {savings_percent:.1f}%")
    else:
        logger.info(f"\n⚠️ No significant savings detected in this test")


async def test_lazy_loading_benefits():
    """Test the benefits of lazy loading."""
    logger.info("\n🎯 Testing Lazy Loading Benefits")
    logger.info("=" * 50)
    
    # Test 1: Startup time
    logger.info("Test 1: Startup Time")
    start_time = time.time()
    
    from app.services.rag.lazy_rag_service import LazyRAGService
    config = {"rag_enabled": True}
    lazy_service = LazyRAGService(config)
    
    startup_time = time.time() - start_time
    logger.info(f"Lazy service creation time: {startup_time:.3f}s")
    
    # Test 2: Memory usage
    logger.info("\nTest 2: Memory Usage")
    memory_before = get_memory_mb()
    logger.info(f"Memory before lazy service: {memory_before:.1f}MB")
    
    # Test 3: Service availability
    logger.info("\nTest 3: Service Availability")
    logger.info(f"Service initialized: {lazy_service.is_initialized()}")
    logger.info(f"Service enabled: {lazy_service.is_enabled()}")
    logger.info(f"Available models: {lazy_service.get_available_models()}")
    
    # Test 4: Lazy initialization
    logger.info("\nTest 4: Lazy Initialization")
    init_start = time.time()
    
    try:
        await lazy_service._ensure_initialized()
        init_time = time.time() - init_start
        logger.info(f"Lazy initialization time: {init_time:.3f}s")
        logger.info(f"Service initialized: {lazy_service.is_initialized()}")
    except Exception as e:
        logger.info(f"Lazy initialization simulation: {e}")
    
    memory_after = get_memory_mb()
    logger.info(f"Memory after lazy initialization: {memory_after:.1f}MB")


async def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Test Lazy Loading Memory Savings")
    parser.add_argument("--test", choices=["traditional", "lazy", "compare", "benefits"], 
                       default="compare", help="Test to run")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")
    
    args = parser.parse_args()
    
    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    try:
        if args.test == "traditional":
            await test_traditional_import()
        elif args.test == "lazy":
            await test_lazy_loading()
        elif args.test == "compare":
            await compare_approaches()
        elif args.test == "benefits":
            await test_lazy_loading_benefits()
        
        logger.info("\n🎉 Lazy loading tests completed!")
        
    except KeyboardInterrupt:
        logger.info("Tests interrupted by user")
    except Exception as e:
        logger.error(f"Test error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
