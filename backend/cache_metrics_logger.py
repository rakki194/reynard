#!/usr/bin/env python3
"""
Cache Metrics Logger
====================

A comprehensive logging system for cache performance metrics.
This provides detailed logging, analysis, and reporting of cache effectiveness.
"""

import asyncio
import time
import json
import logging
import csv
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, asdict
import sqlite3
from contextlib import asynccontextmanager


@dataclass
class CacheMetricsEntry:
    """A single cache metrics entry."""
    timestamp: datetime
    total_searches: int
    cache_hits: int
    cache_misses: int
    cache_hit_rate: float
    average_search_time_ms: float
    total_search_time_ms: float
    redis_available: bool
    legacy_cache_size: int
    memory_usage_bytes: int
    key_count: int


@dataclass
class CachePerformanceTest:
    """Results from a cache performance test."""
    test_name: str
    query: str
    first_request_time_ms: float
    second_request_time_ms: float
    speedup_factor: float
    cache_hit: bool
    timestamp: datetime


class CacheMetricsLogger:
    """Comprehensive cache metrics logging system."""
    
    def __init__(self, log_dir: str = "cache_logs"):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)
        
        # Setup logging
        self.logger = self._setup_logger()
        
        # Database for persistent storage
        self.db_path = self.log_dir / "cache_metrics.db"
        self._init_database()
        
        # In-memory storage for recent metrics
        self.recent_metrics: List[CacheMetricsEntry] = []
        self.performance_tests: List[CachePerformanceTest] = []
        
        # Configuration
        self.max_memory_entries = 1000
        self.log_interval = 60  # seconds
        
    def _setup_logger(self) -> logging.Logger:
        """Setup the logger with file and console handlers."""
        logger = logging.getLogger("cache_metrics")
        logger.setLevel(logging.INFO)
        
        # File handler
        log_file = self.log_dir / f"cache_metrics_{datetime.now().strftime('%Y%m%d')}.log"
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
        return logger
    
    def _init_database(self):
        """Initialize the SQLite database for metrics storage."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Create metrics table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS cache_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    total_searches INTEGER,
                    cache_hits INTEGER,
                    cache_misses INTEGER,
                    cache_hit_rate REAL,
                    average_search_time_ms REAL,
                    total_search_time_ms REAL,
                    redis_available BOOLEAN,
                    legacy_cache_size INTEGER,
                    memory_usage_bytes INTEGER,
                    key_count INTEGER
                )
            """)
            
            # Create performance tests table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS performance_tests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    test_name TEXT,
                    query TEXT,
                    first_request_time_ms REAL,
                    second_request_time_ms REAL,
                    speedup_factor REAL,
                    cache_hit BOOLEAN
                )
            """)
            
            conn.commit()
    
    async def log_metrics(self, metrics_data: Dict[str, Any]):
        """Log cache metrics to file, database, and memory."""
        try:
            # Extract metrics
            search_metrics = metrics_data.get("metrics", {}).get("search_metrics", {})
            cache_status = metrics_data.get("metrics", {}).get("cache_status", {})
            
            # Create metrics entry
            entry = CacheMetricsEntry(
                timestamp=datetime.now(),
                total_searches=search_metrics.get("total_searches", 0),
                cache_hits=search_metrics.get("cache_hits", 0),
                cache_misses=search_metrics.get("cache_misses", 0),
                cache_hit_rate=search_metrics.get("cache_hit_rate", 0.0),
                average_search_time_ms=search_metrics.get("average_search_time_ms", 0.0),
                total_search_time_ms=search_metrics.get("total_search_time_ms", 0.0),
                redis_available=cache_status.get("redis_available", False),
                legacy_cache_size=cache_status.get("legacy_cache_size", 0),
                memory_usage_bytes=cache_status.get("memory_usage_bytes", 0),
                key_count=cache_status.get("key_count", 0)
            )
            
            # Add to memory storage
            self.recent_metrics.append(entry)
            if len(self.recent_metrics) > self.max_memory_entries:
                self.recent_metrics.pop(0)
            
            # Log to database
            await self._save_to_database(entry)
            
            # Log to file
            self.logger.info(
                f"Cache Metrics - Searches: {entry.total_searches}, "
                f"Hits: {entry.cache_hits}, Misses: {entry.cache_misses}, "
                f"Hit Rate: {entry.cache_hit_rate:.1f}%, "
                f"Avg Time: {entry.average_search_time_ms:.2f}ms"
            )
            
        except Exception as e:
            self.logger.error(f"Failed to log metrics: {e}")
    
    async def log_performance_test(self, test: CachePerformanceTest):
        """Log a performance test result."""
        try:
            # Add to memory storage
            self.performance_tests.append(test)
            if len(self.performance_tests) > 100:  # Keep last 100 tests
                self.performance_tests.pop(0)
            
            # Log to database
            await self._save_performance_test_to_database(test)
            
            # Log to file
            self.logger.info(
                f"Performance Test - {test.test_name}: "
                f"Speedup: {test.speedup_factor:.1f}x, "
                f"Cache Hit: {test.cache_hit}"
            )
            
        except Exception as e:
            self.logger.error(f"Failed to log performance test: {e}")
    
    async def _save_to_database(self, entry: CacheMetricsEntry):
        """Save metrics entry to database."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO cache_metrics (
                    timestamp, total_searches, cache_hits, cache_misses,
                    cache_hit_rate, average_search_time_ms, total_search_time_ms,
                    redis_available, legacy_cache_size, memory_usage_bytes, key_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                entry.timestamp.isoformat(),
                entry.total_searches,
                entry.cache_hits,
                entry.cache_misses,
                entry.cache_hit_rate,
                entry.average_search_time_ms,
                entry.total_search_time_ms,
                entry.redis_available,
                entry.legacy_cache_size,
                entry.memory_usage_bytes,
                entry.key_count
            ))
            conn.commit()
    
    async def _save_performance_test_to_database(self, test: CachePerformanceTest):
        """Save performance test to database."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO performance_tests (
                    timestamp, test_name, query, first_request_time_ms,
                    second_request_time_ms, speedup_factor, cache_hit
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                test.timestamp.isoformat(),
                test.test_name,
                test.query,
                test.first_request_time_ms,
                test.second_request_time_ms,
                test.speedup_factor,
                test.cache_hit
            ))
            conn.commit()
    
    def export_metrics_to_csv(self, hours: int = 24) -> str:
        """Export metrics to CSV file."""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        # Filter recent metrics
        recent_entries = [
            entry for entry in self.recent_metrics
            if entry.timestamp >= cutoff_time
        ]
        
        if not recent_entries:
            return "No metrics data available for export"
        
        # Create CSV file
        csv_file = self.log_dir / f"cache_metrics_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        with open(csv_file, 'w', newline='') as f:
            writer = csv.writer(f)
            
            # Write header
            writer.writerow([
                'timestamp', 'total_searches', 'cache_hits', 'cache_misses',
                'cache_hit_rate', 'average_search_time_ms', 'total_search_time_ms',
                'redis_available', 'legacy_cache_size', 'memory_usage_bytes', 'key_count'
            ])
            
            # Write data
            for entry in recent_entries:
                writer.writerow([
                    entry.timestamp.isoformat(),
                    entry.total_searches,
                    entry.cache_hits,
                    entry.cache_misses,
                    entry.cache_hit_rate,
                    entry.average_search_time_ms,
                    entry.total_search_time_ms,
                    entry.redis_available,
                    entry.legacy_cache_size,
                    entry.memory_usage_bytes,
                    entry.key_count
                ])
        
        return str(csv_file)
    
    def export_performance_tests_to_csv(self) -> str:
        """Export performance tests to CSV file."""
        if not self.performance_tests:
            return "No performance test data available for export"
        
        # Create CSV file
        csv_file = self.log_dir / f"performance_tests_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        with open(csv_file, 'w', newline='') as f:
            writer = csv.writer(f)
            
            # Write header
            writer.writerow([
                'timestamp', 'test_name', 'query', 'first_request_time_ms',
                'second_request_time_ms', 'speedup_factor', 'cache_hit'
            ])
            
            # Write data
            for test in self.performance_tests:
                writer.writerow([
                    test.timestamp.isoformat(),
                    test.test_name,
                    test.query,
                    test.first_request_time_ms,
                    test.second_request_time_ms,
                    test.speedup_factor,
                    test.cache_hit
                ])
        
        return str(csv_file)
    
    def generate_metrics_report(self, hours: int = 24) -> Dict[str, Any]:
        """Generate a comprehensive metrics report."""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        # Filter recent metrics
        recent_entries = [
            entry for entry in self.recent_metrics
            if entry.timestamp >= cutoff_time
        ]
        
        if not recent_entries:
            return {"error": "No metrics data available for the specified time period"}
        
        # Calculate statistics
        hit_rates = [entry.cache_hit_rate for entry in recent_entries]
        search_times = [entry.average_search_time_ms for entry in recent_entries]
        total_searches = [entry.total_searches for entry in recent_entries]
        
        report = {
            "report_period": f"Last {hours} hours",
            "data_points": len(recent_entries),
            "time_range": {
                "start": recent_entries[0].timestamp.isoformat(),
                "end": recent_entries[-1].timestamp.isoformat()
            },
            "cache_performance": {
                "average_hit_rate": sum(hit_rates) / len(hit_rates) if hit_rates else 0,
                "max_hit_rate": max(hit_rates) if hit_rates else 0,
                "min_hit_rate": min(hit_rates) if hit_rates else 0,
                "hit_rate_trend": hit_rates[-1] - hit_rates[0] if len(hit_rates) > 1 else 0
            },
            "search_performance": {
                "average_search_time_ms": sum(search_times) / len(search_times) if search_times else 0,
                "max_search_time_ms": max(search_times) if search_times else 0,
                "min_search_time_ms": min(search_times) if search_times else 0,
                "total_searches": max(total_searches) - min(total_searches) if len(total_searches) > 1 else 0
            },
            "system_status": {
                "redis_available": recent_entries[-1].redis_available,
                "current_cache_size": recent_entries[-1].legacy_cache_size,
                "current_memory_usage_mb": recent_entries[-1].memory_usage_bytes / 1024 / 1024,
                "current_key_count": recent_entries[-1].key_count
            }
        }
        
        # Performance test summary
        if self.performance_tests:
            recent_tests = [
                test for test in self.performance_tests
                if test.timestamp >= cutoff_time
            ]
            
            if recent_tests:
                speedups = [test.speedup_factor for test in recent_tests]
                report["performance_tests"] = {
                    "total_tests": len(recent_tests),
                    "average_speedup": sum(speedups) / len(speedups),
                    "max_speedup": max(speedups),
                    "min_speedup": min(speedups),
                    "cache_hit_rate": sum(1 for test in recent_tests if test.cache_hit) / len(recent_tests) * 100
                }
        
        return report
    
    def print_metrics_summary(self, hours: int = 24):
        """Print a summary of recent metrics."""
        report = self.generate_metrics_report(hours)
        
        if "error" in report:
            print(f"❌ {report['error']}")
            return
        
        print("\n" + "="*60)
        print(f"📊 Cache Metrics Summary - {report['report_period']}")
        print("="*60)
        
        print(f"📈 Data Points: {report['data_points']}")
        print(f"⏱️  Time Range: {report['time_range']['start']} to {report['time_range']['end']}")
        
        cache_perf = report["cache_performance"]
        print(f"\n💾 Cache Performance:")
        print(f"   Average Hit Rate: {cache_perf['average_hit_rate']:.1f}%")
        print(f"   Max Hit Rate: {cache_perf['max_hit_rate']:.1f}%")
        print(f"   Min Hit Rate: {cache_perf['min_hit_rate']:.1f}%")
        print(f"   Hit Rate Trend: {cache_perf['hit_rate_trend']:+.1f}%")
        
        search_perf = report["search_performance"]
        print(f"\n🔍 Search Performance:")
        print(f"   Average Search Time: {search_perf['average_search_time_ms']:.2f}ms")
        print(f"   Max Search Time: {search_perf['max_search_time_ms']:.2f}ms")
        print(f"   Min Search Time: {search_perf['min_search_time_ms']:.2f}ms")
        print(f"   Total Searches: {search_perf['total_searches']}")
        
        system_status = report["system_status"]
        print(f"\n⚙️  System Status:")
        print(f"   Redis Available: {'✅' if system_status['redis_available'] else '❌'}")
        print(f"   Cache Size: {system_status['current_cache_size']}")
        print(f"   Memory Usage: {system_status['current_memory_usage_mb']:.2f}MB")
        print(f"   Key Count: {system_status['current_key_count']}")
        
        if "performance_tests" in report:
            perf_tests = report["performance_tests"]
            print(f"\n🚀 Performance Tests:")
            print(f"   Total Tests: {perf_tests['total_tests']}")
            print(f"   Average Speedup: {perf_tests['average_speedup']:.1f}x")
            print(f"   Max Speedup: {perf_tests['max_speedup']:.1f}x")
            print(f"   Cache Hit Rate: {perf_tests['cache_hit_rate']:.1f}%")
    
    async def start_continuous_logging(self, duration_minutes: int = 60):
        """Start continuous logging of cache metrics."""
        print(f"🔄 Starting continuous logging for {duration_minutes} minutes...")
        
        start_time = time.time()
        end_time = start_time + (duration_minutes * 60)
        
        try:
            while time.time() < end_time:
                # Get metrics from API
                try:
                    import requests
                    response = requests.get("http://localhost:8000/api/search/performance", timeout=5)
                    if response.status_code == 200:
                        metrics_data = response.json()
                        await self.log_metrics(metrics_data)
                    else:
                        self.logger.warning(f"API returned status {response.status_code}")
                except Exception as e:
                    self.logger.error(f"Failed to get metrics: {e}")
                
                # Wait for next log interval
                await asyncio.sleep(self.log_interval)
                
        except KeyboardInterrupt:
            print("\n⏹️  Logging stopped by user")
        
        print("✅ Continuous logging complete")
        
        # Generate and print summary
        self.print_metrics_summary(hours=1)
        
        # Export data
        csv_file = self.export_metrics_to_csv(hours=1)
        print(f"📁 Metrics exported to: {csv_file}")


async def main():
    """Main function to demonstrate the cache metrics logger."""
    print("🦊 Cache Metrics Logger")
    print("=" * 50)
    print("This system provides comprehensive logging and analysis")
    print("of cache performance metrics to prove the system is working.")
    print("=" * 50)
    
    logger = CacheMetricsLogger()
    
    try:
        # Test logging a single metrics entry
        print("\n🧪 Testing metrics logging...")
        test_metrics = {
            "metrics": {
                "search_metrics": {
                    "total_searches": 100,
                    "cache_hits": 80,
                    "cache_misses": 20,
                    "cache_hit_rate": 80.0,
                    "average_search_time_ms": 150.5,
                    "total_search_time_ms": 15050.0
                },
                "cache_status": {
                    "redis_available": True,
                    "legacy_cache_size": 50,
                    "memory_usage_bytes": 1024 * 1024 * 10,  # 10MB
                    "key_count": 1000
                }
            }
        }
        
        await logger.log_metrics(test_metrics)
        print("✅ Test metrics logged successfully")
        
        # Test logging a performance test
        print("\n🧪 Testing performance test logging...")
        test_performance = CachePerformanceTest(
            test_name="authentication_search",
            query="authentication flow",
            first_request_time_ms=500.0,
            second_request_time_ms=50.0,
            speedup_factor=10.0,
            cache_hit=True,
            timestamp=datetime.now()
        )
        
        await logger.log_performance_test(test_performance)
        print("✅ Test performance logged successfully")
        
        # Print summary
        logger.print_metrics_summary(hours=1)
        
        # Export data
        csv_file = logger.export_metrics_to_csv(hours=1)
        print(f"\n📁 Metrics exported to: {csv_file}")
        
        perf_csv = logger.export_performance_tests_to_csv()
        print(f"📁 Performance tests exported to: {perf_csv}")
        
        print("\n🎉 Cache metrics logger demonstration complete!")
        print("🦊 The logging system is ready to track cache performance!")
        
    except Exception as e:
        print(f"❌ Logger demonstration failed: {e}")


if __name__ == "__main__":
    asyncio.run(main())
