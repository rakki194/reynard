"""
Mock gatekeeper API routes for testing.
"""

from fastapi import APIRouter
from ..main import create_auth_router

# Re-export the auth router creation function
__all__ = ["create_auth_router"]
