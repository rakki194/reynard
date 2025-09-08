"""
Florence2 Generator Implementation

This module implements the Florence2 caption generator for the Reynard system.
Florence2 is a general-purpose image captioning model with support for various
captioning tasks.

The implementation includes:
- Model loading and management
- GPU acceleration support
- Configurable generation parameters
- Support for different captioning tasks
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

# Add the Yipyap Florence2 plugin to the path
yipyap_plugin_path = Path(__file__).parent.parent.parent.parent.parent / "third_party" / "yipyap" / "app" / "caption_generation" / "plugins" / "florence2"
if yipyap_plugin_path.exists():
    sys.path.insert(0, str(yipyap_plugin_path))

try:
    from generator import Florence2Generator as YipyapFlorence2Generator
    FLORENCE2_AVAILABLE = True
except ImportError:
    logger.warning("Yipyap Florence2 generator not available, using mock implementation")
    FLORENCE2_AVAILABLE = False


class Florence2Generator(CaptionGenerator):
    """
    Florence2 caption generator.

    This generator provides general-purpose image captioning with support for
    various captioning tasks including standard captioning, dense captioning,
    and region captioning.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self._config = config or {}
        self._model = None
        self._device = None
        self._is_loaded = False
        self._model_path = self._config.get("model_path")

    @property
    def name(self) -> str:
        """Get the name of the generator."""
        return "florence2"

    @property
    def description(self) -> str:
        """Get the description of the generator."""
        return "Microsoft Florence2 - General purpose image captioning model"

    @property
    def version(self) -> str:
        """Get the version of the generator."""
        return "1.0.0"

    @property
    def caption_type(self) -> CaptionType:
        """Get the caption type."""
        return CaptionType.CAPTION

    @property
    def model_category(self) -> ModelCategory:
        """Get the model category."""
        return ModelCategory.HEAVY

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
                "max_length": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 512,
                    "default": 256,
                    "description": "Maximum length of generated caption"
                },
                "temperature": {
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 2.0,
                    "default": 0.7,
                    "description": "Sampling temperature for generation"
                },
                "task": {
                    "type": "string",
                    "enum": ["caption", "dense_caption", "region_caption"],
                    "default": "caption",
                    "description": "Type of captioning task"
                },
                "model_path": {
                    "type": "string",
                    "description": "Path to the Florence2 model file"
                }
            }
        }

    @property
    def features(self) -> List[str]:
        """Get the list of features."""
        return ["gpu_acceleration", "multilingual", "dense_captioning", "region_captioning"]

    def is_available(self) -> bool:
        """Check if the generator is available."""
        if not FLORENCE2_AVAILABLE:
            return False

        # Check if required files exist
        if self._model_path and not Path(self._model_path).exists():
            return False

        # Check if PyTorch is available
        try:
            import torch
            return True
        except ImportError:
            return False

    async def load(self, config: Optional[Dict[str, Any]] = None) -> None:
        """Load the Florence2 model."""
        if self._is_loaded:
            return

        if not FLORENCE2_AVAILABLE:
            raise RuntimeError("Florence2 generator is not available")

        try:
            # Update config if provided
            if config:
                self._config.update(config)

            # Determine device
            if not torch.cuda.is_available():
                self._device = torch.device("cpu")
                logger.info("Florence2 using CPU")
            else:
                self._device = torch.device("cuda")
                logger.info("Florence2 using GPU")

            # Initialize the Yipyap Florence2 generator
            yipyap_config = {
                "max_length": self._config.get("max_length", 256),
                "temperature": self._config.get("temperature", 0.7),
                "task": self._config.get("task", "caption"),
                "model_path": self._model_path
            }

            self._model = YipyapFlorence2Generator(yipyap_config)
            
            # Load the model
            await asyncio.get_event_loop().run_in_executor(
                None, self._model.load
            )

            self._is_loaded = True
            logger.info("Florence2 model loaded successfully")

        except Exception as e:
            self._is_loaded = False
            logger.error(f"Failed to load Florence2 model: {e}")
            raise

    async def unload(self) -> None:
        """Unload the Florence2 model."""
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
            logger.info("Florence2 model unloaded successfully")

        except Exception as e:
            logger.error(f"Failed to unload Florence2 model: {e}")
            raise

    async def generate(self, image_path: Path, **kwargs) -> str:
        """Generate caption for an image."""
        if not self._is_loaded:
            raise RuntimeError("Florence2 model is not loaded")

        try:
            # Merge kwargs with config
            config = {**self._config, **kwargs}

            # Generate caption using the Yipyap generator
            caption = await asyncio.get_event_loop().run_in_executor(
                None, self._model.generate, str(image_path)
            )

            return caption

        except Exception as e:
            logger.error(f"Florence2 generation failed for {image_path}: {e}")
            raise

    def get_info(self) -> Dict[str, Any]:
        """Get comprehensive information about this generator."""
        info = super().get_info()
        info.update({
            "device": str(self._device) if self._device else None,
            "model_path": self._model_path,
            "yipyap_available": FLORENCE2_AVAILABLE
        })
        return info
