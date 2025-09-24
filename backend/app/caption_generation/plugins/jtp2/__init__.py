"""JTP2 (Joint Tagger Project PILOT2) Plugin for Reynard

This plugin provides the JTP2 caption generation model, which is specialized
for furry artwork and provides high-quality tag generation with GPU acceleration.

Features:
- Specialized for furry artwork
- GPU acceleration support
- Configurable threshold for tag confidence
- Batch processing support
- Model management and lifecycle handling

Configuration:
- threshold: Confidence threshold for tags (0.0-1.0, default: 0.2)
- force_cpu: Force CPU usage instead of GPU (default: False)
- batch_size: Number of images to process in batch (default: 1)
"""

from .generator import JTP2Generator


def register_plugin():
    """Register the JTP2 plugin with the Reynard system."""
    return {
        "name": "jtp2",
        "module_path": "app.caption_generation.plugins.jtp2",
        "default_config": {
            "threshold": 0.2,
            "force_cpu": False,
            "batch_size": 1,
        },
    }


def get_generator(config=None):
    """Get a JTP2 generator instance."""
    return JTP2Generator(config or {})
