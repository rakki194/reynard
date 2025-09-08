"""
Reynard Caption Generation Service

This module provides the main service interface for caption generation in the
Reynard framework. It handles both single and batch operations with smart model
loading, progress tracking, and comprehensive error handling.

The service provides:
- Smart model loading based on task requirements
- Interface for single and batch operations
- Progress tracking for batch operations
- Efficient resource management
- Model lifecycle coordination
- Retry logic with exponential backoff
- Post-processing pipeline
"""

import asyncio
import logging
import time
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Union

from .base import CaptionGenerator, CaptionType, ModelCategory
from .plugin_loader import get_captioner_manager

logger = logging.getLogger("uvicorn")

# Global locks for model loading coordination
_model_loading_locks: Dict[str, asyncio.Lock] = {}


class CaptionError(Exception):
    """Base exception for caption generation errors."""

    def __init__(
        self, message: str, error_type: str = "unknown", retryable: bool = False
    ):
        super().__init__(message)
        self.error_type = error_type
        self.retryable = retryable


class ModelLoadingError(CaptionError):
    """Error when model fails to load."""

    def __init__(self, model_name: str, reason: str, retryable: bool = True):
        super().__init__(
            f"Failed to load model '{model_name}': {reason}", "model_loading", retryable
        )


class CaptionGenerationError(CaptionError):
    """Error when caption generation fails."""

    def __init__(self, model_name: str, reason: str, retryable: bool = False):
        super().__init__(
            f"Failed to generate caption with '{model_name}': {reason}",
            "generation",
            retryable,
        )


@dataclass
class CaptionTask:
    """Represents a caption generation task."""

    image_path: Path
    generator_name: str
    config: Dict[str, Any]
    force: bool = False
    post_process: bool = True  # Enable post-processing by default


@dataclass
class CaptionResult:
    """Result of a caption generation task."""

    image_path: Path
    generator_name: str
    success: bool
    caption: Optional[str] = None
    error: Optional[str] = None
    error_type: Optional[str] = None
    retryable: bool = False
    processing_time: Optional[float] = None
    caption_type: Optional[str] = None


class CaptionService:
    """Service for caption generation with smart model loading."""

    def __init__(self):
        self._manager = get_captioner_manager()
        self._retry_config = {
            "max_retries": 3,
            "base_delay": 1.0,
            "max_delay": 10.0,
            "backoff_factor": 2.0,
        }

    def _should_load_model(
        self, generator_name: str, is_batch: bool, batch_size: int = 0
    ) -> bool:
        """
        Determine if a model should be loaded based on task requirements.

        Args:
            generator_name: Name of the caption generator
            is_batch: Whether this is a batch operation
            batch_size: Number of images in the batch (for batch operations)

        Returns:
            bool: True if the model should be loaded
        """
        captioner = self._manager.get_captioner(generator_name)
        if not captioner:
            return False

        category = captioner.model_category

        # Always load lightweight models (they're fast and small)
        if category == ModelCategory.LIGHTWEIGHT:
            return True

        # For heavy models:
        # - Always load for batch operations (efficiency)
        # - Load for single operations (user expects it to work)
        # - Consider batch size for very large batches
        if category == ModelCategory.HEAVY:
            if is_batch and batch_size > 50:
                # For very large batches, we might want to load the model
                # to avoid repeated loading/unloading
                return True
            return True

        return True

    async def _get_or_load_model_with_coordination(
        self, generator_name: str
    ) -> Optional[CaptionGenerator]:
        """
        Get a loaded model with download coordination to prevent concurrent loads.

        Args:
            generator_name: Name of the caption generator

        Returns:
            Optional[CaptionGenerator]: The loaded model or None if failed
        """
        # Check if model is already loaded
        if generator_name in self._manager.get_loaded_models():
            captioner = self._manager.get_captioner(generator_name)
            if captioner and captioner.is_loaded:
                return captioner

        # Get or create the loading lock for this generator
        if generator_name not in _model_loading_locks:
            _model_loading_locks[generator_name] = asyncio.Lock()

        loading_lock = _model_loading_locks[generator_name]

        async with loading_lock:
            # Double-check if model was loaded while waiting for lock
            if generator_name in self._manager.get_loaded_models():
                captioner = self._manager.get_captioner(generator_name)
                if captioner and captioner.is_loaded:
                    return captioner

            # Load the model
            success = await self._manager.load_captioner(generator_name)
            if success:
                logger.info(f"Loaded caption model with coordination: {generator_name}")
                return self._manager.get_captioner(generator_name)
            else:
                logger.error(f"Failed to load caption model: {generator_name}")
                return None

    async def _retry_with_backoff(
        self, operation: Callable, operation_name: str, *args, **kwargs
    ) -> Union[str, List[str]]:
        """
        Retry an operation with exponential backoff.

        Args:
            operation: The operation to retry
            operation_name: Name of the operation for logging
            *args: Arguments for the operation
            **kwargs: Keyword arguments for the operation

        Returns:
            The result of the operation

        Raises:
            CaptionError: If all retries fail
        """
        last_exception = None

        for attempt in range(self._retry_config["max_retries"] + 1):
            try:
                if attempt > 0:
                    delay = min(
                        self._retry_config["base_delay"]
                        * (self._retry_config["backoff_factor"] ** (attempt - 1)),
                        self._retry_config["max_delay"],
                    )
                    logger.info(
                        f"Retrying {operation_name} in {delay:.1f}s (attempt {attempt + 1}/{self._retry_config['max_retries'] + 1})"
                    )
                    await asyncio.sleep(delay)

                return await operation(*args, **kwargs)

            except CaptionError as e:
                last_exception = e
                if not e.retryable or attempt >= self._retry_config["max_retries"]:
                    raise
                logger.warning(f"{operation_name} failed (attempt {attempt + 1}): {e}")

            except Exception as e:
                last_exception = CaptionError(
                    f"Unexpected error in {operation_name}: {str(e)}",
                    "unexpected",
                    retryable=True,
                )
                if attempt >= self._retry_config["max_retries"]:
                    raise last_exception
                logger.warning(f"{operation_name} failed (attempt {attempt + 1}): {e}")

        # This should never be reached, but just in case
        raise last_exception or CaptionError(f"All retries failed for {operation_name}")

    async def _generate_caption_with_retry(
        self, model: CaptionGenerator, image_path: Path, config: Dict[str, Any]
    ) -> str:
        """
        Generate caption with retry logic.

        Args:
            model: The caption model
            image_path: Path to the image
            config: Configuration for generation

        Returns:
            The generated caption

        Raises:
            CaptionGenerationError: If generation fails after retries
        """

        async def _generate():
            try:
                return await model.generate(image_path, **config)
            except Exception as e:
                error_msg = str(e).lower()

                # Determine if error is retryable
                retryable = any(
                    pattern in error_msg
                    for pattern in [
                        "timeout",
                        "connection",
                        "network",
                        "temporary",
                        "server error",
                        "rate limit",
                        "memory",
                        "cuda",
                    ]
                )

                raise CaptionGenerationError(
                    model.name, str(e), retryable=retryable
                )

        return await self._retry_with_backoff(_generate, "caption generation")

    async def generate_single_caption(
        self,
        image_path: Path,
        generator_name: str,
        config: Optional[Dict[str, Any]] = None,
        force: bool = False,
    ) -> CaptionResult:
        """
        Generate a caption for a single image.

        Args:
            image_path: Path to the image
            generator_name: Name of the caption generator
            config: Configuration for the generator
            force: Whether to force regeneration if caption exists

        Returns:
            CaptionResult: Result of the caption generation
        """
        start_time = time.time()
        config = config or {}

        try:
            # Check if we should load the model
            if not self._should_load_model(generator_name, is_batch=False):
                return CaptionResult(
                    image_path=image_path,
                    generator_name=generator_name,
                    success=False,
                    error="Model loading not allowed for single operation",
                    error_type="model_loading",
                    retryable=False,
                    caption_type=None,
                )

            # Get or load the model with coordination
            model = await self._get_or_load_model_with_coordination(generator_name)
            if not model:
                return CaptionResult(
                    image_path=image_path,
                    generator_name=generator_name,
                    success=False,
                    error=f"Model {generator_name} is not available. Please ensure the model is downloaded and try again.",
                    error_type="model_unavailable",
                    retryable=True,
                    caption_type=None,
                )

            # Check if caption already exists (unless force is True)
            if not force:
                caption_path = image_path.with_suffix(f".{model.caption_type.value}")
                logger.debug(
                    f"Checking if caption exists for {generator_name}: {caption_path}"
                )
                if caption_path.exists():
                    logger.info(
                        f"Caption already exists for {generator_name} at {caption_path}, skipping generation"
                    )
                    return CaptionResult(
                        image_path=image_path,
                        generator_name=generator_name,
                        success=False,
                        error="Caption already exists. Use 'force' option to regenerate.",
                        error_type="caption_exists",
                        retryable=False,
                        caption_type=model.caption_type.value,
                    )

            # Generate caption with retry logic
            caption = await self._generate_caption_with_retry(model, image_path, config)

            # Apply post-processing if enabled
            if caption and config.get("post_process", True):
                caption = self._post_process_caption(
                    caption,
                    generator_name,
                    config.get("post_processing_settings"),
                )

            processing_time = time.time() - start_time

            return CaptionResult(
                image_path=image_path,
                generator_name=generator_name,
                success=True,
                caption=caption,
                processing_time=processing_time,
                caption_type=model.caption_type.value,
            )

        except CaptionError as e:
            processing_time = time.time() - start_time
            logger.error(
                f"Caption generation error for {image_path}: {e}", exc_info=True
            )

            friendly_error = self._format_error_message(e)

            return CaptionResult(
                image_path=image_path,
                generator_name=generator_name,
                success=False,
                error=friendly_error,
                error_type=e.error_type,
                retryable=e.retryable,
                processing_time=processing_time,
                caption_type=None,
            )

        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(
                f"Unexpected error generating caption for {image_path}: {e}",
                exc_info=True,
            )

            return CaptionResult(
                image_path=image_path,
                generator_name=generator_name,
                success=False,
                error=f"Unexpected error: {str(e)}",
                error_type="unexpected",
                retryable=True,
                processing_time=processing_time,
                caption_type=None,
            )

    async def generate_batch_captions(
        self,
        tasks: List[CaptionTask],
        progress_callback: Optional[Callable[[Dict[str, Any]], None]] = None,
        max_concurrent: int = 4,
    ) -> List[CaptionResult]:
        """
        Generate captions for multiple images in batch.

        Args:
            tasks: List of caption generation tasks
            progress_callback: Optional callback for progress updates
            max_concurrent: Maximum number of concurrent operations

        Returns:
            List[CaptionResult]: Results of all caption generation tasks
        """
        if not tasks:
            return []

        # Group tasks by generator for efficient model loading
        tasks_by_generator: Dict[str, List[CaptionTask]] = {}
        for task in tasks:
            if task.generator_name not in tasks_by_generator:
                tasks_by_generator[task.generator_name] = []
            tasks_by_generator[task.generator_name].append(task)

        # Pre-load models for batch operations with coordination
        loaded_models: Dict[str, CaptionGenerator] = {}
        for generator_name, generator_tasks in tasks_by_generator.items():
            if self._should_load_model(
                generator_name, is_batch=True, batch_size=len(generator_tasks)
            ):
                model = await self._get_or_load_model_with_coordination(generator_name)
                if model:
                    loaded_models[generator_name] = model
                else:
                    # If model loading fails, create error results for all tasks
                    for task in generator_tasks:
                        if progress_callback:
                            progress_callback(
                                {
                                    "type": "error",
                                    "message": f"Failed to load model: {generator_name}",
                                    "item": str(task.image_path),
                                }
                            )

        # Process tasks with semaphore for concurrency control
        semaphore = asyncio.Semaphore(max_concurrent)
        completed = 0
        total = len(tasks)
        results: List[CaptionResult] = []

        async def process_task(task: CaptionTask) -> CaptionResult:
            nonlocal completed

            async with semaphore:
                # Use pre-loaded model if available
                if task.generator_name in loaded_models:
                    model = loaded_models[task.generator_name]
                else:
                    model = await self._get_or_load_model_with_coordination(
                        task.generator_name
                    )

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
                    # Check if caption already exists (unless force is True)
                    if not task.force:
                        caption_path = task.image_path.with_suffix(
                            f".{model.caption_type.value}"
                        )
                        if caption_path.exists():
                            result = CaptionResult(
                                image_path=task.image_path,
                                generator_name=task.generator_name,
                                success=False,
                                error="Caption already exists. Use 'force' option to regenerate.",
                                error_type="caption_exists",
                                retryable=False,
                                caption_type=model.caption_type.value,
                            )
                        else:
                            result = await self._generate_caption_with_model(
                                model, task
                            )
                    else:
                        result = await self._generate_caption_with_model(model, task)

                completed += 1
                if progress_callback:
                    progress_callback(
                        {
                            "type": "item_complete",
                            "current": completed,
                            "total": total,
                            "message": f"Processed {completed}/{total} images",
                            "item_result": {
                                "image": task.image_path.name,
                                "success": result.success,
                                "error": result.error,
                            },
                        }
                    )

                return result

        # Create tasks and wait for completion
        task_coroutines = [process_task(task) for task in tasks]
        results = await asyncio.gather(*task_coroutines, return_exceptions=True)

        # Convert exceptions to error results
        final_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                final_results.append(
                    CaptionResult(
                        image_path=tasks[i].image_path,
                        generator_name=tasks[i].generator_name,
                        success=False,
                        error=f"Task failed: {str(result)}",
                        error_type="task_failed",
                        retryable=True,
                        caption_type=None,
                    )
                )
            else:
                final_results.append(result)

        return final_results

    async def _generate_caption_with_model(
        self, model: CaptionGenerator, task: CaptionTask
    ) -> CaptionResult:
        """Generate caption using a specific model."""
        start_time = time.time()

        try:
            # Generate caption with retry logic
            caption = await self._generate_caption_with_retry(
                model, task.image_path, task.config
            )

            # Apply post-processing
            if caption and task.post_process:
                settings = None
                try:
                    settings = (
                        task.config.get("post_processing_settings")
                        if task.config
                        else None
                    )
                except Exception:
                    settings = None
                caption = self._post_process_caption(
                    caption, task.generator_name, settings
                )

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
            logger.error(
                f"Caption generation error for {task.image_path}: {e}", exc_info=True
            )

            friendly_error = self._format_error_message(e)

            return CaptionResult(
                image_path=task.image_path,
                generator_name=task.generator_name,
                success=False,
                error=friendly_error,
                error_type=e.error_type,
                retryable=e.retryable,
                processing_time=processing_time,
                caption_type=None,
            )

        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(
                f"Unexpected error generating caption for {task.image_path}: {e}",
                exc_info=True,
            )

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

    def _format_error_message(self, error: CaptionError) -> str:
        """Return a concise error message suitable for user display.

        For generation errors, extract only the reason part after the colon.
        """
        try:
            message = str(error)
            if getattr(error, "error_type", None) == "generation" and ": " in message:
                return message.split(": ", 1)[1]
            return message
        except Exception:
            return str(error)

    def get_available_generators(self) -> Dict[str, Dict[str, Any]]:
        """Get information about available caption generators."""
        return self._manager.get_available_captioners()

    def get_generator_info(self, generator_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific generator."""
        return self._manager.get_available_captioners().get(generator_name)

    def is_generator_available(self, generator_name: str) -> bool:
        """Check if a generator is available."""
        return self._manager.is_captioner_available(generator_name)

    def get_loaded_models(self) -> set:
        """Get set of currently loaded model names."""
        return self._manager.get_loaded_models()

    def is_model_loaded(self, model_id: str) -> bool:
        """Check if a specific model is loaded."""
        return model_id in self._manager.get_loaded_models()

    async def unload_model(self, generator_name: str) -> bool:
        """Unload a specific model."""
        return await self._manager.unload_captioner(generator_name)

    def unload_all_models(self) -> None:
        """Unload all loaded models."""
        # This would need to be implemented in the manager
        pass

    def _post_process_caption(
        self,
        caption: str,
        generator_name: str,
        settings: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Apply post-processing to caption text.

        Advanced pipeline supports:
        - generator-specific overrides
        - explicit pipeline order
        - base rules default
        """
        if not caption:
            return caption

        # If no settings provided, fallback to simple, non-invasive defaults
        if (
            not settings
            or not isinstance(settings, dict)
            or not settings.get("enabled", True)
        ):
            # For tag-style generators, only replace underscores with spaces
            if generator_name in ["jtp2", "wdv3"]:
                return caption.replace("_", " ")
            # For others, return as-is
            return caption

        # Use explicit pipeline order if provided, otherwise a sensible default
        pipeline: List[str] = settings.get("pipeline") or [
            "replace_underscores",
            "trim_whitespace",
            "remove_duplicate_spaces",
            "normalize_punctuation_spacing",
            "case_conversion",
            "ensure_terminal_punctuation",
        ]

        # Base rules
        rules: Dict[str, Any] = {
            "replace_underscores": True,
            "case_conversion": "none",
            "trim_whitespace": True,
            "remove_duplicate_spaces": True,
            "ensure_terminal_punctuation": False,
            "normalize_punctuation_spacing": True,
        }
        # Merge in settings.rules
        settings_rules = settings.get("rules") or {}
        rules.update(settings_rules)
        # Apply generator overrides
        overrides = settings.get("overrides") or {}
        gen_over = overrides.get(generator_name)
        if isinstance(gen_over, dict):
            rules.update(gen_over)

        # Apply rules according to pipeline
        for step in pipeline:
            if step == "replace_underscores" and rules.get("replace_underscores"):
                if generator_name in ["jtp2", "wdv3"]:
                    caption = caption.replace("_", " ")
            elif step == "trim_whitespace" and rules.get("trim_whitespace"):
                caption = caption.strip()
            elif step == "remove_duplicate_spaces" and rules.get(
                "remove_duplicate_spaces"
            ):
                import re as _re

                caption = _re.sub(r"\s+", " ", caption)
            elif step == "normalize_punctuation_spacing" and rules.get(
                "normalize_punctuation_spacing"
            ):
                caption = self._normalize_spacing(caption)
            elif step == "case_conversion":
                mode = (rules.get("case_conversion") or "none").lower()
                caption = self._apply_case(caption, mode)
            elif step == "ensure_terminal_punctuation" and rules.get(
                "ensure_terminal_punctuation"
            ):
                if caption and caption[-1] not in ".!?":
                    caption = caption + "."

        return caption

    def _normalize_spacing(self, text: str) -> str:
        import re

        text = re.sub(r"\s+([,.;:!?])", r"\1", text)  # remove space before punctuation
        text = re.sub(r"([,.;:!?])(\S)", r"\1 \2", text)  # ensure space after punctuation
        text = re.sub(r"\s+", " ", text).strip()  # collapse spaces
        return text

    def _apply_case(self, text: str, mode: str) -> str:
        if mode == "lowercase":
            return text.lower()
        if mode == "uppercase":
            return text.upper()
        if mode == "titlecase":
            try:
                import re

                return re.sub(
                    r"\b(\w)(\w*)\b",
                    lambda m: m.group(1).upper() + m.group(2).lower(),
                    text,
                )
            except Exception:
                return text.title()
        return text


# Global instance
_caption_service: Optional[CaptionService] = None


def get_caption_service() -> CaptionService:
    """Get the global unified caption service instance."""
    global _caption_service
    if _caption_service is None:
        _caption_service = CaptionService()
    return _caption_service
