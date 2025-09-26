"""Performance monitoring middleware for FastAPI ECS backend.

This module provides comprehensive performance tracking including:
- Request/response timing
- Memory usage monitoring
- Database query profiling
- Async task performance tracking
- Bottleneck detection and analysis
"""

import asyncio
import logging
import threading
import time
import tracemalloc
from collections import defaultdict, deque
from collections.abc import Callable
from contextlib import asynccontextmanager
from dataclasses import dataclass
from datetime import datetime
from typing import Any

import psutil

try:
    from fastapi import Request, Response
    from fastapi.middleware.base import BaseHTTPMiddleware
    from starlette.middleware.base import RequestResponseEndpoint
except ImportError:
    # Fallback for when FastAPI is not available
    BaseHTTPMiddleware = object
    Request = object
    Response = object
    RequestResponseEndpoint = object

logger = logging.getLogger(__name__)


@dataclass
class PerformanceMetrics:
    """Container for performance metrics."""

    endpoint: str
    method: str
    start_time: float
    end_time: float
    duration: float
    memory_before: int
    memory_after: int
    memory_peak: int
    db_queries: int = 0
    db_query_time: float = 0.0
    async_tasks: int = 0
    async_task_time: float = 0.0
    status_code: int = 200
    request_size: int = 0
    response_size: int = 0
    error_message: str | None = None


@dataclass
class DatabaseQuery:
    """Database query performance data."""

    query: str
    duration: float
    timestamp: float
    parameters: dict[str, Any] | None = None
    rows_affected: int | None = None


@dataclass
class AsyncTask:
    """Async task performance data."""

    task_name: str
    duration: float
    timestamp: float
    success: bool = True
    error_message: str | None = None


class PerformanceTracker:
    """Central performance tracking system."""

    def __init__(self, max_history: int = 1000):
        self.max_history = max_history
        self.metrics_history: deque = deque(maxlen=max_history)
        self.db_queries: list[DatabaseQuery] = []
        self.async_tasks: list[AsyncTask] = []
        self.endpoint_stats: dict[str, dict[str, Any]] = defaultdict(
            lambda: {
                "total_requests": 0,
                "total_duration": 0.0,
                "avg_duration": 0.0,
                "min_duration": float("inf"),
                "max_duration": 0.0,
                "error_count": 0,
                "memory_usage": deque(maxlen=100),
                "db_queries": deque(maxlen=100),
                "async_tasks": deque(maxlen=100),
            },
        )
        self._lock = threading.Lock()
        self._active_requests: dict[str, PerformanceMetrics] = {}

    def start_request(
        self,
        request_id: str,
        endpoint: str,
        method: str,
    ) -> PerformanceMetrics:
        """Start tracking a request."""
        with self._lock:
            metrics = PerformanceMetrics(
                endpoint=endpoint,
                method=method,
                start_time=time.time(),
                end_time=0.0,
                duration=0.0,
                memory_before=psutil.Process().memory_info().rss,
                memory_after=0,
                memory_peak=0,
            )
            self._active_requests[request_id] = metrics
            return metrics

    def end_request(
        self,
        request_id: str,
        status_code: int = 200,
        error_message: str | None = None,
    ) -> PerformanceMetrics | None:
        """End tracking a request."""
        with self._lock:
            if request_id not in self._active_requests:
                return None

            metrics = self._active_requests.pop(request_id)
            metrics.end_time = time.time()
            metrics.duration = metrics.end_time - metrics.start_time
            metrics.memory_after = psutil.Process().memory_info().rss
            metrics.memory_peak = max(metrics.memory_before, metrics.memory_after)
            metrics.status_code = status_code
            metrics.error_message = error_message

            # Update endpoint statistics
            endpoint_key = f"{metrics.method} {metrics.endpoint}"
            stats = self.endpoint_stats[endpoint_key]
            stats["total_requests"] += 1
            stats["total_duration"] += metrics.duration
            stats["avg_duration"] = stats["total_duration"] / stats["total_requests"]
            stats["min_duration"] = min(stats["min_duration"], metrics.duration)
            stats["max_duration"] = max(stats["max_duration"], metrics.duration)
            stats["memory_usage"].append(metrics.memory_peak)

            if status_code >= 400:
                stats["error_count"] += 1

            self.metrics_history.append(metrics)
            return metrics

    def add_db_query(
        self,
        query: str,
        duration: float,
        parameters: dict[str, Any] | None = None,
        rows_affected: int | None = None,
    ):
        """Add database query performance data."""
        db_query = DatabaseQuery(
            query=query,
            duration=duration,
            timestamp=time.time(),
            parameters=parameters,
            rows_affected=rows_affected,
        )
        self.db_queries.append(db_query)

        # Update endpoint stats if we have an active request
        with self._lock:
            for metrics in self._active_requests.values():
                metrics.db_queries += 1
                metrics.db_query_time += duration

    def add_async_task(
        self,
        task_name: str,
        duration: float,
        success: bool = True,
        error_message: str | None = None,
    ):
        """Add async task performance data."""
        async_task = AsyncTask(
            task_name=task_name,
            duration=duration,
            timestamp=time.time(),
            success=success,
            error_message=error_message,
        )
        self.async_tasks.append(async_task)

        # Update endpoint stats if we have an active request
        with self._lock:
            for metrics in self._active_requests.values():
                metrics.async_tasks += 1
                metrics.async_task_time += duration

    def get_performance_summary(self) -> dict[str, Any]:
        """Get comprehensive performance summary."""
        with self._lock:
            recent_metrics = list(self.metrics_history)[-100:]  # Last 100 requests

            if not recent_metrics:
                return {"message": "No performance data available"}

            total_requests = len(recent_metrics)
            total_duration = sum(m.duration for m in recent_metrics)
            avg_duration = total_duration / total_requests
            max_duration = max(m.duration for m in recent_metrics)
            min_duration = min(m.duration for m in recent_metrics)

            error_count = sum(1 for m in recent_metrics if m.status_code >= 400)
            error_rate = (error_count / total_requests) * 100

            total_memory = sum(m.memory_peak for m in recent_metrics)
            avg_memory = total_memory / total_requests

            total_db_queries = sum(m.db_queries for m in recent_metrics)
            total_db_time = sum(m.db_query_time for m in recent_metrics)

            total_async_tasks = sum(m.async_tasks for m in recent_metrics)
            total_async_time = sum(m.async_task_time for m in recent_metrics)

            # Find slowest endpoints
            endpoint_performance = {}
            for endpoint, stats in self.endpoint_stats.items():
                if stats["total_requests"] > 0:
                    endpoint_performance[endpoint] = {
                        "requests": stats["total_requests"],
                        "avg_duration": stats["avg_duration"],
                        "max_duration": stats["max_duration"],
                        "error_rate": (stats["error_count"] / stats["total_requests"])
                        * 100,
                        "avg_memory": (
                            sum(stats["memory_usage"]) / len(stats["memory_usage"])
                            if stats["memory_usage"]
                            else 0
                        ),
                    }

            slowest_endpoints = sorted(
                endpoint_performance.items(),
                key=lambda x: x[1]["avg_duration"],
                reverse=True,
            )[:10]

            return {
                "summary": {
                    "total_requests": total_requests,
                    "avg_duration_ms": round(avg_duration * 1000, 2),
                    "max_duration_ms": round(max_duration * 1000, 2),
                    "min_duration_ms": round(min_duration * 1000, 2),
                    "error_rate_percent": round(error_rate, 2),
                    "avg_memory_mb": round(avg_memory / 1024 / 1024, 2),
                    "total_db_queries": total_db_queries,
                    "total_db_time_ms": round(total_db_time * 1000, 2),
                    "total_async_tasks": total_async_tasks,
                    "total_async_time_ms": round(total_async_time * 1000, 2),
                },
                "slowest_endpoints": slowest_endpoints,
                "endpoint_stats": endpoint_performance,
                "timestamp": datetime.now().isoformat(),
            }


# Global performance tracker instance
performance_tracker = PerformanceTracker()


class PerformanceMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware for performance monitoring."""

    def __init__(self, app, enable_memory_tracking: bool = True):
        super().__init__(app)
        self.enable_memory_tracking = enable_memory_tracking
        if enable_memory_tracking:
            tracemalloc.start()

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        """Process request with performance tracking."""
        request_id = f"{request.client.host}:{request.client.port}:{time.time()}"
        endpoint = str(request.url.path)
        method = request.method

        # Start tracking
        metrics = performance_tracker.start_request(request_id, endpoint, method)

        try:
            # Process request
            response = await call_next(request)

            # Update metrics
            metrics.status_code = response.status_code
            metrics.request_size = int(request.headers.get("content-length", 0))
            metrics.response_size = int(response.headers.get("content-length", 0))

            return response

        except Exception as e:
            # Track error
            error_message = str(e)
            logger.error(f"Request error: {error_message}")
            performance_tracker.end_request(request_id, 500, error_message)
            raise

        finally:
            # End tracking
            performance_tracker.end_request(
                request_id,
                metrics.status_code,
                metrics.error_message,
            )


@asynccontextmanager
async def track_async_task(task_name: str):
    """Context manager for tracking async task performance."""
    start_time = time.time()
    success = True
    error_message = None

    try:
        yield
    except Exception as e:
        success = False
        error_message = str(e)
        raise
    finally:
        duration = time.time() - start_time
        performance_tracker.add_async_task(task_name, duration, success, error_message)


def track_db_query(
    query: str,
    parameters: dict[str, Any] | None = None,
    rows_affected: int | None = None,
):
    """Decorator for tracking database query performance."""

    def decorator(func: Callable) -> Callable:
        if asyncio.iscoroutinefunction(func):

            async def async_wrapper(*args, **kwargs):
                start_time = time.time()
                try:
                    result = await func(*args, **kwargs)
                    duration = time.time() - start_time
                    performance_tracker.add_db_query(
                        query,
                        duration,
                        parameters,
                        rows_affected,
                    )
                    return result
                except Exception:
                    duration = time.time() - start_time
                    performance_tracker.add_db_query(query, duration, parameters, None)
                    raise

            return async_wrapper

        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                performance_tracker.add_db_query(
                    query,
                    duration,
                    parameters,
                    rows_affected,
                )
                return result
            except Exception:
                duration = time.time() - start_time
                performance_tracker.add_db_query(query, duration, parameters, None)
                raise

        return sync_wrapper

    return decorator


class MemoryProfiler:
    """Memory usage profiler and leak detector."""

    def __init__(self, check_interval: float = 5.0):
        self.check_interval = check_interval
        self.memory_snapshots: list[dict[str, Any]] = []
        self._running = False
        self._thread: threading.Thread | None = None

    def start(self):
        """Start memory profiling."""
        if self._running:
            return

        self._running = True
        self._thread = threading.Thread(target=self._profile_loop, daemon=True)
        self._thread.start()
        logger.info("Memory profiler started")

    def stop(self):
        """Stop memory profiling."""
        self._running = False
        if self._thread:
            self._thread.join()
        logger.info("Memory profiler stopped")

    def _profile_loop(self):
        """Main profiling loop."""
        while self._running:
            try:
                process = psutil.Process()
                memory_info = process.memory_info()
                memory_percent = process.memory_percent()

                snapshot = {
                    "timestamp": time.time(),
                    "rss_mb": memory_info.rss / 1024 / 1024,
                    "vms_mb": memory_info.vms / 1024 / 1024,
                    "percent": memory_percent,
                    "num_threads": process.num_threads(),
                    "num_fds": process.num_fds() if hasattr(process, "num_fds") else 0,
                }

                self.memory_snapshots.append(snapshot)

                # Keep only last 1000 snapshots
                if len(self.memory_snapshots) > 1000:
                    self.memory_snapshots = self.memory_snapshots[-1000:]

                time.sleep(self.check_interval)

            except Exception as e:
                logger.error(f"Memory profiling error: {e}")
                time.sleep(self.check_interval)

    def get_memory_summary(self) -> dict[str, Any]:
        """Get memory usage summary."""
        if not self.memory_snapshots:
            return {"message": "No memory data available"}

        recent_snapshots = self.memory_snapshots[-100:]  # Last 100 snapshots

        rss_values = [s["rss_mb"] for s in recent_snapshots]
        vms_values = [s["vms_mb"] for s in recent_snapshots]
        percent_values = [s["percent"] for s in recent_snapshots]

        return {
            "current_memory_mb": rss_values[-1] if rss_values else 0,
            "avg_memory_mb": sum(rss_values) / len(rss_values) if rss_values else 0,
            "max_memory_mb": max(rss_values) if rss_values else 0,
            "min_memory_mb": min(rss_values) if rss_values else 0,
            "avg_memory_percent": (
                sum(percent_values) / len(percent_values) if percent_values else 0
            ),
            "memory_trend": (
                "increasing"
                if len(rss_values) > 1 and rss_values[-1] > rss_values[0]
                else "stable"
            ),
            "snapshots_count": len(self.memory_snapshots),
            "timestamp": datetime.now().isoformat(),
        }


# Global memory profiler instance
memory_profiler = MemoryProfiler()
