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
import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import torch
from PIL import Image

from ...base import CaptionGenerator, CaptionType, ModelCategory

logger = logging.getLogger("uvicorn")

# Add the Yipyap WDv3 plugin to the path
yipyap_plugin_path = Path(__file__).parent.parent.parent.parent.parent / "third_party" / "yipyap" / "app" / "caption_generation" / "plugins" / "wdv3"
if yipyap_plugin_path.exists():
    sys.path.insert(0, str(yipyap_plugin_path))

try:
    from generator import WDv3Generator as YipyapWDv3Generator
    WDV3_AVAILABLE = True
except ImportError:
    logger.warning("Yipyap WDv3 generator not available, using mock implementation")
    WDV3_AVAILABLE = False


class WDv3Generator(CaptionGenerator):
    """
    WDv3 caption generator.

    This generator provides Danbooru-style tagging with support for various
    architectures including ViT, SwinV2, and ConvNeXt.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self._config = config or {}
        self._model = None
        self._device = None
        self._is_loaded = False
        self._model_path = self._config.get("model_path")
        self._tags_path = self._config.get("tags_path")

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
    def config_schema(self) -> Dict[str, Any]:
        """Get the configuration schema."""
        return {
            "type": "object",
            "properties": {
                "threshold": {
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 1.0,
                    "default": 0.2,
                    "description": "Confidence threshold for tags"
                },
                "force_cpu": {
                    "type": "boolean",
                    "default": False,
                    "description": "Force CPU usage instead of GPU"
                },
                "architecture": {
                    "type": "string",
                    "enum": ["vit", "swinv2", "convnext"],
                    "default": "vit",
                    "description": "Model architecture to use"
                },
                "model_path": {
                    "type": "string",
                    "description": "Path to the WDv3 model file"
                },
                "tags_path": {
                    "type": "string",
                    "description": "Path to the tags file"
                }
            }
        }

    @property
    def features(self) -> List[str]:
        """Get the list of features."""
        return ["gpu_acceleration", "batch_processing", "multiple_architectures", "danbooru_style"]

    def is_available(self) -> bool:
        """Check if the generator is available."""
        if not WDV3_AVAILABLE:
            return False

        # Check if required files exist
        if self._model_path and not Path(self._model_path).exists():
            return False

        if self._tags_path and not Path(self._tags_path).exists():
            return False

        # Check if PyTorch is available
        try:
            import torch
            return True
        except ImportError:
            return False

    async def load(self, config: Optional[Dict[str, Any]] = None) -> None:
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

            # Initialize the Yipyap WDv3 generator
            yipyap_config = {
                "threshold": self._config.get("threshold", 0.2),
                "force_cpu": force_cpu,
                "architecture": self._config.get("architecture", "vit"),
                "model_path": self._model_path,
                "tags_path": self._tags_path
            }

            self._model = YipyapWDv3Generator(yipyap_config)
            
            # Load the model
            await asyncio.get_event_loop().run_in_executor(
                None, self._model.load
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
            if self._model:
                # Unload the model
                await asyncio.get_event_loop().run_in_executor(
                    None, self._model.unload
                )
                self._model = None

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

            # Generate tags using the Yipyap generator
            tags = await asyncio.get_event_loop().run_in_executor(
                None, self._model.generate, str(image_path)
            )

            return tags

        except Exception as e:
            logger.error(f"WDv3 generation failed for {image_path}: {e}")
            raise

    def get_info(self) -> Dict[str, Any]:
        """Get comprehensive information about this generator."""
        info = super().get_info()
        info.update({
            "device": str(self._device) if self._device else None,
            "model_path": self._model_path,
            "tags_path": self._tags_path,
            "yipyap_available": WDV3_AVAILABLE
        })
        return info
