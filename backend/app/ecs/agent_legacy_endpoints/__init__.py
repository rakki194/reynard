"""
ECS Endpoints Package

This package contains specialized endpoint modules for the ECS system.
"""

from .legacy_endpoints import router as legacy_router

__all__ = ["legacy_router"]
