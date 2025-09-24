#!/usr/bin/env python3
"""Simple validation test for performance monitoring core functionality.

This script validates the core performance monitoring components without
requiring FastAPI dependencies.
"""

import asyncio
import logging
import sys
import time
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.ecs.performance.analyzer import PerformanceAnalyzer

# Import core components (without FastAPI dependencies)
from app.ecs.performance.middleware import (
    MemoryProfiler,
    PerformanceTracker,
    track_async_task,
    track_db_query,
)

logger = logging.getLogger(__name__)


async def test_performance_tracker():
    """Test PerformanceTracker core functionality."""
    print("🔍 Testing PerformanceTracker...")

    tracker = PerformanceTracker(max_history=50)

    # Test request tracking
    for i in range(10):
        request_id = f"test-{i}"
        endpoint = f"/api/test/{i % 3}"
        method = "GET"

        # Start request
        tracker.start_request(request_id, endpoint, method)

        # Simulate work
        await asyncio.sleep(0.01 + (i * 0.005))  # Increasing delay

        # Add some database queries
        tracker.add_db_query(f"SELECT * FROM test_{i}", 0.05)

        # Add async tasks
        tracker.add_async_task(f"task_{i}", 0.02)

        # End request
        status_code = 200 if i < 8 else 500  # Some errors
        tracker.end_request(request_id, status_code)

    # Get summary
    summary = tracker.get_performance_summary()

    # Validate results
    total_requests = summary["summary"]["total_requests"]
    avg_duration = summary["summary"]["avg_duration_ms"]
    error_rate = summary["summary"]["error_rate_percent"]

    print(f"   Total requests: {total_requests}")
    print(f"   Average duration: {avg_duration:.2f}ms")
    print(f"   Error rate: {error_rate:.1f}%")
    print(f"   DB queries tracked: {len(tracker.db_queries)}")
    print(f"   Async tasks tracked: {len(tracker.async_tasks)}")

    success = (
        total_requests == 10
        and avg_duration > 10  # Should be > 10ms due to our delays
        and error_rate == 20.0  # 2 out of 10 requests failed
        and len(tracker.db_queries) == 10
        and len(tracker.async_tasks) == 10
    )

    print(f"   Test result: {'✅ PASS' if success else '❌ FAIL'}")
    return success


async def test_memory_profiler():
    """Test MemoryProfiler functionality."""
    print("\n🔍 Testing MemoryProfiler...")

    profiler = MemoryProfiler(check_interval=0.1)

    # Start profiling
    profiler.start()

    # Simulate memory usage
    data = []
    for i in range(3):
        # Allocate some memory
        data.append([j for j in range(10000)])
        await asyncio.sleep(0.2)  # Let profiler collect data

    # Stop profiling
    profiler.stop()

    # Get summary
    summary = profiler.get_memory_summary()

    print(f"   Current memory: {summary['current_memory_mb']:.1f}MB")
    print(f"   Average memory: {summary['avg_memory_mb']:.1f}MB")
    print(f"   Memory trend: {summary['memory_trend']}")
    print(f"   Snapshots: {summary['snapshots_count']}")

    success = (
        summary["snapshots_count"] > 0
        and summary["current_memory_mb"] > 0
        and summary["avg_memory_mb"] > 0
    )

    print(f"   Test result: {'✅ PASS' if success else '❌ FAIL'}")
    return success


async def test_async_task_tracking():
    """Test async task tracking decorator."""
    print("\n🔍 Testing Async Task Tracking...")

    @track_async_task("test_task")
    async def test_task(duration: float):
        await asyncio.sleep(duration)
        return "completed"

    # Test the task
    result = await test_task(0.1)

    print(f"   Task result: {result}")
    print("   Task completed successfully")

    success = result == "completed"
    print(f"   Test result: {'✅ PASS' if success else '❌ FAIL'}")
    return success


def test_db_query_tracking():
    """Test database query tracking decorator."""
    print("\n🔍 Testing Database Query Tracking...")

    @track_db_query("SELECT * FROM test_table")
    def test_query():
        time.sleep(0.05)  # Simulate query time
        return [{"id": 1, "name": "test"}]

    # Run the query
    result = test_query()

    print(f"   Query result: {len(result)} rows")
    print("   Query completed successfully")

    success = len(result) == 1 and result[0]["id"] == 1
    print(f"   Test result: {'✅ PASS' if success else '❌ FAIL'}")
    return success


async def test_bottleneck_analysis():
    """Test bottleneck analysis."""
    print("\n🔍 Testing Bottleneck Analysis...")

    # Create tracker and profiler
    tracker = PerformanceTracker(max_history=50)
    profiler = MemoryProfiler(check_interval=0.1)
    analyzer = PerformanceAnalyzer(tracker, profiler)

    # Simulate some performance data
    for i in range(15):
        request_id = f"analysis-test-{i}"
        endpoint = "/api/slow" if i < 5 else "/api/fast"
        method = "GET"

        tracker.start_request(request_id, endpoint, method)

        # Simulate different response times
        if i < 5:  # Slow requests
            await asyncio.sleep(0.2)  # 200ms
        else:  # Fast requests
            await asyncio.sleep(0.01)  # 10ms

        # Add some errors
        status_code = 500 if i % 3 == 0 else 200
        tracker.end_request(request_id, status_code)

    # Analyze bottlenecks
    bottlenecks = analyzer.analyze_bottlenecks()

    print(f"   Total bottlenecks found: {len(bottlenecks)}")

    # Check for slow endpoint detection
    slow_bottlenecks = [b for b in bottlenecks if b.bottleneck_type == "slow_endpoint"]
    error_bottlenecks = [
        b for b in bottlenecks if b.bottleneck_type == "high_error_rate"
    ]

    print(f"   Slow endpoint bottlenecks: {len(slow_bottlenecks)}")
    print(f"   Error rate bottlenecks: {len(error_bottlenecks)}")

    # Should detect slow endpoint and high error rate
    success = len(slow_bottlenecks) > 0 and len(error_bottlenecks) > 0

    print(f"   Test result: {'✅ PASS' if success else '❌ FAIL'}")
    return success


async def test_performance_trends():
    """Test performance trend analysis."""
    print("\n🔍 Testing Performance Trend Analysis...")

    tracker = PerformanceTracker(max_history=50)
    profiler = MemoryProfiler(check_interval=0.1)
    analyzer = PerformanceAnalyzer(tracker, profiler)

    # Simulate degrading performance over time
    for i in range(20):
        request_id = f"trend-test-{i}"
        tracker.start_request(request_id, "/api/trend", "GET")

        # Simulate degrading performance (increasing response time)
        await asyncio.sleep(
            0.01 + (i * 0.02),
        )  # 10ms + 20ms per request (more dramatic increase)

        tracker.end_request(request_id)

    # Analyze trends
    trends = analyzer.analyze_performance_trends()

    print(f"   Trends found: {len(trends)}")

    # Check for response time trend
    response_time_trend = None
    for trend in trends:
        if trend.metric_name == "response_time":
            response_time_trend = trend
            break

    if response_time_trend:
        print(f"   Response time trend: {response_time_trend.trend_direction}")
        print(f"   Trend confidence: {response_time_trend.confidence:.1%}")
        success = response_time_trend.trend_direction == "degrading"
    else:
        print("   No response time trend detected")
        success = False

    print(f"   Test result: {'✅ PASS' if success else '❌ FAIL'}")
    return success


async def main():
    """Run all validation tests."""
    print("🐍 Mysterious-Prime-67 Performance Monitoring Validation")
    print("=" * 60)

    tests = [
        ("Performance Tracker", test_performance_tracker),
        ("Memory Profiler", test_memory_profiler),
        ("Async Task Tracking", test_async_task_tracking),
        ("Database Query Tracking", test_db_query_tracking),
        ("Bottleneck Analysis", test_bottleneck_analysis),
        ("Performance Trends", test_performance_trends),
    ]

    results = []

    for test_name, test_func in tests:
        try:
            if asyncio.iscoroutinefunction(test_func):
                result = await test_func()
            else:
                result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"   ❌ Test failed with error: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 60)
    print("📊 VALIDATION SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")

    print(f"\nOverall: {passed}/{total} tests passed ({passed/total:.1%})")

    if passed == total:
        print("🎉 All validation tests passed!")
        print("✅ Performance monitoring system is working correctly")
        return 0
    print("⚠️  Some validation tests failed")
    print("🔧 Review the failed tests and fix any issues")
    return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
