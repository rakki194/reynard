"""Test script for performance monitoring system.

This script demonstrates and tests the performance monitoring functionality.
"""

import asyncio
import sys
import time
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.ecs.performance import (
    MemoryProfiler,
    PerformanceAnalyzer,
    PerformanceTracker,
    track_async_task,
    track_db_query,
)


async def test_performance_tracking():
    """Test basic performance tracking functionality."""
    print("🧪 Testing Performance Tracking...")

    # Create performance tracker
    tracker = PerformanceTracker(max_history=100)

    # Simulate some requests
    for i in range(10):
        request_id = f"test-request-{i}"
        endpoint = f"/api/test/{i % 3}"  # 3 different endpoints
        method = "GET"

        # Start request
        tracker.start_request(request_id, endpoint, method)

        # Simulate processing time
        await asyncio.sleep(0.1 + (i * 0.01))  # Increasing delay

        # Add some database queries
        tracker.add_db_query(f"SELECT * FROM test_table_{i}", 0.05)

        # Add some async tasks
        tracker.add_async_task(f"background_task_{i}", 0.02)

        # End request
        status_code = 200 if i < 8 else 500  # Some errors
        tracker.end_request(request_id, status_code)

    # Get performance summary
    summary = tracker.get_performance_summary()
    print("✅ Performance tracking test completed")
    print(f"   Total requests: {summary['summary']['total_requests']}")
    print(f"   Average duration: {summary['summary']['avg_duration_ms']:.2f}ms")
    print(f"   Error rate: {summary['summary']['error_rate_percent']:.1f}%")

    return tracker


async def test_memory_profiling():
    """Test memory profiling functionality."""
    print("\n🧪 Testing Memory Profiling...")

    # Create memory profiler
    profiler = MemoryProfiler(check_interval=0.5)  # Check every 0.5 seconds

    # Start profiling
    profiler.start()

    # Simulate some memory usage
    data = []
    for i in range(5):
        # Allocate some memory
        data.append([j for j in range(10000)])
        await asyncio.sleep(1)  # Wait for profiler to collect data

    # Stop profiling
    profiler.stop()

    # Get memory summary
    summary = profiler.get_memory_summary()
    print("✅ Memory profiling test completed")
    print(f"   Current memory: {summary['current_memory_mb']:.1f}MB")
    print(f"   Average memory: {summary['avg_memory_mb']:.1f}MB")
    print(f"   Memory trend: {summary['memory_trend']}")
    print(f"   Snapshots: {summary['snapshots_count']}")

    return profiler


async def test_async_task_tracking():
    """Test async task tracking decorator."""
    print("\n🧪 Testing Async Task Tracking...")

    @track_async_task("test_task")
    async def test_task():
        await asyncio.sleep(0.1)
        return "task completed"

    # Run the task
    result = await test_task()
    print(f"✅ Async task tracking test completed: {result}")

    return result


def test_db_query_tracking():
    """Test database query tracking decorator."""
    print("\n🧪 Testing Database Query Tracking...")

    @track_db_query("SELECT * FROM test_table")
    def test_query():
        time.sleep(0.05)  # Simulate query time
        return [{"id": 1, "name": "test"}]

    # Run the query
    result = test_query()
    print(f"✅ Database query tracking test completed: {len(result)} rows")

    return result


async def test_bottleneck_analysis(tracker, profiler):
    """Test bottleneck analysis functionality."""
    print("\n🧪 Testing Bottleneck Analysis...")

    # Create analyzer
    analyzer = PerformanceAnalyzer(tracker, profiler)

    # Analyze bottlenecks
    bottlenecks = analyzer.analyze_bottlenecks()
    print("✅ Bottleneck analysis test completed")
    print(f"   Found {len(bottlenecks)} bottlenecks")

    for bottleneck in bottlenecks[:3]:  # Show first 3
        print(f"   - {bottleneck.severity.upper()}: {bottleneck.description}")

    # Analyze trends
    trends = analyzer.analyze_performance_trends()
    print(f"   Found {len(trends)} trends")

    for trend in trends:
        print(
            f"   - {trend.metric_name}: {trend.trend_direction} ({trend.change_percentage:+.1f}%)",
        )

    # Generate optimization report
    report = analyzer.generate_optimization_report()
    print(
        f"   Optimization score: {report['optimization_score']['score']}/100 ({report['optimization_score']['grade']})",
    )

    return analyzer


async def main():
    """Run all performance monitoring tests."""
    print("🐍 Mysterious-Prime-67 Performance Monitoring Test Suite")
    print("=" * 60)

    try:
        # Test performance tracking
        tracker = await test_performance_tracking()

        # Test memory profiling
        profiler = await test_memory_profiling()

        # Test async task tracking
        await test_async_task_tracking()

        # Test database query tracking
        test_db_query_tracking()

        # Test bottleneck analysis
        analyzer = await test_bottleneck_analysis(tracker, profiler)

        print("\n" + "=" * 60)
        print("🎉 All performance monitoring tests completed successfully!")
        print("\n📊 Performance monitoring system is ready for use.")
        print("💡 Check the README.md for integration instructions.")

    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback

        traceback.print_exc()
        return 1

    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
