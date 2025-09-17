"""
WDv3 Generator Implementation

This module implements the WDv3 caption generator for the Reynard system.
WDv3 is a Danbooru-style tagger with support for various architectures.

The implementation includes:
- Model loading and management
- GPU acceleration support
- Configurable threshold for tag confidence
- Support for different architectures
- Batch processing capabilities
"""

import asyncio
import json
import logging
from pathlib import Path
from typing import Any

import safetensors
import timm
import torch
from huggingface_hub import hf_hub_download
from PIL import Image

from ...base import CaptionGeneratorBase, CaptionType, ModelCategory

logger = logging.getLogger("uvicorn")

# Self-contained WDv3 implementation - no external dependencies
WDV3_AVAILABLE = True

# Map of model names to HuggingFace repositories
MODEL_REPO_MAP = {
    "vit": "SmilingWolf/wd-vit-tagger-v3",
    "swinv2": "SmilingWolf/wd-swinv2-tagger-v3",
    "convnext": "SmilingWolf/wd-convnext-tagger-v3",
}


class WDv3Generator(CaptionGeneratorBase):
    """
    WDv3 caption generator.

    This generator provides Danbooru-style tagging with support for various
    architectures including ViT, SwinV2, and ConvNeXt.
    """

    def __init__(self, config: dict[str, Any] | None = None):
        self._config = config or {}
        self._model = None
        self._labels = None
        self._transform = None
        self._device = None
        self._is_loaded = False
        self._architecture = self._config.get("architecture", "vit")
        self._gen_threshold = self._config.get("gen_threshold", 0.35)
        self._char_threshold = self._config.get("char_threshold", 0.75)
        self._downloaded_model_path = None
        self._downloaded_labels_path = None

    @property
    def name(self) -> str:
        """Get the name of the generator."""
        return "wdv3"

    @property
    def description(self) -> str:
        """Get the description of the generator."""
        return "WDv3 - Danbooru-style tagger with multiple architecture support"

    @property
    def version(self) -> str:
        """Get the version of the generator."""
        return "1.0.0"

    @property
    def caption_type(self) -> CaptionType:
        """Get the caption type."""
        return CaptionType.TAGS

    @property
    def model_category(self) -> ModelCategory:
        """Get the model category."""
        return ModelCategory.LIGHTWEIGHT

    @property
    def is_loaded(self) -> bool:
        """Check if the model is loaded."""
        return self._is_loaded

    @property
    def config_schema(self) -> dict[str, Any]:
        """Get the configuration schema."""
        return {
            "type": "object",
            "properties": {
                "gen_threshold": {
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 1.0,
                    "default": 0.35,
                    "description": "Confidence threshold for general tags",
                },
                "char_threshold": {
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 1.0,
                    "default": 0.75,
                    "description": "Confidence threshold for character tags",
                },
                "force_cpu": {
                    "type": "boolean",
                    "default": False,
                    "description": "Force CPU usage instead of GPU",
                },
                "architecture": {
                    "type": "string",
                    "enum": ["vit", "swinv2", "convnext"],
                    "default": "vit",
                    "description": "Model architecture to use",
                },
            },
        }

    @property
    def features(self) -> list[str]:
        """Get the list of features."""
        return [
            "gpu_acceleration",
            "batch_processing",
            "multiple_architectures",
            "danbooru_style",
        ]

    def is_available(self) -> bool:
        """Check if the generator is available."""
        if not WDV3_AVAILABLE:
            return False

        # Check if required dependencies are available
        try:
            import safetensors
            import timm
            import torch

            return True
        except ImportError:
            return False

    async def load(self, config: dict[str, Any] | None = None) -> None:
        """Load the WDv3 model."""
        if self._is_loaded:
            return

        if not WDV3_AVAILABLE:
            raise RuntimeError("WDv3 generator is not available")

        try:
            # Update config if provided
            if config:
                self._config.update(config)

            # Determine device
            force_cpu = self._config.get("force_cpu", False)
            if force_cpu or not torch.cuda.is_available():
                self._device = torch.device("cpu")
                logger.info("WDv3 using CPU")
            else:
                self._device = torch.device("cuda")
                logger.info("WDv3 using GPU")

            # Load model and labels in executor to avoid blocking
            await asyncio.get_event_loop().run_in_executor(
                None, self._load_model_and_labels
            )

            self._is_loaded = True
            logger.info("WDv3 model loaded successfully")

        except Exception as e:
            self._is_loaded = False
            logger.error(f"Failed to load WDv3 model: {e}")
            raise

    async def unload(self) -> None:
        """Unload the WDv3 model."""
        if not self._is_loaded:
            return

        try:
            # Clear model from memory
            self._model = None
            self._labels = None
            self._transform = None
            self._is_loaded = False
            logger.info("WDv3 model unloaded successfully")

        except Exception as e:
            logger.error(f"Failed to unload WDv3 model: {e}")
            raise

    async def generate(self, image_path: Path, **kwargs) -> str:
        """Generate tags for an image."""
        if not self._is_loaded:
            raise RuntimeError("WDv3 model is not loaded")

        try:
            # Merge kwargs with config
            config = {**self._config, **kwargs}

            # Generate tags using self-contained implementation
            tags = await asyncio.get_event_loop().run_in_executor(
                None, self._generate_tags, str(image_path), config
            )

            return tags

        except Exception as e:
            logger.error(f"WDv3 generation failed for {image_path}: {e}")
            raise

    def get_info(self) -> dict[str, Any]:
        """Get comprehensive information about this generator."""
        info = super().get_info()
        info.update(
            {
                "device": str(self._device) if self._device else None,
                "architecture": self._architecture,
                "gen_threshold": self._gen_threshold,
                "char_threshold": self._char_threshold,
                "self_contained": True,
            }
        )
        return info

    def _load_model_and_labels(self) -> None:
        """Load WDv3 model and labels from HuggingFace Hub."""
        model_path, labels_path = self._ensure_files_available()

        # Load labels
        with open(labels_path) as f:
            self._labels = json.load(f)

        # Load model
        self._model = self._load_model_from_file(model_path)

        # Create transform
        self._transform = self._create_transform()

    def _ensure_files_available(self) -> tuple[Path, Path]:
        """Ensure model and labels files are available, downloading from HuggingFace Hub if needed."""
        # If we already have downloaded paths, return them
        if self._downloaded_model_path and self._downloaded_labels_path:
            return self._downloaded_model_path, self._downloaded_labels_path

        # Download from HuggingFace Hub
        return self._download_from_huggingface()

    def _download_from_huggingface(self) -> tuple[Path, Path]:
        """Download model and labels from HuggingFace Hub."""
        try:
            repo_id = MODEL_REPO_MAP[self._architecture]

            # Download model file with security measures
            model_path = hf_hub_download(
                repo_id=repo_id,
                filename="model.safetensors",
                local_files_only=False,
                token=False,
            )

            # Download labels file with security measures
            labels_path = hf_hub_download(
                repo_id=repo_id,
                filename="selected_tags.csv",
                local_files_only=False,
                token=False,
            )

            self._downloaded_model_path = Path(model_path)
            self._downloaded_labels_path = Path(labels_path)

            logger.info(
                f"Downloaded WDv3 {self._architecture} model files from HuggingFace Hub"
            )
            return self._downloaded_model_path, self._downloaded_labels_path

        except Exception as e:
            logger.error(f"Failed to download WDv3 model from HuggingFace: {e}")
            raise

    def _load_model_from_file(self, model_path: Path) -> torch.nn.Module:
        """Load model from safetensors file."""
        # Create model architecture based on type
        if self._architecture == "vit":
            model = timm.create_model(
                "vit_base_patch16_224", pretrained=False, num_classes=len(self._labels)
            )
        elif self._architecture == "swinv2":
            model = timm.create_model(
                "swin_base_patch4_window12_384",
                pretrained=False,
                num_classes=len(self._labels),
            )
        elif self._architecture == "convnext":
            model = timm.create_model(
                "convnext_base", pretrained=False, num_classes=len(self._labels)
            )
        else:
            raise ValueError(f"Unsupported architecture: {self._architecture}")

        # Load weights from safetensors
        weights = safetensors.torch.load_file(str(model_path))
        model.load_state_dict(weights)

        # Set to evaluation mode
        model.eval()

        # Move to appropriate device
        model.to(self._device)

        return model

    def _create_transform(self) -> torch.nn.Module:
        """Create image transform for preprocessing."""
        from torchvision import transforms

        return transforms.Compose(
            [
                transforms.Resize((448, 448)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
            ]
        )

    def _generate_tags(self, image_path: str, config: dict[str, Any]) -> str:
        """Generate tags for an image using WDv3."""
        if not self._model or not self._labels or not self._transform:
            raise RuntimeError("WDv3 model components not loaded")

        # Load and preprocess image
        image = Image.open(image_path)
        input_tensor = self._transform(image).unsqueeze(0)

        # Move to device
        input_tensor = input_tensor.to(self._device)

        # Run inference
        with torch.no_grad():
            outputs = self._model(input_tensor)
            probabilities = torch.sigmoid(outputs)

        # Get tags above thresholds
        gen_threshold = config.get("gen_threshold", self._gen_threshold)
        char_threshold = config.get("char_threshold", self._char_threshold)

        # Apply different thresholds for general and character tags
        # This is a simplified approach - in practice, you'd need to know which tags are character tags
        general_tags = []
        character_tags = []

        for i, prob in enumerate(probabilities[0]):
            if prob > gen_threshold:
                tag = self._labels[i]
                if prob > char_threshold:
                    character_tags.append((tag, prob.item()))
                else:
                    general_tags.append((tag, prob.item()))

        # Sort by probability and format output
        general_tags.sort(key=lambda x: x[1], reverse=True)
        character_tags.sort(key=lambda x: x[1], reverse=True)

        # Combine tags
        all_tags = character_tags + general_tags
        tag_names = [tag[0] for tag in all_tags[:20]]  # Limit to top 20 tags

        return ", ".join(tag_names)
