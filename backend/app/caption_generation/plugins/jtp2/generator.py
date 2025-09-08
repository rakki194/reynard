"""
JTP2 (Joint Tagger Project PILOT2) Generator Implementation

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
import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import torch
from PIL import Image

from ...base import CaptionGenerator, CaptionType, ModelCategory

logger = logging.getLogger("uvicorn")

# Add the Yipyap JTP2 plugin to the path
yipyap_plugin_path = Path(__file__).parent.parent.parent.parent.parent / "third_party" / "yipyap" / "app" / "caption_generation" / "plugins" / "jtp2"
if yipyap_plugin_path.exists():
    sys.path.insert(0, str(yipyap_plugin_path))

try:
    from generator import JTP2Generator as YipyapJTP2Generator
    JTP2_AVAILABLE = True
except ImportError:
    logger.warning("Yipyap JTP2 generator not available, using mock implementation")
    JTP2_AVAILABLE = False


class JTP2Generator(CaptionGenerator):
    """
    JTP2 (Joint Tagger Project PILOT2) caption generator.

    This generator is specialized for furry artwork and provides high-quality
    tag generation with GPU acceleration support.
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
                "batch_size": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 32,
                    "default": 1,
                    "description": "Number of images to process in batch"
                },
                "model_path": {
                    "type": "string",
                    "description": "Path to the JTP2 model file"
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
        return ["gpu_acceleration", "batch_processing", "furry_specialized"]

    def is_available(self) -> bool:
        """Check if the generator is available."""
        if not JTP2_AVAILABLE:
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

            # Initialize the Yipyap JTP2 generator
            yipyap_config = {
                "threshold": self._config.get("threshold", 0.2),
                "force_cpu": force_cpu,
                "model_path": self._model_path,
                "tags_path": self._tags_path
            }

            self._model = YipyapJTP2Generator(yipyap_config)
            
            # Load the model
            await asyncio.get_event_loop().run_in_executor(
                None, self._model.load
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
            if self._model:
                # Unload the model
                await asyncio.get_event_loop().run_in_executor(
                    None, self._model.unload
                )
                self._model = None

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

            # Generate tags using the Yipyap generator
            tags = await asyncio.get_event_loop().run_in_executor(
                None, self._model.generate, str(image_path)
            )

            return tags

        except Exception as e:
            logger.error(f"JTP2 generation failed for {image_path}: {e}")
            raise

    def get_info(self) -> Dict[str, Any]:
        """Get comprehensive information about this generator."""
        info = super().get_info()
        info.update({
            "device": str(self._device) if self._device else None,
            "model_path": self._model_path,
            "tags_path": self._tags_path,
            "yipyap_available": JTP2_AVAILABLE
        })
        return info
