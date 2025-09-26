"""Training Profile Manager for Diffusion-Pipe Integration.

This module provides comprehensive training profile management with predefined
templates, custom profile creation, and validation for the Reynard diffusion-pipe
integration.
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.api.diffusion_pipe.models import (
    ChromaTrainingConfig,
    DatasetConfig,
    DiffusionPipeConfig,
    ModelType,
    OptimizerType,
)
from app.core.config import get_config

logger = logging.getLogger(__name__)


class TrainingProfile:
    """Training profile with metadata and configuration."""

    def __init__(
        self,
        name: str,
        description: str,
        config: DiffusionPipeConfig,
        tags: Optional[List[str]] = None,
        created_by: str = "system",
        version: str = "1.0.0",
    ):
        self.name = name
        self.description = description
        self.config = config
        self.tags = tags or []
        self.created_by = created_by
        self.version = version
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert profile to dictionary."""
        return {
            "name": self.name,
            "description": self.description,
            "config": self.config.model_dump(),
            "tags": self.tags,
            "created_by": self.created_by,
            "version": self.version,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TrainingProfile":
        """Create profile from dictionary."""
        config = DiffusionPipeConfig(**data["config"])
        profile = cls(
            name=data["name"],
            description=data["description"],
            config=config,
            tags=data.get("tags", []),
            created_by=data.get("created_by", "system"),
            version=data.get("version", "1.0.0"),
        )
        profile.created_at = datetime.fromisoformat(
            data.get("created_at", datetime.now().isoformat())
        )
        profile.updated_at = datetime.fromisoformat(
            data.get("updated_at", datetime.now().isoformat())
        )
        return profile


class TrainingProfileManager:
    """Manager for training profiles with template support."""

    def __init__(self):
        self.config = get_config()
        self.profiles_dir = (
            Path(self.config.DIFFUSION_PIPE_DEFAULT_OUTPUT_DIR) / "profiles"
        )
        self.profiles_dir.mkdir(parents=True, exist_ok=True)
        self._profiles: Dict[str, TrainingProfile] = {}
        self._load_default_profiles()

    def _load_default_profiles(self):
        """Load default training profiles."""
        logger.info("Loading default training profiles")

        # Chroma E6AI 512 Profile (Default)
        chroma_512_profile = self._create_chroma_e6ai_512_profile()
        self._profiles["chroma_e6ai_512"] = chroma_512_profile

        # Chroma E6AI 1024 Profile (Advanced)
        chroma_1024_profile = self._create_chroma_e6ai_1024_profile()
        self._profiles["chroma_e6ai_1024"] = chroma_1024_profile

        # SDXL Basic Profile
        sdxl_basic_profile = self._create_sdxl_basic_profile()
        self._profiles["sdxl_basic"] = sdxl_basic_profile

        logger.info(f"Loaded {len(self._profiles)} default profiles")

    def _create_chroma_e6ai_512_profile(self) -> TrainingProfile:
        """Create Chroma E6AI 512 training profile."""
        config = DiffusionPipeConfig(
            output_dir=f"{self.config.DIFFUSION_PIPE_DEFAULT_OUTPUT_DIR}/e6ai_512",
            dataset_config=DatasetConfig(
                dataset_path="/home/kade/datasets/e6ai/1_e6ai",
                resolutions=[512],
                enable_ar_bucket=True,
                min_ar=0.5,
                max_ar=2.0,
                num_ar_buckets=9,
                frame_buckets=[1],
                shuffle_tags=True,
                caption_prefix="by e6ai, ",
                num_repeats=1,
            ),
            training_model_config=ChromaTrainingConfig(
                model_type=ModelType.CHROMA,
                diffusers_path="/home/kade/flux_schnell_diffusers",
                transformer_path="/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v47.safetensors",
                dtype="bfloat16",
                transformer_dtype="float8",
                flux_shift=True,
                adapter_type="lora",
                rank=32,
                adapter_dtype="bfloat16",
                optimizer_type=OptimizerType.ADAMW_OPTIMI,
                learning_rate=2.5e-4,
                betas=[0.9, 0.99],
                weight_decay=0.01,
                eps=1e-8,
            ),
            epochs=1000,
            micro_batch_size_per_gpu=4,
            pipeline_stages=1,
            gradient_accumulation_steps=1,
            gradient_clipping=1.0,
            warmup_steps=100,
            enable_wandb=True,
            wandb_api_key=self.config.DIFFUSION_PIPE_WANDB_API_KEY,
            wandb_tracker_name="e6ai-lora",
            wandb_run_name="e6ai-512-default",
        )

        return TrainingProfile(
            name="Chroma E6AI 512",
            description="Chroma model training with E6AI dataset at 512 resolution - optimized for quality and speed",
            config=config,
            tags=["chroma", "e6ai", "512", "lora", "default"],
            created_by="system",
        )

    def _create_chroma_e6ai_1024_profile(self) -> TrainingProfile:
        """Create Chroma E6AI 1024 training profile."""
        config = DiffusionPipeConfig(
            output_dir=f"{self.config.DIFFUSION_PIPE_DEFAULT_OUTPUT_DIR}/e6ai_1024",
            dataset_config=DatasetConfig(
                dataset_path="/home/kade/datasets/e6ai/1_e6ai",
                resolutions=[1024],
                enable_ar_bucket=True,
                min_ar=0.5,
                max_ar=2.0,
                num_ar_buckets=9,
                frame_buckets=[1],
                shuffle_tags=True,
                caption_prefix="by e6ai, ",
                num_repeats=1,
            ),
            training_model_config=ChromaTrainingConfig(
                model_type=ModelType.CHROMA,
                diffusers_path="/home/kade/flux_schnell_diffusers",
                transformer_path="/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v50.safetensors",
                dtype="bfloat16",
                transformer_dtype="float8",
                flux_shift=True,
                adapter_type="lora",
                rank=32,
                adapter_dtype="bfloat16",
                optimizer_type=OptimizerType.ADAMW_OPTIMI,
                learning_rate=2.5e-4,
                betas=[0.9, 0.99],
                weight_decay=0.01,
                eps=1e-8,
            ),
            epochs=1000,
            micro_batch_size_per_gpu=1,  # Reduced for 1024 resolution
            pipeline_stages=1,
            gradient_accumulation_steps=1,
            gradient_clipping=1.0,
            warmup_steps=100,
            enable_wandb=True,
            wandb_api_key=self.config.DIFFUSION_PIPE_WANDB_API_KEY,
            wandb_tracker_name="e6ai-lora",
            wandb_run_name="e6ai-1024-advanced",
        )

        return TrainingProfile(
            name="Chroma E6AI 1024",
            description="Chroma model training with E6AI dataset at 1024 resolution - advanced high-quality training",
            config=config,
            tags=["chroma", "e6ai", "1024", "lora", "advanced", "high-quality"],
            created_by="system",
        )

    def _create_sdxl_basic_profile(self) -> TrainingProfile:
        """Create SDXL basic training profile."""
        config = DiffusionPipeConfig(
            output_dir=f"{self.config.DIFFUSION_PIPE_DEFAULT_OUTPUT_DIR}/sdxl_basic",
            dataset_config=DatasetConfig(
                dataset_path="/home/kade/datasets/sdxl",
                resolutions=[1024],
                enable_ar_bucket=True,
                min_ar=0.5,
                max_ar=2.0,
                num_ar_buckets=9,
                frame_buckets=[1],
                shuffle_tags=True,
                caption_prefix="",
                num_repeats=1,
            ),
            training_model_config=ChromaTrainingConfig(
                model_type=ModelType.SDXL,
                diffusers_path="/home/kade/runeset/wolfy/models/sdxl",
                transformer_path="/home/kade/runeset/wolfy/models/unet/sdxl-unet.safetensors",
                dtype="bfloat16",
                transformer_dtype="bfloat16",
                flux_shift=False,
                adapter_type="lora",
                rank=64,
                adapter_dtype="bfloat16",
                optimizer_type=OptimizerType.ADAMW,
                learning_rate=1e-4,
                betas=[0.9, 0.999],
                weight_decay=0.01,
                eps=1e-8,
            ),
            epochs=500,
            micro_batch_size_per_gpu=2,
            pipeline_stages=1,
            gradient_accumulation_steps=1,
            gradient_clipping=1.0,
            warmup_steps=50,
            enable_wandb=True,
            wandb_api_key=self.config.DIFFUSION_PIPE_WANDB_API_KEY,
            wandb_tracker_name="sdxl-lora",
            wandb_run_name="sdxl-basic",
        )

        return TrainingProfile(
            name="SDXL Basic",
            description="Basic SDXL model training configuration for general use",
            config=config,
            tags=["sdxl", "basic", "lora", "general"],
            created_by="system",
        )

    def get_profile(self, name: str) -> Optional[TrainingProfile]:
        """Get a training profile by name."""
        return self._profiles.get(name)

    def list_profiles(self, tags: Optional[List[str]] = None) -> List[TrainingProfile]:
        """List all profiles, optionally filtered by tags."""
        profiles = list(self._profiles.values())

        if tags:
            filtered_profiles = []
            for profile in profiles:
                if any(tag in profile.tags for tag in tags):
                    filtered_profiles.append(profile)
            return filtered_profiles

        return profiles

    def create_custom_profile(
        self,
        name: str,
        description: str,
        config: DiffusionPipeConfig,
        tags: Optional[List[str]] = None,
        created_by: str = "user",
    ) -> TrainingProfile:
        """Create a custom training profile."""
        if name in self._profiles:
            raise ValueError(f"Profile '{name}' already exists")

        profile = TrainingProfile(
            name=name,
            description=description,
            config=config,
            tags=tags or [],
            created_by=created_by,
        )

        self._profiles[name] = profile
        self._save_profile(profile)

        logger.info(f"Created custom profile: {name}")
        return profile

    def update_profile(
        self,
        name: str,
        config: Optional[DiffusionPipeConfig] = None,
        description: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> TrainingProfile:
        """Update an existing training profile."""
        if name not in self._profiles:
            raise ValueError(f"Profile '{name}' not found")

        profile = self._profiles[name]

        if config:
            profile.config = config
        if description:
            profile.description = description
        if tags:
            profile.tags = tags

        profile.updated_at = datetime.now()
        self._save_profile(profile)

        logger.info(f"Updated profile: {name}")
        return profile

    def delete_profile(self, name: str) -> bool:
        """Delete a training profile."""
        if name not in self._profiles:
            return False

        # Don't allow deletion of system profiles
        if self._profiles[name].created_by == "system":
            raise ValueError(f"Cannot delete system profile: {name}")

        del self._profiles[name]

        # Delete profile file
        profile_file = self.profiles_dir / f"{name}.json"
        if profile_file.exists():
            profile_file.unlink()

        logger.info(f"Deleted profile: {name}")
        return True

    def export_profile(self, name: str) -> Dict[str, Any]:
        """Export a profile to dictionary format."""
        if name not in self._profiles:
            raise ValueError(f"Profile '{name}' not found")

        return self._profiles[name].to_dict()

    def import_profile(
        self, data: Dict[str, Any], overwrite: bool = False
    ) -> TrainingProfile:
        """Import a profile from dictionary format."""
        name = data["name"]

        if name in self._profiles and not overwrite:
            raise ValueError(
                f"Profile '{name}' already exists. Use overwrite=True to replace."
            )

        profile = TrainingProfile.from_dict(data)
        self._profiles[name] = profile
        self._save_profile(profile)

        logger.info(f"Imported profile: {name}")
        return profile

    def validate_profile(self, name: str) -> Dict[str, Any]:
        """Validate a training profile configuration."""
        if name not in self._profiles:
            return {"valid": False, "errors": [f"Profile '{name}' not found"]}

        profile = self._profiles[name]
        errors = []
        warnings = []

        try:
            # Validate configuration
            profile.config.model_validate(profile.config.model_dump())
        except Exception as e:
            errors.append(f"Configuration validation failed: {str(e)}")

        # Check paths
        if not Path(profile.config.dataset_config.dataset_path).exists():
            errors.append(
                f"Dataset path does not exist: {profile.config.dataset_config.dataset_path}"
            )

        if not Path(profile.config.training_model_config.transformer_path).exists():
            errors.append(
                f"Transformer path does not exist: {profile.config.training_model_config.transformer_path}"
            )

        # Check WandB configuration
        if profile.config.enable_wandb and not profile.config.wandb_api_key:
            warnings.append("WandB enabled but no API key provided")

        # Check GPU memory requirements
        if profile.config.micro_batch_size_per_gpu > 8:
            warnings.append("Large batch size may require significant GPU memory")

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
        }

    def _save_profile(self, profile: TrainingProfile):
        """Save a profile to disk."""
        profile_file = self.profiles_dir / f"{profile.name}.json"
        with open(profile_file, "w") as f:
            json.dump(profile.to_dict(), f, indent=2)

    def _load_profile(self, name: str) -> Optional[TrainingProfile]:
        """Load a profile from disk."""
        profile_file = self.profiles_dir / f"{name}.json"
        if not profile_file.exists():
            return None

        try:
            with open(profile_file, "r") as f:
                data = json.load(f)
            return TrainingProfile.from_dict(data)
        except Exception as e:
            logger.error(f"Failed to load profile {name}: {e}")
            return None


# Global profile manager instance
_profile_manager: Optional[TrainingProfileManager] = None


def get_training_profile_manager() -> TrainingProfileManager:
    """Get the global training profile manager instance."""
    global _profile_manager
    if _profile_manager is None:
        _profile_manager = TrainingProfileManager()
    return _profile_manager
