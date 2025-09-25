"""🔐 PGP Key Management API Routes

API endpoints for PGP key generation, regeneration, and management.
Provides both user and admin interfaces for secure PGP key operations.

Key Features:
- User key generation and regeneration
- Admin key management and oversight
- Secure key storage and retrieval
- Audit logging for all operations
- Permission-based access control

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field

from app.security.pgp_key_service import pgp_key_service
from app.auth.dependencies import get_current_active_user, get_current_admin_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/pgp-keys", tags=["PGP Keys"])


# Request/Response Models
class PGPKeyGenerateRequest(BaseModel):
    """Request model for PGP key generation."""
    
    name: str = Field(..., min_length=1, max_length=255, description="Full name for the key")
    email: EmailStr = Field(..., description="Email address for the key")
    passphrase: Optional[str] = Field(None, min_length=8, max_length=128, description="Optional passphrase for the key")
    key_length: int = Field(2048, ge=1024, le=4096, description="Key length in bits")
    key_type: str = Field("RSA", pattern="^(RSA|DSA|ELGAMAL|ECDSA|EDDSA)$", description="Key type")
    is_primary: bool = Field(False, description="Whether this should be the user's primary key")
    auto_rotate: bool = Field(False, description="Enable automatic key rotation")
    rotation_schedule_days: int = Field(365, ge=30, le=3650, description="Days between automatic rotations")


class PGPKeyRegenerateRequest(BaseModel):
    """Request model for PGP key regeneration."""
    
    old_key_id: str = Field(..., min_length=16, max_length=16, description="ID of the key to regenerate")
    name: Optional[str] = Field(None, min_length=1, max_length=255, description="New name for the key")
    email: Optional[EmailStr] = Field(None, description="New email address for the key")
    passphrase: Optional[str] = Field(None, min_length=8, max_length=128, description="New passphrase for the key")
    key_length: Optional[int] = Field(None, ge=1024, le=4096, description="New key length in bits")
    key_type: Optional[str] = Field(None, pattern="^(RSA|DSA|ELGAMAL|ECDSA|EDDSA)$", description="New key type")


class PGPKeyRevokeRequest(BaseModel):
    """Request model for PGP key revocation."""
    
    key_id: str = Field(..., min_length=16, max_length=16, description="ID of the key to revoke")
    reason: str = Field(..., min_length=1, max_length=500, description="Reason for revocation")


class PGPKeyResponse(BaseModel):
    """Response model for PGP key data."""
    
    id: str
    key_id: str
    fingerprint: str
    short_fingerprint: str
    key_type: str
    key_length: int
    algorithm: str
    user_id: str
    email: str
    name: str
    status: str
    created_at: str
    expires_at: Optional[str]
    last_used: Optional[str]
    usage_count: int
    is_primary: bool
    auto_rotate: bool
    rotation_schedule_days: int
    trust_level: int
    is_revoked: bool
    revocation_reason: Optional[str]
    revoked_at: Optional[str]
    revoked_by: Optional[str]
    notes: Optional[str]
    updated_at: str


class PGPKeyListResponse(BaseModel):
    """Response model for PGP key list."""
    
    keys: list[PGPKeyResponse]
    total: int


class PGPKeyOperationResponse(BaseModel):
    """Response model for PGP key operations."""
    
    success: bool
    message: str
    key: Optional[PGPKeyResponse] = None


# Helper function to get request context
def get_request_context(request: Request) -> dict[str, Any]:
    """Extract request context for audit logging."""
    return {
        "ip_address": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
        "request_id": request.headers.get("x-request-id"),
    }


# User Endpoints
@router.post("/generate", response_model=PGPKeyOperationResponse)
async def generate_pgp_key(
    request: PGPKeyGenerateRequest,
    current_user: dict = Depends(get_current_active_user),
    http_request: Request = None,
) -> PGPKeyOperationResponse:
    """Generate a new PGP key for the current user."""
    try:
        context = get_request_context(http_request)
        
        key_data = await pgp_key_service.generate_pgp_key(
            user_id=current_user["username"],
            name=request.name,
            email=request.email,
            passphrase=request.passphrase,
            key_length=request.key_length,
            key_type=request.key_type,
            is_primary=request.is_primary,
            auto_rotate=request.auto_rotate,
            rotation_schedule_days=request.rotation_schedule_days,
            **context,
        )
        
        return PGPKeyOperationResponse(
            success=True,
            message="PGP key generated successfully",
            key=PGPKeyResponse(**key_data),
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to generate PGP key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate PGP key",
        )


@router.post("/regenerate", response_model=PGPKeyOperationResponse)
async def regenerate_pgp_key(
    request: PGPKeyRegenerateRequest,
    current_user: dict = Depends(get_current_active_user),
    http_request: Request = None,
) -> PGPKeyOperationResponse:
    """Regenerate an existing PGP key for the current user."""
    try:
        context = get_request_context(http_request)
        
        key_data = await pgp_key_service.regenerate_pgp_key(
            user_id=current_user["username"],
            old_key_id=request.old_key_id,
            name=request.name,
            email=request.email,
            passphrase=request.passphrase,
            key_length=request.key_length,
            key_type=request.key_type,
            **context,
        )
        
        return PGPKeyOperationResponse(
            success=True,
            message="PGP key regenerated successfully",
            key=PGPKeyResponse(**key_data),
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to regenerate PGP key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to regenerate PGP key",
        )


@router.get("/my-keys", response_model=PGPKeyListResponse)
async def get_my_pgp_keys(
    include_revoked: bool = False,
    current_user: dict = Depends(get_current_active_user),
    http_request: Request = None,
) -> PGPKeyListResponse:
    """Get all PGP keys for the current user."""
    try:
        context = get_request_context(http_request)
        
        keys_data = await pgp_key_service.get_user_keys(
            user_id=current_user["username"],
            include_revoked=include_revoked,
            **context,
        )
        
        keys = [PGPKeyResponse(**key_data) for key_data in keys_data]
        
        return PGPKeyListResponse(
            keys=keys,
            total=len(keys),
        )
        
    except Exception as e:
        logger.error(f"Failed to get user PGP keys: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve PGP keys",
        )


@router.post("/revoke", response_model=PGPKeyOperationResponse)
async def revoke_pgp_key(
    request: PGPKeyRevokeRequest,
    current_user: dict = Depends(get_current_active_user),
    http_request: Request = None,
) -> PGPKeyOperationResponse:
    """Revoke a PGP key for the current user."""
    try:
        context = get_request_context(http_request)
        
        key_data = await pgp_key_service.revoke_key(
            user_id=current_user["username"],
            key_id=request.key_id,
            reason=request.reason,
            **context,
        )
        
        return PGPKeyOperationResponse(
            success=True,
            message="PGP key revoked successfully",
            key=PGPKeyResponse(**key_data),
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to revoke PGP key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke PGP key",
        )


@router.get("/key/{fingerprint}", response_model=PGPKeyResponse)
async def get_pgp_key_by_fingerprint(
    fingerprint: str,
    include_private: bool = False,
    current_user: dict = Depends(get_current_active_user),
    http_request: Request = None,
) -> PGPKeyResponse:
    """Get a PGP key by fingerprint."""
    try:
        context = get_request_context(http_request)
        
        key_data = await pgp_key_service.get_key_by_fingerprint(
            fingerprint=fingerprint,
            include_private=include_private,
            user_id=current_user["username"],
            **context,
        )
        
        if not key_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="PGP key not found",
            )
        
        return PGPKeyResponse(**key_data)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get PGP key by fingerprint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve PGP key",
        )


# Admin Endpoints
@router.post("/admin/generate", response_model=PGPKeyOperationResponse)
async def admin_generate_pgp_key(
    user_id: str,
    request: PGPKeyGenerateRequest,
    admin_user: dict = Depends(get_current_admin_user),
    http_request: Request = None,
) -> PGPKeyOperationResponse:
    """Generate a new PGP key for any user (admin only)."""
    try:
        context = get_request_context(http_request)
        
        key_data = await pgp_key_service.generate_pgp_key(
            user_id=user_id,
            name=request.name,
            email=request.email,
            passphrase=request.passphrase,
            key_length=request.key_length,
            key_type=request.key_type,
            is_primary=request.is_primary,
            auto_rotate=request.auto_rotate,
            rotation_schedule_days=request.rotation_schedule_days,
            admin_user_id=admin_user["username"],
            **context,
        )
        
        return PGPKeyOperationResponse(
            success=True,
            message=f"PGP key generated successfully for user {user_id}",
            key=PGPKeyResponse(**key_data),
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to generate PGP key for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate PGP key",
        )


@router.post("/admin/regenerate", response_model=PGPKeyOperationResponse)
async def admin_regenerate_pgp_key(
    user_id: str,
    request: PGPKeyRegenerateRequest,
    admin_user: dict = Depends(get_current_admin_user),
    http_request: Request = None,
) -> PGPKeyOperationResponse:
    """Regenerate a PGP key for any user (admin only)."""
    try:
        context = get_request_context(http_request)
        
        key_data = await pgp_key_service.regenerate_pgp_key(
            user_id=user_id,
            old_key_id=request.old_key_id,
            name=request.name,
            email=request.email,
            passphrase=request.passphrase,
            key_length=request.key_length,
            key_type=request.key_type,
            admin_user_id=admin_user["username"],
            **context,
        )
        
        return PGPKeyOperationResponse(
            success=True,
            message=f"PGP key regenerated successfully for user {user_id}",
            key=PGPKeyResponse(**key_data),
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to regenerate PGP key for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to regenerate PGP key",
        )


@router.get("/admin/user/{user_id}/keys", response_model=PGPKeyListResponse)
async def admin_get_user_pgp_keys(
    user_id: str,
    include_revoked: bool = True,
    admin_user: dict = Depends(get_current_admin_user),
    http_request: Request = None,
) -> PGPKeyListResponse:
    """Get all PGP keys for any user (admin only)."""
    try:
        context = get_request_context(http_request)
        
        keys_data = await pgp_key_service.get_user_keys(
            user_id=user_id,
            include_revoked=include_revoked,
            admin_user_id=admin_user["username"],
            **context,
        )
        
        keys = [PGPKeyResponse(**key_data) for key_data in keys_data]
        
        return PGPKeyListResponse(
            keys=keys,
            total=len(keys),
        )
        
    except Exception as e:
        logger.error(f"Failed to get PGP keys for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve PGP keys",
        )


@router.post("/admin/revoke", response_model=PGPKeyOperationResponse)
async def admin_revoke_pgp_key(
    user_id: str,
    request: PGPKeyRevokeRequest,
    admin_user: dict = Depends(get_current_admin_user),
    http_request: Request = None,
) -> PGPKeyOperationResponse:
    """Revoke a PGP key for any user (admin only)."""
    try:
        context = get_request_context(http_request)
        
        key_data = await pgp_key_service.revoke_key(
            user_id=user_id,
            key_id=request.key_id,
            reason=f"Admin revocation: {request.reason}",
            admin_user_id=admin_user["username"],
            **context,
        )
        
        return PGPKeyOperationResponse(
            success=True,
            message=f"PGP key revoked successfully for user {user_id}",
            key=PGPKeyResponse(**key_data),
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to revoke PGP key for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke PGP key",
        )


@router.get("/admin/key/{fingerprint}", response_model=PGPKeyResponse)
async def admin_get_pgp_key_by_fingerprint(
    fingerprint: str,
    include_private: bool = True,
    admin_user: dict = Depends(get_current_admin_user),
    http_request: Request = None,
) -> PGPKeyResponse:
    """Get any PGP key by fingerprint (admin only)."""
    try:
        context = get_request_context(http_request)
        
        key_data = await pgp_key_service.get_key_by_fingerprint(
            fingerprint=fingerprint,
            include_private=include_private,
            admin_user_id=admin_user["username"],
            **context,
        )
        
        if not key_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="PGP key not found",
            )
        
        return PGPKeyResponse(**key_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get PGP key by fingerprint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve PGP key",
        )
