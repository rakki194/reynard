#!/usr/bin/env python3
"""
FastAPI ECS Search Load Testing Suite

Comprehensive load testing for the Reynard FastAPI ECS search system using Locust.
This script provides realistic load testing scenarios including:
- Search endpoint stress testing
- ECS world simulation load testing
- RAG service performance testing
- Database connection pool testing
- Memory and CPU monitoring
"""

import asyncio
import time
import json
import random
import statistics
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import logging
from pathlib import Path
import sys

import aiohttp
import psutil
from locust import HttpUser, task, between, events
from locust.env import Environment
from locust.stats import stats_printer, stats_history
from locust.log import setup_logging

# Add backend to path for imports
sys.path.append(str(Path(__file__).parent.parent))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class LoadTestScenario:
    """Load test scenario configuration."""
    name: str
    endpoint: str
    method: str
    payload: Optional[Dict[str, Any]] = None
    weight: int = 1
    min_wait: float = 1.0
    max_wait: float = 3.0


@dataclass
class LoadTestResult:
    """Load test result data."""
    scenario_name: str
    total_requests: int
    successful_requests: int
    failed_requests: int
    average_response_time_ms: float
    median_response_time_ms: float
    p95_response_time_ms: float
    p99_response_time_ms: float
    requests_per_second: float
    error_rate_percent: float
    timestamp: datetime = field(default_factory=datetime.now)


class SystemMonitor:
    """Monitor system resources during load testing."""
    
    def __init__(self):
        self.process = psutil.Process()
        self.baseline_memory = self.process.memory_info().rss / 1024 / 1024
        self.baseline_cpu = self.process.cpu_percent()
        self.metrics: List[Dict[str, Any]] = []
        
    def get_current_metrics(self) -> Dict[str, Any]:
        """Get current system metrics."""
        memory_info = self.process.memory_info()
        return {
            'timestamp': datetime.now(),
            'memory_usage_mb': memory_info.rss / 1024 / 1024 - self.baseline_memory,
            'cpu_usage_percent': self.process.cpu_percent() - self.baseline_cpu,
            'memory_percent': self.process.memory_percent(),
            'cpu_count': psutil.cpu_count(),
            'load_average': psutil.getloadavg() if hasattr(psutil, 'getloadavg') else [0, 0, 0]
        }
    
    def start_monitoring(self, interval: float = 1.0):
        """Start continuous monitoring."""
        self.monitoring = True
        asyncio.create_task(self._monitor_loop(interval))
    
    async def _monitor_loop(self, interval: float):
        """Background monitoring loop."""
        while getattr(self, 'monitoring', False):
            metrics = self.get_current_metrics()
            self.metrics.append(metrics)
            await asyncio.sleep(interval)
    
    def stop_monitoring(self):
        """Stop monitoring."""
        self.monitoring = False
    
    def get_peak_metrics(self) -> Dict[str, Any]:
        """Get peak resource usage metrics."""
        if not self.metrics:
            return {}
        
        return {
            'peak_memory_mb': max(m['memory_usage_mb'] for m in self.metrics),
            'peak_cpu_percent': max(m['cpu_usage_percent'] for m in self.metrics),
            'average_memory_mb': statistics.mean(m['memory_usage_mb'] for m in self.metrics),
            'average_cpu_percent': statistics.mean(m['cpu_usage_percent'] for m in self.metrics),
            'monitoring_duration_seconds': len(self.metrics)
        }


class SearchLoadTestUser(HttpUser):
    """Locust user class for search endpoint load testing."""
    
    wait_time = between(1, 3)
    
    def on_start(self):
        """Initialize user session."""
        self.search_queries = [
            "user authentication flow",
            "database connection pooling",
            "FastAPI performance optimization",
            "async await patterns",
            "Redis caching strategies",
            "vector similarity search",
            "machine learning algorithms",
            "ECS world simulation",
            "agent trait inheritance",
            "semantic search optimization"
        ]
        
        self.file_types = [["py"], ["ts"], ["js"], ["py", "ts"], ["py", "ts", "js", "md"]]
        self.directories = [
            ["backend"], 
            ["packages"], 
            ["frontend"], 
            ["backend", "packages"],
            ["backend", "packages", "frontend", "docs"]
        ]
    
    @task(3)
    def test_semantic_search(self):
        """Test semantic search endpoint."""
        query = random.choice(self.search_queries)
        payload = {
            "query": query,
            "max_results": random.randint(10, 50),
            "file_types": random.choice(self.file_types),
            "directories": random.choice(self.directories),
            "similarity_threshold": random.uniform(0.5, 0.9)
        }
        
        with self.client.post(
            "/api/search/semantic",
            json=payload,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("total_results", 0) > 0:
                    response.success()
                else:
                    response.failure("No results returned")
            else:
                response.failure(f"HTTP {response.status_code}")
    
    @task(2)
    def test_syntax_search(self):
        """Test syntax search endpoint."""
        syntax_patterns = [
            "def authenticate",
            "class.*Service",
            "async def.*",
            "import.*",
            "from.*import",
            "SELECT.*FROM",
            "CREATE TABLE",
            "async with.*"
        ]
        
        query = random.choice(syntax_patterns)
        payload = {
            "query": query,
            "max_results": random.randint(20, 100),
            "file_types": random.choice(self.file_types),
            "directories": random.choice(self.directories),
            "case_sensitive": random.choice([True, False]),
            "whole_word": random.choice([True, False])
        }
        
        with self.client.post(
            "/api/search/syntax",
            json=payload,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    response.success()
                else:
                    response.failure("Search failed")
            else:
                response.failure(f"HTTP {response.status_code}")
    
    @task(2)
    def test_hybrid_search(self):
        """Test hybrid search endpoint."""
        query = random.choice(self.search_queries)
        payload = {
            "query": query,
            "max_results": random.randint(15, 40),
            "file_types": random.choice(self.file_types),
            "directories": random.choice(self.directories)
        }
        
        with self.client.post(
            "/api/search/hybrid",
            json=payload,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    response.success()
                else:
                    response.failure("Hybrid search failed")
            else:
                response.failure(f"HTTP {response.status_code}")
    
    @task(1)
    def test_smart_search(self):
        """Test smart search endpoint."""
        query = random.choice(self.search_queries)
        payload = {
            "query": query,
            "max_results": random.randint(10, 30),
            "file_types": random.choice(self.file_types),
            "directories": random.choice(self.directories)
        }
        
        with self.client.post(
            "/api/search/search",
            json=payload,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    response.success()
                else:
                    response.failure("Smart search failed")
            else:
                response.failure(f"HTTP {response.status_code}")
    
    @task(1)
    def test_health_check(self):
        """Test health check endpoint."""
        with self.client.get("/api/search/health", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Health check failed: HTTP {response.status_code}")


class ECSLoadTestUser(HttpUser):
    """Locust user class for ECS endpoint load testing."""
    
    wait_time = between(2, 5)
    
    def on_start(self):
        """Initialize user session."""
        self.spirits = ["fox", "wolf", "otter", "eagle", "lion", "tiger", "dragon", "phoenix"]
        self.styles = ["foundation", "exo", "hybrid", "cyberpunk", "mythological", "scientific"]
    
    @task(3)
    def test_get_ecs_status(self):
        """Test ECS status endpoint."""
        with self.client.get("/api/ecs/status", catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    response.success()
                else:
                    response.failure("ECS status check failed")
            else:
                response.failure(f"HTTP {response.status_code}")
    
    @task(2)
    def test_create_agent(self):
        """Test agent creation endpoint."""
        payload = {
            "spirit": random.choice(self.spirits),
            "style": random.choice(self.styles)
        }
        
        with self.client.post(
            "/api/ecs/agents",
            json=payload,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    response.success()
                else:
                    response.failure("Agent creation failed")
            else:
                response.failure(f"HTTP {response.status_code}")
    
    @task(2)
    def test_list_agents(self):
        """Test agent listing endpoint."""
        with self.client.get("/api/ecs/agents", catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) or data.get("success"):
                    response.success()
                else:
                    response.failure("Agent listing failed")
            else:
                response.failure(f"HTTP {response.status_code}")
    
    @task(1)
    def test_agent_interaction(self):
        """Test agent interaction endpoint."""
        payload = {
            "agent1_id": f"test-agent-{random.randint(1, 100)}",
            "agent2_id": f"test-agent-{random.randint(1, 100)}",
            "interaction_type": random.choice(["communication", "social", "collaboration"])
        }
        
        with self.client.post(
            "/api/ecs/interactions",
            json=payload,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    response.success()
                else:
                    response.failure("Agent interaction failed")
            else:
                response.failure(f"HTTP {response.status_code}")


class RAGLoadTestUser(HttpUser):
    """Locust user class for RAG endpoint load testing."""
    
    wait_time = between(3, 8)
    
    def on_start(self):
        """Initialize user session."""
        self.rag_queries = [
            "machine learning algorithms",
            "neural network architectures",
            "natural language processing",
            "computer vision techniques",
            "deep learning optimization",
            "transformer models",
            "attention mechanisms",
            "reinforcement learning",
            "unsupervised learning",
            "feature engineering"
        ]
    
    @task(3)
    def test_rag_query(self):
        """Test RAG query endpoint."""
        query = random.choice(self.rag_queries)
        payload = {
            "query": query,
            "top_k": random.randint(5, 20),
            "similarity_threshold": random.uniform(0.6, 0.9),
            "enable_reranking": random.choice([True, False])
        }
        
        with self.client.post(
            "/api/rag/query",
            json=payload,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("hits") is not None:
                    response.success()
                else:
                    response.failure("RAG query returned no hits")
            else:
                response.failure(f"HTTP {response.status_code}")
    
    @task(1)
    def test_rag_embed(self):
        """Test RAG embedding endpoint."""
        texts = random.sample(self.rag_queries, random.randint(1, 3))
        payload = {
            "texts": texts,
            "model": "mxbai-embed-large"
        }
        
        with self.client.post(
            "/api/rag/embed",
            json=payload,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("embeddings"):
                    response.success()
                else:
                    response.failure("RAG embedding failed")
            else:
                response.failure(f"HTTP {response.status_code}")
    
    @task(1)
    def test_rag_health(self):
        """Test RAG health endpoint."""
        with self.client.get("/api/rag/health", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"RAG health check failed: HTTP {response.status_code}")


class LoadTestRunner:
    """Load test runner with comprehensive monitoring."""
    
    def __init__(self, host: str = "http://localhost:8000"):
        self.host = host
        self.monitor = SystemMonitor()
        self.results: List[LoadTestResult] = []
    
    async def run_search_load_test(
        self,
        users: int = 50,
        spawn_rate: int = 10,
        run_time: str = "5m"
    ) -> LoadTestResult:
        """Run search endpoint load test."""
        logger.info(f"Starting search load test: {users} users, {spawn_rate} spawn rate, {run_time} duration")
        
        # Start system monitoring
        self.monitor.start_monitoring()
        
        # Create Locust environment
        env = Environment(user_classes=[SearchLoadTestUser], host=self.host)
        
        # Start the test
        env.create_local_runner()
        env.runner.start(users, spawn_rate=spawn_rate)
        
        # Run for specified duration
        await asyncio.sleep(self._parse_duration(run_time))
        
        # Stop the test
        env.runner.quit()
        
        # Stop monitoring
        self.monitor.stop_monitoring()
        
        # Collect results
        stats = env.runner.stats
        result = self._collect_test_results("Search Load Test", stats)
        self.results.append(result)
        
        return result
    
    async def run_ecs_load_test(
        self,
        users: int = 30,
        spawn_rate: int = 5,
        run_time: str = "3m"
    ) -> LoadTestResult:
        """Run ECS endpoint load test."""
        logger.info(f"Starting ECS load test: {users} users, {spawn_rate} spawn rate, {run_time} duration")
        
        # Start system monitoring
        self.monitor.start_monitoring()
        
        # Create Locust environment
        env = Environment(user_classes=[ECSLoadTestUser], host=self.host)
        
        # Start the test
        env.create_local_runner()
        env.runner.start(users, spawn_rate=spawn_rate)
        
        # Run for specified duration
        await asyncio.sleep(self._parse_duration(run_time))
        
        # Stop the test
        env.runner.quit()
        
        # Stop monitoring
        self.monitor.stop_monitoring()
        
        # Collect results
        stats = env.runner.stats
        result = self._collect_test_results("ECS Load Test", stats)
        self.results.append(result)
        
        return result
    
    async def run_rag_load_test(
        self,
        users: int = 20,
        spawn_rate: int = 3,
        run_time: str = "3m"
    ) -> LoadTestResult:
        """Run RAG endpoint load test."""
        logger.info(f"Starting RAG load test: {users} users, {spawn_rate} spawn rate, {run_time} duration")
        
        # Start system monitoring
        self.monitor.start_monitoring()
        
        # Create Locust environment
        env = Environment(user_classes=[RAGLoadTestUser], host=self.host)
        
        # Start the test
        env.create_local_runner()
        env.runner.start(users, spawn_rate=spawn_rate)
        
        # Run for specified duration
        await asyncio.sleep(self._parse_duration(run_time))
        
        # Stop the test
        env.runner.quit()
        
        # Stop monitoring
        self.monitor.stop_monitoring()
        
        # Collect results
        stats = env.runner.stats
        result = self._collect_test_results("RAG Load Test", stats)
        self.results.append(result)
        
        return result
    
    def _parse_duration(self, duration: str) -> int:
        """Parse duration string to seconds."""
        if duration.endswith('s'):
            return int(duration[:-1])
        elif duration.endswith('m'):
            return int(duration[:-1]) * 60
        elif duration.endswith('h'):
            return int(duration[:-1]) * 3600
        else:
            return int(duration)
    
    def _collect_test_results(self, test_name: str, stats) -> LoadTestResult:
        """Collect test results from Locust stats."""
        total_requests = stats.total.num_requests
        successful_requests = stats.total.num_requests - stats.total.num_failures
        failed_requests = stats.total.num_failures
        
        # Calculate response time statistics
        response_times = []
        for entry in stats.entries.values():
            if entry.num_requests > 0:
                response_times.extend([entry.avg_response_time] * entry.num_requests)
        
        if response_times:
            average_response_time = statistics.mean(response_times)
            median_response_time = statistics.median(response_times)
            p95_response_time = statistics.quantiles(response_times, n=20)[18] if len(response_times) > 20 else max(response_times)
            p99_response_time = statistics.quantiles(response_times, n=100)[98] if len(response_times) > 100 else max(response_times)
        else:
            average_response_time = median_response_time = p95_response_time = p99_response_time = 0
        
        # Calculate throughput
        total_time = stats.total.last_request_timestamp - stats.total.start_time
        requests_per_second = total_requests / total_time if total_time > 0 else 0
        
        # Calculate error rate
        error_rate = (failed_requests / total_requests * 100) if total_requests > 0 else 0
        
        return LoadTestResult(
            scenario_name=test_name,
            total_requests=total_requests,
            successful_requests=successful_requests,
            failed_requests=failed_requests,
            average_response_time_ms=average_response_time,
            median_response_time_ms=median_response_time,
            p95_response_time_ms=p95_response_time,
            p99_response_time_ms=p99_response_time,
            requests_per_second=requests_per_second,
            error_rate_percent=error_rate
        )
    
    def generate_load_test_report(self) -> str:
        """Generate comprehensive load test report."""
        report = []
        report.append("=" * 80)
        report.append("FASTAPI ECS SEARCH LOAD TEST REPORT")
        report.append("=" * 80)
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # System metrics
        peak_metrics = self.monitor.get_peak_metrics()
        if peak_metrics:
            report.append("🖥️  SYSTEM RESOURCE USAGE")
            report.append("-" * 40)
            report.append(f"Peak Memory Usage: {peak_metrics.get('peak_memory_mb', 0):.2f} MB")
            report.append(f"Peak CPU Usage: {peak_metrics.get('peak_cpu_percent', 0):.2f}%")
            report.append(f"Average Memory Usage: {peak_metrics.get('average_memory_mb', 0):.2f} MB")
            report.append(f"Average CPU Usage: {peak_metrics.get('average_cpu_percent', 0):.2f}%")
            report.append(f"Monitoring Duration: {peak_metrics.get('monitoring_duration_seconds', 0)} seconds")
            report.append("")
        
        # Test results
        for result in self.results:
            report.append(f"📊 {result.scenario_name}")
            report.append("-" * 40)
            report.append(f"Total Requests: {result.total_requests}")
            report.append(f"Successful: {result.successful_requests}")
            report.append(f"Failed: {result.failed_requests}")
            report.append(f"Success Rate: {((result.successful_requests / result.total_requests) * 100):.1f}%")
            report.append(f"Error Rate: {result.error_rate_percent:.1f}%")
            report.append("")
            
            report.append("⏱️  Response Time Statistics:")
            report.append(f"  Average: {result.average_response_time_ms:.2f} ms")
            report.append(f"  Median:  {result.median_response_time_ms:.2f} ms")
            report.append(f"  95th %:  {result.p95_response_time_ms:.2f} ms")
            report.append(f"  99th %:  {result.p99_response_time_ms:.2f} ms")
            report.append("")
            
            report.append("🚀 Throughput:")
            report.append(f"  Requests/sec: {result.requests_per_second:.2f}")
            report.append("")
            
            # Performance recommendations
            report.append("🎯 Performance Recommendations:")
            if result.error_rate_percent > 5:
                report.append("  ⚠️  High error rate - investigate server stability")
            if result.average_response_time_ms > 1000:
                report.append("  ⚠️  High response times - optimize database queries")
            if result.p95_response_time_ms > 2000:
                report.append("  ⚠️  High 95th percentile latency - check for bottlenecks")
            if result.requests_per_second < 100:
                report.append("  ⚠️  Low throughput - consider connection pooling optimization")
            report.append("")
        
        report.append("=" * 80)
        return "\n".join(report)


async def main():
    """Main load test execution."""
    logger.info("Starting FastAPI ECS Search Load Testing Suite")
    
    # Check if server is running
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:8000/health") as response:
                if response.status != 200:
                    logger.error("Server health check failed")
                    return
    except Exception as e:
        logger.error(f"Cannot connect to server: {e}")
        logger.info("Please ensure the FastAPI server is running on localhost:8000")
        return
    
    runner = LoadTestRunner()
    
    try:
        # Run load tests
        logger.info("Running comprehensive load tests...")
        
        # Search endpoints load test
        search_result = await runner.run_search_load_test(users=50, spawn_rate=10, run_time="5m")
        logger.info(f"Search load test completed: {search_result.requests_per_second:.2f} req/s")
        
        # ECS endpoints load test
        ecs_result = await runner.run_ecs_load_test(users=30, spawn_rate=5, run_time="3m")
        logger.info(f"ECS load test completed: {ecs_result.requests_per_second:.2f} req/s")
        
        # RAG endpoints load test
        rag_result = await runner.run_rag_load_test(users=20, spawn_rate=3, run_time="3m")
        logger.info(f"RAG load test completed: {rag_result.requests_per_second:.2f} req/s")
        
        # Generate and save report
        report = runner.generate_load_test_report()
        print(report)
        
        # Save report to file
        report_file = Path(__file__).parent / f"load_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(report_file, 'w') as f:
            f.write(report)
        logger.info(f"Load test report saved to: {report_file}")
        
    except Exception as e:
        logger.error(f"Load test failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
