"""
ECS Systems Package

Core systems for the ECS world simulation.
"""

from .gender_system import GenderSystem
from .interaction_system import InteractionSystem
from .learning_system import LearningSystem
from .memory_system import MemorySystem
from .social_system import SocialSystem

__all__ = [
    "MemorySystem",
    "LearningSystem",
    "InteractionSystem",
    "SocialSystem",
    "GenderSystem",
]
