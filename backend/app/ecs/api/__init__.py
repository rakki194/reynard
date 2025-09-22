"""
ECS API Module
==============

Organized API endpoints for the ECS World simulation system.
"""

from .agents import router as agents_router
from .naming import router as naming_router
from .spirits import router as spirits_router
from .traits import router as traits_router
from .world import router as world_router

__all__ = [
    "agents_router",
    "naming_router",
    "traits_router",
    "world_router",
    "spirits_router",
]
