"""
ECS World Integration for FastAPI Backend

Provides ECS world integration as a singleton service for the Reynard backend.
"""

from .config import ECSConfig
from .endpoints import router as ecs_router
from .service import ECSWorldService, get_ecs_world

__all__ = ["ECSConfig", "ECSWorldService", "ecs_router", "get_ecs_world"]
