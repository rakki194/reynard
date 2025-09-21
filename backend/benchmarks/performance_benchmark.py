#!/usr/bin/env python3
"""
FastAPI ECS Search Performance Benchmark Suite

Comprehensive performance testing and bottleneck identification for the Reynard
FastAPI ECS search system. This suite provides detailed analysis of:
- API endpoint performance
- Database query optimization
- Caching effectiveness
- Memory usage patterns
- Concurrent request handling
"""

import asyncio
import time
import statistics
import psutil
import aiohttp
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import logging
from pathlib import Path
import sys

# Add backend to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from app.core.config import get_config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class BenchmarkResult:
    """Individual benchmark test result."""
    test_name: str
    endpoint: str
    method: str
    duration_ms: float
    status_code: int
    response_size_bytes: int
    memory_usage_mb: float
    cpu_usage_percent: float
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class BenchmarkSuite:
    """Complete benchmark test suite results."""
    suite_name: str
    total_tests: int
    successful_tests: int
    failed_tests: int
    average_response_time_ms: float
    median_response_time_ms: float
    p95_response_time_ms: float
    p99_response_time_ms: float
    requests_per_second: float
    total_memory_usage_mb: float
    peak_cpu_usage_percent: float
    results: List[BenchmarkResult] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.now)


class PerformanceMonitor:
    """System performance monitoring during benchmarks."""
    
    def __init__(self):
        self.process = psutil.Process()
        self.baseline_memory = self.process.memory_info().rss / 1024 / 1024
        self.baseline_cpu = self.process.cpu_percent()
        
    def get_current_metrics(self) -> Dict[str, float]:
        """Get current system metrics."""
        memory_info = self.process.memory_info()
        return {
            'memory_usage_mb': memory_info.rss / 1024 / 1024 - self.baseline_memory,
            'cpu_usage_percent': self.process.cpu_percent() - self.baseline_cpu,
        }


class FastAPIBenchmark:
    """FastAPI ECS Search Performance Benchmark Suite."""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.monitor = PerformanceMonitor()
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            connector=aiohttp.TCPConnector(limit=100, limit_per_host=30)
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
    
    async def make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> BenchmarkResult:
        """Make a single HTTP request and measure performance."""
        url = f"{self.base_url}{endpoint}"
        start_time = time.time()
        
        try:
            # Get system metrics before request
            metrics_before = self.monitor.get_current_metrics()
            
            # Make the request
            if method.upper() == "GET":
                async with self.session.get(url, params=params) as response:
                    response_data = await response.text()
                    status_code = response.status
            elif method.upper() == "POST":
                async with self.session.post(url, json=data, params=params) as response:
                    response_data = await response.text()
                    status_code = response.status
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Get system metrics after request
            metrics_after = self.monitor.get_current_metrics()
            
            return BenchmarkResult(
                test_name=f"{method}_{endpoint.replace('/', '_')}",
                endpoint=endpoint,
                method=method,
                duration_ms=duration_ms,
                status_code=status_code,
                response_size_bytes=len(response_data.encode('utf-8')),
                memory_usage_mb=metrics_after['memory_usage_mb'],
                cpu_usage_percent=metrics_after['cpu_usage_percent'],
                error_message=None
            )
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            metrics_after = self.monitor.get_current_metrics()
            
            return BenchmarkResult(
                test_name=f"{method}_{endpoint.replace('/', '_')}",
                endpoint=endpoint,
                method=method,
                duration_ms=duration_ms,
                status_code=0,
                response_size_bytes=0,
                memory_usage_mb=metrics_after['memory_usage_mb'],
                cpu_usage_percent=metrics_after['cpu_usage_percent'],
                error_message=str(e)
            )
    
    async def run_concurrent_requests(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        concurrency: int = 10,
        total_requests: int = 100
    ) -> List[BenchmarkResult]:
        """Run concurrent requests to test load handling."""
        logger.info(f"Running {total_requests} concurrent requests to {endpoint} with concurrency {concurrency}")
        
        semaphore = asyncio.Semaphore(concurrency)
        
        async def make_request_with_semaphore():
            async with semaphore:
                return await self.make_request(method, endpoint, data, params)
        
        # Create tasks
        tasks = [make_request_with_semaphore() for _ in range(total_requests)]
        
        # Execute all requests
        start_time = time.time()
        results = await asyncio.gather(*tasks, return_exceptions=True)
        total_time = time.time() - start_time
        
        # Filter out exceptions and log them
        valid_results = []
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Request failed with exception: {result}")
            else:
                valid_results.append(result)
        
        logger.info(f"Completed {len(valid_results)}/{total_requests} requests in {total_time:.2f}s")
        return valid_results
    
    def analyze_results(self, results: List[BenchmarkResult]) -> BenchmarkSuite:
        """Analyze benchmark results and generate statistics."""
        if not results:
            raise ValueError("No results to analyze")
        
        # Filter successful results for timing analysis
        successful_results = [r for r in results if r.status_code == 200 and r.error_message is None]
        failed_results = [r for r in results if r.status_code != 200 or r.error_message is not None]
        
        if not successful_results:
            logger.warning("No successful requests found in results")
            return BenchmarkSuite(
                suite_name="Failed Benchmark",
                total_tests=len(results),
                successful_tests=0,
                failed_tests=len(failed_results),
                average_response_time_ms=0,
                median_response_time_ms=0,
                p95_response_time_ms=0,
                p99_response_time_ms=0,
                requests_per_second=0,
                total_memory_usage_mb=0,
                peak_cpu_usage_percent=0,
                results=results
            )
        
        # Calculate timing statistics
        durations = [r.duration_ms for r in successful_results]
        average_response_time = statistics.mean(durations)
        median_response_time = statistics.median(durations)
        p95_response_time = statistics.quantiles(durations, n=20)[18]  # 95th percentile
        p99_response_time = statistics.quantiles(durations, n=100)[98]  # 99th percentile
        
        # Calculate throughput
        total_time = max(r.timestamp for r in results) - min(r.timestamp for r in results)
        requests_per_second = len(successful_results) / total_time.total_seconds() if total_time.total_seconds() > 0 else 0
        
        # Calculate resource usage
        total_memory = max(r.memory_usage_mb for r in results)
        peak_cpu = max(r.cpu_usage_percent for r in results)
        
        return BenchmarkSuite(
            suite_name="FastAPI ECS Search Benchmark",
            total_tests=len(results),
            successful_tests=len(successful_results),
            failed_tests=len(failed_results),
            average_response_time_ms=average_response_time,
            median_response_time_ms=median_response_time,
            p95_response_time_ms=p95_response_time,
            p99_response_time_ms=p99_response_time,
            requests_per_second=requests_per_second,
            total_memory_usage_mb=total_memory,
            peak_cpu_usage_percent=peak_cpu,
            results=results
        )
    
    async def benchmark_search_endpoints(self) -> BenchmarkSuite:
        """Benchmark all search endpoints."""
        logger.info("Starting search endpoints benchmark")
        
        # Define test cases
        test_cases = [
            {
                "method": "POST",
                "endpoint": "/api/search/semantic",
                "data": {
                    "query": "user authentication flow",
                    "max_results": 20,
                    "file_types": ["py", "ts"],
                    "directories": ["backend", "packages"]
                }
            },
            {
                "method": "POST", 
                "endpoint": "/api/search/syntax",
                "data": {
                    "query": "def authenticate",
                    "max_results": 50,
                    "file_types": ["py"],
                    "directories": ["backend"]
                }
            },
            {
                "method": "POST",
                "endpoint": "/api/search/hybrid", 
                "data": {
                    "query": "FastAPI performance optimization",
                    "max_results": 30,
                    "file_types": ["py", "ts", "md"],
                    "directories": ["backend", "packages", "docs"]
                }
            },
            {
                "method": "POST",
                "endpoint": "/api/search/search",
                "data": {
                    "query": "database connection pooling",
                    "max_results": 25,
                    "file_types": ["py"],
                    "directories": ["backend"]
                }
            },
            {
                "method": "GET",
                "endpoint": "/api/search/health"
            }
        ]
        
        all_results = []
        
        # Run individual endpoint tests
        for test_case in test_cases:
            logger.info(f"Testing {test_case['method']} {test_case['endpoint']}")
            
            # Single request test
            result = await self.make_request(
                test_case["method"],
                test_case["endpoint"],
                test_case.get("data"),
                test_case.get("params")
            )
            all_results.append(result)
            
            # Concurrent load test for POST endpoints
            if test_case["method"] == "POST":
                concurrent_results = await self.run_concurrent_requests(
                    test_case["method"],
                    test_case["endpoint"],
                    test_case.get("data"),
                    test_case.get("params"),
                    concurrency=5,
                    total_requests=20
                )
                all_results.extend(concurrent_results)
        
        return self.analyze_results(all_results)
    
    async def benchmark_ecs_endpoints(self) -> BenchmarkSuite:
        """Benchmark ECS world simulation endpoints."""
        logger.info("Starting ECS endpoints benchmark")
        
        test_cases = [
            {
                "method": "GET",
                "endpoint": "/api/ecs/status"
            },
            {
                "method": "POST",
                "endpoint": "/api/ecs/agents",
                "data": {
                    "agent_id": "test-agent-benchmark",
                    "spirit": "fox",
                    "style": "foundation"
                }
            },
            {
                "method": "GET",
                "endpoint": "/api/ecs/agents"
            },
            {
                "method": "POST",
                "endpoint": "/api/ecs/interactions",
                "data": {
                    "agent1_id": "test-agent-benchmark",
                    "agent2_id": "test-agent-123",
                    "interaction_type": "communication"
                }
            }
        ]
        
        all_results = []
        
        for test_case in test_cases:
            logger.info(f"Testing {test_case['method']} {test_case['endpoint']}")
            
            result = await self.make_request(
                test_case["method"],
                test_case["endpoint"],
                test_case.get("data"),
                test_case.get("params")
            )
            all_results.append(result)
            
            # Load test for GET endpoints
            if test_case["method"] == "GET":
                concurrent_results = await self.run_concurrent_requests(
                    test_case["method"],
                    test_case["endpoint"],
                    test_case.get("data"),
                    test_case.get("params"),
                    concurrency=10,
                    total_requests=50
                )
                all_results.extend(concurrent_results)
        
        return self.analyze_results(all_results)
    
    async def benchmark_rag_endpoints(self) -> BenchmarkSuite:
        """Benchmark RAG service endpoints."""
        logger.info("Starting RAG endpoints benchmark")
        
        test_cases = [
            {
                "method": "POST",
                "endpoint": "/api/rag/test-query",
                "data": {
                    "q": "machine learning algorithms",
                    "top_k": 10,
                    "similarity_threshold": 0.7
                }
            },
            {
                "method": "POST",
                "endpoint": "/api/rag/embed",
                "data": {
                    "texts": ["FastAPI performance", "database optimization", "caching strategies"],
                    "model": "mxbai-embed-large"
                }
            },
            {
                "method": "GET",
                "endpoint": "/api/rag/health"
            }
        ]
        
        all_results = []
        
        for test_case in test_cases:
            logger.info(f"Testing {test_case['method']} {test_case['endpoint']}")
            
            result = await self.make_request(
                test_case["method"],
                test_case["endpoint"],
                test_case.get("data"),
                test_case.get("params")
            )
            all_results.append(result)
            
            # Load test for query endpoint
            if test_case["endpoint"] == "/api/rag/test-query":
                concurrent_results = await self.run_concurrent_requests(
                    test_case["method"],
                    test_case["endpoint"],
                    test_case.get("data"),
                    test_case.get("params"),
                    concurrency=3,
                    total_requests=15
                )
                all_results.extend(concurrent_results)
        
        return self.analyze_results(all_results)
    
    def generate_report(self, suites: List[BenchmarkSuite]) -> str:
        """Generate a comprehensive performance report."""
        report = []
        report.append("=" * 80)
        report.append("FASTAPI ECS SEARCH PERFORMANCE BENCHMARK REPORT")
        report.append("=" * 80)
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        for suite in suites:
            report.append(f"📊 {suite.suite_name}")
            report.append("-" * 60)
            report.append(f"Total Tests: {suite.total_tests}")
            report.append(f"Successful: {suite.successful_tests}")
            report.append(f"Failed: {suite.failed_tests}")
            report.append(f"Success Rate: {(suite.successful_tests/suite.total_tests)*100:.1f}%")
            report.append("")
            
            if suite.successful_tests > 0:
                report.append("⏱️  Response Time Statistics:")
                report.append(f"  Average: {suite.average_response_time_ms:.2f} ms")
                report.append(f"  Median:  {suite.median_response_time_ms:.2f} ms")
                report.append(f"  95th %:  {suite.p95_response_time_ms:.2f} ms")
                report.append(f"  99th %:  {suite.p99_response_time_ms:.2f} ms")
                report.append("")
                
                report.append("🚀 Throughput:")
                report.append(f"  Requests/sec: {suite.requests_per_second:.2f}")
                report.append("")
                
                report.append("💾 Resource Usage:")
                report.append(f"  Peak Memory: {suite.total_memory_usage_mb:.2f} MB")
                report.append(f"  Peak CPU:    {suite.peak_cpu_usage_percent:.2f}%")
                report.append("")
                
                # Performance recommendations
                report.append("🎯 Performance Recommendations:")
                if suite.average_response_time_ms > 1000:
                    report.append("  ⚠️  High response times detected - consider caching optimization")
                if suite.p95_response_time_ms > 2000:
                    report.append("  ⚠️  High 95th percentile latency - investigate slow queries")
                if suite.requests_per_second < 100:
                    report.append("  ⚠️  Low throughput - consider connection pooling optimization")
                if suite.total_memory_usage_mb > 500:
                    report.append("  ⚠️  High memory usage - investigate memory leaks")
                if suite.peak_cpu_usage_percent > 80:
                    report.append("  ⚠️  High CPU usage - consider async optimization")
                
                report.append("")
            
            # Detailed results for failed tests
            failed_results = [r for r in suite.results if r.status_code != 200 or r.error_message]
            if failed_results:
                report.append("❌ Failed Tests:")
                for result in failed_results[:5]:  # Show first 5 failures
                    report.append(f"  {result.endpoint}: {result.error_message or f'Status {result.status_code}'}")
                if len(failed_results) > 5:
                    report.append(f"  ... and {len(failed_results) - 5} more failures")
                report.append("")
        
        report.append("=" * 80)
        return "\n".join(report)


async def main():
    """Main benchmark execution."""
    logger.info("Starting FastAPI ECS Search Performance Benchmark")
    
    # Check if server is running
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:8000/api/search/health") as response:
                if response.status != 200:
                    logger.error("Server health check failed")
                    return
    except Exception as e:
        logger.error(f"Cannot connect to server: {e}")
        logger.info("Please ensure the FastAPI server is running on localhost:8000")
        return
    
    async with FastAPIBenchmark() as benchmark:
        # Run all benchmark suites
        suites = []
        
        try:
            logger.info("Running search endpoints benchmark...")
            search_suite = await benchmark.benchmark_search_endpoints()
            suites.append(search_suite)
        except Exception as e:
            logger.error(f"Search benchmark failed: {e}")
        
        try:
            logger.info("Running ECS endpoints benchmark...")
            ecs_suite = await benchmark.benchmark_ecs_endpoints()
            suites.append(ecs_suite)
        except Exception as e:
            logger.error(f"ECS benchmark failed: {e}")
        
        try:
            logger.info("Running RAG endpoints benchmark...")
            rag_suite = await benchmark.benchmark_rag_endpoints()
            suites.append(rag_suite)
        except Exception as e:
            logger.error(f"RAG benchmark failed: {e}")
        
        # Generate and save report
        if suites:
            report = benchmark.generate_report(suites)
            print(report)
            
            # Save report to file
            report_file = Path(__file__).parent / f"benchmark_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            with open(report_file, 'w') as f:
                f.write(report)
            logger.info(f"Report saved to: {report_file}")
        else:
            logger.error("No benchmark suites completed successfully")


if __name__ == "__main__":
    asyncio.run(main())
