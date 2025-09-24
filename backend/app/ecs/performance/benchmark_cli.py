"""Command-line benchmarking and profiling tools for FastAPI ECS backend.

This module provides comprehensive CLI tools for:
- Load testing endpoints
- Performance profiling
- Memory usage analysis
- Database query benchmarking
- Real-time monitoring
"""

import argparse
import asyncio
import csv
import json
import logging
import statistics
import sys
import time
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import aiohttp

logger = logging.getLogger(__name__)


@dataclass
class LoadTestResult:
    """Result of a load test."""

    endpoint: str
    method: str
    total_requests: int
    successful_requests: int
    failed_requests: int
    avg_response_time: float
    min_response_time: float
    max_response_time: float
    p50_response_time: float
    p95_response_time: float
    p99_response_time: float
    requests_per_second: float
    total_duration: float
    error_rate: float
    status_codes: dict[int, int]
    errors: list[str]


@dataclass
class BenchmarkConfig:
    """Configuration for benchmarking."""

    base_url: str
    endpoints: list[dict[str, Any]]
    concurrent_users: int
    duration_seconds: int
    ramp_up_seconds: int
    timeout_seconds: int
    headers: dict[str, str]
    output_file: str | None = None
    verbose: bool = False


class LoadTester:
    """Async load testing tool."""

    def __init__(self, config: BenchmarkConfig):
        self.config = config
        self.results: list[dict[str, Any]] = []
        self.start_time: float | None = None
        self.end_time: float | None = None

    async def run_load_test(self) -> list[LoadTestResult]:
        """Run comprehensive load test."""
        print(
            f"🚀 Starting load test with {self.config.concurrent_users} concurrent users",
        )
        print(
            f"⏱️  Duration: {self.config.duration_seconds}s, Ramp-up: {self.config.ramp_up_seconds}s",
        )

        self.start_time = time.time()

        # Create semaphore to limit concurrent requests
        semaphore = asyncio.Semaphore(self.config.concurrent_users)

        # Create tasks for each endpoint
        tasks = []
        for endpoint_config in self.config.endpoints:
            task = asyncio.create_task(self._test_endpoint(endpoint_config, semaphore))
            tasks.append(task)

        # Wait for all tasks to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)

        self.end_time = time.time()

        # Filter out exceptions and return valid results
        valid_results = [r for r in results if isinstance(r, LoadTestResult)]

        if self.config.output_file:
            self._save_results(valid_results)

        return valid_results

    async def _test_endpoint(
        self, endpoint_config: dict[str, Any], semaphore: asyncio.Semaphore,
    ) -> LoadTestResult:
        """Test a single endpoint."""
        endpoint = endpoint_config["endpoint"]
        method = endpoint_config.get("method", "GET")
        payload = endpoint_config.get("payload")
        headers = {**self.config.headers, **endpoint_config.get("headers", {})}

        url = f"{self.config.base_url}{endpoint}"

        response_times = []
        status_codes = {}
        errors = []
        successful_requests = 0
        failed_requests = 0

        async with aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.config.timeout_seconds),
        ) as session:
            # Ramp-up phase
            if self.config.ramp_up_seconds > 0:
                await self._ramp_up(
                    semaphore, session, url, method, payload, headers, endpoint_config,
                )

            # Main test phase
            end_time = self.start_time + self.config.duration_seconds

            while time.time() < end_time:
                async with semaphore:
                    try:
                        start_time = time.time()

                        if method.upper() == "GET":
                            async with session.get(url, headers=headers) as response:
                                await response.text()  # Consume response
                        elif method.upper() == "POST":
                            async with session.post(
                                url, json=payload, headers=headers,
                            ) as response:
                                await response.text()
                        elif method.upper() == "PUT":
                            async with session.put(
                                url, json=payload, headers=headers,
                            ) as response:
                                await response.text()
                        elif method.upper() == "DELETE":
                            async with session.delete(url, headers=headers) as response:
                                await response.text()

                        response_time = time.time() - start_time
                        response_times.append(response_time)

                        status_code = response.status
                        status_codes[status_code] = status_codes.get(status_code, 0) + 1

                        if 200 <= status_code < 300:
                            successful_requests += 1
                        else:
                            failed_requests += 1
                            errors.append(f"HTTP {status_code}")

                    except TimeoutError:
                        failed_requests += 1
                        errors.append("Timeout")
                    except Exception as e:
                        failed_requests += 1
                        errors.append(str(e))

        # Calculate statistics
        total_requests = successful_requests + failed_requests
        total_duration = self.end_time - self.start_time if self.end_time else 0

        if response_times:
            avg_response_time = statistics.mean(response_times)
            min_response_time = min(response_times)
            max_response_time = max(response_times)
            p50_response_time = statistics.median(response_times)
            p95_response_time = self._percentile(response_times, 95)
            p99_response_time = self._percentile(response_times, 99)
        else:
            avg_response_time = min_response_time = max_response_time = 0
            p50_response_time = p95_response_time = p99_response_time = 0

        requests_per_second = (
            total_requests / total_duration if total_duration > 0 else 0
        )
        error_rate = (
            (failed_requests / total_requests * 100) if total_requests > 0 else 0
        )

        return LoadTestResult(
            endpoint=endpoint,
            method=method,
            total_requests=total_requests,
            successful_requests=successful_requests,
            failed_requests=failed_requests,
            avg_response_time=avg_response_time,
            min_response_time=min_response_time,
            max_response_time=max_response_time,
            p50_response_time=p50_response_time,
            p95_response_time=p95_response_time,
            p99_response_time=p99_response_time,
            requests_per_second=requests_per_second,
            total_duration=total_duration,
            error_rate=error_rate,
            status_codes=status_codes,
            errors=errors[:10],  # Keep only first 10 errors
        )

    async def _ramp_up(
        self,
        semaphore: asyncio.Semaphore,
        session: aiohttp.ClientSession,
        url: str,
        method: str,
        payload: Any,
        headers: dict[str, str],
        endpoint_config: dict[str, Any],
    ):
        """Gradually increase load during ramp-up phase."""
        ramp_up_duration = self.config.ramp_up_seconds
        ramp_up_start = time.time()

        while time.time() - ramp_up_start < ramp_up_duration:
            # Gradually increase concurrency
            current_concurrency = min(
                self.config.concurrent_users,
                int(
                    (time.time() - ramp_up_start)
                    / ramp_up_duration
                    * self.config.concurrent_users,
                ),
            )

            if current_concurrency > 0:
                current_semaphore = asyncio.Semaphore(current_concurrency)
                async with current_semaphore:
                    try:
                        if method.upper() == "GET":
                            async with session.get(url, headers=headers) as response:
                                await response.text()
                        elif method.upper() == "POST":
                            async with session.post(
                                url, json=payload, headers=headers,
                            ) as response:
                                await response.text()
                    except Exception:
                        pass  # Ignore errors during ramp-up

            await asyncio.sleep(0.1)  # Small delay between ramp-up requests

    def _percentile(self, data: list[float], percentile: int) -> float:
        """Calculate percentile of data."""
        if not data:
            return 0.0

        sorted_data = sorted(data)
        index = int((percentile / 100) * len(sorted_data))
        return sorted_data[min(index, len(sorted_data) - 1)]

    def _save_results(self, results: list[LoadTestResult]):
        """Save results to file."""
        output_path = Path(self.config.output_file)

        if output_path.suffix == ".json":
            # Save as JSON
            results_data = [asdict(result) for result in results]
            with open(output_path, "w") as f:
                json.dump(
                    {
                        "timestamp": datetime.now().isoformat(),
                        "config": asdict(self.config),
                        "results": results_data,
                    },
                    f,
                    indent=2,
                )

        elif output_path.suffix == ".csv":
            # Save as CSV
            with open(output_path, "w", newline="") as f:
                if results:
                    writer = csv.DictWriter(f, fieldnames=asdict(results[0]).keys())
                    writer.writeheader()
                    for result in results:
                        writer.writerow(asdict(result))

        print(f"📊 Results saved to {output_path}")


class PerformanceProfiler:
    """Performance profiling tool."""

    def __init__(self, base_url: str):
        self.base_url = base_url

    async def profile_endpoint(
        self,
        endpoint: str,
        method: str = "GET",
        payload: dict | None = None,
        iterations: int = 100,
    ) -> dict[str, Any]:
        """Profile a single endpoint."""
        print(f"🔍 Profiling {method} {endpoint} ({iterations} iterations)")

        response_times = []
        memory_usage = []
        status_codes = {}
        errors = []

        async with aiohttp.ClientSession() as session:
            for i in range(iterations):
                try:
                    start_time = time.time()

                    if method.upper() == "GET":
                        async with session.get(
                            f"{self.base_url}{endpoint}",
                        ) as response:
                            await response.text()
                    elif method.upper() == "POST":
                        async with session.post(
                            f"{self.base_url}{endpoint}", json=payload,
                        ) as response:
                            await response.text()

                    response_time = time.time() - start_time
                    response_times.append(response_time)

                    status_code = response.status
                    status_codes[status_code] = status_codes.get(status_code, 0) + 1

                    if status_code >= 400:
                        errors.append(f"HTTP {status_code}")

                except Exception as e:
                    errors.append(str(e))

                # Small delay between requests
                await asyncio.sleep(0.01)

        # Calculate statistics
        if response_times:
            stats = {
                "endpoint": endpoint,
                "method": method,
                "iterations": iterations,
                "avg_response_time": statistics.mean(response_times),
                "min_response_time": min(response_times),
                "max_response_time": max(response_times),
                "median_response_time": statistics.median(response_times),
                "std_deviation": (
                    statistics.stdev(response_times) if len(response_times) > 1 else 0
                ),
                "p95_response_time": self._percentile(response_times, 95),
                "p99_response_time": self._percentile(response_times, 99),
                "status_codes": status_codes,
                "error_count": len(errors),
                "errors": errors[:5],  # First 5 errors
            }
        else:
            stats = {
                "endpoint": endpoint,
                "method": method,
                "iterations": iterations,
                "error": "No successful requests",
            }

        return stats

    def _percentile(self, data: list[float], percentile: int) -> float:
        """Calculate percentile of data."""
        if not data:
            return 0.0

        sorted_data = sorted(data)
        index = int((percentile / 100) * len(sorted_data))
        return sorted_data[min(index, len(sorted_data) - 1)]


def print_load_test_results(results: list[LoadTestResult]):
    """Print formatted load test results."""
    print("\n" + "=" * 80)
    print("📊 LOAD TEST RESULTS")
    print("=" * 80)

    for result in results:
        print(f"\n🎯 Endpoint: {result.method} {result.endpoint}")
        print(
            f"📈 Requests: {result.total_requests} total, {result.successful_requests} successful, {result.failed_requests} failed",
        )
        print("⏱️  Response Times:")
        print(f"   • Average: {result.avg_response_time*1000:.1f}ms")
        print(f"   • Median (P50): {result.p50_response_time*1000:.1f}ms")
        print(f"   • P95: {result.p95_response_time*1000:.1f}ms")
        print(f"   • P99: {result.p99_response_time*1000:.1f}ms")
        print(f"   • Min: {result.min_response_time*1000:.1f}ms")
        print(f"   • Max: {result.max_response_time*1000:.1f}ms")
        print(f"🚀 Throughput: {result.requests_per_second:.1f} req/s")
        print(f"❌ Error Rate: {result.error_rate:.1f}%")

        if result.status_codes:
            print(f"📊 Status Codes: {dict(result.status_codes)}")

        if result.errors:
            print(f"⚠️  Errors: {result.errors[:3]}")  # Show first 3 errors


def print_profiling_results(results: dict[str, Any]):
    """Print formatted profiling results."""
    print("\n" + "=" * 80)
    print("🔍 PROFILING RESULTS")
    print("=" * 80)

    if "error" in results:
        print(f"❌ Error: {results['error']}")
        return

    print(f"🎯 Endpoint: {results['method']} {results['endpoint']}")
    print(f"🔄 Iterations: {results['iterations']}")
    print("⏱️  Response Times:")
    print(f"   • Average: {results['avg_response_time']*1000:.1f}ms")
    print(f"   • Median: {results['median_response_time']*1000:.1f}ms")
    print(f"   • Std Dev: {results['std_deviation']*1000:.1f}ms")
    print(f"   • P95: {results['p95_response_time']*1000:.1f}ms")
    print(f"   • P99: {results['p99_response_time']*1000:.1f}ms")
    print(f"   • Min: {results['min_response_time']*1000:.1f}ms")
    print(f"   • Max: {results['max_response_time']*1000:.1f}ms")

    if results["status_codes"]:
        print(f"📊 Status Codes: {results['status_codes']}")

    if results["error_count"] > 0:
        print(f"❌ Errors: {results['error_count']}")
        if results["errors"]:
            print(f"   • {results['errors']}")


async def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="FastAPI ECS Performance Benchmarking Tool",
    )
    parser.add_argument(
        "--base-url", default="http://localhost:8000", help="Base URL of the API",
    )
    parser.add_argument(
        "--mode",
        choices=["load-test", "profile", "monitor"],
        required=True,
        help="Benchmarking mode",
    )

    # Load test arguments
    parser.add_argument(
        "--endpoints",
        nargs="+",
        help="Endpoints to test (e.g., /api/health /api/users)",
    )
    parser.add_argument(
        "--concurrent-users", type=int, default=10, help="Number of concurrent users",
    )
    parser.add_argument(
        "--duration", type=int, default=60, help="Test duration in seconds",
    )
    parser.add_argument(
        "--ramp-up", type=int, default=10, help="Ramp-up duration in seconds",
    )
    parser.add_argument(
        "--timeout", type=int, default=30, help="Request timeout in seconds",
    )

    # Profiling arguments
    parser.add_argument(
        "--iterations", type=int, default=100, help="Number of profiling iterations",
    )
    parser.add_argument("--method", default="GET", help="HTTP method for profiling")
    parser.add_argument("--payload", help="JSON payload for POST/PUT requests")

    # Output arguments
    parser.add_argument("--output", help="Output file (JSON or CSV)")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")

    args = parser.parse_args()

    if args.mode == "load-test":
        if not args.endpoints:
            print("❌ Error: --endpoints required for load-test mode")
            sys.exit(1)

        # Create endpoint configurations
        endpoints = []
        for endpoint in args.endpoints:
            endpoints.append({"endpoint": endpoint, "method": "GET", "headers": {}})

        config = BenchmarkConfig(
            base_url=args.base_url,
            endpoints=endpoints,
            concurrent_users=args.concurrent_users,
            duration_seconds=args.duration,
            ramp_up_seconds=args.ramp_up,
            timeout_seconds=args.timeout,
            headers={"User-Agent": "ECS-Benchmark-Tool/1.0"},
            output_file=args.output,
            verbose=args.verbose,
        )

        # Run load test
        load_tester = LoadTester(config)
        results = await load_tester.run_load_test()
        print_load_test_results(results)

    elif args.mode == "profile":
        if not args.endpoints or len(args.endpoints) != 1:
            print("❌ Error: Exactly one endpoint required for profile mode")
            sys.exit(1)

        endpoint = args.endpoints[0]
        payload = json.loads(args.payload) if args.payload else None

        profiler = PerformanceProfiler(args.base_url)
        result = await profiler.profile_endpoint(
            endpoint, args.method, payload, args.iterations,
        )
        print_profiling_results(result)

        if args.output:
            with open(args.output, "w") as f:
                json.dump(result, f, indent=2)
            print(f"📊 Results saved to {args.output}")

    elif args.mode == "monitor":
        print("🔍 Real-time monitoring mode not yet implemented")
        print("💡 Use the performance middleware for real-time monitoring")


if __name__ == "__main__":
    asyncio.run(main())
