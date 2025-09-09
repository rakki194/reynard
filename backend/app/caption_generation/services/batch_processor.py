"""
Batch processing service for caption generation.

This module handles batch caption generation with proper concurrency control,
progress tracking, and error handling.
"""

import asyncio
import logging
import time
from typing import Callable, Dict, List, Optional

from ..base import CaptionGenerator
from ..types import CaptionResult, CaptionTask
from ..errors import CaptionError, format_error_message
from ..retry_utils import retry_with_backoff, DEFAULT_RETRY_CONFIG
from ..post_processing import post_process_caption
from .model_coordinator import ModelCoordinator

logger = logging.getLogger("uvicorn")


class BatchProcessor:
    """Handles batch processing of caption generation tasks."""
    
    def __init__(self, model_coordinator: ModelCoordinator):
        self._model_coordinator = model_coordinator
        self._retry_config = dict(DEFAULT_RETRY_CONFIG)
    
    async def process_batch(
        self,
        tasks: List[CaptionTask],
        progress_callback: Optional[Callable[[Dict], None]] = None,
        max_concurrent: int = 4,
    ) -> List[CaptionResult]:
        """Process a batch of caption generation tasks."""
        if not tasks:
            return []

        # Group tasks by generator for efficient model loading
        tasks_by_generator: Dict[str, List[CaptionTask]] = {}
        for task in tasks:
            tasks_by_generator.setdefault(task.generator_name, []).append(task)

        # Pre-load models for batch processing
        loaded_models: Dict[str, CaptionGenerator] = {}
        for generator_name, generator_tasks in tasks_by_generator.items():
            if self._model_coordinator.should_load_model(
                generator_name, is_batch=True, batch_size=len(generator_tasks)
            ):
                model = await self._model_coordinator.get_or_load_model(generator_name)
                if model:
                    loaded_models[generator_name] = model
                else:
                    # Handle failed model loading
                    for task in generator_tasks:
                        if progress_callback:
                            progress_callback({
                                "type": "error",
                                "message": f"Failed to load model: {generator_name}",
                                "item": str(task.image_path),
                            })

        # Process tasks with concurrency control
        semaphore = asyncio.Semaphore(max_concurrent)
        completed = 0
        total = len(tasks)

        async def process_task(task: CaptionTask) -> CaptionResult:
            nonlocal completed
            async with semaphore:
                model = loaded_models.get(task.generator_name) or await self._model_coordinator.get_or_load_model(task.generator_name)
                if not model:
                    result = CaptionResult(
                        image_path=task.image_path,
                        generator_name=task.generator_name,
                        success=False,
                        error=f"Failed to load model: {task.generator_name}. Please ensure the model is downloaded.",
                        error_type="model_loading",
                        retryable=True,
                        caption_type=None,
                    )
                else:
                    result = await self._process_single_task(model, task)

                completed += 1
                if progress_callback:
                    progress_callback({
                        "type": "item_complete",
                        "current": completed,
                        "total": total,
                        "message": f"Processed {completed}/{total} images",
                        "item_result": {
                            "image": task.image_path.name,
                            "success": result.success,
                            "error": result.error,
                        },
                    })
                return result

        # Execute all tasks
        results = await asyncio.gather(*[process_task(task) for task in tasks], return_exceptions=True)

        # Handle exceptions and return final results
        final_results: List[CaptionResult] = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                final_results.append(CaptionResult(
                    image_path=tasks[i].image_path,
                    generator_name=tasks[i].generator_name,
                    success=False,
                    error=f"Task failed: {str(result)}",
                    error_type="task_failed",
                    retryable=True,
                    caption_type=None,
                ))
            else:
                final_results.append(result)
        
        return final_results
    
    async def _process_single_task(self, model: CaptionGenerator, task: CaptionTask) -> CaptionResult:
        """Process a single caption generation task."""
        start_time = time.time()
        
        try:
            # Check if caption already exists
            if not task.force:
                caption_path = task.image_path.with_suffix(f".{model.caption_type.value}")
                if caption_path.exists():
                    return CaptionResult(
                        image_path=task.image_path,
                        generator_name=task.generator_name,
                        success=False,
                        error="Caption already exists. Use 'force' option to regenerate.",
                        error_type="caption_exists",
                        retryable=False,
                        caption_type=model.caption_type.value,
                    )
            
            # Generate caption with retry logic
            caption = await self._generate_caption_with_retry(model, task.image_path, task.config)
            
            # Apply post-processing if requested
            if caption and task.post_process:
                settings = None
                try:
                    settings = task.config.get("post_processing_settings") if task.config else None
                except Exception:
                    settings = None
                caption = post_process_caption(caption, task.generator_name, settings)

            processing_time = time.time() - start_time
            
            return CaptionResult(
                image_path=task.image_path,
                generator_name=task.generator_name,
                success=True,
                caption=caption,
                processing_time=processing_time,
                caption_type=model.caption_type.value,
            )
            
        except CaptionError as e:
            processing_time = time.time() - start_time
            logger.error(f"Caption generation error for {task.image_path}: {e}", exc_info=True)
            return CaptionResult(
                image_path=task.image_path,
                generator_name=task.generator_name,
                success=False,
                error=format_error_message(e),
                error_type=e.error_type,
                retryable=e.retryable,
                processing_time=processing_time,
                caption_type=None,
            )
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Unexpected error generating caption for {task.image_path}: {e}", exc_info=True)
            return CaptionResult(
                image_path=task.image_path,
                generator_name=task.generator_name,
                success=False,
                error=f"Unexpected error: {str(e)}",
                error_type="unexpected",
                retryable=True,
                processing_time=processing_time,
                caption_type=None,
            )
    
    async def _generate_caption_with_retry(self, model: CaptionGenerator, image_path, config: Dict) -> str:
        """Generate caption with retry logic."""
        async def _generate() -> str:
            try:
                return await model.generate(image_path, **config)
            except Exception as e:
                from ..errors import CaptionGenerationError
                retryable = any(p in str(e).lower() for p in [
                    "timeout",
                    "connection",
                    "network",
                    "temporary",
                    "server error",
                    "rate limit",
                    "memory",
                    "cuda",
                ])
                raise CaptionGenerationError(model.name, str(e), retryable=retryable)

        return await retry_with_backoff(_generate, "caption generation", config=self._retry_config)
