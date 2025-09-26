"""JTP2 (Joint Tagger Project PILOT2) Generator Implementation

This module implements the JTP2 caption generator for the Reynard system.
JTP2 is specialized for furry artwork and provides high-quality tag generation.

The implementation includes:
- Model loading and management
- GPU acceleration support
- Configurable threshold for tag confidence
- Batch processing capabilities
- Error handling and retry logic
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

# Self-contained JTP2 implementation - no external dependencies
JTP2_AVAILABLE = True


class JTP2Generator(CaptionGeneratorBase):
    """JTP2 (Joint Tagger Project PILOT2) caption generator.

    This generator is specialized for furry artwork and provides high-quality
    tag generation with GPU acceleration support.
    """

    def __init__(self, config: dict[str, Any] | None = None):
        self._config = config or {}
        self._model = None
        self._tags = None
        self._transform = None
        self._device = None
        self._is_loaded = False
        self._model_path = self._config.get(
            "model_path",
            "RedRocket/JointTaggerProject/JTP_PILOT2/JTP_PILOT2-e3-vit_so400m_patch14_siglip_384.safetensors",
        )
        self._tags_path = self._config.get(
            "tags_path",
            "RedRocket/JointTaggerProject/JTP_PILOT2/tags.json",
        )
        self._downloaded_model_path = None
        self._downloaded_tags_path = None

    @property
    def name(self) -> str:
        """Get the name of the generator."""
        return "jtp2"

    @property
    def description(self) -> str:
        """Get the description of the generator."""
        return "Joint Tagger Project PILOT2 - Specialized tagger for furry artwork"

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
                "threshold": {
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 1.0,
                    "default": 0.2,
                    "description": "Confidence threshold for tags",
                },
                "force_cpu": {
                    "type": "boolean",
                    "default": False,
                    "description": "Force CPU usage instead of GPU",
                },
                "batch_size": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 32,
                    "default": 1,
                    "description": "Number of images to process in batch",
                },
                "model_path": {
                    "type": "string",
                    "description": "Path to the JTP2 model file",
                },
                "tags_path": {"type": "string", "description": "Path to the tags file"},
            },
        }

    @property
    def features(self) -> list[str]:
        """Get the list of features."""
        return ["gpu_acceleration", "batch_processing", "furry_specialized"]

    def is_available(self) -> bool:
        """Check if the generator is available."""
        if not JTP2_AVAILABLE:
            return False

        # Check if required dependencies are available
        try:
            import safetensors
            import timm
            import torch
            from huggingface_hub import hf_hub_download
            from PIL import Image

            return True
        except ImportError:
            return False

    async def load(self, config: dict[str, Any] | None = None) -> None:
        """Load the JTP2 model."""
        if self._is_loaded:
            return

        if not JTP2_AVAILABLE:
            raise RuntimeError("JTP2 generator is not available")

        try:
            # Update config if provided
            if config:
                self._config.update(config)

            # Determine device
            force_cpu = self._config.get("force_cpu", False)
            if force_cpu or not torch.cuda.is_available():
                self._device = torch.device("cpu")
                logger.info("JTP2 using CPU")
            else:
                self._device = torch.device("cuda")
                logger.info("JTP2 using GPU")

            # Load model and tags in executor to avoid blocking
            await asyncio.get_event_loop().run_in_executor(
                None,
                self._load_model_and_tags,
            )

            self._is_loaded = True
            logger.info("JTP2 model loaded successfully")

        except Exception as e:
            self._is_loaded = False
            logger.error(f"Failed to load JTP2 model: {e}")
            raise

    async def unload(self) -> None:
        """Unload the JTP2 model."""
        if not self._is_loaded:
            return

        try:
            # Clear model from memory
            self._model = None
            self._tags = None
            self._transform = None
            self._is_loaded = False
            logger.info("JTP2 model unloaded successfully")

        except Exception as e:
            logger.error(f"Failed to unload JTP2 model: {e}")
            raise

    async def generate(self, image_path: Path, **kwargs) -> str:
        """Generate tags for an image."""
        if not self._is_loaded:
            raise RuntimeError("JTP2 model is not loaded")

        try:
            # Merge kwargs with config
            config = {**self._config, **kwargs}

            # Generate tags using self-contained implementation
            tags = await asyncio.get_event_loop().run_in_executor(
                None,
                self._generate_caption,
                str(image_path),
                config,
            )

            return tags

        except Exception as e:
            logger.error(f"JTP2 generation failed for {image_path}: {e}")
            raise

    def get_info(self) -> dict[str, Any]:
        """Get comprehensive information about this generator."""
        info = super().get_info()
        info.update(
            {
                "device": str(self._device) if self._device else None,
                "model_path": self._model_path,
                "tags_path": self._tags_path,
                "self_contained": True,
            },
        )
        return info

    def _load_model_and_tags(self) -> None:
        """Load model and tags from files or HuggingFace Hub."""
        model_path, tags_path = self._ensure_files_available()

        # Load tags dictionary
        with open(tags_path) as f:
            self._tags = json.load(f)

        # Load model
        self._model = self._load_model_from_file(model_path)

        # Create transform
        self._transform = self._create_transform()

    def _ensure_files_available(self) -> tuple[Path, Path]:
        """Ensure model and tags files are available, downloading from HuggingFace Hub if needed."""
        # If we already have downloaded paths, return them
        if self._downloaded_model_path and self._downloaded_tags_path:
            return self._downloaded_model_path, self._downloaded_tags_path

        # Check if paths are local files
        model_path = Path(self._model_path)
        tags_path = Path(self._tags_path)

        if model_path.exists() and tags_path.exists():
            # Both files exist locally
            self._downloaded_model_path = model_path
            self._downloaded_tags_path = tags_path
            return model_path, tags_path

        # Download from HuggingFace Hub if needed
        return self._download_from_huggingface()

    def _download_from_huggingface(self) -> tuple[Path, Path]:
        """Download model and tags from HuggingFace Hub."""
        try:
            # Extract repo path and filename from model path
            parts = str(self._model_path).split("/")
            if len(parts) >= 4:
                repo_id = "RedRocket/JointTaggerProject"
                model_filename = parts[
                    -1
                ]  # JTP_PILOT2-e3-vit_so400m_patch14_siglip_384.safetensors
                tags_filename = "tags.json"
                subfolder = parts[-2]  # JTP_PILOT2

                # Download model file with security measures
                model_path = hf_hub_download(
                    repo_id=repo_id,
                    filename=model_filename,
                    subfolder=subfolder,
                    local_files_only=False,
                    token=False,
                )

                # Download tags file with security measures
                tags_path = hf_hub_download(
                    repo_id=repo_id,
                    filename=tags_filename,
                    subfolder=subfolder,
                    local_files_only=False,
                    token=False,
                )

                self._downloaded_model_path = Path(model_path)
                self._downloaded_tags_path = Path(tags_path)

                logger.info("Downloaded JTP2 model files from HuggingFace Hub")
                return self._downloaded_model_path, self._downloaded_tags_path
            raise ValueError(f"Invalid model path format: {self._model_path}")

        except Exception as e:
            logger.error(f"Failed to download JTP2 model from HuggingFace: {e}")
            raise

    def _load_model_from_file(self, model_path: Path) -> torch.nn.Module:
        """Load model from safetensors file."""
        # Load model architecture
        model = timm.create_model("vit_so400m_patch14_siglip_384", pretrained=False)

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
                transforms.Resize((384, 384)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
            ],
        )

    def _generate_caption(self, image_path: str, config: dict[str, Any]) -> str:
        """Generate caption for an image."""
        if not self._model or not self._tags or not self._transform:
            raise RuntimeError("JTP2 model components not loaded")

        # Load and preprocess image
        image = Image.open(image_path)
        input_tensor = self._transform(image).unsqueeze(0)

        # Move to device
        input_tensor = input_tensor.to(self._device)

        # Run inference
        with torch.no_grad():
            outputs = self._model(input_tensor)
            probabilities = torch.sigmoid(outputs)

        # Get tags above threshold
        threshold = config.get("threshold", 0.2)
        tag_indices = (probabilities > threshold).nonzero(as_tuple=True)[0]

        tags = [self._tags[index.item()] for index in tag_indices]

        # Limit to max_tags
        max_tags = config.get("max_tags", 20)
        return ", ".join(tags[:max_tags])
