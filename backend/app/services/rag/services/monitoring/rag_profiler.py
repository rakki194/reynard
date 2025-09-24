"""RAG Profiler: Comprehensive profiling and monitoring for RAG operations.

This service provides detailed profiling, performance monitoring, and debug logging
for all RAG operations, helping identify bottlenecks and optimize performance.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import time
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from ...interfaces.base import BaseService, ServiceStatus

logger = logging.getLogger("uvicorn")

# Enable comprehensive profiling
ENABLE_RAG_PROFILING = True
PROFILE_HISTORY_SIZE = 1000


@dataclass
class OperationProfile:
    """Profile data for a single operation."""
    
    operation_type: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_ms: float = 0.0
    success: bool = False
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    memory_usage_mb: float = 0.0
    cpu_usage_percent: float = 0.0


@dataclass
class ServiceMetrics:
    """Metrics for a specific service."""
    
    service_name: str
    total_operations: int = 0
    successful_operations: int = 0
    failed_operations: int = 0
    average_duration_ms: float = 0.0
    min_duration_ms: float = float('inf')
    max_duration_ms: float = 0.0
    total_duration_ms: float = 0.0
    error_rate: float = 0.0
    operations_per_minute: float = 0.0
    last_operation_time: Optional[datetime] = None


class RAGProfiler(BaseService):
    """Comprehensive profiler for RAG operations."""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__("rag-profiler", config)
        
        # Profiling configuration
        self.enabled = ENABLE_RAG_PROFILING
        self.history_size = PROFILE_HISTORY_SIZE
        self.profile_history: deque = deque(maxlen=self.history_size)
        
        # Service metrics
        self.service_metrics: Dict[str, ServiceMetrics] = defaultdict(
            lambda: ServiceMetrics(service_name="")
        )
        
        # Operation tracking
        self.active_operations: Dict[str, OperationProfile] = {}
        self.operation_counter = 0
        
        # Performance thresholds
        self.slow_operation_threshold_ms = self.config.get("slow_operation_threshold_ms", 1000)
        self.error_rate_threshold = self.config.get("error_rate_threshold", 0.1)
        
        # Memory and CPU tracking
        self.memory_samples: deque = deque(maxlen=100)
        self.cpu_samples: deque = deque(maxlen=100)
        
        # Alerting
        self.alerts: List[Dict[str, Any]] = []
        self.alert_thresholds = {
            "slow_operations": 10,
            "high_error_rate": 0.2,
            "memory_usage_mb": 500,
        }

    async def initialize(self) -> bool:
        """Initialize the RAG profiler."""
        try:
            self.update_status(ServiceStatus.INITIALIZING, "Initializing RAG profiler")
            
            if self.enabled:
                logger.info("🦊 [PROFILER] RAG profiling enabled with comprehensive monitoring")
                
                # Start background monitoring
                asyncio.create_task(self._background_monitoring())
                
                self.update_status(ServiceStatus.HEALTHY, "RAG profiler initialized")
            else:
                logger.info("🦊 [PROFILER] RAG profiling disabled")
                self.update_status(ServiceStatus.HEALTHY, "RAG profiler initialized (disabled)")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize RAG profiler: {e}")
            self.update_status(ServiceStatus.ERROR, f"Initialization failed: {e}")
            return False

    async def shutdown(self) -> None:
        """Shutdown the RAG profiler."""
        try:
            self.update_status(ServiceStatus.SHUTTING_DOWN, "Shutting down RAG profiler")
            
            # Clear all data
            self.profile_history.clear()
            self.active_operations.clear()
            self.service_metrics.clear()
            self.alerts.clear()
            
            self.update_status(ServiceStatus.SHUTDOWN, "RAG profiler shutdown complete")
            
        except Exception as e:
            self.logger.error(f"Error during shutdown: {e}")

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check."""
        try:
            return {
                "status": self.status.value,
                "message": self.health.message,
                "last_updated": self.health.last_updated.isoformat(),
                "enabled": self.enabled,
                "active_operations": len(self.active_operations),
                "total_profiles": len(self.profile_history),
                "service_metrics": len(self.service_metrics),
                "alerts": len(self.alerts),
                "dependencies": self.get_dependency_status(),
            }
            
        except Exception as e:
            self.logger.error(f"Health check failed: {e}")
            self.update_status(ServiceStatus.ERROR, f"Health check failed: {e}")
            return {
                "status": "error",
                "message": str(e),
                "last_updated": self.health.last_updated.isoformat(),
                "dependencies": self.get_dependency_status(),
            }

    def start_operation(
        self, 
        operation_type: str, 
        service_name: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Start profiling an operation."""
        if not self.enabled:
            return ""
        
        self.operation_counter += 1
        operation_id = f"{service_name}_{operation_type}_{self.operation_counter}_{int(time.time())}"
        
        profile = OperationProfile(
            operation_type=operation_type,
            start_time=datetime.now(),
            metadata=metadata or {}
        )
        
        self.active_operations[operation_id] = profile
        
        if DEBUG_RAG_OPERATIONS:
            logger.info(f"🦊 [PROFILER] Started operation: {operation_type} on {service_name}")
        
        return operation_id

    def end_operation(
        self, 
        operation_id: str, 
        success: bool = True, 
        error_message: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """End profiling an operation."""
        if not self.enabled or operation_id not in self.active_operations:
            return
        
        profile = self.active_operations.pop(operation_id)
        profile.end_time = datetime.now()
        profile.duration_ms = (profile.end_time - profile.start_time).total_seconds() * 1000
        profile.success = success
        profile.error_message = error_message
        
        if metadata:
            profile.metadata.update(metadata)
        
        # Add to history
        self.profile_history.append(profile)
        
        # Update service metrics
        self._update_service_metrics(profile)
        
        # Check for alerts
        self._check_alerts(profile)
        
        if DEBUG_RAG_OPERATIONS:
            status = "✅" if success else "❌"
            logger.info(f"🦊 [PROFILER] {status} Operation {profile.operation_type} completed in {profile.duration_ms:.2f}ms")
        
        if not success and error_message:
            logger.error(f"🚨 [PROFILER] Operation failed: {error_message}")

    def _update_service_metrics(self, profile: OperationProfile) -> None:
        """Update service metrics based on profile."""
        service_name = profile.metadata.get("service_name", "unknown")
        metrics = self.service_metrics[service_name]
        
        if not metrics.service_name:
            metrics.service_name = service_name
        
        metrics.total_operations += 1
        metrics.total_duration_ms += profile.duration_ms
        metrics.last_operation_time = profile.end_time
        
        if profile.success:
            metrics.successful_operations += 1
        else:
            metrics.failed_operations += 1
        
        # Update duration statistics
        metrics.min_duration_ms = min(metrics.min_duration_ms, profile.duration_ms)
        metrics.max_duration_ms = max(metrics.max_duration_ms, profile.duration_ms)
        metrics.average_duration_ms = metrics.total_duration_ms / metrics.total_operations
        
        # Calculate error rate
        metrics.error_rate = metrics.failed_operations / metrics.total_operations
        
        # Calculate operations per minute (last 5 minutes)
        now = datetime.now()
        recent_operations = [
            p for p in self.profile_history 
            if p.metadata.get("service_name") == service_name 
            and p.end_time and (now - p.end_time).total_seconds() < 300
        ]
        metrics.operations_per_minute = len(recent_operations) / 5.0

    def _check_alerts(self, profile: OperationProfile) -> None:
        """Check for performance alerts."""
        service_name = profile.metadata.get("service_name", "unknown")
        metrics = self.service_metrics[service_name]
        
        # Check for slow operations
        if profile.duration_ms > self.slow_operation_threshold_ms:
            alert = {
                "type": "slow_operation",
                "service": service_name,
                "operation": profile.operation_type,
                "duration_ms": profile.duration_ms,
                "threshold_ms": self.slow_operation_threshold_ms,
                "timestamp": profile.end_time.isoformat(),
                "severity": "warning"
            }
            self.alerts.append(alert)
            logger.warning(f"🚨 [PROFILER] Slow operation detected: {profile.operation_type} took {profile.duration_ms:.2f}ms")
        
        # Check for high error rate
        if metrics.total_operations > 10 and metrics.error_rate > self.error_rate_threshold:
            alert = {
                "type": "high_error_rate",
                "service": service_name,
                "error_rate": metrics.error_rate,
                "threshold": self.error_rate_threshold,
                "timestamp": datetime.now().isoformat(),
                "severity": "error"
            }
            self.alerts.append(alert)
            logger.error(f"🚨 [PROFILER] High error rate detected: {service_name} has {metrics.error_rate:.2%} error rate")

    async def _background_monitoring(self) -> None:
        """Background monitoring task."""
        while self.status == ServiceStatus.HEALTHY:
            try:
                # Monitor system resources
                await self._monitor_system_resources()
                
                # Clean up old alerts
                self._cleanup_old_alerts()
                
                # Log periodic statistics
                await self._log_periodic_stats()
                
                await asyncio.sleep(30)  # Monitor every 30 seconds
                
            except Exception as e:
                logger.error(f"Background monitoring error: {e}")
                await asyncio.sleep(60)  # Wait longer on error

    async def _monitor_system_resources(self) -> None:
        """Monitor system resource usage."""
        try:
            import psutil
            
            # Get memory usage
            memory_info = psutil.virtual_memory()
            memory_usage_mb = memory_info.used / 1024 / 1024
            
            # Get CPU usage
            cpu_usage = psutil.cpu_percent(interval=1)
            
            self.memory_samples.append(memory_usage_mb)
            self.cpu_samples.append(cpu_usage)
            
            # Check for high memory usage
            if memory_usage_mb > self.alert_thresholds["memory_usage_mb"]:
                alert = {
                    "type": "high_memory_usage",
                    "memory_usage_mb": memory_usage_mb,
                    "threshold_mb": self.alert_thresholds["memory_usage_mb"],
                    "timestamp": datetime.now().isoformat(),
                    "severity": "warning"
                }
                self.alerts.append(alert)
                logger.warning(f"🚨 [PROFILER] High memory usage: {memory_usage_mb:.2f}MB")
            
        except ImportError:
            pass  # psutil not available
        except Exception as e:
            logger.error(f"Resource monitoring error: {e}")

    def _cleanup_old_alerts(self) -> None:
        """Clean up old alerts."""
        cutoff_time = datetime.now() - timedelta(hours=1)
        self.alerts = [
            alert for alert in self.alerts
            if datetime.fromisoformat(alert["timestamp"]) > cutoff_time
        ]

    async def _log_periodic_stats(self) -> None:
        """Log periodic statistics."""
        if not self.service_metrics:
            return
        
        logger.info("🦊 [PROFILER] === RAG Performance Summary ===")
        for service_name, metrics in self.service_metrics.items():
            if metrics.total_operations > 0:
                logger.info(
                    f"🦊 [PROFILER] {service_name}: "
                    f"{metrics.total_operations} ops, "
                    f"{metrics.average_duration_ms:.2f}ms avg, "
                    f"{metrics.error_rate:.2%} error rate, "
                    f"{metrics.operations_per_minute:.1f} ops/min"
                )
        
        if self.alerts:
            logger.warning(f"🚨 [PROFILER] {len(self.alerts)} active alerts")
        
        logger.info("🦊 [PROFILER] =================================")

    def get_performance_summary(self) -> Dict[str, Any]:
        """Get comprehensive performance summary."""
        return {
            "enabled": self.enabled,
            "total_operations": len(self.profile_history),
            "active_operations": len(self.active_operations),
            "service_metrics": {
                name: {
                    "total_operations": metrics.total_operations,
                    "successful_operations": metrics.successful_operations,
                    "failed_operations": metrics.failed_operations,
                    "average_duration_ms": metrics.average_duration_ms,
                    "min_duration_ms": metrics.min_duration_ms,
                    "max_duration_ms": metrics.max_duration_ms,
                    "error_rate": metrics.error_rate,
                    "operations_per_minute": metrics.operations_per_minute,
                }
                for name, metrics in self.service_metrics.items()
            },
            "recent_alerts": self.alerts[-10:],  # Last 10 alerts
            "system_resources": {
                "avg_memory_mb": sum(self.memory_samples) / len(self.memory_samples) if self.memory_samples else 0,
                "avg_cpu_percent": sum(self.cpu_samples) / len(self.cpu_samples) if self.cpu_samples else 0,
            },
            "performance_thresholds": self.alert_thresholds,
        }

    def get_service_metrics(self, service_name: str) -> Optional[Dict[str, Any]]:
        """Get metrics for a specific service."""
        if service_name not in self.service_metrics:
            return None
        
        metrics = self.service_metrics[service_name]
        return {
            "service_name": metrics.service_name,
            "total_operations": metrics.total_operations,
            "successful_operations": metrics.successful_operations,
            "failed_operations": metrics.failed_operations,
            "average_duration_ms": metrics.average_duration_ms,
            "min_duration_ms": metrics.min_duration_ms,
            "max_duration_ms": metrics.max_duration_ms,
            "error_rate": metrics.error_rate,
            "operations_per_minute": metrics.operations_per_minute,
            "last_operation_time": metrics.last_operation_time.isoformat() if metrics.last_operation_time else None,
        }

    def get_recent_operations(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent operations."""
        recent = list(self.profile_history)[-limit:]
        return [
            {
                "operation_type": profile.operation_type,
                "start_time": profile.start_time.isoformat(),
                "end_time": profile.end_time.isoformat() if profile.end_time else None,
                "duration_ms": profile.duration_ms,
                "success": profile.success,
                "error_message": profile.error_message,
                "metadata": profile.metadata,
            }
            for profile in recent
        ]

    def clear_metrics(self) -> None:
        """Clear all metrics and history."""
        self.profile_history.clear()
        self.active_operations.clear()
        self.service_metrics.clear()
        self.alerts.clear()
        self.memory_samples.clear()
        self.cpu_samples.clear()
        logger.info("🦊 [PROFILER] All metrics cleared")


# Global profiler instance
_rag_profiler: Optional[RAGProfiler] = None


def get_rag_profiler() -> RAGProfiler:
    """Get the global RAG profiler instance."""
    global _rag_profiler
    if _rag_profiler is None:
        _rag_profiler = RAGProfiler()
    return _rag_profiler


def profile_operation(operation_type: str, service_name: str, metadata: Optional[Dict[str, Any]] = None):
    """Decorator to profile an operation."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            profiler = get_rag_profiler()
            operation_id = profiler.start_operation(operation_type, service_name, metadata)
            
            try:
                result = await func(*args, **kwargs)
                profiler.end_operation(operation_id, success=True)
                return result
            except Exception as e:
                profiler.end_operation(operation_id, success=False, error_message=str(e))
                raise
        
        return wrapper
    return decorator


# Enable debug logging for RAG operations
DEBUG_RAG_OPERATIONS = True
