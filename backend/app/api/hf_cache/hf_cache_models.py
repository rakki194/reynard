"""
HuggingFace Cache API Models for Reynard Backend

Pydantic models for HF cache API endpoints.
"""

from typing import Optional
from pydantic import BaseModel, Field


class HFCacheInfoResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    
    cache_dir: str
    hub_dir: str
    size: int
    model_count: int


class ModelCacheInfoResponse(BaseModel):
    repo_id: str
    cache_path: str
    snapshot_path: str
    is_cached: bool
    size: Optional[int] = None
    last_modified: Optional[str] = None


class ModelCacheRequest(BaseModel):
    repo_id: str = Field(..., description="HuggingFace repository ID")
    revision: str = Field(default="main", description="Model revision")
