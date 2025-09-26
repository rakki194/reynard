"""Model-specific training providers.

This module provides model-specific training providers with capabilities
registry, model validation, and specialized training configurations.
"""

import asyncio
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.api.diffusion_pipe.models import (
    ModelInfo,
    ModelType,
    TrainingRequest,
    TrainingStatus,
)

logger = logging.getLogger(__name__)


class ModelProvider:
    """Model-specific training provider with capabilities registry.

    This provider handles:
    - Model-specific training configurations and optimizations
    - Model validation and compatibility checks
    - Specialized training parameters and presets
    - Model information and capabilities registry
    - Training execution with model-specific optimizations
    """

    def __init__(self, model_type: ModelType, config: Dict[str, Any]):
        """Initialize the model provider."""
        self.model_type = model_type
        self.config = config
        self.is_initialized = False
        self.model_info: Optional[ModelInfo] = None

        # Model-specific configurations
        self.model_configs = self._get_model_configs()

        logger.info(f"ModelProvider initialized for {model_type}")

    async def initialize(self) -> bool:
        """Initialize the model provider."""
        try:
            # Validate model availability
            if not await self._validate_model_availability():
                logger.warning(f"Model {self.model_type} not available")
                return False

            # Load model information
            self.model_info = await self._load_model_info()

            # Validate model configuration
            if not await self._validate_model_configuration():
                logger.error(
                    f"Model configuration validation failed for {self.model_type}"
                )
                return False

            self.is_initialized = True
            logger.info(f"ModelProvider for {self.model_type} initialized successfully")
            return True

        except Exception as e:
            logger.error(
                f"Failed to initialize ModelProvider for {self.model_type}: {e}"
            )
            return False

    async def shutdown(self) -> bool:
        """Shutdown the model provider."""
        try:
            self.is_initialized = False
            logger.info(f"ModelProvider for {self.model_type} shutdown completed")
            return True

        except Exception as e:
            logger.error(
                f"Error during ModelProvider shutdown for {self.model_type}: {e}"
            )
            return False

    def is_available(self) -> bool:
        """Check if the model is available."""
        return self.is_initialized and self.model_info is not None

    async def get_model_info(self) -> ModelInfo:
        """Get model information."""
        if not self.model_info:
            raise RuntimeError(f"Model info not available for {self.model_type}")
        return self.model_info

    async def execute_training(
        self, request: TrainingRequest, training_status: TrainingStatus
    ) -> Dict[str, Any]:
        """Execute training with model-specific optimizations."""
        try:
            if not self.is_available():
                raise RuntimeError(f"Model {self.model_type} not available")

            # Apply model-specific optimizations
            optimized_request = await self._optimize_training_request(request)

            # Validate training request
            if not await self._validate_training_request(optimized_request):
                raise ValueError(f"Invalid training request for {self.model_type}")

            # Execute training with model-specific parameters
            result = await self._execute_model_training(
                optimized_request, training_status
            )

            return result

        except Exception as e:
            logger.error(f"Training execution failed for {self.model_type}: {e}")
            return {"success": False, "error_message": str(e)}

    async def get_supported_resolutions(self) -> List[int]:
        """Get supported resolutions for this model."""
        if not self.model_info:
            return []
        return self.model_info.supported_resolutions

    async def get_max_batch_size(self) -> int:
        """Get maximum batch size for this model."""
        if not self.model_info:
            return 1
        return self.model_info.max_batch_size

    async def get_memory_requirement(self) -> float:
        """Get memory requirement in GB for this model."""
        if not self.model_info:
            return 0.0
        return self.model_info.memory_requirement_gb

    def _get_model_configs(self) -> Dict[str, Any]:
        """Get model-specific configurations."""
        configs = {
            ModelType.CHROMA: {
                "name": "Chroma",
                "description": "High-quality image generation model with LoRA support",
                "supported_resolutions": [512, 1024],
                "max_batch_size": 8,
                "memory_requirement_gb": 12.0,
                "default_rank": 32,
                "default_learning_rate": 2.5e-4,
                "optimized_settings": {
                    "gradient_clipping": 1.0,
                    "warmup_steps": 100,
                    "enable_mixed_precision": True,
                    "enable_gradient_checkpointing": True,
                },
            },
            ModelType.SDXL: {
                "name": "Stable Diffusion XL",
                "description": "High-resolution image generation model",
                "supported_resolutions": [1024],
                "max_batch_size": 4,
                "memory_requirement_gb": 16.0,
                "default_rank": 64,
                "default_learning_rate": 1e-4,
                "optimized_settings": {
                    "gradient_clipping": 1.0,
                    "warmup_steps": 200,
                    "enable_mixed_precision": True,
                    "enable_gradient_checkpointing": True,
                },
            },
            ModelType.FLUX: {
                "name": "Flux",
                "description": "Advanced image generation model",
                "supported_resolutions": [1024],
                "max_batch_size": 2,
                "memory_requirement_gb": 20.0,
                "default_rank": 32,
                "default_learning_rate": 1e-4,
                "optimized_settings": {
                    "gradient_clipping": 1.0,
                    "warmup_steps": 150,
                    "enable_mixed_precision": True,
                    "enable_gradient_checkpointing": True,
                },
            },
            ModelType.LTX_VIDEO: {
                "name": "LTX Video",
                "description": "Video generation model",
                "supported_resolutions": [512, 1024],
                "max_batch_size": 1,
                "memory_requirement_gb": 24.0,
                "default_rank": 16,
                "default_learning_rate": 5e-5,
                "optimized_settings": {
                    "gradient_clipping": 1.0,
                    "warmup_steps": 100,
                    "enable_mixed_precision": True,
                    "enable_gradient_checkpointing": True,
                },
            },
            ModelType.HUNYUAN_VIDEO: {
                "name": "Hunyuan Video",
                "description": "Advanced video generation model",
                "supported_resolutions": [512, 1024],
                "max_batch_size": 1,
                "memory_requirement_gb": 28.0,
                "default_rank": 16,
                "default_learning_rate": 5e-5,
                "optimized_settings": {
                    "gradient_clipping": 1.0,
                    "warmup_steps": 100,
                    "enable_mixed_precision": True,
                    "enable_gradient_checkpointing": True,
                },
            },
            ModelType.COSMOS: {
                "name": "Cosmos",
                "description": "Cosmic image generation model",
                "supported_resolutions": [512, 1024],
                "max_batch_size": 4,
                "memory_requirement_gb": 14.0,
                "default_rank": 32,
                "default_learning_rate": 2e-4,
                "optimized_settings": {
                    "gradient_clipping": 1.0,
                    "warmup_steps": 100,
                    "enable_mixed_precision": True,
                    "enable_gradient_checkpointing": True,
                },
            },
            ModelType.LUMINA: {
                "name": "Lumina",
                "description": "Luminous image generation model",
                "supported_resolutions": [512, 1024],
                "max_batch_size": 6,
                "memory_requirement_gb": 10.0,
                "default_rank": 32,
                "default_learning_rate": 2.5e-4,
                "optimized_settings": {
                    "gradient_clipping": 1.0,
                    "warmup_steps": 100,
                    "enable_mixed_precision": True,
                    "enable_gradient_checkpointing": True,
                },
            },
            ModelType.WAN2_1: {
                "name": "Wan 2.1",
                "description": "Wan image generation model v2.1",
                "supported_resolutions": [512, 1024],
                "max_batch_size": 4,
                "memory_requirement_gb": 12.0,
                "default_rank": 32,
                "default_learning_rate": 2e-4,
                "optimized_settings": {
                    "gradient_clipping": 1.0,
                    "warmup_steps": 100,
                    "enable_mixed_precision": True,
                    "enable_gradient_checkpointing": True,
                },
            },
            ModelType.HIDREAM: {
                "name": "HiDream",
                "description": "High-dream image generation model",
                "supported_resolutions": [512, 1024],
                "max_batch_size": 4,
                "memory_requirement_gb": 14.0,
                "default_rank": 32,
                "default_learning_rate": 2e-4,
                "optimized_settings": {
                    "gradient_clipping": 1.0,
                    "warmup_steps": 100,
                    "enable_mixed_precision": True,
                    "enable_gradient_checkpointing": True,
                },
            },
            ModelType.SD3: {
                "name": "Stable Diffusion 3",
                "description": "Latest Stable Diffusion model",
                "supported_resolutions": [1024],
                "max_batch_size": 2,
                "memory_requirement_gb": 18.0,
                "default_rank": 64,
                "default_learning_rate": 1e-4,
                "optimized_settings": {
                    "gradient_clipping": 1.0,
                    "warmup_steps": 200,
                    "enable_mixed_precision": True,
                    "enable_gradient_checkpointing": True,
                },
            },
            ModelType.COSMOS_PREDICT2: {
                "name": "Cosmos Predict 2",
                "description": "Cosmos prediction model v2",
                "supported_resolutions": [512, 1024],
                "max_batch_size": 4,
                "memory_requirement_gb": 16.0,
                "default_rank": 32,
                "default_learning_rate": 2e-4,
                "optimized_settings": {
                    "gradient_clipping": 1.0,
                    "warmup_steps": 100,
                    "enable_mixed_precision": True,
                    "enable_gradient_checkpointing": True,
                },
            },
        }

        return configs.get(self.model_type, {})

    async def _validate_model_availability(self) -> bool:
        """Validate model availability."""
        try:
            # Check if model files exist
            model_dir = Path(
                self.config.get("default_model_dir", "/home/kade/runeset/wolfy/models")
            )

            # Model-specific file checks
            if self.model_type == ModelType.CHROMA:
                # Check for Chroma-specific files
                required_files = [
                    "chroma-unlocked-v47.safetensors",
                    "chroma-unlocked-v50.safetensors",
                ]
                for file_name in required_files:
                    file_path = model_dir / "unet" / file_name
                    if file_path.exists():
                        return True
            else:
                # For other models, check for generic model files
                model_files = list(model_dir.glob(f"**/*{self.model_type.value}*"))
                if model_files:
                    return True

            return False

        except Exception as e:
            logger.error(
                f"Model availability validation error for {self.model_type}: {e}"
            )
            return False

    async def _load_model_info(self) -> ModelInfo:
        """Load model information."""
        try:
            model_config = self.model_configs

            return ModelInfo(
                model_type=self.model_type,
                model_name=model_config.get("name", self.model_type.value),
                model_version="1.0.0",
                model_path=str(
                    Path(
                        self.config.get(
                            "default_model_dir", "/home/kade/runeset/wolfy/models"
                        )
                    )
                ),
                supported_resolutions=model_config.get("supported_resolutions", [512]),
                max_batch_size=model_config.get("max_batch_size", 1),
                memory_requirement_gb=model_config.get("memory_requirement_gb", 8.0),
                is_available=True,
                is_loaded=False,
                description=model_config.get("description", ""),
                tags=[self.model_type.value, "diffusion", "training"],
            )

        except Exception as e:
            logger.error(f"Failed to load model info for {self.model_type}: {e}")
            raise

    async def _validate_model_configuration(self) -> bool:
        """Validate model configuration."""
        try:
            # Check if model config exists
            if not self.model_configs:
                logger.error(f"No configuration found for model {self.model_type}")
                return False

            # Validate required fields
            required_fields = [
                "name",
                "supported_resolutions",
                "max_batch_size",
                "memory_requirement_gb",
            ]
            for field in required_fields:
                if field not in self.model_configs:
                    logger.error(
                        f"Missing required field {field} for model {self.model_type}"
                    )
                    return False

            return True

        except Exception as e:
            logger.error(
                f"Model configuration validation error for {self.model_type}: {e}"
            )
            return False

    async def _optimize_training_request(
        self, request: TrainingRequest
    ) -> TrainingRequest:
        """Apply model-specific optimizations to training request."""
        try:
            # Get model-specific settings
            optimized_settings = self.model_configs.get("optimized_settings", {})

            # Apply optimizations
            config = request.config

            # Update model configuration with optimized settings
            if "gradient_clipping" in optimized_settings:
                config.gradient_clipping = optimized_settings["gradient_clipping"]

            if "warmup_steps" in optimized_settings:
                config.warmup_steps = optimized_settings["warmup_steps"]

            if "enable_mixed_precision" in optimized_settings:
                config.enable_mixed_precision = optimized_settings[
                    "enable_mixed_precision"
                ]

            if "enable_gradient_checkpointing" in optimized_settings:
                config.enable_gradient_checkpointing = optimized_settings[
                    "enable_gradient_checkpointing"
                ]

            # Apply model-specific defaults if not set
            model_config = config.model_config
            if model_config.rank == 32 and "default_rank" in self.model_configs:
                model_config.rank = self.model_configs["default_rank"]

            if (
                model_config.learning_rate == 2.5e-4
                and "default_learning_rate" in self.model_configs
            ):
                model_config.learning_rate = self.model_configs["default_learning_rate"]

            # Validate batch size against model limits
            max_batch_size = self.model_configs.get("max_batch_size", 1)
            if config.micro_batch_size_per_gpu > max_batch_size:
                logger.warning(
                    f"Batch size {config.micro_batch_size_per_gpu} exceeds model limit {max_batch_size}"
                )
                config.micro_batch_size_per_gpu = max_batch_size

            return request

        except Exception as e:
            logger.error(
                f"Failed to optimize training request for {self.model_type}: {e}"
            )
            return request

    async def _validate_training_request(self, request: TrainingRequest) -> bool:
        """Validate training request for this model."""
        try:
            config = request.config
            model_config = config.training_model_config

            # Check model type match
            if model_config.model_type != self.model_type:
                logger.error(
                    f"Model type mismatch: expected {self.model_type}, got {model_config.model_type}"
                )
                return False

            # Check resolution support
            dataset_config = config.dataset_config
            supported_resolutions = self.model_configs.get("supported_resolutions", [])

            for resolution in dataset_config.resolutions:
                if resolution not in supported_resolutions:
                    logger.error(
                        f"Resolution {resolution} not supported by {self.model_type}"
                    )
                    return False

            # Check batch size limits
            max_batch_size = self.model_configs.get("max_batch_size", 1)
            if config.micro_batch_size_per_gpu > max_batch_size:
                logger.error(
                    f"Batch size {config.micro_batch_size_per_gpu} exceeds model limit {max_batch_size}"
                )
                return False

            # Check memory requirements
            memory_requirement = self.model_configs.get("memory_requirement_gb", 8.0)
            max_gpu_memory = request.max_gpu_memory_gb or self.config.get(
                "max_gpu_memory_gb", 24
            )

            if memory_requirement > max_gpu_memory:
                logger.error(
                    f"Model requires {memory_requirement}GB but only {max_gpu_memory}GB available"
                )
                return False

            return True

        except Exception as e:
            logger.error(
                f"Training request validation error for {self.model_type}: {e}"
            )
            return False

    async def _execute_model_training(
        self, request: TrainingRequest, training_status: TrainingStatus
    ) -> Dict[str, Any]:
        """Execute training with model-specific parameters."""
        try:
            # This would integrate with the TrainingManager
            # For now, return a placeholder response

            logger.info(
                f"Executing training for {self.model_type} with request {request.request_id}"
            )

            # Simulate training execution
            await asyncio.sleep(1)  # Placeholder

            return {
                "success": True,
                "output_path": f"/tmp/training_output/{request.request_id}",
                "model_type": self.model_type.value,
                "optimizations_applied": list(
                    self.model_configs.get("optimized_settings", {}).keys()
                ),
            }

        except Exception as e:
            logger.error(f"Model training execution error for {self.model_type}: {e}")
            return {"success": False, "error_message": str(e)}
