"""
Performance monitoring and benchmarking package for FastAPI ECS backend.

This package provides comprehensive performance monitoring including:
- Real-time request/response tracking
- Memory usage monitoring
- Database query profiling
- Async task performance tracking
- Bottleneck detection and analysis
- Load testing and benchmarking tools
"""

from .analyzer import PerformanceAnalyzer
from .benchmark_cli import BenchmarkConfig, LoadTester, PerformanceProfiler
from .endpoints import router as performance_router
from .middleware import (
    MemoryProfiler,
    PerformanceMiddleware,
    PerformanceTracker,
    memory_profiler,
    performance_tracker,
    track_async_task,
    track_db_query,
)

__all__ = [
    "PerformanceMiddleware",
    "PerformanceTracker",
    "MemoryProfiler",
    "performance_tracker",
    "memory_profiler",
    "track_async_task",
    "track_db_query",
    "PerformanceAnalyzer",
    "performance_router",
    "LoadTester",
    "PerformanceProfiler",
    "BenchmarkConfig",
]
