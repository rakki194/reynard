"""JoyCaption Generator Implementation

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
from pathlib import Path
from typing import Any

import torch
from PIL import Image
from transformers import AutoModelForCausalLM, AutoProcessor

from ...base import CaptionGeneratorBase, CaptionType, ModelCategory

logger = logging.getLogger("uvicorn")

# Self-contained JoyCaption implementation - no external dependencies
JOYCAPTION_AVAILABLE = True

# Caption type mappings with prompts
CAPTION_TYPE_MAP = {
    "descriptive": [
        "Write a descriptive caption for this image in a formal tone.",
        "Write a descriptive caption for this image in a formal tone within {word_count} words.",
        "Write a {length} descriptive caption for this image in a formal tone.",
    ],
    "descriptive (informal)": [
        "Write a descriptive caption for this image in a casual tone.",
        "Write a descriptive caption for this image in a casual tone within {word_count} words.",
        "Write a {length} descriptive caption for this image in a casual tone.",
    ],
    "training prompt": [
        "Write a stable diffusion prompt for this image.",
        "Write a stable diffusion prompt for this image within {word_count} words.",
        "Write a {length} stable diffusion prompt for this image.",
    ],
    "midjourney": [
        "Write a MidJourney prompt for this image.",
        "Write a MidJourney prompt for this image within {word_count} words.",
        "Write a {length} MidJourney prompt for this image.",
    ],
    "booru tag list": [
        "Write a list of Booru tags for this image.",
        "Write a list of Booru tags for this image within {word_count} words.",
        "Write a {length} list of Booru tags for this image.",
    ],
    "booru-like tag list": [
        "Write a list of Booru-like tags for this image.",
        "Write a list of Booru-like tags for this image within {word_count} words.",
        "Write a {length} list of Booru-like tags for this image.",
    ],
    "art critic": [
        "Analyze this image like an art critic would with information about its composition, style, symbolism, the use of color, light, any artistic movement it might belong to, etc.",
        "Analyze this image like an art critic would with information about its composition, style, symbolism, the use of color, light, any artistic movement it might belong to, etc. Keep it within {word_count} words.",
        "Analyze this image like an art critic would with information about its composition, style, symbolism, the use of color, light, any artistic movement it might belong to, etc. Keep it {length}.",
    ],
    "product listing": [
        "Write a caption for this image as though it were a product listing.",
        "Write a caption for this image as though it were a product listing. Keep it under {word_count} words.",
        "Write a {length} caption for this image as though it were a product listing.",
    ],
    "social media post": [
        "Write a caption for this image as if it were being used for a social media post.",
        "Write a caption for this image as if it were being used for a social media post. Limit the caption to {word_count} words.",
        "Write a {length} caption for this image as if it were being used for a social media post.",
    ],
}


class JoyCaptionGenerator(CaptionGeneratorBase):
    """JoyCaption caption generator.

    This generator provides large language model-based image captioning with
    multilingual support and configurable generation parameters.
    """

    def __init__(self, config: dict[str, Any] | None = None):
        self._config = config or {}
        self._model = None
        self._processor = None
        self._device = None
        self._is_loaded = False
        self._model_name = self._config.get("model_name", "llava-hf/llava-1.5-7b-hf")

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
    def config_schema(self) -> dict[str, Any]:
        """Get the configuration schema."""
        return {
            "type": "object",
            "properties": {
                "max_length": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 512,
                    "default": 256,
                    "description": "Maximum length of generated caption",
                },
                "temperature": {
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 2.0,
                    "default": 0.7,
                    "description": "Sampling temperature for generation",
                },
                "top_p": {
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 1.0,
                    "default": 0.9,
                    "description": "Top-p sampling parameter",
                },
                "repetition_penalty": {
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 2.0,
                    "default": 1.0,
                    "description": "Repetition penalty",
                },
                "model_name": {
                    "type": "string",
                    "default": "llava-hf/llava-1.5-7b-hf",
                    "description": "HuggingFace model name for JoyCaption",
                },
                "caption_type": {
                    "type": "string",
                    "enum": list(CAPTION_TYPE_MAP.keys()),
                    "default": "descriptive",
                    "description": "Type of caption to generate",
                },
            },
        }

    @property
    def features(self) -> list[str]:
        """Get the list of features."""
        return [
            "gpu_acceleration",
            "multilingual",
            "large_language_model",
            "configurable_generation",
        ]

    def is_available(self) -> bool:
        """Check if the generator is available."""
        if not JOYCAPTION_AVAILABLE:
            return False

        # Check if required dependencies are available
        try:
            import torch
            import transformers

            return True
        except ImportError:
            return False

    async def load(self, config: dict[str, Any] | None = None) -> None:
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

            # Load model and processor in executor to avoid blocking
            await asyncio.get_event_loop().run_in_executor(
                None, self._load_model_and_processor,
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
            # Clear model from memory
            self._model = None
            self._processor = None
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

            # Generate caption using self-contained implementation
            caption = await asyncio.get_event_loop().run_in_executor(
                None, self._generate_caption, str(image_path), config,
            )

            return caption

        except Exception as e:
            logger.error(f"JoyCaption generation failed for {image_path}: {e}")
            raise

    def get_info(self) -> dict[str, Any]:
        """Get comprehensive information about this generator."""
        info = super().get_info()
        info.update(
            {
                "device": str(self._device) if self._device else None,
                "model_name": self._model_name,
                "self_contained": True,
            },
        )
        return info

    def _load_model_and_processor(self) -> None:
        """Load JoyCaption model and processor from HuggingFace."""
        # Load processor with security measures
        self._processor = AutoProcessor.from_pretrained(
            self._model_name,
            trust_remote_code=False,
            use_auth_token=False,
        )

        # Load model with security measures
        self._model = AutoModelForCausalLM.from_pretrained(
            self._model_name,
            torch_dtype=torch.float16 if self._device.type == "cuda" else torch.float32,
            device_map="auto" if self._device.type == "cuda" else None,
            trust_remote_code=False,
            use_auth_token=False,
        )

        # Move to device if not using device_map
        if self._device.type == "cpu":
            self._model.to(self._device)

    def _generate_caption(self, image_path: str, config: dict[str, Any]) -> str:
        """Generate caption for an image using JoyCaption."""
        if not self._model or not self._processor:
            raise RuntimeError("JoyCaption model components not loaded")

        # Load and process image
        image = Image.open(image_path)

        # Get caption type and build prompt
        caption_type = config.get("caption_type", "descriptive")
        max_length = config.get("max_length", 256)

        # Select appropriate prompt based on caption type
        prompts = CAPTION_TYPE_MAP.get(caption_type, CAPTION_TYPE_MAP["descriptive"])

        # Choose prompt based on length
        if max_length <= 50:
            prompt_template = prompts[1] if len(prompts) > 1 else prompts[0]
            word_count = max_length // 2  # Rough word count estimation
            prompt = prompt_template.format(word_count=word_count)
        elif max_length <= 150:
            prompt_template = prompts[2] if len(prompts) > 2 else prompts[0]
            length = "medium-length"
            prompt = prompt_template.format(length=length)
        else:
            prompt = prompts[0]

        # Process inputs
        inputs = self._processor(text=prompt, images=image, return_tensors="pt")

        # Move inputs to device
        inputs = {k: v.to(self._device) for k, v in inputs.items()}

        # Generate caption
        temperature = config.get("temperature", 0.7)
        top_p = config.get("top_p", 0.9)
        repetition_penalty = config.get("repetition_penalty", 1.0)

        with torch.no_grad():
            generated_ids = self._model.generate(
                inputs["input_ids"],
                pixel_values=inputs["pixel_values"],
                max_length=max_length,
                temperature=temperature,
                top_p=top_p,
                repetition_penalty=repetition_penalty,
                do_sample=True,
                pad_token_id=self._processor.tokenizer.eos_token_id,
            )

        # Decode the generated text
        generated_text = self._processor.batch_decode(
            generated_ids, skip_special_tokens=True,
        )[0]

        # Extract caption from the generated text
        caption = generated_text.replace(prompt, "").strip()

        return caption if caption else "Unable to generate caption for this image."
