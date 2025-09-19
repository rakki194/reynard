"""
Systems Package

ECS systems that contain logic and operate on entities with specific components.
"""

from .interaction_system import InteractionSystem
from .learning_system import LearningSystem
from .memory_system import MemorySystem
from .social_system import SocialSystem
from .gender_system import GenderSystem

__all__ = [
    "InteractionSystem",
    "LearningSystem",
    "MemorySystem",
    "SocialSystem",
    "GenderSystem",
]
