"""Scraping Manager for Reynard Backend

Manages scraping operations, job queues, and resource allocation.
"""

import asyncio
import logging
from typing import Any
from uuid import UUID

from .models import ScrapingJob

logger = logging.getLogger(__name__)


class ScrapingManager:
    """Manages scraping operations and job queues.

    Handles job scheduling, resource allocation, and coordination
    between different scraping components.
    """

    def __init__(self):
        """Initialize the scraping manager."""
        self.initialized = False
        self.job_queue: asyncio.Queue = asyncio.Queue()
        self.active_jobs: dict[UUID, ScrapingJob] = {}
        self.completed_jobs: dict[UUID, ScrapingJob] = {}
        self.max_concurrent_jobs = 5
        self.worker_tasks: list[asyncio.Task] = []

    async def initialize(self) -> bool:
        """Initialize the scraping manager."""
        try:
            if self.initialized:
                return True

            # Start worker tasks
            for i in range(self.max_concurrent_jobs):
                task = asyncio.create_task(self._worker(f"worker-{i}"))
                self.worker_tasks.append(task)

            self.initialized = True
            logger.info("Scraping manager initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize scraping manager: {e}")
            return False

    async def shutdown(self) -> bool:
        """Shutdown the scraping manager."""
        try:
            # Cancel all worker tasks
            for task in self.worker_tasks:
                task.cancel()

            # Wait for tasks to complete
            await asyncio.gather(*self.worker_tasks, return_exceptions=True)

            self.worker_tasks.clear()
            self.initialized = False

            logger.info("Scraping manager shutdown successfully")
            return True

        except Exception as e:
            logger.error(f"Error shutting down scraping manager: {e}")
            return False

    async def create_job(self, url: str, scraping_type: str) -> ScrapingJob:
        """Create a new scraping job.

        Args:
            url: URL to scrape
            scraping_type: Type of scraping to perform

        Returns:
            Created ScrapingJob

        """
        from .models import ScrapingType, ScrapingStatus
        
        # Convert string to enum if needed
        if isinstance(scraping_type, str):
            scraping_type = ScrapingType(scraping_type)
        
        job = ScrapingJob(
            url=url,
            type=scraping_type,
            status=ScrapingStatus.PENDING,
        )
        
        await self.add_job(job)
        return job

    async def add_job(self, job: ScrapingJob) -> bool:
        """Add a job to the queue.

        Args:
            job: Scraping job to add

        Returns:
            True if job was added successfully

        """
        try:
            await self.job_queue.put(job)
            self.active_jobs[job.id] = job
            logger.info(f"Added job {job.id} to queue")
            return True

        except Exception as e:
            logger.error(f"Error adding job {job.id}: {e}")
            return False

    async def get_job(self, job_id: UUID) -> ScrapingJob:
        """Get a job by ID.

        Args:
            job_id: Job ID

        Returns:
            Job if found

        Raises:
            ValueError: If job not found

        """
        job = self.active_jobs.get(job_id) or self.completed_jobs.get(job_id)
        if job is None:
            raise ValueError("Job not found")
        return job

    async def cancel_job(self, job_id: UUID) -> bool:
        """Cancel a job.

        Args:
            job_id: Job ID to cancel

        Returns:
            True if job was cancelled

        """
        try:
            if job_id in self.active_jobs:
                job = self.active_jobs[job_id]
                from .models import ScrapingStatus
                job.status = ScrapingStatus.CANCELLED
                del self.active_jobs[job_id]
                self.completed_jobs[job_id] = job
                logger.info(f"Cancelled job {job_id}")
                return True

            return False

        except Exception as e:
            logger.error(f"Error cancelling job {job_id}: {e}")
            return False

    async def get_active_jobs(self) -> list[ScrapingJob]:
        """Get all active jobs."""
        return list(self.active_jobs.values())

    async def get_completed_jobs(self) -> list[ScrapingJob]:
        """Get all completed jobs."""
        return list(self.completed_jobs.values())

    async def get_jobs(self) -> list[ScrapingJob]:
        """Get all jobs (active and completed)."""
        return list(self.active_jobs.values()) + list(self.completed_jobs.values())

    async def delete_job(self, job_id: UUID) -> bool:
        """Delete a job.

        Args:
            job_id: Job ID to delete

        Returns:
            True if job was deleted

        """
        try:
            deleted = False
            if job_id in self.active_jobs:
                del self.active_jobs[job_id]
                deleted = True
            if job_id in self.completed_jobs:
                del self.completed_jobs[job_id]
                deleted = True
            
            if deleted:
                logger.info(f"Deleted job {job_id}")
                return True
            else:
                logger.warning(f"Job {job_id} not found for deletion")
                raise ValueError("Job not found")

        except Exception as e:
            logger.error(f"Error deleting job {job_id}: {e}")
            return False

    async def get_queue_size(self) -> int:
        """Get the current queue size."""
        return self.job_queue.qsize()

    async def get_statistics(self) -> dict[str, Any]:
        """Get scraping statistics.

        Returns:
            Dictionary with statistics

        """
        from .models import ScrapingStatistics, PerformanceMetrics
        
        total_jobs = len(self.active_jobs) + len(self.completed_jobs)
        completed_jobs = len([job for job in self.completed_jobs.values() 
                             if job.status.value == "completed"])
        failed_jobs = len([job for job in self.completed_jobs.values() 
                          if job.status.value == "failed"])
        running_jobs = len([job for job in self.active_jobs.values() 
                           if job.status.value == "running"])
        pending_jobs = len([job for job in self.active_jobs.values() 
                           if job.status.value == "pending"])
        
        # Calculate average quality if we have results
        total_results = sum(len(job.results) for job in self.completed_jobs.values())
        average_quality = 0.0
        if total_results > 0:
            quality_scores = []
            for job in self.completed_jobs.values():
                for result in job.results:
                    if hasattr(result, 'quality') and hasattr(result.quality, 'score'):
                        quality_scores.append(result.quality.score)
            if quality_scores:
                average_quality = sum(quality_scores) / len(quality_scores)
        
        # Calculate success rate
        success_rate = 0.0
        if total_jobs > 0:
            success_rate = (completed_jobs / total_jobs) * 100
        
        performance_metrics = PerformanceMetrics(
            average_processing_time=0.0,  # Would need to track this
            average_quality_score=average_quality,
            success_rate=success_rate,
            throughput=0.0,  # Would need to track this
        )
        
        stats = ScrapingStatistics(
            total_jobs=total_jobs,
            completed_jobs=completed_jobs,
            failed_jobs=failed_jobs,
            active_jobs=len(self.active_jobs),
            total_results=total_results,
            average_quality=average_quality,
            performance_metrics=performance_metrics,
        )
        
        return {
            "totalJobs": total_jobs,
            "completedJobs": completed_jobs,
            "failedJobs": failed_jobs,
            "runningJobs": running_jobs,
            "pendingJobs": pending_jobs,
            "queueSize": await self.get_queue_size(),
            "totalResults": total_results,
            "averageQuality": average_quality,
            "successRate": success_rate,
        }

    async def _worker(self, worker_name: str) -> None:
        """Worker task that processes jobs from the queue.

        Args:
            worker_name: Name of the worker

        """
        logger.info(f"Started worker: {worker_name}")

        try:
            while True:
                # Get job from queue
                job = await self.job_queue.get()

                try:
                    # Process the job
                    await self._process_job(job, worker_name)

                except Exception as e:
                    logger.error(f"Error processing job {job.id} in {worker_name}: {e}")
                    from .models import ScrapingStatus
                    job.status = ScrapingStatus.FAILED
                    job.error = str(e)

                finally:
                    # Mark job as done
                    self.job_queue.task_done()

                    # Move to completed jobs
                    if job.id in self.active_jobs:
                        del self.active_jobs[job.id]
                    self.completed_jobs[job.id] = job

        except asyncio.CancelledError:
            logger.info(f"Worker {worker_name} cancelled")
        except Exception as e:
            logger.error(f"Error in worker {worker_name}: {e}")

    async def _process_job(self, job: ScrapingJob, worker_name: str) -> None:
        """Process a scraping job.

        Args:
            job: Job to process
            worker_name: Name of the worker processing the job

        """
        from datetime import datetime, timezone
        from .models import ScrapingStatus
        
        logger.info(f"Processing job {job.id} in {worker_name}")

        try:
            # Update job status
            job.status = ScrapingStatus.RUNNING
            job.updated_at = datetime.now(timezone.utc)

            # TODO: Implement actual scraping logic
            # This is a placeholder implementation
            await asyncio.sleep(1)  # Simulate work

            # Mark as completed
            job.status = ScrapingStatus.COMPLETED
            job.progress = 100
            job.completed_at = datetime.now(timezone.utc)

            logger.info(f"Completed job {job.id} in {worker_name}")

        except Exception as e:
            logger.error(f"Error processing job {job.id}: {e}")
            job.status = ScrapingStatus.FAILED
            job.error = str(e)
            raise

    def get_info(self) -> dict[str, Any]:
        """Get manager information."""
        return {
            "initialized": self.initialized,
            "active_jobs": len(self.active_jobs),
            "completed_jobs": len(self.completed_jobs),
            "queue_size": self.job_queue.qsize(),
            "max_concurrent_jobs": self.max_concurrent_jobs,
            "worker_count": len(self.worker_tasks),
        }
