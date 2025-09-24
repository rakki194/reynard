"""ECS World Management API
========================

Core world simulation endpoints for status, control, and monitoring.
"""

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..postgres_service import get_postgres_ecs_service

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="", tags=["ECS World"])


class WorldStatusResponse(BaseModel):
    """Response model for ECS world status information."""

    status: str
    entity_count: int | None = None
    system_count: int | None = None
    agent_count: int | None = None
    mature_agents: int | None = None


@router.get("/status", response_model=WorldStatusResponse)
async def get_world_status() -> WorldStatusResponse:
    """Get the current ECS world status."""
    try:
        service = get_postgres_ecs_service()
        status = await service.get_world_status()
        return WorldStatusResponse(**status)
    except Exception as e:
        logger.exception("Error getting world status")
        raise HTTPException(status_code=500, detail="Failed to get world status") from e


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint for the ECS world."""
    return {"status": "healthy", "service": "ecs-world"}
