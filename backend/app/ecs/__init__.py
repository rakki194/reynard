"""
ECS World Integration for FastAPI Backend

Provides ECS world integration as a singleton service for the Reynard backend.
"""

from .service import get_ecs_world, ECSWorldService
from .endpoints import router as ecs_router
from .config import ECSConfig

__all__ = ["get_ecs_world", "ECSWorldService", "ecs_router", "ECSConfig"]
