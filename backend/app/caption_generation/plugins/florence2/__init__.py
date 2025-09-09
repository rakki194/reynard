"""
Florence2 Plugin for Reynard

This plugin provides the Microsoft Florence2 caption generation model, which is
a general-purpose image captioning model with support for various captioning tasks.

Features:
- General purpose image captioning
- Support for different captioning tasks (caption, dense_caption, region_caption)
- GPU acceleration support
- Configurable generation parameters
- Batch processing support

Configuration:
- max_length: Maximum length of generated caption (default: 256)
- temperature: Sampling temperature for generation (default: 0.7)
- task: Type of captioning task (caption, dense_caption, region_caption)
- model_path: Path to the Florence2 model file
"""

from .generator import Florence2Generator


def register_plugin():
    """Register the Florence2 plugin with the Reynard system."""
    return {
        "name": "florence2",
        "module_path": "app.caption_generation.plugins.florence2",
        "default_config": {
            "max_length": 256,
            "temperature": 0.7,
            "task": "caption",
            "model_path": None,
        },
    }


def get_generator(config=None):
    """Get a Florence2 generator instance."""
    return Florence2Generator(config or {})
