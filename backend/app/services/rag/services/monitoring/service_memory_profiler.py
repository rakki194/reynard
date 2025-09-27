"""🦊 Service Memory Profiler
============================

Comprehensive memory profiling for individual services with real-time monitoring,
leak detection, and performance optimization suggestions.

Features:
- Real-time memory monitoring per service
- Memory leak detection with trend analysis
- Service-specific memory usage tracking
- Automatic memory pressure alerts
- Performance optimization recommendations
- Integration with existing profiling infrastructure

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import gc
import logging
import psutil
import time
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from app.core.debug_logging import DebugLogContext
from app.ecs.performance.middleware import MemoryProfiler

logger = logging.getLogger("uvicorn")


@dataclass
class ServiceMemorySnapshot:
    """Memory snapshot for a specific service."""
    
    service_name: str
    timestamp: datetime
    memory_mb: float
    memory_percent: float
    cpu_percent: float
    num_threads: int
    num_fds: int
    gc_count: Tuple[int, int, int]  # (gen0, gen1, gen2)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class MemoryLeakAlert:
    """Memory leak alert with detailed information."""
    
    service_name: str
    alert_type: str
    severity: str
    memory_increase_mb: float
    trend_period_minutes: float
    current_memory_mb: float
    peak_memory_mb: float
    timestamp: datetime
    recommendations: List[str] = field(default_factory=list)


class ServiceMemoryProfiler:
    """Comprehensive memory profiler for individual services."""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize the service memory profiler."""
        self.config = config or {}
        
        # Configuration
        self.check_interval = self.config.get("check_interval", 2.0)
        self.memory_leak_threshold_mb = self.config.get("memory_leak_threshold_mb", 100)
        self.memory_leak_trend_minutes = self.config.get("memory_leak_trend_minutes", 5)
        self.high_memory_threshold_mb = self.config.get("high_memory_threshold_mb", 512)
        self.critical_memory_threshold_mb = self.config.get("critical_memory_threshold_mb", 1024)
        
        # Memory tracking
        self.service_snapshots: Dict[str, deque] = defaultdict(
            lambda: deque(maxlen=1000)  # Keep last 1000 snapshots per service
        )
        self.memory_alerts: List[MemoryLeakAlert] = []
        self.service_baselines: Dict[str, float] = {}
        
        # Profiling state
        self._running = False
        self._profiling_task: Optional[asyncio.Task] = None
        self._start_time: Optional[datetime] = None
        
        # Global memory profiler
        self.global_profiler = MemoryProfiler(check_interval=1.0)
        
        # Performance tracking
        self.profiling_stats = {
            "total_snapshots": 0,
            "alerts_generated": 0,
            "memory_cleanups_triggered": 0,
            "services_monitored": set(),
        }

    async def start_profiling(self) -> None:
        """Start memory profiling for all services."""
        if self._running:
            logger.warning("Memory profiling already running")
            return
        
        try:
            with DebugLogContext(logger, "start_service_memory_profiling"):
                self._running = True
                self._start_time = datetime.now()
                
                # Start global memory profiler
                self.global_profiler.start()
                
                # Start service-specific profiling
                self._profiling_task = asyncio.create_task(self._profiling_loop())
                
                logger.info("✅ Service memory profiling started")
                logger.info(f"   Check interval: {self.check_interval}s")
                logger.info(f"   Memory leak threshold: {self.memory_leak_threshold_mb}MB")
                logger.info(f"   High memory threshold: {self.high_memory_threshold_mb}MB")
                
        except Exception as e:
            logger.error(f"❌ Failed to start memory profiling: {e}")
            self._running = False
    
    def start(self) -> None:
        """Start memory profiling (synchronous wrapper)."""
        asyncio.create_task(self.start_profiling())
    
    def stop(self) -> None:
        """Stop memory profiling (synchronous wrapper)."""
        asyncio.create_task(self.stop_profiling())

    async def stop_profiling(self) -> None:
        """Stop memory profiling."""
        if not self._running:
            return
        
        try:
            with DebugLogContext(logger, "stop_service_memory_profiling"):
                self._running = False
                
                # Stop global profiler
                self.global_profiler.stop()
                
                # Cancel profiling task
                if self._profiling_task and not self._profiling_task.done():
                    self._profiling_task.cancel()
                    try:
                        await self._profiling_task
                    except asyncio.CancelledError:
                        pass
                
                # Log final statistics
                await self._log_final_statistics()
                
                logger.info("✅ Service memory profiling stopped")
                
        except Exception as e:
            logger.error(f"❌ Error stopping memory profiling: {e}")

    async def _profiling_loop(self) -> None:
        """Main profiling loop."""
        try:
            while self._running:
                await self._collect_service_memory_snapshots()
                await self._analyze_memory_trends()
                await self._check_memory_alerts()
                await asyncio.sleep(self.check_interval)
                
        except asyncio.CancelledError:
            logger.info("Memory profiling loop cancelled")
        except Exception as e:
            logger.error(f"Error in memory profiling loop: {e}")

    async def _collect_service_memory_snapshots(self) -> None:
        """Collect memory snapshots for all active services."""
        try:
            # Get current process information
            process = psutil.Process()
            current_memory_mb = process.memory_info().rss / 1024 / 1024
            current_cpu_percent = process.cpu_percent()
            num_threads = process.num_threads()
            num_fds = process.num_fds() if hasattr(process, 'num_fds') else 0
            
            # Get garbage collection counts
            gc_counts = gc.get_count()
            
            # Create snapshot for the main process
            snapshot = ServiceMemorySnapshot(
                service_name="main_process",
                timestamp=datetime.now(),
                memory_mb=current_memory_mb,
                memory_percent=process.memory_percent(),
                cpu_percent=current_cpu_percent,
                num_threads=num_threads,
                num_fds=num_fds,
                gc_count=gc_counts,
                metadata={
                    "process_id": process.pid,
                    "create_time": process.create_time(),
                }
            )
            
            # Store snapshot
            self.service_snapshots["main_process"].append(snapshot)
            self.profiling_stats["total_snapshots"] += 1
            self.profiling_stats["services_monitored"].add("main_process")
            
            # Log high memory usage
            if current_memory_mb > self.high_memory_threshold_mb:
                logger.warning(f"⚠️ High memory usage detected: {current_memory_mb:.1f}MB")
                
                if current_memory_mb > self.critical_memory_threshold_mb:
                    logger.error(f"🚨 Critical memory usage: {current_memory_mb:.1f}MB")
                    await self._trigger_memory_cleanup()
            
        except Exception as e:
            logger.error(f"Error collecting memory snapshots: {e}")

    async def _analyze_memory_trends(self) -> None:
        """Analyze memory trends for leak detection."""
        try:
            for service_name, snapshots in self.service_snapshots.items():
                if len(snapshots) < 10:  # Need enough data for trend analysis
                    continue
                
                # Get recent snapshots
                recent_snapshots = list(snapshots)[-20:]  # Last 20 snapshots
                
                # Calculate memory trend
                memory_trend = self._calculate_memory_trend(recent_snapshots)
                
                # Check for memory leaks
                if memory_trend["trend"] == "increasing" and memory_trend["increase_mb"] > self.memory_leak_threshold_mb:
                    await self._generate_memory_leak_alert(service_name, memory_trend, recent_snapshots)
                
        except Exception as e:
            logger.error(f"Error analyzing memory trends: {e}")

    def _calculate_memory_trend(self, snapshots: List[ServiceMemorySnapshot]) -> Dict[str, Any]:
        """Calculate memory trend from snapshots."""
        if len(snapshots) < 2:
            return {"trend": "stable", "increase_mb": 0, "rate_mb_per_minute": 0}
        
        # Calculate time span
        time_span = (snapshots[-1].timestamp - snapshots[0].timestamp).total_seconds() / 60  # minutes
        
        # Calculate memory change
        memory_start = snapshots[0].memory_mb
        memory_end = snapshots[-1].memory_mb
        memory_increase = memory_end - memory_start
        
        # Calculate rate
        rate_mb_per_minute = memory_increase / time_span if time_span > 0 else 0
        
        # Determine trend
        if memory_increase > self.memory_leak_threshold_mb:
            trend = "increasing"
        elif memory_increase < -self.memory_leak_threshold_mb:
            trend = "decreasing"
        else:
            trend = "stable"
        
        return {
            "trend": trend,
            "increase_mb": memory_increase,
            "rate_mb_per_minute": rate_mb_per_minute,
            "time_span_minutes": time_span,
            "memory_start_mb": memory_start,
            "memory_end_mb": memory_end,
        }

    async def _generate_memory_leak_alert(
        self, 
        service_name: str, 
        memory_trend: Dict[str, Any], 
        snapshots: List[ServiceMemorySnapshot]
    ) -> None:
        """Generate memory leak alert."""
        try:
            # Check if we already have a recent alert for this service
            recent_alerts = [
                alert for alert in self.memory_alerts
                if alert.service_name == service_name and 
                (datetime.now() - alert.timestamp).total_seconds() < 300  # 5 minutes
            ]
            
            if recent_alerts:
                return  # Don't spam alerts
            
            # Determine severity
            if memory_trend["increase_mb"] > self.critical_memory_threshold_mb:
                severity = "critical"
            elif memory_trend["increase_mb"] > self.high_memory_threshold_mb:
                severity = "high"
            else:
                severity = "medium"
            
            # Generate recommendations
            recommendations = self._generate_memory_optimization_recommendations(
                service_name, memory_trend, snapshots
            )
            
            # Create alert
            alert = MemoryLeakAlert(
                service_name=service_name,
                alert_type="memory_leak",
                severity=severity,
                memory_increase_mb=memory_trend["increase_mb"],
                trend_period_minutes=memory_trend["time_span_minutes"],
                current_memory_mb=memory_trend["memory_end_mb"],
                peak_memory_mb=max(snapshot.memory_mb for snapshot in snapshots),
                timestamp=datetime.now(),
                recommendations=recommendations,
            )
            
            # Store alert
            self.memory_alerts.append(alert)
            self.profiling_stats["alerts_generated"] += 1
            
            # Log alert
            logger.warning(f"🚨 Memory leak detected in {service_name}:")
            logger.warning(f"   Memory increase: {memory_trend['increase_mb']:.1f}MB")
            logger.warning(f"   Rate: {memory_trend['rate_mb_per_minute']:.1f}MB/min")
            logger.warning(f"   Severity: {severity}")
            
            # Trigger cleanup for critical alerts
            if severity == "critical":
                await self._trigger_memory_cleanup()
                
        except Exception as e:
            logger.error(f"Error generating memory leak alert: {e}")

    def _generate_memory_optimization_recommendations(
        self, 
        service_name: str, 
        memory_trend: Dict[str, Any], 
        snapshots: List[ServiceMemorySnapshot]
    ) -> List[str]:
        """Generate memory optimization recommendations."""
        recommendations = []
        
        # General recommendations
        recommendations.append("Consider reducing batch sizes for memory-intensive operations")
        recommendations.append("Implement more frequent garbage collection")
        recommendations.append("Review object lifecycle management")
        
        # Service-specific recommendations
        if service_name == "rag_service":
            recommendations.extend([
                "Consider reducing vector cache size",
                "Implement document chunking with smaller sizes",
                "Review embedding model memory usage",
            ])
        elif service_name == "ai_service":
            recommendations.extend([
                "Consider model quantization",
                "Implement model unloading when not in use",
                "Review context window sizes",
            ])
        
        # Trend-based recommendations
        if memory_trend["rate_mb_per_minute"] > 50:
            recommendations.append("High memory growth rate - consider immediate optimization")
        
        return recommendations

    async def _check_memory_alerts(self) -> None:
        """Check for various memory-related alerts."""
        try:
            # Get current memory usage
            process = psutil.Process()
            current_memory_mb = process.memory_info().rss / 1024 / 1024
            
            # Check for high memory usage
            if current_memory_mb > self.critical_memory_threshold_mb:
                logger.error(f"🚨 Critical memory usage: {current_memory_mb:.1f}MB")
                await self._trigger_memory_cleanup()
            elif current_memory_mb > self.high_memory_threshold_mb:
                logger.warning(f"⚠️ High memory usage: {current_memory_mb:.1f}MB")
                
        except Exception as e:
            logger.error(f"Error checking memory alerts: {e}")

    async def _trigger_memory_cleanup(self) -> None:
        """Trigger memory cleanup operations."""
        try:
            cleanup_start_time = time.time()
            memory_before = psutil.Process().memory_info().rss / 1024 / 1024
            
            # Force garbage collection
            collected = gc.collect()
            
            # Small delay to allow system to reclaim memory
            await asyncio.sleep(0.1)
            
            memory_after = psutil.Process().memory_info().rss / 1024 / 1024
            memory_freed = memory_before - memory_after
            cleanup_duration = time.time() - cleanup_start_time
            
            self.profiling_stats["memory_cleanups_triggered"] += 1
            
            logger.info(f"🧹 Memory cleanup triggered:")
            logger.info(f"   Objects collected: {collected}")
            logger.info(f"   Memory freed: {memory_freed:.1f}MB")
            logger.info(f"   Cleanup duration: {cleanup_duration:.3f}s")
            
        except Exception as e:
            logger.error(f"Error during memory cleanup: {e}")

    async def _log_final_statistics(self) -> None:
        """Log final profiling statistics."""
        try:
            if not self._start_time:
                return
            
            total_duration = (datetime.now() - self._start_time).total_seconds()
            
            logger.info("📊 Memory profiling final statistics:")
            logger.info(f"   Total duration: {total_duration:.1f}s")
            logger.info(f"   Total snapshots: {self.profiling_stats['total_snapshots']}")
            logger.info(f"   Alerts generated: {self.profiling_stats['alerts_generated']}")
            logger.info(f"   Memory cleanups: {self.profiling_stats['memory_cleanups_triggered']}")
            logger.info(f"   Services monitored: {len(self.profiling_stats['services_monitored'])}")
            
            # Log service-specific statistics
            for service_name, snapshots in self.service_snapshots.items():
                if snapshots:
                    memory_values = [s.memory_mb for s in snapshots]
                    logger.info(f"   {service_name}:")
                    logger.info(f"     Snapshots: {len(snapshots)}")
                    logger.info(f"     Peak memory: {max(memory_values):.1f}MB")
                    logger.info(f"     Average memory: {sum(memory_values) / len(memory_values):.1f}MB")
            
        except Exception as e:
            logger.error(f"Error logging final statistics: {e}")

    def get_service_memory_stats(self, service_name: str) -> Dict[str, Any]:
        """Get memory statistics for a specific service."""
        if service_name not in self.service_snapshots:
            return {"error": f"Service {service_name} not found"}
        
        snapshots = list(self.service_snapshots[service_name])
        if not snapshots:
            return {"error": f"No snapshots available for {service_name}"}
        
        memory_values = [s.memory_mb for s in snapshots]
        cpu_values = [s.cpu_percent for s in snapshots]
        
        return {
            "service_name": service_name,
            "snapshots_count": len(snapshots),
            "current_memory_mb": memory_values[-1],
            "peak_memory_mb": max(memory_values),
            "average_memory_mb": sum(memory_values) / len(memory_values),
            "memory_trend": self._calculate_memory_trend(snapshots[-10:])["trend"],
            "current_cpu_percent": cpu_values[-1],
            "average_cpu_percent": sum(cpu_values) / len(cpu_values),
            "last_snapshot": snapshots[-1].timestamp.isoformat(),
        }

    def get_all_memory_stats(self) -> Dict[str, Any]:
        """Get memory statistics for all services."""
        return {
            "profiling_active": self._running,
            "total_snapshots": self.profiling_stats["total_snapshots"],
            "alerts_generated": self.profiling_stats["alerts_generated"],
            "memory_cleanups": self.profiling_stats["memory_cleanups_triggered"],
            "services": {
                service_name: self.get_service_memory_stats(service_name)
                for service_name in self.service_snapshots.keys()
            },
            "recent_alerts": [
                {
                    "service_name": alert.service_name,
                    "alert_type": alert.alert_type,
                    "severity": alert.severity,
                    "memory_increase_mb": alert.memory_increase_mb,
                    "timestamp": alert.timestamp.isoformat(),
                    "recommendations": alert.recommendations,
                }
                for alert in self.memory_alerts[-10:]  # Last 10 alerts
            ],
        }

    def get_memory_alerts(self, service_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get memory alerts, optionally filtered by service."""
        alerts = self.memory_alerts
        
        if service_name:
            alerts = [alert for alert in alerts if alert.service_name == service_name]
        
        return [
            {
                "service_name": alert.service_name,
                "alert_type": alert.alert_type,
                "severity": alert.severity,
                "memory_increase_mb": alert.memory_increase_mb,
                "trend_period_minutes": alert.trend_period_minutes,
                "current_memory_mb": alert.current_memory_mb,
                "peak_memory_mb": alert.peak_memory_mb,
                "timestamp": alert.timestamp.isoformat(),
                "recommendations": alert.recommendations,
            }
            for alert in alerts
        ]
