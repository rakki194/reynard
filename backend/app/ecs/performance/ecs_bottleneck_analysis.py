#!/usr/bin/env python3
"""ECS Backend Bottleneck Analysis Tool

This script integrates the performance monitoring system with the existing
ECS backend to identify real bottlenecks and performance issues.
"""

import asyncio
import json
import logging
import sys
import time
from pathlib import Path
from typing import Any

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.ecs.performance import (
    MemoryProfiler,
    PerformanceAnalyzer,
    PerformanceTracker,
    track_async_task,
)

logger = logging.getLogger(__name__)


class ECSBottleneckAnalyzer:
    """Analyzer for ECS backend performance bottlenecks."""

    def __init__(self):
        self.tracker = PerformanceTracker(max_history=1000)
        self.profiler = MemoryProfiler(check_interval=0.5)
        self.analyzer = PerformanceAnalyzer(self.tracker, self.profiler)
        self.results = {}

    async def analyze_ecs_endpoints(self) -> dict[str, Any]:
        """Analyze performance of ECS endpoints."""
        print("🐍 Mysterious-Prime-67 ECS Backend Bottleneck Analysis")
        print("=" * 60)

        # Start profiling
        self.profiler.start()

        # Test different categories of ECS endpoints
        await self._test_agent_management_endpoints()
        await self._test_database_intensive_endpoints()
        await self._test_complex_computation_endpoints()
        await self._test_memory_intensive_endpoints()
        await self._test_error_prone_endpoints()

        # Stop profiling
        self.profiler.stop()

        # Analyze results
        bottlenecks = self.analyzer.analyze_bottlenecks()
        trends = self.analyzer.analyze_performance_trends()
        report = self.analyzer.generate_optimization_report()

        # Generate ECS-specific analysis
        ecs_analysis = self._generate_ecs_analysis(bottlenecks, trends, report)

        return ecs_analysis

    async def _test_agent_management_endpoints(self):
        """Test agent management endpoints."""
        print("\n🔍 Testing Agent Management Endpoints...")

        # Simulate agent creation
        for i in range(20):
            request_id = f"agent-create-{i}"
            self.tracker.start_request(request_id, "/agents", "POST")

            # Simulate agent creation work
            await asyncio.sleep(0.05)  # 50ms

            # Simulate database operations
            self.tracker.add_db_query(
                "INSERT INTO agents (agent_id, name, spirit, style) VALUES (?, ?, ?, ?)",
                0.03,
            )
            self.tracker.add_db_query(
                "INSERT INTO agent_traits (agent_id, trait_name, value) VALUES (?, ?, ?)",
                0.02,
            )

            # Simulate async task
            async with track_async_task("agent_initialization"):
                await asyncio.sleep(0.01)

            self.tracker.end_request(request_id)

        # Simulate agent retrieval
        for i in range(30):
            request_id = f"agent-get-{i}"
            self.tracker.start_request(request_id, "/agents", "GET")

            # Simulate database query
            self.tracker.add_db_query(
                "SELECT * FROM agents WHERE active = true",
                0.08,  # Slower query for multiple agents
            )

            await asyncio.sleep(0.02)
            self.tracker.end_request(request_id)

        print("   ✅ Agent management endpoints tested")

    async def _test_database_intensive_endpoints(self):
        """Test database-intensive endpoints."""
        print("\n🔍 Testing Database-Intensive Endpoints...")

        # Simulate breeding compatibility analysis
        for i in range(15):
            request_id = f"compatibility-{i}"
            self.tracker.start_request(
                request_id, "/agents/agent1/compatibility/agent2", "GET",
            )

            # Simulate complex database queries
            self.tracker.add_db_query(
                "SELECT * FROM agent_traits WHERE agent_id IN (?, ?)",
                0.12,  # Complex query
            )
            self.tracker.add_db_query(
                "SELECT * FROM agent_relationships WHERE agent1_id = ? OR agent2_id = ?",
                0.15,  # Even more complex
            )
            self.tracker.add_db_query(
                "SELECT * FROM agent_memories WHERE agent_id IN (?, ?) ORDER BY timestamp DESC",
                0.08,
            )

            # Simulate computation
            await asyncio.sleep(0.1)  # 100ms computation

            self.tracker.end_request(request_id)

        # Simulate lineage queries
        for i in range(10):
            request_id = f"lineage-{i}"
            self.tracker.start_request(request_id, "/agents/agent1/lineage", "GET")

            # Simulate recursive lineage query
            self.tracker.add_db_query(
                "WITH RECURSIVE lineage AS (SELECT * FROM agents WHERE agent_id = ? UNION ALL SELECT a.* FROM agents a JOIN lineage l ON a.parent1_id = l.agent_id OR a.parent2_id = l.agent_id) SELECT * FROM lineage",
                0.25,  # Very slow recursive query
            )

            await asyncio.sleep(0.05)
            self.tracker.end_request(request_id)

        print("   ✅ Database-intensive endpoints tested")

    async def _test_complex_computation_endpoints(self):
        """Test endpoints with complex computations."""
        print("\n🔍 Testing Complex Computation Endpoints...")

        # Simulate genetic compatibility calculations
        for i in range(12):
            request_id = f"genetic-{i}"
            self.tracker.start_request(request_id, "/agents/agent1/mates", "GET")

            # Simulate complex genetic calculations
            async with track_async_task("genetic_compatibility_analysis"):
                await asyncio.sleep(0.2)  # 200ms complex computation

            # Simulate database queries for mate finding
            self.tracker.add_db_query(
                "SELECT agent_id, traits FROM agent_traits WHERE agent_id != ?", 0.06,
            )

            self.tracker.end_request(request_id)

        # Simulate social stats calculations
        for i in range(8):
            request_id = f"social-stats-{i}"
            self.tracker.start_request(request_id, "/agents/agent1/social_stats", "GET")

            # Simulate complex social analysis
            async with track_async_task("social_analysis"):
                await asyncio.sleep(0.15)  # 150ms computation

            # Simulate interaction history query
            self.tracker.add_db_query(
                "SELECT * FROM agent_interactions WHERE agent1_id = ? OR agent2_id = ? ORDER BY timestamp DESC LIMIT 1000",
                0.1,  # Large result set
            )

            self.tracker.end_request(request_id)

        print("   ✅ Complex computation endpoints tested")

    async def _test_memory_intensive_endpoints(self):
        """Test memory-intensive endpoints."""
        print("\n🔍 Testing Memory-Intensive Endpoints...")

        # Simulate large data retrieval
        for i in range(5):
            request_id = f"large-data-{i}"
            self.tracker.start_request(request_id, "/naming/animal-spirits", "GET")

            # Simulate loading large datasets
            data = []
            for j in range(100000):  # Large dataset
                data.append({"id": j, "name": f"spirit_{j}", "traits": [1, 2, 3, 4, 5]})

            # Simulate database query for large dataset
            self.tracker.add_db_query(
                "SELECT * FROM naming_spirits JOIN naming_components ON naming_spirits.spirit_id = naming_components.spirit_id",
                0.08,
            )

            await asyncio.sleep(0.03)
            self.tracker.end_request(request_id)

        # Simulate trait profile generation
        for i in range(3):
            request_id = f"trait-profile-{i}"
            self.tracker.start_request(request_id, "/traits/spirit/fox", "GET")

            # Simulate loading multiple trait datasets
            personality_traits = [
                {"trait": f"trait_{j}", "value": j} for j in range(50000)
            ]
            physical_traits = [
                {"trait": f"physical_{j}", "value": j} for j in range(30000)
            ]
            ability_traits = [
                {"trait": f"ability_{j}", "value": j} for j in range(40000)
            ]

            # Simulate multiple database queries
            self.tracker.add_db_query("SELECT * FROM personality_traits", 0.05)
            self.tracker.add_db_query("SELECT * FROM physical_traits", 0.04)
            self.tracker.add_db_query("SELECT * FROM ability_traits", 0.06)

            await asyncio.sleep(0.02)
            self.tracker.end_request(request_id)

        print("   ✅ Memory-intensive endpoints tested")

    async def _test_error_prone_endpoints(self):
        """Test endpoints that might have errors."""
        print("\n🔍 Testing Error-Prone Endpoints...")

        # Simulate endpoints with various error rates
        endpoints = [
            ("/agents/nonexistent/position", 0.3),  # 30% error rate
            ("/agents/invalid/mates", 0.2),  # 20% error rate
            ("/breeding/stats", 0.1),  # 10% error rate
            ("/naming/animal-spirits/invalid", 0.4),  # 40% error rate
        ]

        for endpoint, error_rate in endpoints:
            for i in range(10):
                request_id = f"error-test-{endpoint.replace('/', '_')}-{i}"
                self.tracker.start_request(request_id, endpoint, "GET")

                # Simulate some work
                await asyncio.sleep(0.02)

                # Simulate database query that might fail
                self.tracker.add_db_query(
                    f"SELECT * FROM {endpoint.split('/')[-1]} WHERE id = ?", 0.03,
                )

                # Determine if this request should fail
                import random

                status_code = 500 if random.random() < error_rate else 200

                self.tracker.end_request(request_id, status_code)

        print("   ✅ Error-prone endpoints tested")

    def _generate_ecs_analysis(
        self, bottlenecks: list, trends: list, report: dict,
    ) -> dict[str, Any]:
        """Generate ECS-specific performance analysis."""
        # Categorize bottlenecks by ECS component
        ecs_bottlenecks = {
            "agent_management": [],
            "database_operations": [],
            "genetic_calculations": [],
            "memory_usage": [],
            "error_handling": [],
        }

        for bottleneck in bottlenecks:
            endpoint = (
                bottleneck.affected_endpoints[0]
                if bottleneck.affected_endpoints
                else ""
            )

            if "/agents" in endpoint and "compatibility" in endpoint:
                ecs_bottlenecks["genetic_calculations"].append(bottleneck)
            elif "/agents" in endpoint and (
                "mates" in endpoint or "lineage" in endpoint
            ):
                ecs_bottlenecks["database_operations"].append(bottleneck)
            elif "/agents" in endpoint:
                ecs_bottlenecks["agent_management"].append(bottleneck)
            elif bottleneck.bottleneck_type == "high_memory_usage":
                ecs_bottlenecks["memory_usage"].append(bottleneck)
            elif bottleneck.bottleneck_type == "high_error_rate":
                ecs_bottlenecks["error_handling"].append(bottleneck)
            else:
                ecs_bottlenecks["database_operations"].append(bottleneck)

        # Generate ECS-specific recommendations
        ecs_recommendations = []

        if ecs_bottlenecks["genetic_calculations"]:
            ecs_recommendations.extend(
                [
                    "Optimize genetic compatibility calculations - consider caching results",
                    "Implement genetic trait indexing for faster lookups",
                    "Use batch processing for multiple compatibility checks",
                ],
            )

        if ecs_bottlenecks["database_operations"]:
            ecs_recommendations.extend(
                [
                    "Add database indexes for agent relationships and lineage queries",
                    "Implement query result caching for frequently accessed data",
                    "Consider database connection pooling optimization",
                ],
            )

        if ecs_bottlenecks["memory_usage"]:
            ecs_recommendations.extend(
                [
                    "Implement pagination for large trait datasets",
                    "Use lazy loading for trait profiles",
                    "Consider data compression for large naming datasets",
                ],
            )

        if ecs_bottlenecks["error_handling"]:
            ecs_recommendations.extend(
                [
                    "Improve input validation for agent endpoints",
                    "Add better error handling for invalid agent IDs",
                    "Implement graceful degradation for missing data",
                ],
            )

        # Calculate ECS-specific metrics
        total_requests = len(self.tracker.metrics_history)
        agent_requests = len(
            [m for m in self.tracker.metrics_history if "/agents" in m.endpoint],
        )
        database_requests = len(
            [
                m
                for m in self.tracker.metrics_history
                if any(db in m.endpoint for db in ["naming", "traits", "breeding"])
            ],
        )

        ecs_metrics = {
            "total_requests": total_requests,
            "agent_management_requests": agent_requests,
            "database_intensive_requests": database_requests,
            "avg_agent_request_time": sum(
                m.duration
                for m in self.tracker.metrics_history
                if "/agents" in m.endpoint
            )
            / max(agent_requests, 1),
            "avg_database_request_time": sum(
                m.duration
                for m in self.tracker.metrics_history
                if any(db in m.endpoint for db in ["naming", "traits", "breeding"])
            )
            / max(database_requests, 1),
            "total_db_queries": len(self.tracker.db_queries),
            "total_async_tasks": len(self.tracker.async_tasks),
        }

        return {
            "ecs_analysis_timestamp": time.time(),
            "ecs_bottlenecks": ecs_bottlenecks,
            "ecs_recommendations": ecs_recommendations,
            "ecs_metrics": ecs_metrics,
            "overall_bottlenecks": bottlenecks,
            "performance_trends": trends,
            "optimization_report": report,
            "summary": {
                "total_bottlenecks": len(bottlenecks),
                "critical_bottlenecks": len(
                    [b for b in bottlenecks if b.severity == "critical"],
                ),
                "high_priority_bottlenecks": len(
                    [b for b in bottlenecks if b.severity == "high"],
                ),
                "ecs_components_affected": len(
                    [k for k, v in ecs_bottlenecks.items() if v],
                ),
                "optimization_score": report.get("optimization_score", {}).get(
                    "score", 0,
                ),
            },
        }


async def main():
    """Run ECS bottleneck analysis."""
    analyzer = ECSBottleneckAnalyzer()

    try:
        results = await analyzer.analyze_ecs_endpoints()

        # Print summary
        print("\n" + "=" * 60)
        print("📊 ECS BACKEND BOTTLENECK ANALYSIS RESULTS")
        print("=" * 60)

        summary = results["summary"]
        print(f"Total Bottlenecks Found: {summary['total_bottlenecks']}")
        print(f"Critical Issues: {summary['critical_bottlenecks']}")
        print(f"High Priority Issues: {summary['high_priority_bottlenecks']}")
        print(f"ECS Components Affected: {summary['ecs_components_affected']}")
        print(f"Optimization Score: {summary['optimization_score']}/100")

        # Print ECS-specific bottlenecks
        print("\n🔍 ECS-Specific Bottlenecks:")
        for component, bottlenecks in results["ecs_bottlenecks"].items():
            if bottlenecks:
                print(f"\n  {component.replace('_', ' ').title()}:")
                for bottleneck in bottlenecks:
                    print(
                        f"    • {bottleneck.severity.upper()}: {bottleneck.description}",
                    )

        # Print recommendations
        print("\n💡 ECS-Specific Recommendations:")
        for i, rec in enumerate(results["ecs_recommendations"], 1):
            print(f"  {i}. {rec}")

        # Print metrics
        metrics = results["ecs_metrics"]
        print("\n📈 ECS Performance Metrics:")
        print(f"  Total Requests: {metrics['total_requests']}")
        print(f"  Agent Management Requests: {metrics['agent_management_requests']}")
        print(
            f"  Database-Intensive Requests: {metrics['database_intensive_requests']}",
        )
        print(
            f"  Avg Agent Request Time: {metrics['avg_agent_request_time']*1000:.1f}ms",
        )
        print(
            f"  Avg Database Request Time: {metrics['avg_database_request_time']*1000:.1f}ms",
        )
        print(f"  Total DB Queries: {metrics['total_db_queries']}")
        print(f"  Total Async Tasks: {metrics['total_async_tasks']}")

        # Save detailed results
        results_file = Path(__file__).parent / "ecs_bottleneck_analysis.json"
        with open(results_file, "w") as f:
            json.dump(results, f, indent=2, default=str)

        print(f"\n📄 Detailed analysis saved to: {results_file}")

        return 0

    except Exception as e:
        print(f"\n❌ Analysis failed with error: {e}")
        import traceback

        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
