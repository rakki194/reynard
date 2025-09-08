"""
JoyCaption Generator Implementation

This module implements the JoyCaption caption generator for the Reynard system.
JoyCaption is a large language model for image captioning with multilingual support.

The implementation includes:
- Model loading and management
- GPU acceleration support
- Configurable generation parameters
- Multilingual support
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

# Add the Yipyap JoyCaption plugin to the path
yipyap_plugin_path = Path(__file__).parent.parent.parent.parent.parent / "third_party" / "yipyap" / "app" / "caption_generation" / "plugins" / "joycaption"
if yipyap_plugin_path.exists():
    sys.path.insert(0, str(yipyap_plugin_path))

try:
    from generator import JoyCaptionGenerator as YipyapJoyCaptionGenerator
    JOYCAPTION_AVAILABLE = True
except ImportError:
    logger.warning("Yipyap JoyCaption generator not available, using mock implementation")
    JOYCAPTION_AVAILABLE = False


class JoyCaptionGenerator(CaptionGenerator):
    """
    JoyCaption caption generator.

    This generator provides large language model-based image captioning with
    multilingual support and configurable generation parameters.
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
        return "joycaption"

    @property
    def description(self) -> str:
        """Get the description of the generator."""
        return "JoyCaption - Large language model for image captioning with multilingual support"

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
                "top_p": {
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 1.0,
                    "default": 0.9,
                    "description": "Top-p sampling parameter"
                },
                "repetition_penalty": {
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 2.0,
                    "default": 1.0,
                    "description": "Repetition penalty"
                },
                "model_path": {
                    "type": "string",
                    "description": "Path to the JoyCaption model file"
                }
            }
        }

    @property
    def features(self) -> List[str]:
        """Get the list of features."""
        return ["gpu_acceleration", "multilingual", "large_language_model", "configurable_generation"]

    def is_available(self) -> bool:
        """Check if the generator is available."""
        if not JOYCAPTION_AVAILABLE:
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
        """Load the JoyCaption model."""
        if self._is_loaded:
            return

        if not JOYCAPTION_AVAILABLE:
            raise RuntimeError("JoyCaption generator is not available")

        try:
            # Update config if provided
            if config:
                self._config.update(config)

            # Determine device
            if not torch.cuda.is_available():
                self._device = torch.device("cpu")
                logger.info("JoyCaption using CPU")
            else:
                self._device = torch.device("cuda")
                logger.info("JoyCaption using GPU")

            # Initialize the Yipyap JoyCaption generator
            yipyap_config = {
                "max_length": self._config.get("max_length", 256),
                "temperature": self._config.get("temperature", 0.7),
                "top_p": self._config.get("top_p", 0.9),
                "repetition_penalty": self._config.get("repetition_penalty", 1.0),
                "model_path": self._model_path
            }

            self._model = YipyapJoyCaptionGenerator(yipyap_config)
            
            # Load the model
            await asyncio.get_event_loop().run_in_executor(
                None, self._model.load
            )

            self._is_loaded = True
            logger.info("JoyCaption model loaded successfully")

        except Exception as e:
            self._is_loaded = False
            logger.error(f"Failed to load JoyCaption model: {e}")
            raise

    async def unload(self) -> None:
        """Unload the JoyCaption model."""
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
            logger.info("JoyCaption model unloaded successfully")

        except Exception as e:
            logger.error(f"Failed to unload JoyCaption model: {e}")
            raise

    async def generate(self, image_path: Path, **kwargs) -> str:
        """Generate caption for an image."""
        if not self._is_loaded:
            raise RuntimeError("JoyCaption model is not loaded")

        try:
            # Merge kwargs with config
            config = {**self._config, **kwargs}

            # Generate caption using the Yipyap generator
            caption = await asyncio.get_event_loop().run_in_executor(
                None, self._model.generate, str(image_path)
            )

            return caption

        except Exception as e:
            logger.error(f"JoyCaption generation failed for {image_path}: {e}")
            raise

    def get_info(self) -> Dict[str, Any]:
        """Get comprehensive information about this generator."""
        info = super().get_info()
        info.update({
            "device": str(self._device) if self._device else None,
            "model_path": self._model_path,
            "yipyap_available": JOYCAPTION_AVAILABLE
        })
        return info
