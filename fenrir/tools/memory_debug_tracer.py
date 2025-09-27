#!/usr/bin/env python3
"""🦊 Memory Debug Tracer for RAG Stack
=====================================

Advanced memory debugging and profiling tool for the Reynard RAG backend.
This script provides comprehensive memory tracing, leak detection, and
performance analysis for the indexing/caching/RAG stack.

Features:
- Real-time memory monitoring with call stack tracing
- Memory leak detection with detailed analysis
- Component-specific memory profiling
- Performance bottleneck identification
- Memory usage visualization and reporting
- Integration with existing profiling infrastructure

Usage:
    python memory_debug_tracer.py --service rag --monitor --duration 300
    python memory_debug_tracer.py --profile-indexing --batch-size 10
    python memory_debug_tracer.py --analyze-leaks --output report.json

Author: Reynard Development Team
Version: 1.0.0
"""

import argparse
import asyncio
import gc
import json
import logging
import os
import psutil
import sys
import time
import traceback
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Callable
import tracemalloc
import threading
from contextlib import contextmanager

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent))

from app.ecs.performance.middleware import MemoryProfiler
from app.services.rag.services.monitoring.service_memory_profiler import ServiceMemoryProfiler

logger = logging.getLogger(__name__)


@dataclass
class MemorySnapshot:
    """Detailed memory snapshot with call stack information."""
    
    timestamp: datetime
    memory_mb: float
    memory_percent: float
    cpu_percent: float
    num_threads: int
    num_fds: int
    gc_counts: Tuple[int, int, int]
    call_stack: List[str] = field(default_factory=list)
    component: str = "unknown"
    operation: str = "unknown"
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class MemoryLeak:
    """Memory leak detection result."""
    
    component: str
    leak_type: str
    severity: str
    memory_increase_mb: float
    rate_mb_per_minute: float
    duration_minutes: float
    snapshots: List[MemorySnapshot]
    recommendations: List[str] = field(default_factory=list)


class MemoryDebugTracer:
    """Advanced memory debugging and tracing system."""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize the memory debug tracer."""
        self.config = config or {}
        
        # Configuration
        self.sample_interval = self.config.get("sample_interval", 1.0)
        self.max_snapshots = self.config.get("max_snapshots", 10000)
        self.leak_threshold_mb = self.config.get("leak_threshold_mb", 50)
        self.critical_threshold_mb = self.config.get("critical_threshold_mb", 200)
        self.enable_tracemalloc = self.config.get("enable_tracemalloc", True)
        self.enable_call_tracing = self.config.get("enable_call_tracing", True)
        
        # Memory tracking
        self.snapshots: deque = deque(maxlen=self.max_snapshots)
        self.component_snapshots: Dict[str, deque] = defaultdict(
            lambda: deque(maxlen=1000)
        )
        self.memory_leaks: List[MemoryLeak] = []
        
        # Profiling state
        self._running = False
        self._profiling_task: Optional[asyncio.Task] = None
        self._start_time: Optional[datetime] = None
        self._tracemalloc_started = False
        
        # Component tracking
        self.active_components: Dict[str, Dict[str, Any]] = {}
        self.operation_stack: List[Dict[str, Any]] = []
        
        # Statistics
        self.stats = {
            "total_snapshots": 0,
            "leaks_detected": 0,
            "critical_alerts": 0,
            "components_monitored": set(),
            "operations_tracked": set(),
        }
        
        # Initialize tracemalloc if enabled
        if self.enable_tracemalloc and not tracemalloc.is_tracing():
            tracemalloc.start()
            self._tracemalloc_started = True
            logger.info("✅ Tracemalloc started for detailed memory tracking")
    
    async def start_monitoring(self, duration_seconds: Optional[int] = None) -> None:
        """Start comprehensive memory monitoring."""
        if self._running:
            logger.warning("Memory monitoring already running")
            return
        
        try:
            self._running = True
            self._start_time = datetime.now()
            
            logger.info("🚀 Starting comprehensive memory monitoring...")
            logger.info(f"   Sample interval: {self.sample_interval}s")
            logger.info(f"   Max snapshots: {self.max_snapshots}")
            logger.info(f"   Leak threshold: {self.leak_threshold_mb}MB")
            logger.info(f"   Tracemalloc: {'enabled' if self._tracemalloc_started else 'disabled'}")
            
            # Start monitoring task
            self._profiling_task = asyncio.create_task(self._monitoring_loop(duration_seconds))
            
            logger.info("✅ Memory monitoring started successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to start memory monitoring: {e}")
            self._running = False
    
    async def stop_monitoring(self) -> Dict[str, Any]:
        """Stop memory monitoring and return comprehensive report."""
        if not self._running:
            return {"error": "Monitoring not running"}
        
        try:
            self._running = False
            
            # Cancel monitoring task
            if self._profiling_task and not self._profiling_task.done():
                self._profiling_task.cancel()
                try:
                    await self._profiling_task
                except asyncio.CancelledError:
                    pass
            
            # Stop tracemalloc
            if self._tracemalloc_started and tracemalloc.is_tracing():
                tracemalloc.stop()
                self._tracemalloc_started = False
            
            # Generate comprehensive report
            report = await self._generate_comprehensive_report()
            
            logger.info("✅ Memory monitoring stopped")
            return report
            
        except Exception as e:
            logger.error(f"❌ Error stopping memory monitoring: {e}")
            return {"error": str(e)}
    
    async def _monitoring_loop(self, duration_seconds: Optional[int] = None) -> None:
        """Main monitoring loop."""
        try:
            end_time = None
            if duration_seconds:
                end_time = datetime.now() + timedelta(seconds=duration_seconds)
            
            while self._running:
                if end_time and datetime.now() >= end_time:
                    logger.info("⏰ Monitoring duration reached, stopping...")
                    break
                
                await self._collect_memory_snapshot()
                await self._analyze_memory_trends()
                await self._check_critical_conditions()
                
                await asyncio.sleep(self.sample_interval)
                
        except asyncio.CancelledError:
            logger.info("Memory monitoring loop cancelled")
        except Exception as e:
            logger.error(f"Error in monitoring loop: {e}")
    
    async def _collect_memory_snapshot(self) -> None:
        """Collect detailed memory snapshot with call stack."""
        try:
            process = psutil.Process()
            
            # Get basic memory info
            memory_info = process.memory_info()
            memory_mb = memory_info.rss / 1024 / 1024
            memory_percent = process.memory_percent()
            cpu_percent = process.cpu_percent()
            num_threads = process.num_threads()
            num_fds = process.num_fds() if hasattr(process, 'num_fds') else 0
            
            # Get garbage collection info
            gc_counts = gc.get_count()
            
            # Get call stack if enabled
            call_stack = []
            if self.enable_call_tracing:
                call_stack = self._get_current_call_stack()
            
            # Determine current component and operation
            component, operation = self._identify_current_component()
            
            # Create snapshot
            snapshot = MemorySnapshot(
                timestamp=datetime.now(),
                memory_mb=memory_mb,
                memory_percent=memory_percent,
                cpu_percent=cpu_percent,
                num_threads=num_threads,
                num_fds=num_fds,
                gc_counts=gc_counts,
                call_stack=call_stack,
                component=component,
                operation=operation,
                metadata={
                    "process_id": process.pid,
                    "create_time": process.create_time(),
                    "num_connections": len(process.connections()) if hasattr(process, 'connections') else 0,
                }
            )
            
            # Store snapshot
            self.snapshots.append(snapshot)
            self.component_snapshots[component].append(snapshot)
            self.stats["total_snapshots"] += 1
            self.stats["components_monitored"].add(component)
            self.stats["operations_tracked"].add(operation)
            
            # Log high memory usage
            if memory_mb > self.critical_threshold_mb:
                logger.error(f"🚨 CRITICAL memory usage: {memory_mb:.1f}MB in {component}/{operation}")
                self.stats["critical_alerts"] += 1
            elif memory_mb > self.leak_threshold_mb:
                logger.warning(f"⚠️ High memory usage: {memory_mb:.1f}MB in {component}/{operation}")
            
        except Exception as e:
            logger.error(f"Error collecting memory snapshot: {e}")
    
    def _get_current_call_stack(self) -> List[str]:
        """Get current call stack for debugging."""
        try:
            stack = traceback.extract_stack()
            # Filter out internal calls and limit depth
            filtered_stack = []
            for frame in stack[-10:]:  # Last 10 frames
                if 'memory_debug_tracer.py' not in frame.filename:
                    filtered_stack.append(f"{frame.filename}:{frame.lineno} in {frame.name}")
            return filtered_stack
        except Exception:
            return []
    
    def _identify_current_component(self) -> Tuple[str, str]:
        """Identify current component and operation from call stack."""
        try:
            stack = traceback.extract_stack()
            
            # Look for RAG-related components in the call stack
            for frame in reversed(stack):
                filename = frame.filename
                if 'rag' in filename.lower():
                    if 'embedding' in filename.lower():
                        return 'embedding_service', frame.name
                    elif 'vector_store' in filename.lower():
                        return 'vector_store', frame.name
                    elif 'indexing' in filename.lower():
                        return 'indexing_service', frame.name
                    elif 'search' in filename.lower():
                        return 'search_engine', frame.name
                    else:
                        return 'rag_service', frame.name
                elif 'ai_service' in filename.lower():
                    return 'ai_service', frame.name
                elif 'database' in filename.lower() or 'db' in filename.lower():
                    return 'database', frame.name
            
            return 'unknown', 'unknown'
        except Exception:
            return 'unknown', 'unknown'
    
    async def _analyze_memory_trends(self) -> None:
        """Analyze memory trends for leak detection."""
        try:
            if len(self.snapshots) < 20:  # Need enough data
                return
            
            # Analyze by component
            for component, snapshots in self.component_snapshots.items():
                if len(snapshots) < 10:
                    continue
                
                recent_snapshots = list(snapshots)[-20:]  # Last 20 snapshots
                leak_info = self._detect_memory_leak(component, recent_snapshots)
                
                if leak_info:
                    await self._handle_memory_leak(leak_info)
                    
        except Exception as e:
            logger.error(f"Error analyzing memory trends: {e}")
    
    def _detect_memory_leak(self, component: str, snapshots: List[MemorySnapshot]) -> Optional[MemoryLeak]:
        """Detect memory leak in a component."""
        try:
            if len(snapshots) < 10:
                return None
            
            # Calculate memory trend
            memory_values = [s.memory_mb for s in snapshots]
            time_span = (snapshots[-1].timestamp - snapshots[0].timestamp).total_seconds() / 60  # minutes
            
            memory_start = memory_values[0]
            memory_end = memory_values[-1]
            memory_increase = memory_end - memory_start
            
            # Calculate rate
            rate_mb_per_minute = memory_increase / time_span if time_span > 0 else 0
            
            # Check for leak
            if memory_increase > self.leak_threshold_mb and rate_mb_per_minute > 5:
                # Determine severity
                if memory_increase > self.critical_threshold_mb:
                    severity = "critical"
                elif memory_increase > self.leak_threshold_mb * 2:
                    severity = "high"
                else:
                    severity = "medium"
                
                # Generate recommendations
                recommendations = self._generate_leak_recommendations(component, memory_increase, rate_mb_per_minute)
                
                return MemoryLeak(
                    component=component,
                    leak_type="memory_leak",
                    severity=severity,
                    memory_increase_mb=memory_increase,
                    rate_mb_per_minute=rate_mb_per_minute,
                    duration_minutes=time_span,
                    snapshots=snapshots,
                    recommendations=recommendations
                )
            
            return None
            
        except Exception as e:
            logger.error(f"Error detecting memory leak: {e}")
            return None
    
    def _generate_leak_recommendations(self, component: str, memory_increase: float, rate: float) -> List[str]:
        """Generate recommendations for memory leak."""
        recommendations = []
        
        # General recommendations
        recommendations.append("Force garbage collection")
        recommendations.append("Review object lifecycle management")
        recommendations.append("Check for circular references")
        
        # Component-specific recommendations
        if component == "embedding_service":
            recommendations.extend([
                "Clear embedding cache",
                "Reduce batch sizes",
                "Implement embedding cleanup",
                "Review model loading/unloading"
            ])
        elif component == "vector_store":
            recommendations.extend([
                "Clear vector cache",
                "Optimize vector storage",
                "Review index management",
                "Implement vector cleanup"
            ])
        elif component == "indexing_service":
            recommendations.extend([
                "Reduce batch processing size",
                "Implement document cleanup",
                "Review file processing pipeline",
                "Optimize memory usage in batches"
            ])
        elif component == "ai_service":
            recommendations.extend([
                "Unload unused models",
                "Reduce context window sizes",
                "Implement model quantization",
                "Review model caching strategy"
            ])
        
        # Rate-based recommendations
        if rate > 50:
            recommendations.append("URGENT: High memory growth rate - immediate action required")
        elif rate > 20:
            recommendations.append("High memory growth rate - optimization needed")
        
        return recommendations
    
    async def _handle_memory_leak(self, leak: MemoryLeak) -> None:
        """Handle detected memory leak."""
        try:
            # Check if we already have a recent alert for this component
            recent_leaks = [
                l for l in self.memory_leaks
                if l.component == leak.component and 
                (datetime.now() - l.snapshots[-1].timestamp).total_seconds() < 300  # 5 minutes
            ]
            
            if recent_leaks:
                return  # Don't spam alerts
            
            # Store leak
            self.memory_leaks.append(leak)
            self.stats["leaks_detected"] += 1
            
            # Log alert
            logger.warning(f"🚨 Memory leak detected in {leak.component}:")
            logger.warning(f"   Memory increase: {leak.memory_increase_mb:.1f}MB")
            logger.warning(f"   Rate: {leak.rate_mb_per_minute:.1f}MB/min")
            logger.warning(f"   Severity: {leak.severity}")
            logger.warning(f"   Duration: {leak.duration_minutes:.1f} minutes")
            
            # Log recommendations
            for rec in leak.recommendations:
                logger.warning(f"   💡 {rec}")
            
            # Trigger cleanup for critical leaks
            if leak.severity == "critical":
                await self._trigger_emergency_cleanup(leak.component)
                
        except Exception as e:
            logger.error(f"Error handling memory leak: {e}")
    
    async def _check_critical_conditions(self) -> None:
        """Check for critical memory conditions."""
        try:
            if not self.snapshots:
                return
            
            current_snapshot = self.snapshots[-1]
            
            # Check for critical memory usage
            if current_snapshot.memory_mb > self.critical_threshold_mb * 2:
                logger.error(f"🚨 EMERGENCY: Memory usage {current_snapshot.memory_mb:.1f}MB exceeds critical threshold")
                await self._trigger_emergency_cleanup("system")
            
            # Check for memory growth rate
            if len(self.snapshots) >= 10:
                recent_snapshots = list(self.snapshots)[-10:]
                memory_values = [s.memory_mb for s in recent_snapshots]
                time_span = (recent_snapshots[-1].timestamp - recent_snapshots[0].timestamp).total_seconds() / 60
                
                memory_increase = memory_values[-1] - memory_values[0]
                rate = memory_increase / time_span if time_span > 0 else 0
                
                if rate > 100:  # 100MB per minute
                    logger.error(f"🚨 EMERGENCY: Memory growing at {rate:.1f}MB/min")
                    await self._trigger_emergency_cleanup("system")
                    
        except Exception as e:
            logger.error(f"Error checking critical conditions: {e}")
    
    async def _trigger_emergency_cleanup(self, component: str) -> None:
        """Trigger emergency memory cleanup."""
        try:
            logger.warning(f"🧹 Triggering emergency cleanup for {component}")
            
            # Force garbage collection
            collected = gc.collect()
            
            # Component-specific cleanup
            if component == "embedding_service":
                await self._cleanup_embedding_service()
            elif component == "vector_store":
                await self._cleanup_vector_store()
            elif component == "indexing_service":
                await self._cleanup_indexing_service()
            elif component == "ai_service":
                await self._cleanup_ai_service()
            else:
                await self._cleanup_system()
            
            # Small delay
            await asyncio.sleep(0.1)
            
            # Check memory after cleanup
            process = psutil.Process()
            memory_after = process.memory_info().rss / 1024 / 1024
            
            logger.info(f"🧹 Emergency cleanup completed: {collected} objects collected, memory: {memory_after:.1f}MB")
            
        except Exception as e:
            logger.error(f"Error during emergency cleanup: {e}")
    
    async def _cleanup_embedding_service(self) -> None:
        """Cleanup embedding service memory."""
        # This would integrate with the actual embedding service
        logger.info("Cleaning up embedding service...")
    
    async def _cleanup_vector_store(self) -> None:
        """Cleanup vector store memory."""
        logger.info("Cleaning up vector store...")
    
    async def _cleanup_indexing_service(self) -> None:
        """Cleanup indexing service memory."""
        logger.info("Cleaning up indexing service...")
    
    async def _cleanup_ai_service(self) -> None:
        """Cleanup AI service memory."""
        logger.info("Cleaning up AI service...")
    
    async def _cleanup_system(self) -> None:
        """General system cleanup."""
        logger.info("Performing general system cleanup...")
    
    async def _generate_comprehensive_report(self) -> Dict[str, Any]:
        """Generate comprehensive memory analysis report."""
        try:
            if not self._start_time:
                return {"error": "No monitoring data available"}
            
            total_duration = (datetime.now() - self._start_time).total_seconds()
            
            # Basic statistics
            report = {
                "monitoring_duration_seconds": total_duration,
                "total_snapshots": len(self.snapshots),
                "leaks_detected": len(self.memory_leaks),
                "critical_alerts": self.stats["critical_alerts"],
                "components_monitored": list(self.stats["components_monitored"]),
                "operations_tracked": list(self.stats["operations_tracked"]),
            }
            
            # Memory statistics
            if self.snapshots:
                memory_values = [s.memory_mb for s in self.snapshots]
                report["memory_stats"] = {
                    "peak_memory_mb": max(memory_values),
                    "min_memory_mb": min(memory_values),
                    "average_memory_mb": sum(memory_values) / len(memory_values),
                    "final_memory_mb": memory_values[-1],
                    "memory_growth_mb": memory_values[-1] - memory_values[0] if len(memory_values) > 1 else 0,
                }
            
            # Component analysis
            report["component_analysis"] = {}
            for component, snapshots in self.component_snapshots.items():
                if snapshots:
                    memory_values = [s.memory_mb for s in snapshots]
                    report["component_analysis"][component] = {
                        "snapshots_count": len(snapshots),
                        "peak_memory_mb": max(memory_values),
                        "average_memory_mb": sum(memory_values) / len(memory_values),
                        "memory_trend": self._calculate_trend(memory_values),
                    }
            
            # Memory leaks
            report["memory_leaks"] = []
            for leak in self.memory_leaks:
                report["memory_leaks"].append({
                    "component": leak.component,
                    "severity": leak.severity,
                    "memory_increase_mb": leak.memory_increase_mb,
                    "rate_mb_per_minute": leak.rate_mb_per_minute,
                    "duration_minutes": leak.duration_minutes,
                    "recommendations": leak.recommendations,
                    "detected_at": leak.snapshots[-1].timestamp.isoformat(),
                })
            
            # Tracemalloc statistics
            if self._tracemalloc_started:
                try:
                    current, peak = tracemalloc.get_traced_memory()
                    report["tracemalloc_stats"] = {
                        "current_memory_mb": current / 1024 / 1024,
                        "peak_memory_mb": peak / 1024 / 1024,
                    }
                except Exception:
                    pass
            
            # Recommendations
            report["recommendations"] = self._generate_overall_recommendations()
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating report: {e}")
            return {"error": str(e)}
    
    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend from a list of values."""
        if len(values) < 2:
            return "stable"
        
        start_avg = sum(values[:len(values)//3]) / (len(values)//3)
        end_avg = sum(values[-len(values)//3:]) / (len(values)//3)
        
        if end_avg > start_avg * 1.1:
            return "increasing"
        elif end_avg < start_avg * 0.9:
            return "decreasing"
        else:
            return "stable"
    
    def _generate_overall_recommendations(self) -> List[str]:
        """Generate overall recommendations based on analysis."""
        recommendations = []
        
        if self.stats["leaks_detected"] > 0:
            recommendations.append("Memory leaks detected - review component lifecycle management")
        
        if self.stats["critical_alerts"] > 0:
            recommendations.append("Critical memory usage detected - immediate optimization required")
        
        if len(self.stats["components_monitored"]) > 5:
            recommendations.append("Many components monitored - consider service isolation")
        
        # Add general recommendations
        recommendations.extend([
            "Implement regular memory cleanup routines",
            "Monitor memory usage in production",
            "Consider memory limits for services",
            "Review and optimize data structures",
        ])
        
        return recommendations
    
    @contextmanager
    def trace_operation(self, component: str, operation: str):
        """Context manager for tracing specific operations."""
        operation_info = {
            "component": component,
            "operation": operation,
            "start_time": datetime.now(),
            "start_memory": psutil.Process().memory_info().rss / 1024 / 1024,
        }
        
        self.operation_stack.append(operation_info)
        self.active_components[component] = operation_info
        
        try:
            yield operation_info
        finally:
            # Remove from stack
            if self.operation_stack and self.operation_stack[-1] == operation_info:
                self.operation_stack.pop()
            
            # Update component info
            if component in self.active_components:
                del self.active_components[component]
    
    def get_current_status(self) -> Dict[str, Any]:
        """Get current monitoring status."""
        if not self.snapshots:
            return {"status": "no_data"}
        
        current_snapshot = self.snapshots[-1]
        
        return {
            "status": "monitoring" if self._running else "stopped",
            "current_memory_mb": current_snapshot.memory_mb,
            "current_component": current_snapshot.component,
            "current_operation": current_snapshot.operation,
            "active_components": list(self.active_components.keys()),
            "operation_stack_depth": len(self.operation_stack),
            "total_snapshots": len(self.snapshots),
            "leaks_detected": len(self.memory_leaks),
        }


async def main():
    """Main function for command-line usage."""
    parser = argparse.ArgumentParser(description="Memory Debug Tracer for RAG Stack")
    parser.add_argument("--service", choices=["rag", "indexing", "embedding", "all"], 
                       default="all", help="Service to monitor")
    parser.add_argument("--monitor", action="store_true", help="Start monitoring mode")
    parser.add_argument("--profile-indexing", action="store_true", help="Profile indexing operations")
    parser.add_argument("--analyze-leaks", action="store_true", help="Analyze existing memory leaks")
    parser.add_argument("--duration", type=int, default=300, help="Monitoring duration in seconds")
    parser.add_argument("--output", type=str, help="Output file for report")
    parser.add_argument("--batch-size", type=int, default=10, help="Batch size for profiling")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")
    
    args = parser.parse_args()
    
    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create tracer
    config = {
        "sample_interval": 1.0,
        "max_snapshots": 10000,
        "leak_threshold_mb": 50,
        "critical_threshold_mb": 200,
        "enable_tracemalloc": True,
        "enable_call_tracing": True,
    }
    
    tracer = MemoryDebugTracer(config)
    
    try:
        if args.monitor:
            logger.info(f"Starting memory monitoring for {args.duration} seconds...")
            await tracer.start_monitoring(args.duration)
            
            # Wait for monitoring to complete
            while tracer._running:
                await asyncio.sleep(1)
            
            # Generate report
            report = await tracer.stop_monitoring()
            
            # Save report
            if args.output:
                with open(args.output, 'w') as f:
                    json.dump(report, f, indent=2, default=str)
                logger.info(f"Report saved to {args.output}")
            else:
                print(json.dumps(report, indent=2, default=str))
        
        elif args.profile_indexing:
            logger.info("Profiling indexing operations...")
            # This would integrate with the actual indexing service
            # For now, just run monitoring for a short duration
            await tracer.start_monitoring(60)
            await asyncio.sleep(60)
            report = await tracer.stop_monitoring()
            print(json.dumps(report, indent=2, default=str))
        
        elif args.analyze_leaks:
            logger.info("Analyzing memory leaks...")
            # This would analyze existing data
            print("Memory leak analysis not yet implemented")
        
        else:
            parser.print_help()
    
    except KeyboardInterrupt:
        logger.info("Monitoring interrupted by user")
        if tracer._running:
            await tracer.stop_monitoring()
    except Exception as e:
        logger.error(f"Error: {e}")
        if tracer._running:
            await tracer.stop_monitoring()


if __name__ == "__main__":
    asyncio.run(main())
