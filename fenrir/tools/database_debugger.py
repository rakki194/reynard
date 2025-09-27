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
                "total_duration_ms": stats["total_duration_ms"],
                "avg_duration_ms": stats["total_duration_ms"] / stats["total_calls"] if stats["total_calls"] > 0 else 0,
                "error_count": stats["error_count"],
                "error_rate": stats["error_count"] / stats["total_calls"] if stats["total_calls"] > 0 else 0,
                "operations": stats["operations"],
            }
        
        return summary
    
    def get_slow_queries(self, threshold_ms: float = 100.0) -> List[Dict[str, Any]]:
        """Get queries that took longer than threshold."""
        return [call for call in self.calls if call["duration_ms"] > threshold_ms]
    
    def get_error_summary(self) -> Dict[str, Any]:
        """Get error summary."""
        if not self.error_log:
            return {"total_errors": 0, "errors_by_database": {}, "errors_by_operation": {}}
        
        errors_by_db = {}
        errors_by_op = {}
        
        for error_call in self.error_log:
            db = error_call["database"]
            op = error_call["operation"]
            
            errors_by_db[db] = errors_by_db.get(db, 0) + 1
            errors_by_op[op] = errors_by_op.get(op, 0) + 1
        
        return {
            "total_errors": len(self.error_log),
            "errors_by_database": errors_by_db,
            "errors_by_operation": errors_by_op,
            "recent_errors": self.error_log[-10:] if self.error_log else [],
        }
    
    def get_connection_health(self) -> Dict[str, Any]:
        """Get connection health status."""
        health = {}
        
        for database, connections in self.connections.items():
            health[database] = {
                "connections": connections,
                "healthy_connections": len([c for c in connections.values() if c["status"] == "healthy"]),
                "total_connections": len(connections),
            }
        
        return health
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive database debugging report."""
        return {
            "performance_summary": self.get_performance_summary(),
            "error_summary": self.get_error_summary(),
            "connection_health": self.get_connection_health(),
            "slow_queries": self.get_slow_queries(),
            "total_calls": len(self.calls),
            "monitoring_duration": time.time() - (self.calls[0]["timestamp"] if self.calls else time.time()),
        }


# Global database debugger instance
_db_debugger = DatabaseDebugger()


def get_database_debugger() -> DatabaseDebugger:
    """Get the global database debugger instance."""
    return _db_debugger


def track_database_call(operation: str, database: str, duration_ms: float, 
                       query: str = None, params: Dict = None, error: str = None,
                       service: str = None):
    """Track a database call."""
    _db_debugger.track_call(operation, database, duration_ms, query, params, error, service)


def track_database_connection(database: str, connection_type: str, 
                             status: str, details: Dict[str, Any] = None):
    """Track database connection status."""
    _db_debugger.track_connection(database, connection_type, status, details)


@contextmanager
def monitor_database_call(operation: str, database: str, query: str = None, 
                         params: Dict = None, service: str = None):
    """Context manager to monitor database calls."""
    start_time = time.time()
    error = None
    
    try:
        yield
    except Exception as e:
        error = str(e)
        raise
    finally:
        duration_ms = (time.time() - start_time) * 1000
        track_database_call(operation, database, duration_ms, query, params, error, service)


def database_call_monitor(operation: str, database: str, service: str = None):
    """Decorator to monitor database calls."""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
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
                track_database_call(operation, database, duration_ms, 
                                  query=getattr(func, '__name__', None), 
                                  error=error, service=service)
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            error = None
            
            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                error = str(e)
                raise
            finally:
                duration_ms = (time.time() - start_time) * 1000
                track_database_call(operation, database, duration_ms, 
                                  query=getattr(func, '__name__', None), 
                                  error=error, service=service)
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    
    return decorator


async def analyze_database_usage():
    """Analyze database usage patterns."""
    debugger = get_database_debugger()
    
    logger.info("🗄️ Starting database usage analysis...")
    logger.info("=" * 60)
    
    # Simulate some database calls for testing
    test_calls = [
        ("SELECT", "reynard", 50.0, "SELECT * FROM users", None, None, "gatekeeper"),
        ("INSERT", "reynard", 25.0, "INSERT INTO sessions", None, None, "gatekeeper"),
        ("SELECT", "reynard_rag", 100.0, "SELECT * FROM documents", None, None, "rag"),
        ("UPDATE", "reynard_rag", 75.0, "UPDATE documents SET indexed = true", None, None, "rag"),
        ("SELECT", "reynard_ecs", 30.0, "SELECT * FROM agents", None, None, "ecs"),
        ("INSERT", "reynard_ecs", 40.0, "INSERT INTO interactions", None, None, "ecs"),
    ]
    
    for operation, database, duration, query, params, error, service in test_calls:
        debugger.track_call(operation, database, duration, query, params, error, service)
        await asyncio.sleep(0.1)  # Simulate time between calls
    
    # Track some connections
    debugger.track_connection("reynard", "postgresql", "healthy", {"pool_size": 5})
    debugger.track_connection("reynard_rag", "postgresql", "healthy", {"pool_size": 3})
    debugger.track_connection("reynard_ecs", "postgresql", "healthy", {"pool_size": 2})
    
    # Generate and display report
    logger.info("\n📊 Database Analysis Results")
    logger.info("=" * 60)
    
    report = debugger.generate_report()
    
    # Performance summary
    logger.info("Performance Summary:")
    for database, stats in report["performance_summary"].items():
        logger.info(f"  {database}:")
        logger.info(f"    Total calls: {stats['total_calls']}")
        logger.info(f"    Avg duration: {stats['avg_duration_ms']:.1f}ms")
        logger.info(f"    Error rate: {stats['error_rate']:.1%}")
        
        for operation, op_stats in stats["operations"].items():
            logger.info(f"    {operation}: {op_stats['count']} calls, {op_stats['avg_duration_ms']:.1f}ms avg")
    
    # Error summary
    error_summary = report["error_summary"]
    if error_summary["total_errors"] > 0:
        logger.info(f"\nError Summary:")
        logger.info(f"  Total errors: {error_summary['total_errors']}")
        logger.info(f"  Errors by database: {error_summary['errors_by_database']}")
        logger.info(f"  Errors by operation: {error_summary['errors_by_operation']}")
    else:
        logger.info(f"\n✅ No database errors detected")
    
    # Connection health
    logger.info(f"\nConnection Health:")
    for database, health in report["connection_health"].items():
        logger.info(f"  {database}: {health['healthy_connections']}/{health['total_connections']} healthy")
    
    # Slow queries
    slow_queries = report["slow_queries"]
    if slow_queries:
        logger.info(f"\nSlow Queries (>100ms):")
        for query in slow_queries:
            logger.info(f"  {query['database']}: {query['operation']} - {query['duration_ms']:.1f}ms")
    else:
        logger.info(f"\n✅ No slow queries detected")
    
    return report


async def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Database Debugger")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")
    parser.add_argument("--output", type=str, help="Output file for analysis")
    parser.add_argument("--threshold", type=float, default=100.0, help="Slow query threshold in ms")
    
    args = parser.parse_args()
    
    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    try:
        # Run analysis
        report = await analyze_database_usage()
        
        # Save analysis if requested
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            logger.info(f"📁 Analysis saved to {args.output}")
        
        logger.info("\n🎉 Database analysis completed!")
        
    except KeyboardInterrupt:
        logger.info("Analysis interrupted by user")
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
