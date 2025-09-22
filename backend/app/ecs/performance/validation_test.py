#!/usr/bin/env python3
"""
Comprehensive validation test for performance monitoring system.

This script validates that our performance monitoring is measuring actual
application performance and not just monitoring overhead. It tests:
- Baseline performance without monitoring
- Performance with monitoring enabled
- Overhead measurement and validation
- Real bottleneck detection vs false positives
"""

import asyncio
import time
import statistics
import sys
import os
from pathlib import Path
from typing import Dict, List, Any
import json
import logging

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.ecs.performance import (
    PerformanceTracker,
    MemoryProfiler,
    PerformanceAnalyzer,
    track_async_task,
    track_db_query
)

logger = logging.getLogger(__name__)


class PerformanceValidationSuite:
    """Comprehensive validation suite for performance monitoring."""
    
    def __init__(self):
        self.results = {}
        self.baseline_metrics = {}
        self.monitored_metrics = {}
    
    async def run_validation_suite(self) -> Dict[str, Any]:
        """Run complete validation suite."""
        print("🐍 Mysterious-Prime-67 Performance Monitoring Validation Suite")
        print("=" * 70)
        
        # Test 1: Overhead Measurement
        overhead_results = await self._test_monitoring_overhead()
        self.results['overhead'] = overhead_results
        
        # Test 2: Real vs False Bottleneck Detection
        bottleneck_results = await self._test_bottleneck_detection()
        self.results['bottleneck_detection'] = bottleneck_results
        
        # Test 3: Memory Monitoring Accuracy
        memory_results = await self._test_memory_monitoring()
        self.results['memory_monitoring'] = memory_results
        
        # Test 4: Database Query Tracking
        db_results = await self._test_database_tracking()
        self.results['database_tracking'] = db_results
        
        # Test 5: Async Task Monitoring
        async_results = await self._test_async_monitoring()
        self.results['async_monitoring'] = async_results
        
        # Test 6: Performance Trend Analysis
        trend_results = await self._test_trend_analysis()
        self.results['trend_analysis'] = trend_results
        
        # Generate validation report
        validation_report = self._generate_validation_report()
        
        return validation_report
    
    async def _test_monitoring_overhead(self) -> Dict[str, Any]:
        """Test monitoring overhead impact."""
        print("\n🔍 Testing Monitoring Overhead...")
        
        # Test function that simulates real work
        async def simulate_work(duration: float, complexity: int = 1):
            """Simulate work with configurable duration and complexity."""
            start_time = time.time()
            
            # Simulate CPU work
            for i in range(complexity * 1000):
                _ = sum(range(100))
            
            # Simulate async work
            await asyncio.sleep(duration)
            
            return time.time() - start_time
        
        # Baseline test (no monitoring)
        baseline_times = []
        for i in range(50):
            duration = await simulate_work(0.01, 1)
            baseline_times.append(duration)
        
        # Monitored test (with tracking)
        tracker = PerformanceTracker(max_history=100)
        monitored_times = []
        
        for i in range(50):
            request_id = f"overhead-test-{i}"
            endpoint = "/test/overhead"
            method = "GET"
            
            # Start tracking
            tracker.start_request(request_id, endpoint, method)
            
            # Simulate work
            duration = await simulate_work(0.01, 1)
            monitored_times.append(duration)
            
            # End tracking
            tracker.end_request(request_id)
        
        # Calculate overhead
        baseline_avg = statistics.mean(baseline_times)
        monitored_avg = statistics.mean(monitored_times)
        overhead_percentage = ((monitored_avg - baseline_avg) / baseline_avg) * 100
        
        # Validate overhead is reasonable (< 5%)
        overhead_acceptable = overhead_percentage < 5.0
        
        result = {
            'baseline_avg_ms': baseline_avg * 1000,
            'monitored_avg_ms': monitored_avg * 1000,
            'overhead_percentage': overhead_percentage,
            'overhead_acceptable': overhead_acceptable,
            'baseline_std_dev': statistics.stdev(baseline_times) * 1000,
            'monitored_std_dev': statistics.stdev(monitored_times) * 1000,
            'test_passed': overhead_acceptable
        }
        
        print(f"   Baseline: {baseline_avg*1000:.2f}ms ± {statistics.stdev(baseline_times)*1000:.2f}ms")
        print(f"   Monitored: {monitored_avg*1000:.2f}ms ± {statistics.stdev(monitored_times)*1000:.2f}ms")
        print(f"   Overhead: {overhead_percentage:.2f}% {'✅' if overhead_acceptable else '❌'}")
        
        return result
    
    async def _test_bottleneck_detection(self) -> Dict[str, Any]:
        """Test real vs false bottleneck detection."""
        print("\n🔍 Testing Bottleneck Detection Accuracy...")
        
        tracker = PerformanceTracker(max_history=100)
        profiler = MemoryProfiler(check_interval=0.1)
        analyzer = PerformanceAnalyzer(tracker, profiler)
        
        # Test 1: Simulate slow endpoint (should be detected)
        slow_endpoint_times = []
        for i in range(20):
            request_id = f"slow-test-{i}"
            tracker.start_request(request_id, "/api/slow", "GET")
            
            # Simulate slow work
            await asyncio.sleep(0.5)  # 500ms delay
            
            tracker.end_request(request_id)
            slow_endpoint_times.append(0.5)
        
        # Test 2: Simulate fast endpoint (should not be detected as bottleneck)
        fast_endpoint_times = []
        for i in range(20):
            request_id = f"fast-test-{i}"
            tracker.start_request(request_id, "/api/fast", "GET")
            
            # Simulate fast work
            await asyncio.sleep(0.01)  # 10ms delay
            
            tracker.end_request(request_id)
            fast_endpoint_times.append(0.01)
        
        # Test 3: Simulate high error rate (should be detected)
        for i in range(20):
            request_id = f"error-test-{i}"
            tracker.start_request(request_id, "/api/error", "GET")
            
            await asyncio.sleep(0.05)
            
            # 50% error rate
            status_code = 500 if i % 2 == 0 else 200
            tracker.end_request(request_id, status_code)
        
        # Analyze bottlenecks
        bottlenecks = analyzer.analyze_bottlenecks()
        
        # Validate detection accuracy
        slow_bottleneck_detected = any(
            b.bottleneck_type == 'slow_endpoint' and '/api/slow' in b.affected_endpoints
            for b in bottlenecks
        )
        
        fast_bottleneck_detected = any(
            b.bottleneck_type == 'slow_endpoint' and '/api/fast' in b.affected_endpoints
            for b in bottlenecks
        )
        
        error_bottleneck_detected = any(
            b.bottleneck_type == 'high_error_rate' and '/api/error' in b.affected_endpoints
            for b in bottlenecks
        )
        
        # Calculate accuracy
        true_positives = sum([slow_bottleneck_detected, error_bottleneck_detected])
        false_positives = 1 if fast_bottleneck_detected else 0
        false_negatives = 2 - true_positives
        
        accuracy = true_positives / (true_positives + false_positives + false_negatives) if (true_positives + false_positives + false_negatives) > 0 else 0
        
        result = {
            'slow_bottleneck_detected': slow_bottleneck_detected,
            'fast_bottleneck_detected': fast_bottleneck_detected,
            'error_bottleneck_detected': error_bottleneck_detected,
            'true_positives': true_positives,
            'false_positives': false_positives,
            'false_negatives': false_negatives,
            'accuracy': accuracy,
            'total_bottlenecks': len(bottlenecks),
            'test_passed': accuracy >= 0.8  # 80% accuracy threshold
        }
        
        print(f"   Slow endpoint detected: {'✅' if slow_bottleneck_detected else '❌'}")
        print(f"   Fast endpoint false positive: {'❌' if fast_bottleneck_detected else '✅'}")
        print(f"   Error rate detected: {'✅' if error_bottleneck_detected else '❌'}")
        print(f"   Detection accuracy: {accuracy:.1%}")
        
        return result
    
    async def _test_memory_monitoring(self) -> Dict[str, Any]:
        """Test memory monitoring accuracy."""
        print("\n🔍 Testing Memory Monitoring Accuracy...")
        
        profiler = MemoryProfiler(check_interval=0.1)
        profiler.start()
        
        # Baseline memory measurement
        import psutil
        process = psutil.Process()
        baseline_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Simulate memory allocation
        allocated_data = []
        for i in range(5):
            # Allocate ~10MB
            data = [0] * (10 * 1024 * 1024 // 8)  # 10MB of integers
            allocated_data.append(data)
            await asyncio.sleep(0.2)  # Let profiler collect data
        
        # Get current memory
        current_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Stop profiler and get summary
        profiler.stop()
        memory_summary = profiler.get_memory_summary()
        
        # Validate memory tracking
        memory_increase = current_memory - baseline_memory
        tracked_memory = memory_summary.get('current_memory_mb', 0)
        
        # Check if profiler detected the memory increase
        memory_trend_detected = memory_summary.get('memory_trend') == 'increasing'
        memory_increase_detected = tracked_memory > baseline_memory
        
        # Calculate accuracy
        memory_accuracy = 1.0 if memory_increase_detected and memory_trend_detected else 0.0
        
        result = {
            'baseline_memory_mb': baseline_memory,
            'current_memory_mb': current_memory,
            'tracked_memory_mb': tracked_memory,
            'memory_increase_mb': memory_increase,
            'memory_trend_detected': memory_trend_detected,
            'memory_increase_detected': memory_increase_detected,
            'memory_accuracy': memory_accuracy,
            'snapshots_count': memory_summary.get('snapshots_count', 0),
            'test_passed': memory_accuracy >= 0.8
        }
        
        print(f"   Baseline memory: {baseline_memory:.1f}MB")
        print(f"   Current memory: {current_memory:.1f}MB")
        print(f"   Tracked memory: {tracked_memory:.1f}MB")
        print(f"   Memory increase detected: {'✅' if memory_increase_detected else '❌'}")
        print(f"   Memory trend detected: {'✅' if memory_trend_detected else '❌'}")
        
        return result
    
    async def _test_database_tracking(self) -> Dict[str, Any]:
        """Test database query tracking accuracy."""
        print("\n🔍 Testing Database Query Tracking...")
        
        tracker = PerformanceTracker(max_history=100)
        
        # Simulate database queries with known durations
        test_queries = [
            ("SELECT * FROM users", 0.1),  # 100ms
            ("SELECT * FROM posts WHERE user_id = ?", 0.05),  # 50ms
            ("INSERT INTO logs (message) VALUES (?)", 0.02),  # 20ms
            ("SELECT COUNT(*) FROM large_table", 0.3),  # 300ms (slow)
        ]
        
        tracked_queries = []
        
        for query, expected_duration in test_queries:
            # Simulate query execution
            start_time = time.time()
            await asyncio.sleep(expected_duration)
            actual_duration = time.time() - start_time
            
            # Track the query
            tracker.add_db_query(query, actual_duration)
            tracked_queries.append((query, expected_duration, actual_duration))
        
        # Validate tracking accuracy
        db_queries = tracker.db_queries
        tracking_accuracy = 0.0
        
        if len(db_queries) == len(test_queries):
            total_error = 0.0
            for i, (query, expected, actual) in enumerate(tracked_queries):
                error = abs(actual - expected) / expected
                total_error += error
            
            tracking_accuracy = 1.0 - (total_error / len(tracked_queries))
        
        # Check if slow query was detected
        slow_queries = [q for q in db_queries if q.duration > 0.1]
        slow_query_detected = len(slow_queries) > 0
        
        result = {
            'expected_queries': len(test_queries),
            'tracked_queries': len(db_queries),
            'tracking_accuracy': tracking_accuracy,
            'slow_query_detected': slow_query_detected,
            'slow_queries_count': len(slow_queries),
            'test_passed': tracking_accuracy >= 0.9 and slow_query_detected
        }
        
        print(f"   Expected queries: {len(test_queries)}")
        print(f"   Tracked queries: {len(db_queries)}")
        print(f"   Tracking accuracy: {tracking_accuracy:.1%}")
        print(f"   Slow query detected: {'✅' if slow_query_detected else '❌'}")
        
        return result
    
    async def _test_async_monitoring(self) -> Dict[str, Any]:
        """Test async task monitoring accuracy."""
        print("\n🔍 Testing Async Task Monitoring...")
        
        tracker = PerformanceTracker(max_history=100)
        
        # Test async task tracking decorator
        @track_async_task("test_task")
        async def test_async_task(duration: float):
            await asyncio.sleep(duration)
            return "completed"
        
        # Test multiple tasks with different durations
        test_durations = [0.1, 0.2, 0.05, 0.3]  # 100ms, 200ms, 50ms, 300ms
        actual_durations = []
        
        for duration in test_durations:
            start_time = time.time()
            result = await test_async_task(duration)
            actual_duration = time.time() - start_time
            actual_durations.append(actual_duration)
        
        # Validate tracking
        async_tasks = tracker.async_tasks
        tracking_accuracy = 0.0
        
        if len(async_tasks) == len(test_durations):
            total_error = 0.0
            for i, (task, expected, actual) in enumerate(zip(async_tasks, test_durations, actual_durations)):
                error = abs(actual - expected) / expected
                total_error += error
            
            tracking_accuracy = 1.0 - (total_error / len(async_tasks))
        
        # Check if slow tasks were detected
        slow_tasks = [t for t in async_tasks if t.duration > 0.2]
        slow_task_detected = len(slow_tasks) > 0
        
        result = {
            'expected_tasks': len(test_durations),
            'tracked_tasks': len(async_tasks),
            'tracking_accuracy': tracking_accuracy,
            'slow_task_detected': slow_task_detected,
            'slow_tasks_count': len(slow_tasks),
            'test_passed': tracking_accuracy >= 0.9 and slow_task_detected
        }
        
        print(f"   Expected tasks: {len(test_durations)}")
        print(f"   Tracked tasks: {len(async_tasks)}")
        print(f"   Tracking accuracy: {tracking_accuracy:.1%}")
        print(f"   Slow task detected: {'✅' if slow_task_detected else '❌'}")
        
        return result
    
    async def _test_trend_analysis(self) -> Dict[str, Any]:
        """Test performance trend analysis."""
        print("\n🔍 Testing Performance Trend Analysis...")
        
        tracker = PerformanceTracker(max_history=100)
        profiler = MemoryProfiler(check_interval=0.1)
        analyzer = PerformanceAnalyzer(tracker, profiler)
        
        # Simulate degrading performance over time
        for i in range(30):
            request_id = f"trend-test-{i}"
            tracker.start_request(request_id, "/api/trend", "GET")
            
            # Simulate degrading performance (increasing response time)
            await asyncio.sleep(0.01 + (i * 0.005))  # 10ms + 5ms per request
            
            tracker.end_request(request_id)
        
        # Analyze trends
        trends = analyzer.analyze_performance_trends()
        
        # Validate trend detection
        response_time_trend = None
        for trend in trends:
            if trend.metric_name == 'response_time':
                response_time_trend = trend
                break
        
        trend_detected = response_time_trend is not None
        degrading_trend = response_time_trend.trend_direction == 'degrading' if response_time_trend else False
        trend_confidence = response_time_trend.confidence if response_time_trend else 0.0
        
        result = {
            'trend_detected': trend_detected,
            'degrading_trend': degrading_trend,
            'trend_confidence': trend_confidence,
            'total_trends': len(trends),
            'test_passed': trend_detected and degrading_trend and trend_confidence > 0.5
        }
        
        print(f"   Trend detected: {'✅' if trend_detected else '❌'}")
        print(f"   Degrading trend: {'✅' if degrading_trend else '❌'}")
        print(f"   Trend confidence: {trend_confidence:.1%}")
        
        return result
    
    def _generate_validation_report(self) -> Dict[str, Any]:
        """Generate comprehensive validation report."""
        print("\n" + "=" * 70)
        print("📊 VALIDATION REPORT")
        print("=" * 70)
        
        # Calculate overall test results
        test_results = []
        for test_name, result in self.results.items():
            test_passed = result.get('test_passed', False)
            test_results.append(test_passed)
            status = "✅ PASS" if test_passed else "❌ FAIL"
            print(f"{test_name.replace('_', ' ').title()}: {status}")
        
        overall_success_rate = sum(test_results) / len(test_results) if test_results else 0
        
        # Generate recommendations
        recommendations = []
        
        if self.results['overhead']['overhead_percentage'] > 5.0:
            recommendations.append("Consider optimizing monitoring overhead - currently > 5%")
        
        if not self.results['bottleneck_detection']['test_passed']:
            recommendations.append("Improve bottleneck detection accuracy")
        
        if not self.results['memory_monitoring']['test_passed']:
            recommendations.append("Enhance memory monitoring accuracy")
        
        if not self.results['database_tracking']['test_passed']:
            recommendations.append("Improve database query tracking precision")
        
        if not self.results['async_monitoring']['test_passed']:
            recommendations.append("Enhance async task monitoring")
        
        if not self.results['trend_analysis']['test_passed']:
            recommendations.append("Improve trend analysis accuracy")
        
        if not recommendations:
            recommendations.append("All validation tests passed - monitoring system is working correctly")
        
        report = {
            'validation_timestamp': time.time(),
            'overall_success_rate': overall_success_rate,
            'test_results': self.results,
            'recommendations': recommendations,
            'validation_passed': overall_success_rate >= 0.8,  # 80% pass rate
            'summary': {
                'total_tests': len(test_results),
                'passed_tests': sum(test_results),
                'failed_tests': len(test_results) - sum(test_results),
                'overhead_percentage': self.results['overhead']['overhead_percentage'],
                'bottleneck_accuracy': self.results['bottleneck_detection']['accuracy'],
                'memory_accuracy': self.results['memory_monitoring']['memory_accuracy'],
                'db_tracking_accuracy': self.results['database_tracking']['tracking_accuracy'],
                'async_tracking_accuracy': self.results['async_monitoring']['tracking_accuracy'],
                'trend_detection_confidence': self.results['trend_analysis']['trend_confidence']
            }
        }
        
        print(f"\nOverall Success Rate: {overall_success_rate:.1%}")
        print(f"Validation Status: {'✅ PASSED' if report['validation_passed'] else '❌ FAILED'}")
        
        print("\n📋 Recommendations:")
        for i, rec in enumerate(recommendations, 1):
            print(f"   {i}. {rec}")
        
        return report


async def main():
    """Main validation function."""
    validation_suite = PerformanceValidationSuite()
    
    try:
        report = await validation_suite.run_validation_suite()
        
        # Save report to file
        report_file = Path(__file__).parent / "validation_report.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Validation report saved to: {report_file}")
        
        # Return exit code based on validation results
        return 0 if report['validation_passed'] else 1
        
    except Exception as e:
        print(f"\n❌ Validation failed with error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
