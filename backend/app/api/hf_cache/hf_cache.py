"""
HuggingFace Cache API for Reynard Backend

Main API module that combines all HF cache endpoints.
"""

from fastapi import APIRouter

from .hf_cache_core_endpoints import router as core_router
from .hf_cache_management_endpoints import router as management_router
from .hf_cache_model_endpoints import router as model_router

# Combine all HF cache routers
router = APIRouter(prefix="/api/hf-cache", tags=["hf-cache"])
router.include_router(core_router)
router.include_router(model_router)
router.include_router(management_router)
