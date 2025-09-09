"""
JoyCaption Plugin for Reynard

This plugin provides the JoyCaption caption generation model, which is
a large language model for image captioning with multilingual support.

Features:
- Large language model for image captioning
- Multilingual support
- GPU acceleration support
- Configurable generation parameters
- Batch processing support

Configuration:
- max_length: Maximum length of generated caption (default: 256)
- temperature: Sampling temperature for generation (default: 0.7)
- top_p: Top-p sampling parameter (default: 0.9)
- repetition_penalty: Repetition penalty (default: 1.0)
- model_path: Path to the JoyCaption model file
"""

from .generator import JoyCaptionGenerator


def register_plugin():
    """Register the JoyCaption plugin with the Reynard system."""
    return {
        "name": "joycaption",
        "module_path": "app.caption_generation.plugins.joycaption",
        "default_config": {
            "max_length": 256,
            "temperature": 0.7,
            "top_p": 0.9,
            "repetition_penalty": 1.0,
            "model_path": None,
        },
    }


def get_generator(config=None):
    """Get a JoyCaption generator instance."""
    return JoyCaptionGenerator(config or {})
