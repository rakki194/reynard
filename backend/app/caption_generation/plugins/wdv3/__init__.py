"""WDv3 Plugin for Reynard

This plugin provides the WDv3 (WDv3) caption generation model, which is
a Danbooru-style tagger with support for various architectures.

Features:
- Danbooru-style tagging
- Multiple architecture support (ViT, SwinV2, ConvNeXt)
- GPU acceleration support
- Configurable threshold for tag confidence
- Batch processing support

Configuration:
- threshold: Confidence threshold for tags (0.0-1.0, default: 0.2)
- force_cpu: Force CPU usage instead of GPU (default: False)
- architecture: Model architecture (vit, swinv2, convnext)
- model_path: Path to the WDv3 model file
- tags_path: Path to the tags file
"""

from .generator import WDv3Generator


def register_plugin():
    """Register the WDv3 plugin with the Reynard system."""
    return {
        "name": "wdv3",
        "module_path": "app.caption_generation.plugins.wdv3",
        "default_config": {
            "threshold": 0.2,
            "force_cpu": False,
            "architecture": "vit",
            "model_path": None,
            "tags_path": None,
        },
    }


def get_generator(config=None):
    """Get a WDv3 generator instance."""
    return WDv3Generator(config or {})
