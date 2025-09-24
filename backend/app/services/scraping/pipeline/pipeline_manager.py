"""Processing Pipeline Manager for Reynard Backend

Manages content processing pipelines for scraping results.
"""

import logging
from typing import Any
from uuid import UUID

from ..models import PipelineConfig, ProcessingPipeline, ProcessingStage

logger = logging.getLogger(__name__)


class ProcessingPipelineManager:
    """Manages content processing pipelines.

    Orchestrates the processing of scraped content through
    various stages like cleaning, categorization, and deduplication.
    """

    def __init__(self):
        """Initialize the pipeline manager."""
        self.initialized = False
        self.pipelines: dict[UUID, ProcessingPipeline] = {}
        self.active_pipelines: dict[UUID, ProcessingPipeline] = {}

    async def initialize(self) -> bool:
        """Initialize the pipeline manager."""
        try:
            if self.initialized:
                return True

            # Initialize default pipelines
            await self._create_default_pipelines()

            self.initialized = True
            logger.info("Processing pipeline manager initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize pipeline manager: {e}")
            return False

    async def shutdown(self) -> bool:
        """Shutdown the pipeline manager."""
        try:
            # Stop all active pipelines
            for pipeline_id in list(self.active_pipelines.keys()):
                await self.stop_pipeline(pipeline_id)

            self.pipelines.clear()
            self.active_pipelines.clear()
            self.initialized = False

            logger.info("Processing pipeline manager shutdown successfully")
            return True

        except Exception as e:
            logger.error(f"Error shutting down pipeline manager: {e}")
            return False

    async def create_pipeline(
        self, name: str, config: PipelineConfig,
    ) -> ProcessingPipeline:
        """Create a new processing pipeline.

        Args:
            name: Name of the pipeline
            config: Pipeline configuration

        Returns:
            Created pipeline

        """
        try:
            pipeline = ProcessingPipeline(
                name=name,
                config=config,
                stages=[],  # Will be populated based on config
            )

            self.pipelines[pipeline.id] = pipeline
            logger.info(f"Created pipeline: {name} ({pipeline.id})")
            return pipeline

        except Exception as e:
            logger.error(f"Error creating pipeline {name}: {e}")
            raise

    async def start_pipeline(self, pipeline_id: UUID) -> bool:
        """Start a processing pipeline.

        Args:
            pipeline_id: ID of the pipeline to start

        Returns:
            True if pipeline started successfully

        """
        try:
            if pipeline_id not in self.pipelines:
                raise ValueError(f"Pipeline {pipeline_id} not found")

            pipeline = self.pipelines[pipeline_id]
            pipeline.status = "running"
            self.active_pipelines[pipeline_id] = pipeline

            logger.info(f"Started pipeline: {pipeline.name} ({pipeline_id})")
            return True

        except Exception as e:
            logger.error(f"Error starting pipeline {pipeline_id}: {e}")
            return False

    async def stop_pipeline(self, pipeline_id: UUID) -> bool:
        """Stop a processing pipeline.

        Args:
            pipeline_id: ID of the pipeline to stop

        Returns:
            True if pipeline stopped successfully

        """
        try:
            if pipeline_id in self.active_pipelines:
                pipeline = self.active_pipelines[pipeline_id]
                pipeline.status = "idle"
                del self.active_pipelines[pipeline_id]

                logger.info(f"Stopped pipeline: {pipeline.name} ({pipeline_id})")
                return True

            return False

        except Exception as e:
            logger.error(f"Error stopping pipeline {pipeline_id}: {e}")
            return False

    async def get_pipeline(self, pipeline_id: UUID) -> ProcessingPipeline | None:
        """Get a pipeline by ID.

        Args:
            pipeline_id: ID of the pipeline

        Returns:
            Pipeline if found

        """
        return self.pipelines.get(pipeline_id)

    async def get_all_pipelines(self) -> list[ProcessingPipeline]:
        """Get all pipelines."""
        return list(self.pipelines.values())

    async def get_active_pipelines(self) -> list[ProcessingPipeline]:
        """Get all active pipelines."""
        return list(self.active_pipelines.values())

    async def delete_pipeline(self, pipeline_id: UUID) -> bool:
        """Delete a pipeline.

        Args:
            pipeline_id: ID of the pipeline to delete

        Returns:
            True if pipeline deleted successfully

        """
        try:
            # Stop pipeline if active
            if pipeline_id in self.active_pipelines:
                await self.stop_pipeline(pipeline_id)

            # Remove from pipelines
            if pipeline_id in self.pipelines:
                pipeline = self.pipelines[pipeline_id]
                del self.pipelines[pipeline_id]
                logger.info(f"Deleted pipeline: {pipeline.name} ({pipeline_id})")
                return True

            return False

        except Exception as e:
            logger.error(f"Error deleting pipeline {pipeline_id}: {e}")
            return False

    async def _create_default_pipelines(self) -> None:
        """Create default processing pipelines."""
        try:
            # Basic content processing pipeline
            basic_config = PipelineConfig(
                parallel=False,
                max_concurrency=2,
                timeout=300,
                retry_attempts=3,
                quality_threshold=60,
            )

            basic_pipeline = await self.create_pipeline(
                "Basic Content Processing", basic_config,
            )

            # Add default stages
            basic_pipeline.stages = [
                ProcessingStage(
                    name="Content Cleaning",
                    type="cleaning",
                    order=1,
                    config={"remove_ads": True, "clean_html": True},
                ),
                ProcessingStage(
                    name="Quality Assessment",
                    type="quality_assessment",
                    order=2,
                    config={"min_score": 60},
                ),
                ProcessingStage(
                    name="Content Categorization",
                    type="categorization",
                    order=3,
                    config={"auto_categorize": True},
                ),
            ]

            logger.info("Created default processing pipelines")

        except Exception as e:
            logger.error(f"Error creating default pipelines: {e}")

    def get_info(self) -> dict[str, Any]:
        """Get pipeline manager information."""
        return {
            "initialized": self.initialized,
            "total_pipelines": len(self.pipelines),
            "active_pipelines": len(self.active_pipelines),
            "pipelines": [
                {
                    "id": str(pipeline.id),
                    "name": pipeline.name,
                    "status": pipeline.status,
                    "stages": len(pipeline.stages),
                }
                for pipeline in self.pipelines.values()
            ],
        }
