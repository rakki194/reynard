"""
Thread Pool Executor API for Reynard Backend

Main API module that combines all executor endpoints.
"""

from fastapi import APIRouter

from .executor_core_endpoints import router as core_router
from .executor_management_endpoints import router as management_router

# Combine all executor routers
router = APIRouter(prefix="/api/executor", tags=["executor"])
router.include_router(core_router)
router.include_router(management_router)
