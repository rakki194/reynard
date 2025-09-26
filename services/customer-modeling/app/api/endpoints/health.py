"""
Health check endpoints for Customer Modeling Microservice.
"""

import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


@router.get("/")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": "Customer Modeling Microservice",
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """Readiness check with database connectivity."""
    try:
        # Test database connection
        db.execute("SELECT 1")

        return {
            "status": "ready",
            "service": "Customer Modeling Microservice",
            "version": settings.VERSION,
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        raise HTTPException(
            status_code=503,
            detail={
                "status": "not_ready",
                "service": "Customer Modeling Microservice",
                "database": "disconnected",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
            },
        )


@router.get("/live")
async def liveness_check():
    """Liveness check endpoint."""
    return {
        "status": "alive",
        "service": "Customer Modeling Microservice",
        "timestamp": datetime.utcnow().isoformat(),
    }
