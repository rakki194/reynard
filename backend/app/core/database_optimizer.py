"""
Database Performance Optimizer for FastAPI ECS Search

This module provides comprehensive database optimization utilities including:
- Connection pooling optimization
- Query performance analysis
- Index recommendations
- Caching strategies
- Performance monitoring
"""

import asyncio
import json
import logging
import time
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import asyncpg
import psycopg2
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool, StaticPool

logger = logging.getLogger(__name__)


@dataclass
class QueryMetrics:
    """Database query performance metrics."""

    query_id: str
    query_text: str
    execution_time_ms: float
    rows_returned: int
    rows_affected: int
    cache_hit: bool
    timestamp: datetime
    connection_id: Optional[str] = None
    error_message: Optional[str] = None


@dataclass
class ConnectionPoolMetrics:
    """Database connection pool metrics."""

    pool_size: int
    checked_in: int
    checked_out: int
    overflow: int
    invalid: int
    timestamp: datetime


@dataclass
class DatabaseOptimizationReport:
    """Comprehensive database optimization report."""

    slow_queries: List[QueryMetrics]
    connection_pool_issues: List[str]
    missing_indexes: List[str]
    cache_recommendations: List[str]
    performance_improvements: List[str]
    generated_at: datetime


class DatabasePerformanceMonitor:
    """Monitor database performance and identify bottlenecks."""

    def __init__(self, database_url: str):
        self.database_url = database_url
        self.query_metrics: List[QueryMetrics] = []
        self.connection_metrics: List[ConnectionPoolMetrics] = []
        self.slow_query_threshold_ms = 1000  # 1 second
        self.monitoring_enabled = True

    async def record_query_metrics(
        self,
        query_id: str,
        query_text: str,
        execution_time_ms: float,
        rows_returned: int = 0,
        rows_affected: int = 0,
        cache_hit: bool = False,
        connection_id: Optional[str] = None,
        error_message: Optional[str] = None,
    ):
        """Record query performance metrics."""
        if not self.monitoring_enabled:
            return

        metrics = QueryMetrics(
            query_id=query_id,
            query_text=query_text,
            execution_time_ms=execution_time_ms,
            rows_returned=rows_returned,
            rows_affected=rows_affected,
            cache_hit=cache_hit,
            timestamp=datetime.now(),
            connection_id=connection_id,
            error_message=error_message,
        )

        self.query_metrics.append(metrics)

        # Log slow queries
        if execution_time_ms > self.slow_query_threshold_ms:
            logger.warning(
                f"Slow query detected: {query_id} took {execution_time_ms:.2f}ms - {query_text[:100]}..."
            )

    async def record_connection_pool_metrics(
        self,
        pool_size: int,
        checked_in: int,
        checked_out: int,
        overflow: int,
        invalid: int,
    ):
        """Record connection pool metrics."""
        if not self.monitoring_enabled:
            return

        metrics = ConnectionPoolMetrics(
            pool_size=pool_size,
            checked_in=checked_in,
            checked_out=checked_out,
            overflow=overflow,
            invalid=invalid,
            timestamp=datetime.now(),
        )

        self.connection_metrics.append(metrics)

        # Log pool issues
        if checked_out > pool_size * 0.8:
            logger.warning(f"Connection pool near capacity: {checked_out}/{pool_size}")
        if overflow > 0:
            logger.warning(f"Connection pool overflow: {overflow} connections")

    def get_slow_queries(self, limit: int = 10) -> List[QueryMetrics]:
        """Get the slowest queries."""
        return sorted(
            [
                q
                for q in self.query_metrics
                if q.execution_time_ms > self.slow_query_threshold_ms
            ],
            key=lambda x: x.execution_time_ms,
            reverse=True,
        )[:limit]

    def get_query_statistics(self) -> Dict[str, Any]:
        """Get comprehensive query statistics."""
        if not self.query_metrics:
            return {}

        successful_queries = [q for q in self.query_metrics if q.error_message is None]
        failed_queries = [q for q in self.query_metrics if q.error_message is not None]

        if not successful_queries:
            return {"error": "No successful queries found"}

        execution_times = [q.execution_time_ms for q in successful_queries]

        return {
            "total_queries": len(self.query_metrics),
            "successful_queries": len(successful_queries),
            "failed_queries": len(failed_queries),
            "success_rate": len(successful_queries) / len(self.query_metrics) * 100,
            "average_execution_time_ms": sum(execution_times) / len(execution_times),
            "median_execution_time_ms": sorted(execution_times)[
                len(execution_times) // 2
            ],
            "max_execution_time_ms": max(execution_times),
            "min_execution_time_ms": min(execution_times),
            "slow_queries_count": len(self.get_slow_queries()),
            "cache_hit_rate": len([q for q in successful_queries if q.cache_hit])
            / len(successful_queries)
            * 100,
        }


class OptimizedDatabaseConnection:
    """Optimized database connection with performance monitoring."""

    def __init__(
        self,
        database_url: str,
        pool_size: int = 20,
        max_overflow: int = 30,
        pool_timeout: int = 30,
        pool_recycle: int = 3600,
        enable_monitoring: bool = True,
    ):
        self.database_url = database_url
        self.pool_size = pool_size
        self.max_overflow = max_overflow
        self.pool_timeout = pool_timeout
        self.pool_recycle = pool_recycle

        # Create optimized engine
        self.engine = create_async_engine(
            database_url,
            poolclass=QueuePool,
            pool_size=pool_size,
            max_overflow=max_overflow,
            pool_timeout=pool_timeout,
            pool_recycle=pool_recycle,
            pool_pre_ping=True,  # Verify connections before use
            echo=False,  # Set to True for SQL logging
            future=True,
        )

        # Create session factory
        self.async_session_factory = async_sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )

        # Initialize performance monitor
        self.monitor = (
            DatabasePerformanceMonitor(database_url) if enable_monitoring else None
        )

        # Connection tracking
        self.active_connections = 0
        self.total_connections_created = 0

    async def get_session(self) -> AsyncSession:
        """Get an optimized database session."""
        session = self.async_session_factory()
        self.active_connections += 1
        self.total_connections_created += 1
        return session

    async def execute_query(
        self,
        query: str,
        params: Optional[Dict[str, Any]] = None,
        query_id: Optional[str] = None,
    ) -> Tuple[Any, QueryMetrics]:
        """Execute a query with performance monitoring."""
        query_id = query_id or f"query_{int(time.time() * 1000)}"
        start_time = time.time()

        try:
            async with self.get_session() as session:
                # Execute query
                if params:
                    result = await session.execute(text(query), params)
                else:
                    result = await session.execute(text(query))

                # Calculate metrics
                execution_time_ms = (time.time() - start_time) * 1000
                rows_returned = result.rowcount if hasattr(result, "rowcount") else 0

                # Record metrics
                if self.monitor:
                    await self.monitor.record_query_metrics(
                        query_id=query_id,
                        query_text=query,
                        execution_time_ms=execution_time_ms,
                        rows_returned=rows_returned,
                        rows_affected=rows_returned,
                    )

                metrics = QueryMetrics(
                    query_id=query_id,
                    query_text=query,
                    execution_time_ms=execution_time_ms,
                    rows_returned=rows_returned,
                    rows_affected=rows_returned,
                    cache_hit=False,
                    timestamp=datetime.now(),
                )

                return result, metrics

        except Exception as e:
            execution_time_ms = (time.time() - start_time) * 1000

            if self.monitor:
                await self.monitor.record_query_metrics(
                    query_id=query_id,
                    query_text=query,
                    execution_time_ms=execution_time_ms,
                    error_message=str(e),
                )

            metrics = QueryMetrics(
                query_id=query_id,
                query_text=query,
                execution_time_ms=execution_time_ms,
                rows_returned=0,
                rows_affected=0,
                cache_hit=False,
                timestamp=datetime.now(),
                error_message=str(e),
            )

            raise e

    async def get_connection_pool_status(self) -> Dict[str, Any]:
        """Get current connection pool status."""
        pool = self.engine.pool

        return {
            "pool_size": pool.size(),
            "checked_in": pool.checkedin(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
            "invalid": pool.invalid(),
            "total_connections": self.total_connections_created,
            "active_connections": self.active_connections,
        }

    async def optimize_connection_pool(self) -> Dict[str, Any]:
        """Optimize connection pool settings based on usage patterns."""
        pool_status = await self.get_connection_pool_status()
        recommendations = []

        # Analyze pool utilization
        utilization = pool_status["checked_out"] / pool_status["pool_size"]

        if utilization > 0.8:
            recommendations.append("Increase pool_size - high utilization detected")
        elif utilization < 0.3:
            recommendations.append("Decrease pool_size - low utilization detected")

        # Check for overflow
        if pool_status["overflow"] > 0:
            recommendations.append(
                "Increase max_overflow or pool_size - overflow detected"
            )

        # Check for invalid connections
        if pool_status["invalid"] > 0:
            recommendations.append(
                "Investigate invalid connections - possible connection issues"
            )

        return {
            "current_status": pool_status,
            "utilization_percent": utilization * 100,
            "recommendations": recommendations,
        }

    async def close(self):
        """Close the database connection and cleanup."""
        await self.engine.dispose()


class DatabaseIndexAnalyzer:
    """Analyze database indexes and provide optimization recommendations."""

    def __init__(self, connection: OptimizedDatabaseConnection):
        self.connection = connection

    async def analyze_table_indexes(self, table_name: str) -> Dict[str, Any]:
        """Analyze indexes for a specific table."""
        # Get table information
        table_info_query = """
        SELECT 
            schemaname,
            tablename,
            attname,
            n_distinct,
            correlation
        FROM pg_stats 
        WHERE tablename = :table_name
        ORDER BY n_distinct DESC
        """

        # Get index information
        index_info_query = """
        SELECT 
            indexname,
            indexdef,
            idx_scan,
            idx_tup_read,
            idx_tup_fetch
        FROM pg_stat_user_indexes 
        WHERE relname = :table_name
        """

        try:
            # Execute queries
            table_result, _ = await self.connection.execute_query(
                table_info_query,
                {"table_name": table_name},
                f"analyze_table_{table_name}",
            )

            index_result, _ = await self.connection.execute_query(
                index_info_query,
                {"table_name": table_name},
                f"analyze_indexes_{table_name}",
            )

            # Process results
            table_stats = [dict(row) for row in table_result.fetchall()]
            index_stats = [dict(row) for row in index_result.fetchall()]

            # Generate recommendations
            recommendations = []

            # Check for missing indexes on high-cardinality columns
            for stat in table_stats:
                if stat["n_distinct"] > 1000 and stat["correlation"] < 0.1:
                    recommendations.append(
                        f"Consider adding index on {stat['attname']} - high cardinality, low correlation"
                    )

            # Check for unused indexes
            for index in index_stats:
                if index["idx_scan"] == 0:
                    recommendations.append(
                        f"Consider dropping unused index: {index['indexname']}"
                    )

            return {
                "table_name": table_name,
                "table_stats": table_stats,
                "index_stats": index_stats,
                "recommendations": recommendations,
            }

        except Exception as e:
            logger.error(f"Failed to analyze table {table_name}: {e}")
            return {"error": str(e)}


class DatabaseOptimizationSuite:
    """Comprehensive database optimization suite."""

    def __init__(self, database_url: str):
        self.database_url = database_url
        self.connection = OptimizedDatabaseConnection(database_url)
        self.index_analyzer = DatabaseIndexAnalyzer(self.connection)

    async def run_full_optimization_analysis(self) -> DatabaseOptimizationReport:
        """Run comprehensive database optimization analysis."""
        logger.info("Starting comprehensive database optimization analysis")

        # Get slow queries
        slow_queries = []
        if self.connection.monitor:
            slow_queries = self.connection.monitor.get_slow_queries(limit=20)

        # Analyze connection pool
        pool_analysis = await self.connection.optimize_connection_pool()
        connection_pool_issues = pool_analysis.get("recommendations", [])

        # Analyze indexes for key tables
        missing_indexes = []
        cache_recommendations = []
        performance_improvements = []

        # Key tables to analyze
        key_tables = [
            "agents",
            "agent_traits",
            "agent_interactions",
            "search_results",
            "embeddings",
            "documents",
        ]

        for table in key_tables:
            try:
                analysis = await self.index_analyzer.analyze_table_indexes(table)
                if "recommendations" in analysis:
                    missing_indexes.extend(analysis["recommendations"])
            except Exception as e:
                logger.warning(f"Could not analyze table {table}: {e}")

        # Generate cache recommendations
        if self.connection.monitor:
            stats = self.connection.monitor.get_query_statistics()
            if stats.get("cache_hit_rate", 0) < 80:
                cache_recommendations.append(
                    "Implement query result caching - low cache hit rate"
                )
            if stats.get("average_execution_time_ms", 0) > 500:
                cache_recommendations.append(
                    "Implement connection-level caching for slow queries"
                )

        # Generate performance improvements
        if slow_queries:
            performance_improvements.append(
                f"Optimize {len(slow_queries)} slow queries identified"
            )

        if connection_pool_issues:
            performance_improvements.append("Optimize connection pool configuration")

        if missing_indexes:
            performance_improvements.append(
                f"Add {len(missing_indexes)} recommended indexes"
            )

        return DatabaseOptimizationReport(
            slow_queries=slow_queries,
            connection_pool_issues=connection_pool_issues,
            missing_indexes=missing_indexes,
            cache_recommendations=cache_recommendations,
            performance_improvements=performance_improvements,
            generated_at=datetime.now(),
        )

    async def generate_optimization_report(self) -> str:
        """Generate a comprehensive optimization report."""
        report = await self.run_full_optimization_analysis()

        output = []
        output.append("=" * 80)
        output.append("DATABASE OPTIMIZATION REPORT")
        output.append("=" * 80)
        output.append(f"Generated: {report.generated_at.strftime('%Y-%m-%d %H:%M:%S')}")
        output.append("")

        # Slow queries section
        if report.slow_queries:
            output.append("🐌 SLOW QUERIES")
            output.append("-" * 40)
            for i, query in enumerate(report.slow_queries[:10], 1):
                output.append(f"{i}. {query.query_id}: {query.execution_time_ms:.2f}ms")
                output.append(f"   Query: {query.query_text[:100]}...")
                if query.error_message:
                    output.append(f"   Error: {query.error_message}")
                output.append("")
        else:
            output.append("✅ No slow queries detected")
            output.append("")

        # Connection pool issues
        if report.connection_pool_issues:
            output.append("🔗 CONNECTION POOL ISSUES")
            output.append("-" * 40)
            for issue in report.connection_pool_issues:
                output.append(f"• {issue}")
            output.append("")
        else:
            output.append("✅ Connection pool is optimized")
            output.append("")

        # Missing indexes
        if report.missing_indexes:
            output.append("📊 INDEX RECOMMENDATIONS")
            output.append("-" * 40)
            for index in report.missing_indexes:
                output.append(f"• {index}")
            output.append("")
        else:
            output.append("✅ Indexes are optimized")
            output.append("")

        # Cache recommendations
        if report.cache_recommendations:
            output.append("💾 CACHE RECOMMENDATIONS")
            output.append("-" * 40)
            for rec in report.cache_recommendations:
                output.append(f"• {rec}")
            output.append("")
        else:
            output.append("✅ Caching is optimized")
            output.append("")

        # Performance improvements
        if report.performance_improvements:
            output.append("🚀 PERFORMANCE IMPROVEMENTS")
            output.append("-" * 40)
            for improvement in report.performance_improvements:
                output.append(f"• {improvement}")
            output.append("")

        output.append("=" * 80)
        return "\n".join(output)

    async def close(self):
        """Close the optimization suite."""
        await self.connection.close()


# Example usage and testing
async def main():
    """Example usage of the database optimizer."""
    # This would be your actual database URL
    database_url = "postgresql+asyncpg://user:password@localhost/reynard_db"

    async with DatabaseOptimizationSuite(database_url) as optimizer:
        # Generate optimization report
        report = await optimizer.generate_optimization_report()
        print(report)

        # Save report to file
        report_file = (
            Path(__file__).parent
            / f"database_optimization_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        )
        with open(report_file, "w") as f:
            f.write(report)
        print(f"Report saved to: {report_file}")


if __name__ == "__main__":
    asyncio.run(main())
