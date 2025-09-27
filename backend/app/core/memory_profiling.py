"""🦊 Memory Profiling Decorators and Utilities
=============================================

Memory profiling decorators and utilities for tracking memory usage
in RAG components and other services.

Features:
- Function-level memory profiling decorators
- Context managers for operation tracing
- Memory usage tracking with call stack information
- Integration with the memory debug tracer
- Performance impact minimization

Author: Reynard Development Team
Version: 1.0.0
"""

import functools
import gc
import logging
import psutil
import time
import tracemalloc
from contextlib import contextmanager
from typing import Any, Callable, Dict, List, Optional, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)


class MemoryProfiler:
    """Memory profiler for tracking function and operation memory usage."""
    
    def __init__(self, enable_tracemalloc: bool = True):
        """Initialize the memory profiler."""
        self.enable_tracemalloc = enable_tracemalloc
        self.tracemalloc_started = False
        self.profiles: List[Dict[str, Any]] = []
    
    def start_tracing(self) -> None:
        """Start tracemalloc tracing."""
        if self.enable_tracemalloc and not tracemalloc.is_tracing():
            tracemalloc.start()
            self.tracemalloc_started = True
            logger.debug("Tracemalloc started")
    
    def stop_tracing(self) -> None:
        """Stop tracemalloc tracing."""
        if self.tracemalloc_started and tracemalloc.is_tracing():
            tracemalloc.stop()
            self.tracemalloc_started = False
            logger.debug("Tracemalloc stopped")
    
    def get_memory_snapshot(self) -> Dict[str, Any]:
        """Get current memory snapshot."""
        process = psutil.Process()
        memory_info = process.memory_info()
        
        snapshot = {
            "timestamp": datetime.now(),
            "memory_mb": memory_info.rss / 1024 / 1024,
            "memory_percent": process.memory_percent(),
            "cpu_percent": process.cpu_percent(),
            "num_threads": process.num_threads(),
            "gc_counts": gc.get_count(),
        }
        
        if self.tracemalloc_started:
            try:
                current, peak = tracemalloc.get_traced_memory()
                snapshot.update({
                    "tracemalloc_current_mb": current / 1024 / 1024,
                    "tracemalloc_peak_mb": peak / 1024 / 1024,
                })
            except Exception:
                pass
        
        return snapshot
    
    def record_profile(self, profile_data: Dict[str, Any]) -> None:
        """Record a memory profile."""
        self.profiles.append(profile_data)
        
        # Keep only last 1000 profiles to prevent memory growth
        if len(self.profiles) > 1000:
            self.profiles = self.profiles[-1000:]


# Global memory profiler instance
_memory_profiler = MemoryProfiler()


def memory_profile(
    component: str = "unknown",
    operation: str = "unknown",
    track_memory: bool = True,
    track_time: bool = True,
    log_threshold_mb: float = 10.0,
    enable_tracemalloc: bool = False
):
    """Decorator for profiling memory usage of functions.
    
    Args:
        component: Component name (e.g., 'embedding_service', 'vector_store')
        operation: Operation name (e.g., 'embed_text', 'search')
        track_memory: Whether to track memory usage
        track_time: Whether to track execution time
        log_threshold_mb: Log if memory usage exceeds this threshold (MB)
        enable_tracemalloc: Whether to enable tracemalloc for this function
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Get initial memory snapshot
            initial_snapshot = _memory_profiler.get_memory_snapshot()
            start_time = time.time()
            
            # Start tracemalloc if requested
            tracemalloc_was_tracing = tracemalloc.is_tracing()
            if enable_tracemalloc and not tracemalloc_was_tracing:
                tracemalloc.start()
            
            try:
                # Execute the function
                result = await func(*args, **kwargs)
                
                # Get final memory snapshot
                final_snapshot = _memory_profiler.get_memory_snapshot()
                end_time = time.time()
                
                # Calculate metrics
                memory_used_mb = final_snapshot["memory_mb"] - initial_snapshot["memory_mb"]
                execution_time_ms = (end_time - start_time) * 1000
                
                # Create profile data
                profile_data = {
                    "component": component,
                    "operation": operation,
                    "function": func.__name__,
                    "timestamp": datetime.now(),
                    "execution_time_ms": execution_time_ms,
                    "memory_used_mb": memory_used_mb,
                    "initial_memory_mb": initial_snapshot["memory_mb"],
                    "final_memory_mb": final_snapshot["memory_mb"],
                    "memory_percent": final_snapshot["memory_percent"],
                    "cpu_percent": final_snapshot["cpu_percent"],
                    "gc_counts": final_snapshot["gc_counts"],
                }
                
                # Add tracemalloc data if available
                if enable_tracemalloc and tracemalloc.is_tracing():
                    try:
                        current, peak = tracemalloc.get_traced_memory()
                        profile_data.update({
                            "tracemalloc_current_mb": current / 1024 / 1024,
                            "tracemalloc_peak_mb": peak / 1024 / 1024,
                        })
                    except Exception:
                        pass
                
                # Record profile
                _memory_profiler.record_profile(profile_data)
                
                # Log if threshold exceeded
                if memory_used_mb > log_threshold_mb:
                    logger.warning(
                        f"⚠️ High memory usage in {component}.{operation}: "
                        f"{memory_used_mb:.1f}MB in {execution_time_ms:.1f}ms"
                    )
                elif track_memory or track_time:
                    logger.debug(
                        f"📊 {component}.{operation}: "
                        f"{memory_used_mb:.1f}MB in {execution_time_ms:.1f}ms"
                    )
                
                return result
                
            except Exception as e:
                # Still record profile data for failed operations
                final_snapshot = _memory_profiler.get_memory_snapshot()
                end_time = time.time()
                
                memory_used_mb = final_snapshot["memory_mb"] - initial_snapshot["memory_mb"]
                execution_time_ms = (end_time - start_time) * 1000
                
                profile_data = {
                    "component": component,
                    "operation": operation,
                    "function": func.__name__,
                    "timestamp": datetime.now(),
                    "execution_time_ms": execution_time_ms,
                    "memory_used_mb": memory_used_mb,
                    "initial_memory_mb": initial_snapshot["memory_mb"],
                    "final_memory_mb": final_snapshot["memory_mb"],
                    "error": str(e),
                }
                
                _memory_profiler.record_profile(profile_data)
                
                logger.error(
                    f"❌ Error in {component}.{operation}: {e} "
                    f"(memory: {memory_used_mb:.1f}MB, time: {execution_time_ms:.1f}ms)"
                )
                
                raise
                
            finally:
                # Stop tracemalloc if we started it
                if enable_tracemalloc and not tracemalloc_was_tracing and tracemalloc.is_tracing():
                    tracemalloc.stop()
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            # Get initial memory snapshot
            initial_snapshot = _memory_profiler.get_memory_snapshot()
            start_time = time.time()
            
            # Start tracemalloc if requested
            tracemalloc_was_tracing = tracemalloc.is_tracing()
            if enable_tracemalloc and not tracemalloc_was_tracing:
                tracemalloc.start()
            
            try:
                # Execute the function
                result = func(*args, **kwargs)
                
                # Get final memory snapshot
                final_snapshot = _memory_profiler.get_memory_snapshot()
                end_time = time.time()
                
                # Calculate metrics
                memory_used_mb = final_snapshot["memory_mb"] - initial_snapshot["memory_mb"]
                execution_time_ms = (end_time - start_time) * 1000
                
                # Create profile data
                profile_data = {
                    "component": component,
                    "operation": operation,
                    "function": func.__name__,
                    "timestamp": datetime.now(),
                    "execution_time_ms": execution_time_ms,
                    "memory_used_mb": memory_used_mb,
                    "initial_memory_mb": initial_snapshot["memory_mb"],
                    "final_memory_mb": final_snapshot["memory_mb"],
                    "memory_percent": final_snapshot["memory_percent"],
                    "cpu_percent": final_snapshot["cpu_percent"],
                    "gc_counts": final_snapshot["gc_counts"],
                }
                
                # Add tracemalloc data if available
                if enable_tracemalloc and tracemalloc.is_tracing():
                    try:
                        current, peak = tracemalloc.get_traced_memory()
                        profile_data.update({
                            "tracemalloc_current_mb": current / 1024 / 1024,
                            "tracemalloc_peak_mb": peak / 1024 / 1024,
                        })
                    except Exception:
                        pass
                
                # Record profile
                _memory_profiler.record_profile(profile_data)
                
                # Log if threshold exceeded
                if memory_used_mb > log_threshold_mb:
                    logger.warning(
                        f"⚠️ High memory usage in {component}.{operation}: "
                        f"{memory_used_mb:.1f}MB in {execution_time_ms:.1f}ms"
                    )
                elif track_memory or track_time:
                    logger.debug(
                        f"📊 {component}.{operation}: "
                        f"{memory_used_mb:.1f}MB in {execution_time_ms:.1f}ms"
                    )
                
                return result
                
            except Exception as e:
                # Still record profile data for failed operations
                final_snapshot = _memory_profiler.get_memory_snapshot()
                end_time = time.time()
                
                memory_used_mb = final_snapshot["memory_mb"] - initial_snapshot["memory_mb"]
                execution_time_ms = (end_time - start_time) * 1000
                
                profile_data = {
                    "component": component,
                    "operation": operation,
                    "function": func.__name__,
                    "timestamp": datetime.now(),
                    "execution_time_ms": execution_time_ms,
                    "memory_used_mb": memory_used_mb,
                    "initial_memory_mb": initial_snapshot["memory_mb"],
                    "final_memory_mb": final_snapshot["memory_mb"],
                    "error": str(e),
                }
                
                _memory_profiler.record_profile(profile_data)
                
                logger.error(
                    f"❌ Error in {component}.{operation}: {e} "
                    f"(memory: {memory_used_mb:.1f}MB, time: {execution_time_ms:.1f}ms)"
                )
                
                raise
                
            finally:
                # Stop tracemalloc if we started it
                if enable_tracemalloc and not tracemalloc_was_tracing and tracemalloc.is_tracing():
                    tracemalloc.stop()
        
        # Return appropriate wrapper based on function type
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


@contextmanager
def memory_trace(component: str, operation: str, log_threshold_mb: float = 10.0):
    """Context manager for tracing memory usage of code blocks.
    
    Args:
        component: Component name
        operation: Operation name
        log_threshold_mb: Log if memory usage exceeds this threshold (MB)
    """
    # Get initial memory snapshot
    initial_snapshot = _memory_profiler.get_memory_snapshot()
    start_time = time.time()
    
    try:
        yield
        
    finally:
        # Get final memory snapshot
        final_snapshot = _memory_profiler.get_memory_snapshot()
        end_time = time.time()
        
        # Calculate metrics
        memory_used_mb = final_snapshot["memory_mb"] - initial_snapshot["memory_mb"]
        execution_time_ms = (end_time - start_time) * 1000
        
        # Create profile data
        profile_data = {
            "component": component,
            "operation": operation,
            "timestamp": datetime.now(),
            "execution_time_ms": execution_time_ms,
            "memory_used_mb": memory_used_mb,
            "initial_memory_mb": initial_snapshot["memory_mb"],
            "final_memory_mb": final_snapshot["memory_mb"],
            "memory_percent": final_snapshot["memory_percent"],
            "cpu_percent": final_snapshot["cpu_percent"],
            "gc_counts": final_snapshot["gc_counts"],
        }
        
        # Record profile
        _memory_profiler.record_profile(profile_data)
        
        # Log if threshold exceeded
        if memory_used_mb > log_threshold_mb:
            logger.warning(
                f"⚠️ High memory usage in {component}.{operation}: "
                f"{memory_used_mb:.1f}MB in {execution_time_ms:.1f}ms"
            )
        else:
            logger.debug(
                f"📊 {component}.{operation}: "
                f"{memory_used_mb:.1f}MB in {execution_time_ms:.1f}ms"
            )


def get_memory_profiles(component: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
    """Get memory profiles, optionally filtered by component.
    
    Args:
        component: Filter by component name
        limit: Maximum number of profiles to return
    
    Returns:
        List of memory profiles
    """
    profiles = _memory_profiler.profiles
    
    if component:
        profiles = [p for p in profiles if p.get("component") == component]
    
    return profiles[-limit:] if limit else profiles


def get_memory_stats(component: Optional[str] = None) -> Dict[str, Any]:
    """Get memory statistics for a component or overall.
    
    Args:
        component: Filter by component name
    
    Returns:
        Memory statistics dictionary
    """
    profiles = get_memory_profiles(component)
    
    if not profiles:
        return {"error": "No profiles available"}
    
    memory_usage = [p["memory_used_mb"] for p in profiles if "memory_used_mb" in p]
    execution_times = [p["execution_time_ms"] for p in profiles if "execution_time_ms" in p]
    
    stats = {
        "total_operations": len(profiles),
        "component": component or "all",
    }
    
    if memory_usage:
        stats.update({
            "memory_usage_mb": {
                "min": min(memory_usage),
                "max": max(memory_usage),
                "average": sum(memory_usage) / len(memory_usage),
                "total": sum(memory_usage),
            }
        })
    
    if execution_times:
        stats.update({
            "execution_time_ms": {
                "min": min(execution_times),
                "max": max(execution_times),
                "average": sum(execution_times) / len(execution_times),
                "total": sum(execution_times),
            }
        })
    
    # Add error statistics
    error_count = len([p for p in profiles if "error" in p])
    stats["error_count"] = error_count
    stats["success_rate"] = (len(profiles) - error_count) / len(profiles) if profiles else 0
    
    return stats


def clear_memory_profiles() -> None:
    """Clear all memory profiles."""
    _memory_profiler.profiles.clear()
    logger.info("Memory profiles cleared")


def start_memory_tracing() -> None:
    """Start global memory tracing."""
    _memory_profiler.start_tracing()


def stop_memory_tracing() -> None:
    """Stop global memory tracing."""
    _memory_profiler.stop_tracing()


# Import asyncio for coroutine detection
import asyncio
