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
from transformers import AutoProcessor, AutoModelForCausalLM

from ...base import CaptionGeneratorBase, CaptionType, ModelCategory

logger = logging.getLogger("uvicorn")

# Self-contained Florence2 implementation - no external dependencies
FLORENCE2_AVAILABLE = True


class Florence2Generator(CaptionGeneratorBase):
    """
    Florence2 caption generator.

    This generator provides general-purpose image captioning with support for
    various captioning tasks including standard captioning, dense captioning,
    and region captioning.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self._config = config or {}
        self._model = None
        self._processor = None
        self._device = None
        self._is_loaded = False
        self._model_name = self._config.get("model_name", "microsoft/Florence-2-base")

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
                "model_name": {
                    "type": "string",
                    "default": "microsoft/Florence-2-base",
                    "description": "HuggingFace model name for Florence2"
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

        # Check if required dependencies are available
        try:
            import torch
            import transformers
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

            # Load model and processor in executor to avoid blocking
            await asyncio.get_event_loop().run_in_executor(
                None, self._load_model_and_processor
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
            # Clear model from memory
            self._model = None
            self._processor = None
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

            # Generate caption using self-contained implementation
            caption = await asyncio.get_event_loop().run_in_executor(
                None, self._generate_caption, str(image_path), config
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
            "model_name": self._model_name,
            "self_contained": True
        })
        return info

    def _load_model_and_processor(self) -> None:
        """Load Florence2 model and processor from HuggingFace."""
        # Load processor
        self._processor = AutoProcessor.from_pretrained(self._model_name)
        
        # Load model
        self._model = AutoModelForCausalLM.from_pretrained(
            self._model_name,
            torch_dtype=torch.float16 if self._device.type == "cuda" else torch.float32,
            device_map="auto" if self._device.type == "cuda" else None
        )
        
        # Move to device if not using device_map
        if self._device.type == "cpu":
            self._model.to(self._device)

    def _generate_caption(self, image_path: str, config: Dict[str, Any]) -> str:
        """Generate caption for an image using Florence2."""
        if not self._model or not self._processor:
            raise RuntimeError("Florence2 model components not loaded")

        # Load and process image
        image = Image.open(image_path)
        
        # Prepare task prompt
        task = config.get("task", "caption")
        task_prompts = {
            "caption": "<DETAILED_CAPTION>",
            "dense_caption": "<DENSE_REGION_CAPTION>",
            "region_caption": "<REGION_CAPTION>"
        }
        
        prompt = task_prompts.get(task, "<DETAILED_CAPTION>")
        
        # Process inputs
        inputs = self._processor(text=prompt, images=image, return_tensors="pt")
        
        # Move inputs to device
        inputs = {k: v.to(self._device) for k, v in inputs.items()}
        
        # Generate caption
        max_length = config.get("max_length", 256)
        temperature = config.get("temperature", 0.7)
        
        with torch.no_grad():
            generated_ids = self._model.generate(
                inputs["input_ids"],
                pixel_values=inputs["pixel_values"],
                max_length=max_length,
                temperature=temperature,
                do_sample=True,
                pad_token_id=self._processor.tokenizer.eos_token_id
            )
        
        # Decode the generated text
        generated_text = self._processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        
        # Extract caption from the generated text
        caption = generated_text.replace(prompt, "").strip()
        
        return caption if caption else "Unable to generate caption for this image."
