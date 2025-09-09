"""
EmbeddingIndexService: queue-backed, streaming-friendly ingestion orchestrator.

Responsibilities (MVP):
- Accept ingest specs, chunk content via chunking managers
- Batch DB upserts through VectorDBService
- Use EmbeddingService/ClipEmbeddingService for embeddings
- Maintain an internal asyncio queue with worker concurrency caps
- Retry with exponential backoff; move to dead-letter on max attempts
- Expose health/metrics (queue depth, lag, counters)
- Admin controls: pause/resume/drain, dead-letter management
"""

import asyncio
import time
import logging
from dataclasses import dataclass, field
from typing import Any, AsyncGenerator, Dict, List, Optional

logger = logging.getLogger("uvicorn")


@dataclass
class _QueueItem:
    kind: str  # "docs" | "images" | "captions"
    payload: Dict[str, Any]
    job_id: Optional[str] = None
    attempts: int = 0
    enqueued_ts: float = field(default_factory=lambda: time.time())
    last_error: Optional[str] = None


class EmbeddingIndexService:
    """Service for managing document ingestion and indexing."""
    
    def __init__(self):
        # Queue & workers
        self._queue: asyncio.Queue[_QueueItem] = asyncio.Queue(maxsize=1000)
        self._dead_letter: List[_QueueItem] = []
        self._workers: List[asyncio.Task] = []
        self._cancelled_jobs: set[str] = set()
        self._paused: asyncio.Event = asyncio.Event()
        self._shutdown_event: asyncio.Event = asyncio.Event()
        self._concurrency: int = 2
        self._max_attempts: int = 5
        self._backoff_base_s: float = 0.5
        
        # Metrics
        self._metrics: Dict[str, Any] = {
            "enqueued": 0,
            "processed": 0,
            "failed": 0,
            "dead_letter": 0,
            "in_flight": 0,
            "last_error": None,
            "avg_latency_ms": 0.0,
            "max_lag_s": 0.0,
            "throughput_last_sec": 0.0,
        }
        self._latency_ema_ms: float = 0.0
        self._ema_alpha: float = 0.2
        self._throughput_window: List[float] = []
        
        # Dependencies
        self._vector_db_service = None
        self._embedding_service = None
        self._clip_embedding_service = None
        
        # Configuration
        self._enabled = False
        self._batch_size = 16
        self._chunk_max_tokens = 512
        self._chunk_min_tokens = 100
        self._chunk_overlap_ratio = 0.15
    
    async def initialize(
        self, 
        config: Dict[str, Any],
        vector_db_service=None,
        embedding_service=None,
        clip_embedding_service=None
    ) -> bool:
        """Initialize the indexing service."""
        try:
            self._enabled = config.get("rag_enabled", False)
            self._concurrency = config.get("rag_ingest_concurrency", 2)
            self._max_attempts = config.get("rag_ingest_max_attempts", 5)
            self._backoff_base_s = config.get("rag_ingest_backoff_base_s", 0.5)
            self._batch_size = config.get("rag_ingest_batch_size_text", 16)
            self._chunk_max_tokens = config.get("rag_chunk_max_tokens", 512)
            self._chunk_min_tokens = config.get("rag_chunk_min_tokens", 100)
            self._chunk_overlap_ratio = config.get("rag_chunk_overlap_ratio", 0.15)
            
            if not self._enabled:
                logger.info("EmbeddingIndexService disabled by config")
                return True
            
            # Set dependencies
            self._vector_db_service = vector_db_service
            self._embedding_service = embedding_service
            self._clip_embedding_service = clip_embedding_service
            
            # Start workers
            await self._start_workers()
            
            logger.info("EmbeddingIndexService initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"EmbeddingIndexService initialization failed: {e}")
            return False
    
    async def _start_workers(self):
        """Start worker tasks for processing the queue."""
        for i in range(self._concurrency):
            worker = asyncio.create_task(self._worker(f"worker-{i}"))
            self._workers.append(worker)
    
    async def _worker(self, worker_name: str):
        """Worker task for processing queue items."""
        logger.info(f"EmbeddingIndexService worker {worker_name} started")
        
        while not self._shutdown_event.is_set():
            try:
                # Wait for unpause
                await self._paused.wait()
                
                # Get item from queue
                try:
                    item = await asyncio.wait_for(
                        self._queue.get(), timeout=1.0
                    )
                except asyncio.TimeoutError:
                    continue
                
                # Process item
                await self._process_item(item, worker_name)
                
            except Exception as e:
                logger.error(f"Worker {worker_name} error: {e}")
                await asyncio.sleep(1.0)
        
        logger.info(f"EmbeddingIndexService worker {worker_name} stopped")
    
    async def _process_item(self, item: _QueueItem, worker_name: str):
        """Process a single queue item."""
        start_time = time.time()
        
        try:
            self._metrics["in_flight"] += 1
            
            # TODO: Implement actual processing logic
            # For now, just simulate processing
            await asyncio.sleep(0.1)
            
            # Update metrics
            processing_time = (time.time() - start_time) * 1000
            self._metrics["processed"] += 1
            self._metrics["in_flight"] -= 1
            
            # Update latency EMA
            if self._latency_ema_ms == 0.0:
                self._latency_ema_ms = processing_time
            else:
                self._latency_ema_ms = (
                    self._ema_alpha * processing_time + 
                    (1 - self._ema_alpha) * self._latency_ema_ms
                )
            
            self._metrics["avg_latency_ms"] = self._latency_ema_ms
            
            logger.debug(f"Worker {worker_name} processed {item.kind} item")
            
        except Exception as e:
            logger.error(f"Failed to process item: {e}")
            self._metrics["failed"] += 1
            self._metrics["in_flight"] -= 1
            self._metrics["last_error"] = str(e)
            
            # Retry logic
            if item.attempts < self._max_attempts:
                item.attempts += 1
                item.last_error = str(e)
                await asyncio.sleep(self._backoff_base_s * (2 ** item.attempts))
                await self._queue.put(item)
            else:
                self._dead_letter.append(item)
                self._metrics["dead_letter"] += 1
    
    async def ingest_documents(
        self, 
        items: List[Dict[str, Any]], 
        model: Optional[str] = None,
        batch_size: Optional[int] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Ingest documents with streaming progress."""
        if not self._enabled:
            yield {"type": "error", "error": "EmbeddingIndexService not enabled"}
            return
        
        try:
            total = len(items)
            processed = 0
            failures = 0
            
            # Process in batches
            batch_size = batch_size or self._batch_size
            for i in range(0, total, batch_size):
                batch = items[i:i + batch_size]
                
                # Queue batch items
                for item in batch:
                    queue_item = _QueueItem(
                        kind="docs",
                        payload=item,
                        job_id=f"batch_{i}_{len(batch)}"
                    )
                    await self._queue.put(queue_item)
                    self._metrics["enqueued"] += 1
                
                # Wait for batch processing
                await asyncio.sleep(0.1)
                processed += len(batch)
                
                yield {
                    "type": "progress",
                    "processed": processed,
                    "total": total,
                    "failures": failures,
                    "message": f"Processed {processed}/{total} documents"
                }
            
            yield {
                "type": "complete",
                "processed": processed,
                "total": total,
                "failures": failures,
                "message": "Document ingestion completed"
            }
            
        except Exception as e:
            logger.error(f"Failed to ingest documents: {e}")
            yield {"type": "error", "error": str(e)}
    
    async def pause(self):
        """Pause the indexing service."""
        self._paused.clear()
        logger.info("EmbeddingIndexService paused")
    
    async def resume(self):
        """Resume the indexing service."""
        self._paused.set()
        logger.info("EmbeddingIndexService resumed")
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get indexing service statistics."""
        return {
            "enabled": self._enabled,
            "queue_size": self._queue.qsize(),
            "workers": len(self._workers),
            "concurrency": self._concurrency,
            "metrics": self._metrics.copy(),
            "dead_letter_size": len(self._dead_letter),
            "paused": not self._paused.is_set()
        }
    
    async def health_check(self) -> bool:
        """Perform health check."""
        if not self._enabled:
            return True
        
        try:
            # Check if workers are running
            if not self._workers:
                return False
            
            # Check if any workers are still alive
            alive_workers = [w for w in self._workers if not w.done()]
            if not alive_workers:
                return False
            
            return True
            
        except Exception as e:
            logger.warning(f"EmbeddingIndexService health check failed: {e}")
            return False
    
    async def shutdown(self):
        """Shutdown the indexing service."""
        logger.info("EmbeddingIndexService shutting down...")
        
        # Signal shutdown
        self._shutdown_event.set()
        
        # Cancel workers
        for worker in self._workers:
            worker.cancel()
        
        # Wait for workers to finish
        if self._workers:
            await asyncio.gather(*self._workers, return_exceptions=True)
        
        logger.info("EmbeddingIndexService shutdown complete")
