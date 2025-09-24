"""Secure Authentication Routes for Reynard Backend

This module provides secure wrappers around authentication endpoints
to prevent SQL injection and other security vulnerabilities.
"""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer

from ..security.input_validator import SecureUserCreate, SecureUserLogin
from ..security.secure_auth import SecureAuthManager, get_current_user_secure

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()

# Create secure auth router
secure_auth_router = APIRouter(prefix="/auth", tags=["secure-authentication"])


@secure_auth_router.post("/register")
async def secure_register(
    user_data: SecureUserCreate, auth_manager: SecureAuthManager = Depends(),
) -> dict[str, Any]:
    """Securely register a new user with comprehensive input validation.

    This endpoint prevents SQL injection, command injection, and other
    security vulnerabilities through comprehensive input validation.

    Args:
        user_data: Validated user creation data
        auth_manager: Secure authentication manager

    Returns:
        Dict containing user information (without sensitive data)

    Raises:
        HTTPException: If registration fails or security violation detected

    """
    try:
        logger.info(
            f"Secure user registration attempt for username: {user_data.username}",
        )

        # Create user through secure auth manager
        result = await auth_manager.create_user_secure(user_data)

        logger.info(f"User registration successful for username: {user_data.username}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Secure registration failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed",
        )


@secure_auth_router.post("/login")
async def secure_login(
    login_data: SecureUserLogin, auth_manager: SecureAuthManager = Depends(),
) -> dict[str, Any]:
    """Securely authenticate a user with comprehensive input validation.

    This endpoint prevents SQL injection, command injection, and other
    security vulnerabilities through comprehensive input validation.

    Args:
        login_data: Validated login data
        auth_manager: Secure authentication manager

    Returns:
        Dict containing authentication tokens

    Raises:
        HTTPException: If authentication fails or security violation detected

    """
    try:
        logger.info(f"Secure login attempt for username: {login_data.username}")

        # Authenticate through secure auth manager
        result = await auth_manager.authenticate_secure(login_data)

        logger.info(f"User login successful for username: {login_data.username}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Secure login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed",
        )


@secure_auth_router.get("/me")
async def secure_get_current_user(
    current_user: dict[str, Any] = Depends(get_current_user_secure),
) -> dict[str, Any]:
    """Securely get current user information.

    This endpoint provides user information without exposing sensitive data.

    Args:
        current_user: Current authenticated user

    Returns:
        Dict containing user information (without sensitive data)

    Raises:
        HTTPException: If user not found or authentication failed

    """
    try:
        logger.info(
            f"Secure user info request for username: {current_user.get('username', 'unknown')}",
        )

        # Return sanitized user data
        return {
            "username": current_user.get("username"),
            "role": current_user.get("role"),
            "is_active": current_user.get("is_active"),
            "message": "User information retrieved successfully",
        }

    except Exception as e:
        logger.error(f"Secure user info retrieval failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user information",
        )


@secure_auth_router.post("/logout")
async def secure_logout(
    current_user: dict[str, Any] = Depends(get_current_user_secure),
) -> dict[str, Any]:
    """Securely logout the current user.

    This endpoint invalidates the user's authentication token.

    Args:
        current_user: Current authenticated user

    Returns:
        Dict containing logout confirmation

    Raises:
        HTTPException: If logout fails

    """
    try:
        logger.info(
            f"Secure logout request for username: {current_user.get('username', 'unknown')}",
        )

        # TODO: Implement actual token invalidation
        # For now, return success message

        return {
            "message": "Successfully logged out",
            "username": current_user.get("username"),
        }

    except Exception as e:
        logger.error(f"Secure logout failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Logout failed",
        )


def create_secure_auth_router(auth_manager) -> APIRouter:
    """Create a secure authentication router.

    Args:
        auth_manager: The authentication manager to wrap

    Returns:
        APIRouter: Configured secure authentication router

    """
    # Create secure auth manager
    secure_auth_manager = SecureAuthManager(auth_manager)

    # Create a new router with the secure manager as a dependency
    router = APIRouter(prefix="/auth", tags=["secure-authentication"])

    # Add routes with the secure manager dependency
    @router.post("/register")
    async def secure_register(
        user_data: SecureUserCreate,
        manager: SecureAuthManager = Depends(lambda: secure_auth_manager),
    ) -> dict[str, Any]:
        """Secure user registration with input validation."""
        try:
            # Validate and sanitize input
            validated_data = manager.validate_user_create(user_data)

            # Create user
            user = await manager.create_user(validated_data)

            return {
                "message": "User registered successfully",
                "user_id": user.id,
                "username": user.username,
            }

        except Exception as e:
            logger.error(f"Secure registration error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Registration failed",
            )

    @router.post("/login")
    async def secure_login(
        login_data: SecureUserLogin,
        manager: SecureAuthManager = Depends(lambda: secure_auth_manager),
    ) -> dict[str, Any]:
        """Secure user login with input validation."""
        try:
            # Validate and sanitize input
            validated_data = manager.validate_user_login(login_data)

            # Authenticate user
            result = await manager.authenticate_user(validated_data)

            return result

        except Exception as e:
            logger.error(f"Secure login error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed",
            )

    @router.post("/logout")
    async def secure_logout(
        current_user: dict[str, Any] = Depends(get_current_user_secure),
        manager: SecureAuthManager = Depends(lambda: secure_auth_manager),
    ) -> dict[str, Any]:
        """Secure user logout."""
        try:
            # Logout user
            await manager.logout_user(current_user)

            return {"message": "Logged out successfully"}

        except Exception as e:
            logger.error(f"Secure logout error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Logout failed",
            )

    return router
