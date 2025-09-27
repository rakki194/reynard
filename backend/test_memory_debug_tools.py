#!/usr/bin/env python3
"""🦊 Test Memory Debug Tools
===========================

Test script to validate the memory debugging tools for the RAG stack.
This script tests all the memory debugging components and ensures they work correctly.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import sys
import time
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.memory_profiling import (
    memory_profile, 
    memory_trace, 
    get_memory_stats, 
    get_memory_profiles,
    clear_memory_profiles,
    start_memory_tracing,
    stop_memory_tracing
)
from memory_debug_tracer import MemoryDebugTracer
from memory_monitor_dashboard import MemoryMonitorDashboard

logger = logging.getLogger(__name__)


# Test functions with memory profiling
@memory_profile(component="test_component", operation="test_function", log_threshold_mb=1.0)
async def test_async_function():
    """Test async function with memory profiling."""
    await asyncio.sleep(0.1)
    # Simulate some memory usage
    data = [i for i in range(1000)]
    return len(data)


@memory_profile(component="test_component", operation="test_sync_function", log_threshold_mb=1.0)
def test_sync_function():
    """Test sync function with memory profiling."""
    time.sleep(0.1)
    # Simulate some memory usage
    data = [i for i in range(1000)]
    return len(data)


async def test_memory_profiling():
    """Test memory profiling functionality."""
    logger.info("🧪 Testing memory profiling...")
    
    try:
        # Clear existing profiles
        clear_memory_profiles()
        
        # Test async function
        result1 = await test_async_function()
        logger.info(f"✅ Async function result: {result1}")
        
        # Test sync function
        result2 = test_sync_function()
        logger.info(f"✅ Sync function result: {result2}")
        
        # Test context manager
        with memory_trace("test_component", "test_context"):
            await asyncio.sleep(0.1)
            data = [i for i in range(500)]
        
        # Get memory stats
        stats = get_memory_stats()
        logger.info(f"📊 Memory stats: {stats}")
        
        # Get profiles
        profiles = get_memory_profiles(limit=10)
        logger.info(f"📋 Profiles collected: {len(profiles)}")
        
        for profile in profiles:
            logger.info(f"   {profile.get('component', 'unknown')}.{profile.get('operation', 'unknown')}: "
                       f"{profile.get('memory_used_mb', 0):.1f}MB in {profile.get('execution_time_ms', 0):.1f}ms")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Memory profiling test failed: {e}")
        return False


async def test_memory_tracer():
    """Test memory debug tracer."""
    logger.info("🧪 Testing memory debug tracer...")
    
    try:
        # Create tracer
        config = {
            "sample_interval": 0.5,
            "max_snapshots": 100,
            "leak_threshold_mb": 10,
            "critical_threshold_mb": 50,
            "enable_tracemalloc": True,
            "enable_call_tracing": True,
        }
        
        tracer = MemoryDebugTracer(config)
        
        # Start monitoring for a short duration
        await tracer.start_monitoring(5)
        
        # Simulate some activity
        for i in range(3):
            await asyncio.sleep(1)
            # Create some memory usage
            data = [j for j in range(1000 * (i + 1))]
            logger.info(f"Created {len(data)} items")
        
        # Stop monitoring
        report = await tracer.stop_monitoring()
        
        logger.info(f"📊 Tracer report: {report}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Memory tracer test failed: {e}")
        return False


async def test_memory_dashboard():
    """Test memory monitor dashboard."""
    logger.info("🧪 Testing memory monitor dashboard...")
    
    try:
        # Create dashboard
        config = {
            "refresh_interval": 1.0,
            "max_history": 50,
            "alert_threshold_mb": 10,
            "critical_threshold_mb": 50,
        }
        
        dashboard = MemoryMonitorDashboard(config)
        
        # Start monitoring for a short duration
        await dashboard.start_monitoring(3)
        
        # Simulate some activity
        for i in range(2):
            await asyncio.sleep(1)
            # Create some memory usage
            data = [j for j in range(1000 * (i + 1))]
            logger.info(f"Created {len(data)} items")
        
        # Stop monitoring
        summary = await dashboard.stop_monitoring()
        
        logger.info(f"📊 Dashboard summary: {summary}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Memory dashboard test failed: {e}")
        return False


async def test_tracemalloc():
    """Test tracemalloc functionality."""
    logger.info("🧪 Testing tracemalloc...")
    
    try:
        # Start tracing
        start_memory_tracing()
        
        # Create some memory usage
        data1 = [i for i in range(10000)]
        data2 = [i * 2 for i in range(10000)]
        
        # Stop tracing
        stop_memory_tracing()
        
        logger.info("✅ Tracemalloc test completed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Tracemalloc test failed: {e}")
        return False


async def run_all_tests():
    """Run all memory debug tests."""
    logger.info("🚀 Starting memory debug tools tests...")
    
    tests = [
        ("Memory Profiling", test_memory_profiling),
        ("Memory Tracer", test_memory_tracer),
        ("Memory Dashboard", test_memory_dashboard),
        ("Tracemalloc", test_tracemalloc),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        logger.info(f"\n{'='*50}")
        logger.info(f"Running test: {test_name}")
        logger.info(f"{'='*50}")
        
        try:
            result = await test_func()
            results[test_name] = result
            
            if result:
                logger.info(f"✅ {test_name} test passed")
            else:
                logger.error(f"❌ {test_name} test failed")
                
        except Exception as e:
            logger.error(f"❌ {test_name} test error: {e}")
            results[test_name] = False
    
    # Print summary
    logger.info(f"\n{'='*50}")
    logger.info("TEST SUMMARY")
    logger.info(f"{'='*50}")
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{test_name}: {status}")
    
    logger.info(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All tests passed! Memory debug tools are working correctly.")
    else:
        logger.error("⚠️ Some tests failed. Please check the logs for details.")
    
    return passed == total


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Test Memory Debug Tools")
    parser.add_argument("--test", choices=["profiling", "tracer", "dashboard", "tracemalloc", "all"], 
                       default="all", help="Test to run")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")
    
    args = parser.parse_args()
    
    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    try:
        if args.test == "all":
            success = asyncio.run(run_all_tests())
            sys.exit(0 if success else 1)
        elif args.test == "profiling":
            success = asyncio.run(test_memory_profiling())
        elif args.test == "tracer":
            success = asyncio.run(test_memory_tracer())
        elif args.test == "dashboard":
            success = asyncio.run(test_memory_dashboard())
        elif args.test == "tracemalloc":
            success = asyncio.run(test_tracemalloc())
        
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        logger.info("Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Test error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
