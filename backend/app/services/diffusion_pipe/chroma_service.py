"""Chroma-Specific Service for Advanced LoRA Training.

This module provides specialized Chroma model training capabilities with
optimization presets, validation, and integration with ComfyUI workflows.
"""

import asyncio
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.api.diffusion_pipe.models import (
    ChromaTrainingConfig,
    DiffusionPipeConfig,
    ModelType,
    OptimizerType,
    TrainingRequest,
    TrainingStatus,
)
from app.core.config import get_config
from app.services.diffusion_pipe.model_provider import ModelProvider
from app.services.diffusion_pipe.training_profile_manager import (
    get_training_profile_manager,
)
from app.services.diffusion_pipe.websocket_manager import get_websocket_manager

logger = logging.getLogger(__name__)


class ChromaOptimizationPreset:
    """Chroma optimization preset with specific configurations."""

    def __init__(
        self,
        name: str,
        description: str,
        rank: int,
        learning_rate: float,
        batch_size: int,
        epochs: int,
        optimizer_type: OptimizerType,
        special_config: Optional[Dict[str, Any]] = None,
    ):
        self.name = name
        self.description = description
        self.rank = rank
        self.learning_rate = learning_rate
        self.batch_size = batch_size
        self.epochs = epochs
        self.optimizer_type = optimizer_type
        self.special_config = special_config or {}

    def apply_to_config(self, config: ChromaTrainingConfig) -> ChromaTrainingConfig:
        """Apply preset settings to a Chroma training configuration."""
        config.rank = self.rank
        config.learning_rate = self.learning_rate
        config.optimizer_type = self.optimizer_type

        # Apply special configuration
        for key, value in self.special_config.items():
            if hasattr(config, key):
                setattr(config, key, value)

        return config


class ChromaService:
    """Specialized service for Chroma model training and optimization."""

    def __init__(self):
        self.config = get_config()
        self.profile_manager = get_training_profile_manager()
        self.websocket_manager = get_websocket_manager()
        self.chroma_provider = ModelProvider(ModelType.CHROMA, {})
        self._optimization_presets = self._create_optimization_presets()

    def _create_optimization_presets(self) -> Dict[str, ChromaOptimizationPreset]:
        """Create Chroma optimization presets."""
        presets = {}

        # Quality Preset - High quality, slower training
        presets["quality"] = ChromaOptimizationPreset(
            name="Quality",
            description="High-quality training with conservative settings",
            rank=64,
            learning_rate=1e-4,
            batch_size=2,
            epochs=1500,
            optimizer_type=OptimizerType.ADAMW,
            special_config={
                "betas": [0.9, 0.999],
                "weight_decay": 0.01,
                "eps": 1e-8,
            },
        )

        # Speed Preset - Fast training, good quality
        presets["speed"] = ChromaOptimizationPreset(
            name="Speed",
            description="Fast training with optimized settings",
            rank=32,
            learning_rate=2.5e-4,
            batch_size=4,
            epochs=800,
            optimizer_type=OptimizerType.ADAMW_OPTIMI,
            special_config={
                "betas": [0.9, 0.99],
                "weight_decay": 0.01,
                "eps": 1e-8,
            },
        )

        # Balanced Preset - Good balance of quality and speed
        presets["balanced"] = ChromaOptimizationPreset(
            name="Balanced",
            description="Balanced training with good quality and reasonable speed",
            rank=48,
            learning_rate=1.5e-4,
            batch_size=3,
            epochs=1000,
            optimizer_type=OptimizerType.ADAMW_OPTIMI,
            special_config={
                "betas": [0.9, 0.99],
                "weight_decay": 0.01,
                "eps": 1e-8,
            },
        )

        # E6AI Optimized Preset - Specifically optimized for E6AI dataset
        presets["e6ai_optimized"] = ChromaOptimizationPreset(
            name="E6AI Optimized",
            description="Optimized for E6AI dataset with specific settings",
            rank=32,
            learning_rate=2.5e-4,
            batch_size=4,
            epochs=1000,
            optimizer_type=OptimizerType.ADAMW_OPTIMI,
            special_config={
                "betas": [0.9, 0.99],
                "weight_decay": 0.01,
                "eps": 1e-8,
                "caption_prefix": "by e6ai, ",
            },
        )

        return presets

    async def validate_chroma_model(self, model_path: str) -> Dict[str, Any]:
        """Validate Chroma model for training compatibility."""
        validation_result = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "model_info": {},
        }

        try:
            model_file = Path(model_path)

            # Check if model file exists
            if not model_file.exists():
                validation_result["valid"] = False
                validation_result["errors"].append(
                    f"Model file does not exist: {model_path}"
                )
                return validation_result

            # Check file extension
            if model_file.suffix not in [".safetensors", ".ckpt", ".pt"]:
                validation_result["warnings"].append(
                    f"Unexpected file extension: {model_file.suffix}"
                )

            # Check file size (basic validation)
            file_size_mb = model_file.stat().st_size / (1024 * 1024)
            if file_size_mb < 100:
                validation_result["warnings"].append("Model file seems unusually small")
            elif file_size_mb > 10000:
                validation_result["warnings"].append(
                    "Model file is very large, may require significant memory"
                )

            # Extract model info
            validation_result["model_info"] = {
                "file_path": str(model_file.absolute()),
                "file_size_mb": round(file_size_mb, 2),
                "file_extension": model_file.suffix,
                "last_modified": model_file.stat().st_mtime,
            }

            # Check for Chroma-specific model patterns
            if "chroma" in model_file.name.lower():
                validation_result["model_info"]["detected_type"] = "chroma"
            elif "unet" in model_file.name.lower():
                validation_result["model_info"]["detected_type"] = "unet"

        except Exception as e:
            validation_result["valid"] = False
            validation_result["errors"].append(f"Validation error: {str(e)}")

        return validation_result

    async def get_optimization_presets(self) -> Dict[str, ChromaOptimizationPreset]:
        """Get available Chroma optimization presets."""
        return self._optimization_presets

    async def apply_optimization_preset(
        self,
        config: ChromaTrainingConfig,
        preset_name: str,
    ) -> ChromaTrainingConfig:
        """Apply an optimization preset to a Chroma training configuration."""
        if preset_name not in self._optimization_presets:
            raise ValueError(f"Unknown optimization preset: {preset_name}")

        preset = self._optimization_presets[preset_name]
        return preset.apply_to_config(config)

    async def create_chroma_training_request(
        self,
        dataset_path: str,
        output_dir: str,
        model_path: str,
        preset_name: str = "balanced",
        custom_config: Optional[Dict[str, Any]] = None,
    ) -> TrainingRequest:
        """Create a Chroma training request with optimization preset."""

        # Get the optimization preset
        if preset_name not in self._optimization_presets:
            raise ValueError(f"Unknown optimization preset: {preset_name}")

        preset = self._optimization_presets[preset_name]

        # Create base Chroma configuration
        chroma_config = ChromaTrainingConfig(
            model_type=ModelType.CHROMA,
            diffusers_path=self.config.DIFFUSION_PIPE_DEFAULT_MODEL_DIR,
            transformer_path=model_path,
            dtype="bfloat16",
            transformer_dtype="float8",
            flux_shift=True,
            adapter_type="lora",
            rank=preset.rank,
            adapter_dtype="bfloat16",
            optimizer_type=preset.optimizer_type,
            learning_rate=preset.learning_rate,
            betas=[0.9, 0.99],
            weight_decay=0.01,
            eps=1e-8,
        )

        # Apply preset optimizations
        chroma_config = preset.apply_to_config(chroma_config)

        # Apply custom configuration if provided
        if custom_config:
            for key, value in custom_config.items():
                if hasattr(chroma_config, key):
                    setattr(chroma_config, key, value)

        # Create full training configuration
        from app.api.diffusion_pipe.models import DatasetConfig, DiffusionPipeConfig

        training_config = DiffusionPipeConfig(
            output_dir=output_dir,
            dataset_config=DatasetConfig(
                dataset_path=dataset_path,
                resolutions=[512, 1024],  # Support both resolutions
                enable_ar_bucket=True,
                min_ar=0.5,
                max_ar=2.0,
                num_ar_buckets=9,
                frame_buckets=[1],
                shuffle_tags=True,
                caption_prefix=preset.special_config.get("caption_prefix", ""),
                num_repeats=1,
            ),
            training_model_config=chroma_config,
            epochs=preset.epochs,
            micro_batch_size_per_gpu=preset.batch_size,
            pipeline_stages=1,
            gradient_accumulation_steps=1,
            gradient_clipping=1.0,
            warmup_steps=100,
            enable_wandb=True,
            wandb_api_key=self.config.DIFFUSION_PIPE_WANDB_API_KEY,
            wandb_tracker_name="chroma-lora",
            wandb_run_name=f"chroma-{preset_name}",
        )

        # Generate request ID
        import uuid

        request_id = f"chroma_{preset_name}_{uuid.uuid4().hex[:8]}"

        return TrainingRequest(
            config=training_config,
            request_id=request_id,
            metadata={
                "preset": preset_name,
                "model_type": "chroma",
                "optimization_level": preset.name,
            },
        )

    async def start_chroma_training(
        self,
        dataset_path: str,
        output_dir: str,
        model_path: str,
        preset_name: str = "balanced",
        custom_config: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Start a Chroma training session with optimization preset."""

        logger.info(f"Starting Chroma training with preset: {preset_name}")

        # Validate model first
        validation_result = await self.validate_chroma_model(model_path)
        if not validation_result["valid"]:
            raise ValueError(f"Model validation failed: {validation_result['errors']}")

        # Create training request
        training_request = await self.create_chroma_training_request(
            dataset_path=dataset_path,
            output_dir=output_dir,
            model_path=model_path,
            preset_name=preset_name,
            custom_config=custom_config,
        )

        # Start training using the provider
        training_id = await self.chroma_provider.execute_training(training_request)

        # Send initial status update via WebSocket
        initial_status = TrainingStatus(
            request_id=training_id,
            status="pending",
            progress_percentage=0.0,
            current_epoch=0,
            total_epochs=training_request.config.epochs,
            current_step=0,
            total_steps=0,
            estimated_time_remaining=None,
            loss_value=None,
            learning_rate=training_request.config.training_model_config.learning_rate,
            gpu_memory_usage=None,
            cpu_usage=None,
            training_speed=None,
            metadata={
                "preset": preset_name,
                "model_type": "chroma",
                "optimization_level": self._optimization_presets[preset_name].name,
            },
        )

        await self.websocket_manager.send_training_status_update(
            training_id, initial_status
        )

        logger.info(f"Chroma training started: {training_id}")
        return training_id

    async def get_chroma_training_recommendations(
        self,
        dataset_size: int,
        gpu_memory_gb: float,
        quality_preference: str = "balanced",
    ) -> Dict[str, Any]:
        """Get Chroma training recommendations based on system specs."""

        recommendations = {
            "recommended_preset": "balanced",
            "batch_size": 4,
            "rank": 32,
            "learning_rate": 2.5e-4,
            "epochs": 1000,
            "reasoning": [],
        }

        # Adjust based on dataset size
        if dataset_size < 1000:
            recommendations["epochs"] = 1500
            recommendations["reasoning"].append(
                "Small dataset - increased epochs for better convergence"
            )
        elif dataset_size > 10000:
            recommendations["epochs"] = 800
            recommendations["reasoning"].append(
                "Large dataset - reduced epochs to prevent overfitting"
            )

        # Adjust based on GPU memory
        if gpu_memory_gb < 8:
            recommendations["batch_size"] = 2
            recommendations["rank"] = 16
            recommendations["reasoning"].append(
                "Limited GPU memory - reduced batch size and rank"
            )
        elif gpu_memory_gb > 24:
            recommendations["batch_size"] = 6
            recommendations["rank"] = 64
            recommendations["reasoning"].append(
                "High GPU memory - increased batch size and rank"
            )

        # Adjust based on quality preference
        if quality_preference == "quality":
            recommendations["recommended_preset"] = "quality"
            recommendations["rank"] = 64
            recommendations["learning_rate"] = 1e-4
            recommendations["reasoning"].append(
                "Quality preference - using high-quality preset"
            )
        elif quality_preference == "speed":
            recommendations["recommended_preset"] = "speed"
            recommendations["rank"] = 32
            recommendations["learning_rate"] = 2.5e-4
            recommendations["reasoning"].append("Speed preference - using fast preset")

        return recommendations

    async def integrate_with_comfyui(self, training_id: str) -> Dict[str, Any]:
        """Integrate Chroma training with ComfyUI workflow."""

        # This would integrate with existing ComfyUI service
        # For now, return a placeholder response

        integration_info = {
            "training_id": training_id,
            "comfyui_workflow_id": f"chroma_training_{training_id}",
            "workflow_url": f"/comfyui/workflows/chroma_training_{training_id}",
            "status": "ready",
            "metadata": {
                "model_type": "chroma",
                "integration_type": "lora_training",
                "workflow_template": "chroma_lora_training",
            },
        }

        logger.info(f"ComfyUI integration prepared for training: {training_id}")
        return integration_info


# Global Chroma service instance
_chroma_service: Optional[ChromaService] = None


def get_chroma_service() -> ChromaService:
    """Get the global Chroma service instance."""
    global _chroma_service
    if _chroma_service is None:
        _chroma_service = ChromaService()
    return _chroma_service
