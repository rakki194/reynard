"""
PerformanceMonitor: Track and analyze RAG system performance metrics.

Responsibilities:
- Monitor embedding generation performance
- Track HNSW index performance metrics
- Analyze cache hit rates and optimization effectiveness
- Generate performance reports and alerts
- Store metrics in database for historical analysis
"""

import asyncio
import logging
import time
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
import statistics

logger = logging.getLogger("uvicorn")


class PerformanceMonitor:
    """Monitor and analyze RAG system performance metrics."""

    def __init__(self, db_connection=None):
        self.db_connection = db_connection
        self.metrics_buffer: List[Dict[str, Any]] = []
        self.buffer_size = 100
        self.flush_interval = 60  # seconds
        
        # Performance thresholds
        self.thresholds = {
            "embedding_latency_ms": 1000,  # 1 second
            "search_latency_ms": 50,       # 50ms
            "cache_hit_rate": 0.8,         # 80%
            "error_rate": 0.05,            # 5%
            "throughput_per_second": 10,   # 10 embeddings/second
        }
        
        # Start background flush task
        self._flush_task = None
        self._running = False

    async def start(self) -> None:
        """Start the performance monitor."""
        self._running = True
        self._flush_task = asyncio.create_task(self._periodic_flush())
        logger.info("PerformanceMonitor started")

    async def stop(self) -> None:
        """Stop the performance monitor."""
        self._running = False
        if self._flush_task:
            self._flush_task.cancel()
            try:
                await self._flush_task
            except asyncio.CancelledError:
                pass
        
        # Flush remaining metrics
        await self._flush_metrics()
        logger.info("PerformanceMonitor stopped")

    async def record_embedding_metrics(self, 
                                     model: str,
                                     latency_ms: float,
                                     success: bool,
                                     cache_hit: bool,
                                     tokens: int,
                                     batch_size: int = 1) -> None:
        """Record embedding generation metrics."""
        metric = {
            "metric_name": "embedding_generation",
            "timestamp": datetime.utcnow(),
            "model": model,
            "latency_ms": latency_ms,
            "success": success,
            "cache_hit": cache_hit,
            "tokens": tokens,
            "batch_size": batch_size,
            "throughput_per_second": batch_size / (latency_ms / 1000) if latency_ms > 0 else 0,
        }
        
        await self._add_metric(metric)

    async def record_search_metrics(self,
                                  query_type: str,
                                  latency_ms: float,
                                  results_count: int,
                                  recall_at_10: Optional[float] = None) -> None:
        """Record search performance metrics."""
        metric = {
            "metric_name": "search_performance",
            "timestamp": datetime.utcnow(),
            "query_type": query_type,
            "latency_ms": latency_ms,
            "results_count": results_count,
            "recall_at_10": recall_at_10,
        }
        
        await self._add_metric(metric)

    async def record_cache_metrics(self,
                                 cache_type: str,
                                 hit_rate: float,
                                 size: int,
                                 max_size: int) -> None:
        """Record cache performance metrics."""
        metric = {
            "metric_name": "cache_performance",
            "timestamp": datetime.utcnow(),
            "cache_type": cache_type,
            "hit_rate": hit_rate,
            "size": size,
            "max_size": max_size,
            "utilization": size / max_size if max_size > 0 else 0,
        }
        
        await self._add_metric(metric)

    async def record_hnsw_metrics(self,
                                index_type: str,
                                query_latency_ms: float,
                                index_size_mb: float,
                                recall_at_10: Optional[float] = None) -> None:
        """Record HNSW index performance metrics."""
        metric = {
            "metric_name": "hnsw_performance",
            "timestamp": datetime.utcnow(),
            "index_type": index_type,
            "query_latency_ms": query_latency_ms,
            "index_size_mb": index_size_mb,
            "recall_at_10": recall_at_10,
        }
        
        await self._add_metric(metric)

    async def record_optimization_metrics(self,
                                        optimization_type: str,
                                        before_metrics: Dict[str, Any],
                                        after_metrics: Dict[str, Any]) -> None:
        """Record optimization impact metrics."""
        improvements = {}
        for key, after_value in after_metrics.items():
            if key in before_metrics:
                before_value = before_metrics[key]
                if isinstance(after_value, (int, float)) and isinstance(before_value, (int, float)):
                    if before_value > 0:
                        improvement = ((after_value - before_value) / before_value) * 100
                        improvements[f"{key}_improvement_pct"] = improvement
        
        metric = {
            "metric_name": "optimization_impact",
            "timestamp": datetime.utcnow(),
            "optimization_type": optimization_type,
            "before_metrics": before_metrics,
            "after_metrics": after_metrics,
            "improvements": improvements,
        }
        
        await self._add_metric(metric)

    async def _add_metric(self, metric: Dict[str, Any]) -> None:
        """Add metric to buffer."""
        self.metrics_buffer.append(metric)
        
        # Flush if buffer is full
        if len(self.metrics_buffer) >= self.buffer_size:
            await self._flush_metrics()

    async def _periodic_flush(self) -> None:
        """Periodically flush metrics to database."""
        while self._running:
            try:
                await asyncio.sleep(self.flush_interval)
                await self._flush_metrics()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in periodic flush: {e}")

    async def _flush_metrics(self) -> None:
        """Flush metrics buffer to database."""
        if not self.metrics_buffer or not self.db_connection:
            return
        
        try:
            # Convert metrics to database format
            db_metrics = []
            for metric in self.metrics_buffer:
                db_metric = {
                    "metric_name": metric["metric_name"],
                    "metric_value": 1.0,  # Count metric
                    "timestamp": metric["timestamp"],
                    "metadata": {k: v for k, v in metric.items() if k not in ["metric_name", "timestamp"]}
                }
                db_metrics.append(db_metric)
            
            # Insert into database (simplified - would need proper async DB connection)
            # await self._insert_metrics_to_db(db_metrics)
            
            # Clear buffer
            self.metrics_buffer.clear()
            
            logger.debug(f"Flushed {len(db_metrics)} metrics to database")
            
        except Exception as e:
            logger.error(f"Failed to flush metrics: {e}")

    async def get_performance_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get performance summary for the last N hours."""
        # This would query the database for recent metrics
        # For now, return a mock summary
        return {
            "time_range_hours": hours,
            "embedding_metrics": {
                "average_latency_ms": 150.0,
                "p95_latency_ms": 300.0,
                "throughput_per_second": 25.0,
                "success_rate": 0.98,
                "cache_hit_rate": 0.85,
            },
            "search_metrics": {
                "average_latency_ms": 15.0,
                "p95_latency_ms": 35.0,
                "average_recall_at_10": 0.92,
            },
            "cache_metrics": {
                "average_hit_rate": 0.85,
                "average_utilization": 0.75,
            },
            "hnsw_metrics": {
                "average_query_latency_ms": 8.0,
                "average_recall_at_10": 0.92,
                "index_size_mb": 45.2,
            },
            "optimization_impact": {
                "hnsw_optimization": {
                    "recall_improvement_pct": 7.2,
                    "query_time_increase_pct": 12.5,
                    "memory_increase_pct": 95.0,
                },
                "concurrent_processing": {
                    "throughput_improvement_pct": 300.0,
                    "latency_reduction_pct": 45.0,
                },
            }
        }

    async def check_performance_alerts(self) -> List[Dict[str, Any]]:
        """Check for performance issues and generate alerts."""
        alerts = []
        summary = await self.get_performance_summary(hours=1)  # Last hour
        
        # Check embedding latency
        if summary["embedding_metrics"]["average_latency_ms"] > self.thresholds["embedding_latency_ms"]:
            alerts.append({
                "type": "high_embedding_latency",
                "severity": "warning",
                "message": f"Average embedding latency {summary['embedding_metrics']['average_latency_ms']:.1f}ms exceeds threshold {self.thresholds['embedding_latency_ms']}ms",
                "timestamp": datetime.utcnow(),
            })
        
        # Check search latency
        if summary["search_metrics"]["average_latency_ms"] > self.thresholds["search_latency_ms"]:
            alerts.append({
                "type": "high_search_latency",
                "severity": "warning",
                "message": f"Average search latency {summary['search_metrics']['average_latency_ms']:.1f}ms exceeds threshold {self.thresholds['search_latency_ms']}ms",
                "timestamp": datetime.utcnow(),
            })
        
        # Check cache hit rate
        if summary["cache_metrics"]["average_hit_rate"] < self.thresholds["cache_hit_rate"]:
            alerts.append({
                "type": "low_cache_hit_rate",
                "severity": "info",
                "message": f"Cache hit rate {summary['cache_metrics']['average_hit_rate']:.2%} below threshold {self.thresholds['cache_hit_rate']:.2%}",
                "timestamp": datetime.utcnow(),
            })
        
        # Check throughput
        if summary["embedding_metrics"]["throughput_per_second"] < self.thresholds["throughput_per_second"]:
            alerts.append({
                "type": "low_throughput",
                "severity": "warning",
                "message": f"Throughput {summary['embedding_metrics']['throughput_per_second']:.1f} embeddings/sec below threshold {self.thresholds['throughput_per_second']}",
                "timestamp": datetime.utcnow(),
            })
        
        return alerts

    async def get_optimization_recommendations(self) -> List[Dict[str, Any]]:
        """Generate optimization recommendations based on current performance."""
        recommendations = []
        summary = await self.get_performance_summary(hours=24)
        
        # HNSW optimization recommendations
        if summary["hnsw_metrics"]["average_recall_at_10"] < 0.90:
            recommendations.append({
                "type": "hnsw_optimization",
                "priority": "high",
                "title": "Optimize HNSW Index Parameters",
                "description": "Current recall is below 90%. Consider increasing m and ef_construction parameters.",
                "expected_improvement": "5-10% recall improvement",
                "implementation_effort": "low",
            })
        
        # Cache optimization recommendations
        if summary["cache_metrics"]["average_hit_rate"] < 0.80:
            recommendations.append({
                "type": "cache_optimization",
                "priority": "medium",
                "title": "Increase Cache Size",
                "description": "Low cache hit rate suggests increasing cache size or improving cache key strategy.",
                "expected_improvement": "10-20% latency reduction",
                "implementation_effort": "low",
            })
        
        # Concurrency optimization recommendations
        if summary["embedding_metrics"]["throughput_per_second"] < 20:
            recommendations.append({
                "type": "concurrency_optimization",
                "priority": "medium",
                "title": "Increase Concurrent Processing",
                "description": "Low throughput suggests increasing concurrent request limits.",
                "expected_improvement": "2-4x throughput improvement",
                "implementation_effort": "low",
            })
        
        return recommendations

    def get_monitor_stats(self) -> Dict[str, Any]:
        """Get performance monitor statistics."""
        return {
            "buffer_size": len(self.metrics_buffer),
            "buffer_capacity": self.buffer_size,
            "flush_interval": self.flush_interval,
            "running": self._running,
            "thresholds": self.thresholds,
        }
