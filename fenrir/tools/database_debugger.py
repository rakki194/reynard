#!/usr/bin/env python3
"""Database Debugger
==================

Strategic database call debugging and monitoring across all services and databases.
Tracks queries, performance, errors, and connection health.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import sys
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
import json
from contextlib import contextmanager
from functools import wraps

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

logger = logging.getLogger(__name__)


class DatabaseDebugger:
    """Database call debugging and monitoring system."""
    
    def __init__(self):
        """Initialize the database debugger."""
        self.calls: List[Dict[str, Any]] = []
        self.connections: Dict[str, Dict[str, Any]] = {}
        self.performance_stats: Dict[str, Dict[str, Any]] = {}
        self.error_log: List[Dict[str, Any]] = []
    
    def track_call(self, operation: str, database: str, duration_ms: float, 
                   query: str = None, params: Dict = None, error: str = None,
                   service: str = None):
        """Track a database call."""
        call = {
            "timestamp": time.time(),
            "operation": operation,
            "database": database,
            "duration_ms": duration_ms,
            "query": query,
            "params": params,
            "error": error,
            "service": service,
        }
        
        self.calls.append(call)
        
        # Track errors
        if error:
            self.error_log.append(call)
        
        # Update performance stats
        if database not in self.performance_stats:
            self.performance_stats[database] = {
                "total_calls": 0,
                "total_duration_ms": 0.0,
                "error_count": 0,
                "operations": {},
            }
        
        stats = self.performance_stats[database]
        stats["total_calls"] += 1
        stats["total_duration_ms"] += duration_ms
        if error:
            stats["error_count"] += 1
        
        if operation not in stats["operations"]:
            stats["operations"][operation] = {
                "count": 0,
                "total_duration_ms": 0.0,
                "avg_duration_ms": 0.0,
            }
        
        op_stats = stats["operations"][operation]
        op_stats["count"] += 1
        op_stats["total_duration_ms"] += duration_ms
        op_stats["avg_duration_ms"] = op_stats["total_duration_ms"] / op_stats["count"]
    
    def track_connection(self, database: str, connection_type: str, 
                        status: str, details: Dict[str, Any] = None):
        """Track database connection status."""
        if database not in self.connections:
            self.connections[database] = {}
        
        self.connections[database][connection_type] = {
            "status": status,
            "timestamp": time.time(),
            "details": details or {},
        }
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary for all databases."""
        summary = {}
        for database, stats in self.performance_stats.items():
            summary[database] = {
                "total_calls": stats["total_calls"],
                "avg_duration_ms": stats["total_duration_ms"] / stats["total_calls"] if stats["total_calls"] > 0 else 0,
                "error_rate": stats["error_count"] / stats["total_calls"] if stats["total_calls"] > 0 else 0,
                "operations": stats["operations"],
            }
        return summary
    
    def get_connection_health(self) -> Dict[str, Any]:
        """Get connection health status for all databases."""
        health = {}
        for database, connections in self.connections.items():
            health[database] = {
                "total_connections": len(connections),
                "healthy_connections": len([conn for conn in connections.values() if conn["status"] == "healthy"]),
                "connections": connections,
            }
        return health
    
    def get_error_summary(self) -> Dict[str, Any]:
        """Get error summary across all databases."""
        errors_by_db = {}
        errors_by_service = {}
        
        for call in self.error_log:
            db = call["database"]
            service = call.get("service", "unknown")
            
            if db not in errors_by_db:
                errors_by_db[db] = []
            errors_by_db[db].append(call)
            
            if service not in errors_by_service:
                errors_by_service[service] = []
            errors_by_service[service].append(call)
        
        return {
            "total_errors": len(self.error_log),
            "error_rate": len(self.error_log) / len(self.calls) if self.calls else 0,
            "errors_by_database": errors_by_db,
            "errors_by_service": errors_by_service,
        }

    def get_slow_queries(self, threshold_ms: float = 100) -> List[Dict[str, Any]]:
        """Get slow queries above threshold."""
        return [call for call in self.calls if call["duration_ms"] > threshold_ms]

    def generate_report(self) -> str:
        """Generate a comprehensive debugging report."""
        report = []
        report.append("=== DATABASE DEBUGGING REPORT ===")
        report.append(f"Total calls tracked: {len(self.calls)}")
        report.append(f"Total connections: {len(self.connections)}")
        
        # Performance summary
        perf = self.get_performance_summary()
        report.append(f"\nPerformance Summary:")
        for db, stats in perf.items():
            report.append(f"  {db}: {stats['total_calls']} calls, "
                         f"avg {stats['avg_duration_ms']:.2f}ms, "
                         f"error rate {stats['error_rate']:.2%}")
        
        # Connection health
        health = self.get_connection_health()
        report.append(f"\nConnection Health:")
        for db, conn_health in health.items():
            report.append(f"  {db}: {conn_health['healthy_connections']}/{conn_health['total_connections']} healthy")
        
        # Slow queries
        slow_queries = self.get_slow_queries()
        if slow_queries:
            report.append(f"\nSlow Queries ({len(slow_queries)} found):")
            for query in slow_queries[:5]:  # Show top 5
                report.append(f"  {query['database']}: {query['duration_ms']:.1f}ms - {query['operation']}")
        else:
            report.append(f"\n✅ No slow queries detected")

        return "\n".join(report)

    async def analyze_connection_pools(self) -> Dict[str, Any]:
        """Analyze database connection pool health and performance."""
        analysis = {
            "databases": {},
            "connection_issues": [],
            "optimization_recommendations": []
        }

        # Simulate connection pool analysis for known databases
        databases = [
            ("reynard", "postgresql", 5, 2, 0, 0),
            ("reynard_rag", "postgresql", 3, 1, 0, 0),
            ("reynard_ecs", "postgresql", 2, 0, 0, 0),
            ("reynard_auth", "postgresql", 4, 1, 0, 0),
            ("reynard_mcp", "postgresql", 3, 0, 0, 0),
            ("reynard_keys", "postgresql", 2, 0, 0, 0),
            ("reynard_e2e", "postgresql", 2, 0, 0, 0),
        ]

        for db_name, db_type, pool_size, checked_out, overflow, invalid in databases:
            pool_analysis = {
                "pool_size": pool_size,
                "checked_in": pool_size - checked_out,
                "checked_out": checked_out,
                "overflow": overflow,
                "invalid": invalid,
                "utilization_percent": (checked_out / pool_size) * 100 if pool_size > 0 else 0
            }

            analysis["databases"][db_name] = pool_analysis

            # Check for connection issues
            if pool_analysis["utilization_percent"] > 80:
                analysis["connection_issues"].append({
                    "database": db_name,
                    "issue": "High connection utilization",
                    "utilization_percent": pool_analysis["utilization_percent"],
                    "recommendation": "Consider increasing pool size"
                })

            if invalid > 0:
                analysis["connection_issues"].append({
                    "database": db_name,
                    "issue": "Invalid connections detected",
                    "invalid_count": invalid,
                    "recommendation": "Check connection health and configuration"
                })

        # Generate optimization recommendations
        if len(analysis["connection_issues"]) > 0:
            analysis["optimization_recommendations"].append(
                f"Found {len(analysis['connection_issues'])} connection issues that need attention"
            )

        total_pools = len(analysis["databases"])
        healthy_pools = len([db for db in analysis["databases"].values() if db["invalid"] == 0])

        if healthy_pools < total_pools:
            analysis["optimization_recommendations"].append(
                f"Only {healthy_pools}/{total_pools} connection pools are healthy"
            )

        return analysis

    async def analyze_query_performance(self) -> Dict[str, Any]:
        """Monitor database query performance and identify bottlenecks."""
        performance_data = {
            "slow_queries": [],
            "frequent_queries": [],
            "connection_metrics": {},
            "recommendations": []
        }

        # Simulate query performance analysis
        slow_queries = [
            {
                "query": "SELECT * FROM documents WHERE content LIKE '%complex_search%'",
                "avg_duration_ms": 250.0,
                "execution_count": 15,
                "database": "reynard_rag",
                "service": "rag_service"
            },
            {
                "query": "SELECT * FROM agents WHERE traits @> '{\"dominance\": 0.9}'",
                "avg_duration_ms": 180.0,
                "execution_count": 8,
                "database": "reynard_ecs",
                "service": "ecs_world"
            },
            {
                "query": "SELECT * FROM interactions WHERE created_at > NOW() - INTERVAL '1 day'",
                "avg_duration_ms": 120.0,
                "execution_count": 25,
                "database": "reynard_ecs",
                "service": "ecs_world"
            }
        ]

        frequent_queries = [
            {
                "query": "SELECT * FROM users WHERE id = $1",
                "execution_count": 1250,
                "avg_duration_ms": 5.2,
                "database": "reynard_auth",
                "service": "auth_service"
            },
            {
                "query": "SELECT * FROM sessions WHERE token = $1",
                "execution_count": 890,
                "avg_duration_ms": 3.8,
                "database": "reynard_auth",
                "service": "auth_service"
            }
        ]

        performance_data["slow_queries"] = slow_queries
        performance_data["frequent_queries"] = frequent_queries

        # Connection metrics
        performance_data["connection_metrics"] = {
            "total_connections": 21,
            "active_connections": 4,
            "idle_connections": 17,
            "connection_pool_utilization": 19.0
        }

        # Generate recommendations
        if len(slow_queries) > 0:
            performance_data["recommendations"].append(
                f"Found {len(slow_queries)} slow queries that may need optimization"
            )

        if len(frequent_queries) > 0:
            performance_data["recommendations"].append(
                f"Found {len(frequent_queries)} frequently executed queries - consider caching"
            )

        return performance_data


# Database call tracking decorators
def track_database_call(operation: str, database: str, service: str = None):
    """Decorator to track database calls."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            error = None
            try:
                result = await func(*args, **kwargs)
                return result
            except Exception as e:
                error = str(e)
                raise
            finally:
                duration_ms = (time.time() - start_time) * 1000
                # Track the call (you'd need access to a global debugger instance)
                logger.debug(f"Database call: {operation} on {database} took {duration_ms:.2f}ms")
        return wrapper
    return decorator


@contextmanager
def track_connection(database: str, connection_type: str = "pool"):
    """Context manager to track database connections."""
    start_time = time.time()
    try:
        yield
        # Track successful connection
        logger.debug(f"Connection to {database} established successfully")
    except Exception as e:
        # Track failed connection
        logger.error(f"Connection to {database} failed: {e}")
        raise
    finally:
        duration = time.time() - start_time
        logger.debug(f"Connection to {database} lasted {duration:.2f}s")


if __name__ == "__main__":
    # Example usage
    async def main():
        debugger = DatabaseDebugger()
        
        # Simulate some database calls
        debugger.track_call("SELECT", "reynard", 45.2, "SELECT * FROM users", service="auth")
        debugger.track_call("INSERT", "reynard_rag", 120.5, "INSERT INTO documents", service="rag")
        debugger.track_call("UPDATE", "reynard_ecs", 89.3, "UPDATE agents SET", service="ecs")
        
        # Track connections
        debugger.track_connection("reynard", "pool", "healthy", {"pool_size": 5, "active": 2})
        debugger.track_connection("reynard_rag", "pool", "healthy", {"pool_size": 3, "active": 1})
        
        # Generate reports
        print(debugger.generate_report())
        
        # Run analysis
        pool_analysis = await debugger.analyze_connection_pools()
        print("\nConnection Pool Analysis:")
        print(json.dumps(pool_analysis, indent=2))
        
        query_analysis = await debugger.analyze_query_performance()
        print("\nQuery Performance Analysis:")
        print(json.dumps(query_analysis, indent=2))

    asyncio.run(main())