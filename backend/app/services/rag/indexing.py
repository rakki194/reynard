"""Indexing Service
=================

File indexing service with memory management, batch processing, and performance monitoring.
Processes files in configurable batches with memory usage tracking and automatic cleanup.

Features:
- Configurable batch processing with memory limits
- Thread pool execution with concurrency control
- Memory profiling and leak detection
- Progress tracking with performance metrics
- Automatic garbage collection and cleanup
- Error handling and recovery

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import gc
import logging
import os
import psutil
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from app.core.debug_logging import DebugLogContext, RAGOperationLogger
from app.ecs.performance.middleware import MemoryProfiler
from app.services.rag.services.monitoring.rag_profiler import RAGProfiler
from app.utils.executor_batch import BatchExecutor
from app.utils.executor_core import ThreadPoolExecutorManager

logger = logging.getLogger("uvicorn")

# Memory management configuration from environment variables
DEFAULT_BATCH_SIZE = int(os.getenv("INDEXING_BATCH_SIZE", "5"))
DEFAULT_MAX_MEMORY_MB = int(os.getenv("INDEXING_MAX_MEMORY_MB", "1024"))
DEFAULT_MEMORY_CLEANUP_THRESHOLD = float(os.getenv("INDEXING_MEMORY_CLEANUP_THRESHOLD", "0.8"))
DEFAULT_GC_FREQUENCY = int(os.getenv("INDEXING_GC_FREQUENCY", "3"))
DEFAULT_MEMORY_PROFILER_INTERVAL = float(os.getenv("INDEXING_MEMORY_PROFILER_INTERVAL", "1.0"))


class IndexingService:
    """File indexing service with memory management and batch processing."""

    def __init__(self, config: Dict[str, Any]):
        """Initialize the indexing service."""
        self.config = config
        self.batch_size = config.get("memory_efficient_batch_size", DEFAULT_BATCH_SIZE)
        self.max_memory_mb = config.get("max_memory_mb", DEFAULT_MAX_MEMORY_MB)
        self.memory_cleanup_threshold = config.get(
            "memory_cleanup_threshold", DEFAULT_MEMORY_CLEANUP_THRESHOLD
        )
        self.gc_frequency = config.get("gc_frequency", DEFAULT_GC_FREQUENCY)
        
        # Initialize profiling and monitoring
        self.memory_profiler = MemoryProfiler(check_interval=DEFAULT_MEMORY_PROFILER_INTERVAL)
        self.rag_profiler = RAGProfiler(config)
        self.rag_logger = RAGOperationLogger()
        
        # Initialize batch executor
        from app.utils.executor_core import ExecutorConfig
        executor_config = ExecutorConfig(
            max_workers=min(4, os.cpu_count() or 1),  # Limit workers to prevent memory overload
        )
        self.executor_manager = ThreadPoolExecutorManager(executor_config)
        self.batch_executor = BatchExecutor(self.executor_manager)
        
        # Progress tracking
        self.current_progress = {
            "status": "idle",
            "total_files": 0,
            "processed_files": 0,
            "failed_files": 0,
            "current_batch": 0,
            "total_batches": 0,
            "start_time": None,
            "estimated_completion": None,
            "current_file": None,
            "errors": [],
            "memory_stats": {
                "current_memory_mb": 0,
                "peak_memory_mb": 0,
                "memory_trend": "stable",
                "gc_count": 0,
            },
        }
        
        # Memory tracking
        self.batch_memory_history = []
        self.memory_cleanup_count = 0
        self.forced_gc_count = 0

    async def initialize(self) -> bool:
        """Initialize the indexing service."""
        try:
            with DebugLogContext(logger, "indexing_init"):
                # Start memory profiling
                self.memory_profiler.start()
                
                # Initialize RAG profiler
                await self.rag_profiler.initialize()
                
                # Initialize executor manager
                await self.executor_manager.initialize()
                
                logger.info("✅ Indexing service initialized")
                logger.info(f"   Batch size: {self.batch_size}")
                logger.info(f"   Max memory: {self.max_memory_mb}MB")
                logger.info(f"   Memory cleanup threshold: {self.memory_cleanup_threshold}")
                logger.info(f"   GC frequency: {self.gc_frequency}")
                
                return True
                
        except Exception as e:
            logger.error(f"❌ Failed to initialize indexing service: {e}")
            return False

    async def perform_indexing(
        self, 
        files_to_index: List[Path], 
        indexing_callback: callable,
        force: bool = False
    ) -> Dict[str, Any]:
        """Perform file indexing with memory management and monitoring."""
        if not files_to_index:
            return {"status": "completed", "reason": "No files to index"}

        try:
            with DebugLogContext(logger, "indexing", 
                               total_files=len(files_to_index),
                               batch_size=self.batch_size):
                
                # Initialize progress tracking
                self._initialize_progress(len(files_to_index))
                
                # Calculate batches
                total_batches = (len(files_to_index) + self.batch_size - 1) // self.batch_size
                self.current_progress["total_batches"] = total_batches
                
                logger.info(f"🚀 Starting indexing:")
                logger.info(f"   Files: {len(files_to_index)}")
                logger.info(f"   Batches: {total_batches}")
                logger.info(f"   Batch size: {self.batch_size}")
                logger.info(f"   Max memory: {self.max_memory_mb}MB")
                
                # Process files in batches
                for batch_num in range(total_batches):
                    start_idx = batch_num * self.batch_size
                    end_idx = min(start_idx + self.batch_size, len(files_to_index))
                    batch_files = files_to_index[start_idx:end_idx]
                    
                    await self._process_batch(
                        batch_files, batch_num + 1, total_batches, indexing_callback
                    )
                    
                    # Update progress
                    self._update_progress(batch_num + 1, total_batches)
                    
                    # Memory management between batches
                    await self._manage_memory_between_batches(batch_num + 1)
                    
                    # Small delay to prevent overwhelming the system
                    await asyncio.sleep(0.1)
                
                # Final cleanup and statistics
                await self._finalize_indexing()
                
                return {
                    "status": "completed",
                    "total_files": len(files_to_index),
                    "processed_files": self.current_progress["processed_files"],
                    "failed_files": self.current_progress["failed_files"],
                    "memory_stats": self.current_progress["memory_stats"],
                    "performance_stats": await self._get_performance_stats(),
                }
                
        except Exception as e:
            logger.error(f"❌ Indexing failed: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "progress": self.current_progress,
            }

    async def _process_batch(
        self, 
        batch_files: List[Path], 
        batch_num: int, 
        total_batches: int,
        indexing_callback: callable
    ) -> None:
        """Process a single batch with memory monitoring and cleanup."""
        batch_start_time = time.time()
        batch_memory_start = self._get_current_memory_mb()
        
        with DebugLogContext(logger, "process_batch",
                           batch_num=batch_num,
                           total_batches=total_batches,
                           batch_size=len(batch_files)):
            
            logger.info(f"📦 Processing batch {batch_num}/{total_batches} ({len(batch_files)} files)")
            logger.info(f"   Memory before batch: {batch_memory_start:.1f}MB")
            
            # Check memory before processing
            if not await self._check_memory_before_batch(batch_memory_start):
                logger.warning(f"⚠️ High memory usage before batch {batch_num}, forcing cleanup")
                await self._force_memory_cleanup()
            
            # Process files in the batch
            batch_results = []
            for file_idx, file_path in enumerate(batch_files):
                try:
                    # Update current file progress
                    self.current_progress["current_file"] = str(file_path)
                    
                    # Process individual file
                    result = await self._process_single_file(file_path, indexing_callback)
                    batch_results.append(result)
                    
                    # Update progress
                    if result.get("success", False):
                        self.current_progress["processed_files"] += 1
                    else:
                        self.current_progress["failed_files"] += 1
                        self.current_progress["errors"].append({
                            "file": str(file_path),
                            "error": result.get("error", "Unknown error"),
                            "batch": batch_num,
                        })
                    
                    # Monitor memory during file processing
                    current_memory = self._get_current_memory_mb()
                    if current_memory > self.max_memory_mb * self.memory_cleanup_threshold:
                        logger.warning(f"⚠️ Memory threshold reached during file processing: {current_memory:.1f}MB")
                        await self._force_memory_cleanup()
                    
                except Exception as e:
                    logger.error(f"❌ Failed to process file {file_path}: {e}")
                    self.current_progress["failed_files"] += 1
                    self.current_progress["errors"].append({
                        "file": str(file_path),
                        "error": str(e),
                        "batch": batch_num,
                    })
            
            # Batch completion statistics
            batch_duration = time.time() - batch_start_time
            batch_memory_end = self._get_current_memory_mb()
            batch_memory_used = batch_memory_end - batch_memory_start
            
            # Log batch statistics
            logger.info(f"✅ Batch {batch_num} completed:")
            logger.info(f"   Duration: {batch_duration:.2f}s")
            logger.info(f"   Memory used: {batch_memory_used:.1f}MB")
            logger.info(f"   Memory after: {batch_memory_end:.1f}MB")
            logger.info(f"   Success rate: {len([r for r in batch_results if r.get('success')])}/{len(batch_results)}")
            
            # Record batch memory usage
            self.batch_memory_history.append({
                "batch_num": batch_num,
                "memory_start_mb": batch_memory_start,
                "memory_end_mb": batch_memory_end,
                "memory_used_mb": batch_memory_used,
                "duration_s": batch_duration,
                "files_processed": len(batch_files),
                "success_count": len([r for r in batch_results if r.get('success')]),
            })
            
            # Update memory statistics
            self._update_memory_stats(batch_memory_end)

    async def _process_single_file(self, file_path: Path, indexing_callback: callable) -> Dict[str, Any]:
        """Process a single file with memory monitoring."""
        file_start_time = time.time()
        file_memory_start = self._get_current_memory_mb()
        
        try:
            with DebugLogContext(logger, "process_single_file", file=str(file_path)):
                
                # Execute indexing callback in thread pool to prevent blocking
                result = await self.executor_manager.execute(
                    indexing_callback, str(file_path)
                )
                
                file_duration = time.time() - file_start_time
                file_memory_end = self._get_current_memory_mb()
                file_memory_used = file_memory_end - file_memory_start
                
                # Log file processing statistics
                logger.debug(f"📄 Processed {file_path.name}:")
                logger.debug(f"   Duration: {file_duration:.3f}s")
                logger.debug(f"   Memory used: {file_memory_used:.1f}MB")
                logger.debug(f"   Success: {result.get('success', False)}")
                
                return {
                    "success": True,
                    "file": str(file_path),
                    "duration_s": file_duration,
                    "memory_used_mb": file_memory_used,
                    "result": result,
                }
                
        except Exception as e:
            file_duration = time.time() - file_start_time
            logger.error(f"❌ Failed to process {file_path}: {e}")
            
            return {
                "success": False,
                "file": str(file_path),
                "duration_s": file_duration,
                "error": str(e),
            }

    async def _check_memory_before_batch(self, current_memory_mb: float) -> bool:
        """Check if memory usage is acceptable before processing a batch."""
        memory_usage_ratio = current_memory_mb / self.max_memory_mb
        
        if memory_usage_ratio > self.memory_cleanup_threshold:
            logger.warning(f"⚠️ Memory usage too high: {current_memory_mb:.1f}MB ({memory_usage_ratio:.1%})")
            return False
        
        return True

    async def _manage_memory_between_batches(self, batch_num: int) -> None:
        """Manage memory between batches with cleanup and monitoring."""
        current_memory = self._get_current_memory_mb()
        
        # Force garbage collection every N batches
        if batch_num % self.gc_frequency == 0:
            await self._force_memory_cleanup()
            self.forced_gc_count += 1
            logger.info(f"🧹 Forced garbage collection after batch {batch_num}")
        
        # Check if memory cleanup is needed
        if current_memory > self.max_memory_mb * self.memory_cleanup_threshold:
            await self._force_memory_cleanup()
            self.memory_cleanup_count += 1
            logger.info(f"🧹 Memory cleanup triggered after batch {batch_num}")
        
        # Log memory status
        logger.debug(f"💾 Memory status after batch {batch_num}: {current_memory:.1f}MB")

    async def _force_memory_cleanup(self) -> None:
        """Force memory cleanup with garbage collection."""
        cleanup_start_time = time.time()
        memory_before = self._get_current_memory_mb()
        
        # Force garbage collection
        collected = gc.collect()
        
        # Small delay to allow system to reclaim memory
        await asyncio.sleep(0.1)
        
        memory_after = self._get_current_memory_mb()
        memory_freed = memory_before - memory_after
        cleanup_duration = time.time() - cleanup_start_time
        
        logger.info(f"🧹 Memory cleanup completed:")
        logger.info(f"   Objects collected: {collected}")
        logger.info(f"   Memory freed: {memory_freed:.1f}MB")
        logger.info(f"   Cleanup duration: {cleanup_duration:.3f}s")

    def _get_current_memory_mb(self) -> float:
        """Get current memory usage in MB."""
        try:
            process = psutil.Process()
            return process.memory_info().rss / 1024 / 1024
        except Exception:
            return 0.0

    def _initialize_progress(self, total_files: int) -> None:
        """Initialize progress tracking."""
        self.current_progress.update({
            "status": "indexing",
            "total_files": total_files,
            "processed_files": 0,
            "failed_files": 0,
            "current_batch": 0,
            "start_time": time.time(),
            "current_file": None,
            "errors": [],
        })

    def _update_progress(self, current_batch: int, total_batches: int) -> None:
        """Update progress tracking."""
        self.current_progress.update({
            "current_batch": current_batch,
            "estimated_completion": self._calculate_estimated_completion(),
        })

    def _update_memory_stats(self, current_memory_mb: float) -> None:
        """Update memory statistics."""
        memory_stats = self.current_progress["memory_stats"]
        memory_stats["current_memory_mb"] = current_memory_mb
        
        if current_memory_mb > memory_stats["peak_memory_mb"]:
            memory_stats["peak_memory_mb"] = current_memory_mb
        
        # Calculate memory trend
        if len(self.batch_memory_history) >= 3:
            recent_batches = self.batch_memory_history[-3:]
            memory_trend = self._calculate_memory_trend(recent_batches)
            memory_stats["memory_trend"] = memory_trend

    def _calculate_memory_trend(self, recent_batches: List[Dict]) -> str:
        """Calculate memory trend from recent batches."""
        if len(recent_batches) < 2:
            return "stable"
        
        memory_values = [batch["memory_end_mb"] for batch in recent_batches]
        if memory_values[-1] > memory_values[0] * 1.1:
            return "increasing"
        elif memory_values[-1] < memory_values[0] * 0.9:
            return "decreasing"
        else:
            return "stable"

    def _calculate_estimated_completion(self) -> Optional[float]:
        """Calculate estimated completion time."""
        if not self.current_progress["start_time"] or self.current_progress["current_batch"] == 0:
            return None
        
        elapsed_time = time.time() - self.current_progress["start_time"]
        progress_ratio = self.current_progress["current_batch"] / self.current_progress["total_batches"]
        
        if progress_ratio > 0:
            estimated_total_time = elapsed_time / progress_ratio
            estimated_remaining = estimated_total_time - elapsed_time
            return time.time() + estimated_remaining
        
        return None

    async def _finalize_indexing(self) -> None:
        """Finalize indexing with comprehensive statistics."""
        total_duration = time.time() - self.current_progress["start_time"]
        
        # Stop memory profiling
        self.memory_profiler.stop()
        memory_summary = self.memory_profiler.get_memory_summary()
        
        # Get RAG profiler statistics
        rag_stats = await self.rag_profiler.get_statistics()
        
        # Final memory cleanup
        await self._force_memory_cleanup()
        
        # Log comprehensive statistics
        logger.info("🎯 Memory-efficient indexing completed:")
        logger.info(f"   Total duration: {total_duration:.2f}s")
        logger.info(f"   Files processed: {self.current_progress['processed_files']}")
        logger.info(f"   Files failed: {self.current_progress['failed_files']}")
        logger.info(f"   Success rate: {self.current_progress['processed_files'] / self.current_progress['total_files']:.1%}")
        logger.info(f"   Memory cleanups: {self.memory_cleanup_count}")
        logger.info(f"   Forced GC: {self.forced_gc_count}")
        logger.info(f"   Peak memory: {self.current_progress['memory_stats']['peak_memory_mb']:.1f}MB")
        logger.info(f"   Final memory: {self._get_current_memory_mb():.1f}MB")
        
        # Update final progress
        self.current_progress.update({
            "status": "completed",
            "total_duration_s": total_duration,
            "memory_summary": memory_summary,
            "rag_stats": rag_stats,
        })

    async def _get_performance_stats(self) -> Dict[str, Any]:
        """Get comprehensive performance statistics."""
        return {
            "batch_memory_history": self.batch_memory_history,
            "memory_cleanup_count": self.memory_cleanup_count,
            "forced_gc_count": self.forced_gc_count,
            "memory_profiler_summary": self.memory_profiler.get_memory_summary(),
            "rag_profiler_stats": await self.rag_profiler.get_statistics(),
        }

    async def shutdown(self) -> None:
        """Shutdown the indexing service."""
        try:
            # Stop memory profiling
            self.memory_profiler.stop()
            
            # Shutdown RAG profiler
            await self.rag_profiler.shutdown()
            
            # Shutdown executor
            await self.executor_manager.shutdown()
            
            logger.info("✅ Indexing service shutdown completed")
            
        except Exception as e:
            logger.error(f"❌ Error during shutdown: {e}")

    def get_current_progress(self) -> Dict[str, Any]:
        """Get current progress information."""
        return self.current_progress.copy()

    def get_memory_stats(self) -> Dict[str, Any]:
        """Get current memory statistics."""
        return {
            "current_memory_mb": self._get_current_memory_mb(),
            "peak_memory_mb": self.current_progress["memory_stats"]["peak_memory_mb"],
            "memory_trend": self.current_progress["memory_stats"]["memory_trend"],
            "memory_cleanup_count": self.memory_cleanup_count,
            "forced_gc_count": self.forced_gc_count,
            "batch_memory_history": self.batch_memory_history[-10:],  # Last 10 batches
        }
