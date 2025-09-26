"""🔐 SSH Key Management API Routes

FastAPI routes for SSH key management with user and admin endpoints.
Provides secure SSH key generation, import, export, and management
integrated with the Gatekeeper authentication system.

Key Features:
- User SSH key management (generate, import, export, revoke)
- Admin SSH key management (view all keys, revoke any key)
- Secure key storage and retrieval
- Audit logging for all operations
- Key rotation and lifecycle management

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from ..auth.dependencies import get_current_active_user, get_current_admin_user
from ..security.ssh_key_service import ssh_key_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ssh-keys", tags=["SSH Key Management"])


# Request/Response Models
class GenerateSSHKeyRequest(BaseModel):
    """Request model for generating a new SSH key."""

    name: str = Field(..., min_length=1, max_length=255, description="Name for the key")
    email: str = Field(..., min_length=1, max_length=255, description="Email address")
    key_type: str = Field(
        "ed25519", pattern="^(ed25519|rsa|ecdsa)$", description="SSH key type"
    )
    key_length: int = Field(256, ge=256, le=4096, description="Key length in bits")
    comment: str = Field("", max_length=255, description="Optional comment for the key")
    passphrase: Optional[str] = Field(
        None,
        min_length=8,
        max_length=128,
        description="Optional passphrase for the key",
    )
    usage: str = Field(
        "authentication",
        pattern="^(authentication|signing|encryption|multipurpose)$",
        description="Key usage type",
    )
    is_primary: bool = Field(
        False, description="Whether this should be the user's primary key"
    )
    auto_rotate: bool = Field(False, description="Enable automatic key rotation")
    rotation_schedule_days: int = Field(
        365, ge=30, le=3650, description="Days between automatic rotations"
    )
    allowed_hosts: Optional[list[str]] = Field(
        None, description="List of allowed host patterns"
    )
    allowed_commands: Optional[list[str]] = Field(
        None, description="List of allowed commands"
    )
    source_restrictions: Optional[list[str]] = Field(
        None, description="Source IP restrictions"
    )
    force_command: Optional[str] = Field(
        None, max_length=255, description="Force command execution"
    )


class ImportSSHKeyRequest(BaseModel):
    """Request model for importing an existing SSH key."""

    name: str = Field(..., min_length=1, max_length=255, description="Name for the key")
    email: str = Field(..., min_length=1, max_length=255, description="Email address")
    public_key: str = Field(
        ..., min_length=1, description="SSH public key in OpenSSH format"
    )
    private_key: Optional[str] = Field(None, description="SSH private key (optional)")
    passphrase: Optional[str] = Field(
        None, min_length=8, max_length=128, description="Passphrase for private key"
    )
    usage: str = Field(
        "authentication",
        pattern="^(authentication|signing|encryption|multipurpose)$",
        description="Key usage type",
    )
    is_primary: bool = Field(
        False, description="Whether this should be the user's primary key"
    )


class RegenerateSSHKeyRequest(BaseModel):
    """Request model for regenerating an SSH key."""

    key_type: Optional[str] = Field(
        None, pattern="^(ed25519|rsa|ecdsa)$", description="New key type"
    )
    key_length: Optional[int] = Field(
        None, ge=256, le=4096, description="New key length in bits"
    )
    comment: Optional[str] = Field(
        None, max_length=255, description="New comment for the key"
    )
    passphrase: Optional[str] = Field(
        None, min_length=8, max_length=128, description="New passphrase for the key"
    )


class RevokeSSHKeyRequest(BaseModel):
    """Request model for revoking an SSH key."""

    reason: str = Field(
        ..., min_length=1, max_length=500, description="Reason for revocation"
    )


class SSHKeyResponse(BaseModel):
    """Response model for SSH key operations."""

    key_id: str
    fingerprint: str
    public_key_hash: str
    key_type: str
    key_length: int
    algorithm: str
    comment: str
    user_id: str
    email: str
    name: str
    public_key_openssh: str
    status: str
    usage: str
    is_primary: bool
    auto_rotate: bool
    rotation_schedule_days: int
    trust_level: int
    is_revoked: bool
    revocation_reason: Optional[str]
    revoked_at: Optional[str]
    revoked_by: Optional[str]
    allowed_hosts: Optional[list[str]]
    allowed_commands: Optional[list[str]]
    source_restrictions: Optional[list[str]]
    force_command: Optional[str]
    created_at: str
    updated_at: Optional[str]


# User Routes
@router.post("/generate", response_model=SSHKeyResponse)
async def generate_ssh_key(
    request: GenerateSSHKeyRequest,
    current_user: dict = Depends(get_current_active_user),
    http_request: Request = None,
) -> SSHKeyResponse:
    """Generate a new SSH key for the current user."""
    try:
        key_data = await ssh_key_service.generate_ssh_key(
            user_id=current_user["username"],
            name=request.name,
            email=request.email,
            key_type=request.key_type,
            key_length=request.key_length,
            comment=request.comment,
            passphrase=request.passphrase,
            usage=request.usage,
            is_primary=request.is_primary,
            auto_rotate=request.auto_rotate,
            rotation_schedule_days=request.rotation_schedule_days,
            allowed_hosts=request.allowed_hosts,
            allowed_commands=request.allowed_commands,
            source_restrictions=request.source_restrictions,
            force_command=request.force_command,
            ip_address=http_request.client.host if http_request else None,
            user_agent=http_request.headers.get("user-agent") if http_request else None,
            request_id=(
                str(http_request.headers.get("x-request-id", ""))
                if http_request
                else None
            ),
        )

        return SSHKeyResponse(**key_data)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate SSH key: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/import", response_model=SSHKeyResponse)
async def import_ssh_key(
    request: ImportSSHKeyRequest,
    current_user: dict = Depends(get_current_active_user),
    http_request: Request = None,
) -> SSHKeyResponse:
    """Import an existing SSH key for the current user."""
    try:
        key_data = await ssh_key_service.import_ssh_key(
            user_id=current_user["username"],
            name=request.name,
            email=request.email,
            public_key_str=request.public_key,
            private_key_str=request.private_key,
            passphrase=request.passphrase,
            usage=request.usage,
            is_primary=request.is_primary,
            ip_address=http_request.client.host if http_request else None,
            user_agent=http_request.headers.get("user-agent") if http_request else None,
            request_id=(
                str(http_request.headers.get("x-request-id", ""))
                if http_request
                else None
            ),
        )

        return SSHKeyResponse(**key_data)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to import SSH key: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/regenerate/{key_id}", response_model=SSHKeyResponse)
async def regenerate_ssh_key(
    key_id: str,
    request: RegenerateSSHKeyRequest,
    current_user: dict = Depends(get_current_active_user),
    http_request: Request = None,
) -> SSHKeyResponse:
    """Regenerate an SSH key for the current user."""
    try:
        key_data = await ssh_key_service.regenerate_ssh_key(
            user_id=current_user["username"],
            old_key_id=key_id,
            key_type=request.key_type,
            key_length=request.key_length,
            comment=request.comment,
            passphrase=request.passphrase,
            ip_address=http_request.client.host if http_request else None,
            user_agent=http_request.headers.get("user-agent") if http_request else None,
            request_id=(
                str(http_request.headers.get("x-request-id", ""))
                if http_request
                else None
            ),
        )

        return SSHKeyResponse(**key_data)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to regenerate SSH key: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/", response_model=list[SSHKeyResponse])
async def get_user_ssh_keys(
    include_revoked: bool = False,
    current_user: dict = Depends(get_current_active_user),
    http_request: Request = None,
) -> list[SSHKeyResponse]:
    """Get all SSH keys for the current user."""
    try:
        keys = await ssh_key_service.get_user_keys(
            user_id=current_user["username"],
            include_revoked=include_revoked,
            ip_address=http_request.client.host if http_request else None,
            user_agent=http_request.headers.get("user-agent") if http_request else None,
            request_id=(
                str(http_request.headers.get("x-request-id", ""))
                if http_request
                else None
            ),
        )

        return [SSHKeyResponse(**key) for key in keys]

    except Exception as e:
        logger.error(f"Failed to get user SSH keys: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/fingerprint/{fingerprint}", response_model=SSHKeyResponse)
async def get_ssh_key_by_fingerprint(
    fingerprint: str,
    include_private: bool = False,
    current_user: dict = Depends(get_current_active_user),
    http_request: Request = None,
) -> SSHKeyResponse:
    """Get an SSH key by fingerprint."""
    try:
        key = await ssh_key_service.get_key_by_fingerprint(
            fingerprint=fingerprint,
            include_private=include_private,
            user_id=current_user["username"],
            ip_address=http_request.client.host if http_request else None,
            user_agent=http_request.headers.get("user-agent") if http_request else None,
            request_id=(
                str(http_request.headers.get("x-request-id", ""))
                if http_request
                else None
            ),
        )

        if not key:
            raise HTTPException(status_code=404, detail="SSH key not found")

        return SSHKeyResponse(**key)

    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get SSH key by fingerprint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/revoke/{key_id}", response_model=SSHKeyResponse)
async def revoke_ssh_key(
    key_id: str,
    request: RevokeSSHKeyRequest,
    current_user: dict = Depends(get_current_active_user),
    http_request: Request = None,
) -> SSHKeyResponse:
    """Revoke an SSH key for the current user."""
    try:
        key_data = await ssh_key_service.revoke_key(
            user_id=current_user["username"],
            key_id=key_id,
            reason=request.reason,
            ip_address=http_request.client.host if http_request else None,
            user_agent=http_request.headers.get("user-agent") if http_request else None,
            request_id=(
                str(http_request.headers.get("x-request-id", ""))
                if http_request
                else None
            ),
        )

        return SSHKeyResponse(**key_data)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to revoke SSH key: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Admin Routes
@router.get("/admin/users/{user_id}", response_model=list[SSHKeyResponse])
async def get_user_ssh_keys_admin(
    user_id: str,
    include_revoked: bool = False,
    current_admin: dict = Depends(get_current_admin_user),
    http_request: Request = None,
) -> list[SSHKeyResponse]:
    """Get all SSH keys for a specific user (admin only)."""
    try:
        keys = await ssh_key_service.get_user_keys(
            user_id=user_id,
            include_revoked=include_revoked,
            admin_user_id=current_admin["username"],
            ip_address=http_request.client.host if http_request else None,
            user_agent=http_request.headers.get("user-agent") if http_request else None,
            request_id=(
                str(http_request.headers.get("x-request-id", ""))
                if http_request
                else None
            ),
        )

        return [SSHKeyResponse(**key) for key in keys]

    except Exception as e:
        logger.error(f"Failed to get user SSH keys (admin): {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/admin/fingerprint/{fingerprint}", response_model=SSHKeyResponse)
async def get_ssh_key_by_fingerprint_admin(
    fingerprint: str,
    include_private: bool = False,
    current_admin: dict = Depends(get_current_admin_user),
    http_request: Request = None,
) -> SSHKeyResponse:
    """Get an SSH key by fingerprint (admin only)."""
    try:
        key = await ssh_key_service.get_key_by_fingerprint(
            fingerprint=fingerprint,
            include_private=include_private,
            admin_user_id=current_admin["username"],
            ip_address=http_request.client.host if http_request else None,
            user_agent=http_request.headers.get("user-agent") if http_request else None,
            request_id=(
                str(http_request.headers.get("x-request-id", ""))
                if http_request
                else None
            ),
        )

        if not key:
            raise HTTPException(status_code=404, detail="SSH key not found")

        return SSHKeyResponse(**key)

    except Exception as e:
        logger.error(f"Failed to get SSH key by fingerprint (admin): {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/admin/revoke/{key_id}", response_model=SSHKeyResponse)
async def revoke_ssh_key_admin(
    key_id: str,
    request: RevokeSSHKeyRequest,
    current_admin: dict = Depends(get_current_admin_user),
    http_request: Request = None,
) -> SSHKeyResponse:
    """Revoke any SSH key (admin only)."""
    try:
        # For admin revocation, we need to find the key first
        # This is a simplified approach - in production you'd want a more robust key lookup
        key_data = await ssh_key_service.revoke_key(
            user_id="admin",  # This will need to be updated based on actual key lookup
            key_id=key_id,
            reason=f"Admin revocation: {request.reason}",
            admin_user_id=current_admin["username"],
            ip_address=http_request.client.host if http_request else None,
            user_agent=http_request.headers.get("user-agent") if http_request else None,
            request_id=(
                str(http_request.headers.get("x-request-id", ""))
                if http_request
                else None
            ),
        )

        return SSHKeyResponse(**key_data)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to revoke SSH key (admin): {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/admin/generate/{user_id}", response_model=SSHKeyResponse)
async def generate_ssh_key_admin(
    user_id: str,
    request: GenerateSSHKeyRequest,
    current_admin: dict = Depends(get_current_admin_user),
    http_request: Request = None,
) -> SSHKeyResponse:
    """Generate a new SSH key for a specific user (admin only)."""
    try:
        key_data = await ssh_key_service.generate_ssh_key(
            user_id=user_id,
            name=request.name,
            email=request.email,
            key_type=request.key_type,
            key_length=request.key_length,
            comment=request.comment,
            passphrase=request.passphrase,
            usage=request.usage,
            is_primary=request.is_primary,
            auto_rotate=request.auto_rotate,
            rotation_schedule_days=request.rotation_schedule_days,
            allowed_hosts=request.allowed_hosts,
            allowed_commands=request.allowed_commands,
            source_restrictions=request.source_restrictions,
            force_command=request.force_command,
            admin_user_id=current_admin["username"],
            ip_address=http_request.client.host if http_request else None,
            user_agent=http_request.headers.get("user-agent") if http_request else None,
            request_id=(
                str(http_request.headers.get("x-request-id", ""))
                if http_request
                else None
            ),
        )

        return SSHKeyResponse(**key_data)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate SSH key (admin): {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
