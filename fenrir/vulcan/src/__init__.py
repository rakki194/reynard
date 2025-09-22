"""
VULCAN: Versatile Unified Learning Capability And Neural Training

Advanced model training framework for Qwen3-8B with LoRA optimization.
Inspired by the Roman god of fire, metalworking, and craftsmanship.
"""

__version__ = "1.0.0"
__author__ = "Strong-Oracle-33"
__email__ = "strong-oracle-33@reynard.ai"

from .data_processor import DataProcessor
from .evaluator import ModelEvaluator
from .lora_manager import LoRAManager
from .model_manager import ModelManager

# Core modules
from .trainer import VulcanTrainer

__all__ = [
    "VulcanTrainer",
    "ModelManager",
    "LoRAManager",
    "DataProcessor",
    "ModelEvaluator",
]
