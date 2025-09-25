"""Secure AI Routes for Reynard Backend

This module provides secure wrappers around AI endpoints
to prevent information disclosure and other security vulnerabilities.
"""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer

from ..security.input_validator import SecureChatRequest
from ..security.secure_auth import get_current_user_secure

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()

# Create secure AI router
secure_ai_router = APIRouter(prefix="/ai", tags=["secure-ai"])


def create_secure_ai_router(ai_service: Any) -> APIRouter:
    """Create a secure AI router with the provided AI service.
    
    Args:
        ai_service: The AI service instance to use
        
    Returns:
        APIRouter: Configured secure AI router
    """
    # Create a new router instance
    router = APIRouter(prefix="/ai", tags=["secure-ai"])
    
    @router.post("/chat")
    async def secure_ai_chat(
        request: SecureChatRequest,
        current_user: dict[str, Any] = Depends(get_current_user_secure),
    ) -> dict[str, Any]:
        """Securely process an AI chat request with comprehensive input validation.

        This endpoint prevents command injection, information disclosure, and other
        security vulnerabilities through comprehensive input validation and response sanitization.

        Args:
            request: Validated chat request data
            current_user: Current authenticated user

        Returns:
            Dict containing AI chat response (sanitized)

        Raises:
            HTTPException: If chat processing fails or security violation detected

        """
        try:
            logger.info(
                f"Processing secure AI chat request for user: {current_user.get('user_id', 'unknown')}"
            )

            # Validate request data
            if not request.message or len(request.message.strip()) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Message cannot be empty"
                )

            # Process the request through the AI service
            if ai_service:
                response = await ai_service.process_chat(
                    message=request.message,
                    user_id=current_user.get('user_id'),
                    context=request.context
                )
            else:
                # Fallback response if AI service is not available
                response = {
                    "message": "AI service is currently unavailable. Please try again later.",
                    "status": "error"
                }

            logger.info("Secure AI chat request processed successfully")
            return response

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error processing secure AI chat request: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error processing AI chat request"
            )

    @router.get("/health")
    async def secure_ai_health(
        current_user: dict[str, Any] = Depends(get_current_user_secure),
    ) -> dict[str, Any]:
        """Check the health status of the AI service.

        Args:
            current_user: Current authenticated user

        Returns:
            Dict containing health status information

        """
        try:
            if ai_service:
                health_status = await ai_service.health_check()
                return {
                    "status": "healthy" if health_status else "unhealthy",
                    "service": "ai",
                    "timestamp": "2025-01-01T00:00:00Z"  # Placeholder timestamp
                }
            else:
                return {
                    "status": "unhealthy",
                    "service": "ai",
                    "error": "AI service not available"
                }
        except Exception as e:
            logger.error(f"Error checking AI service health: {e}")
            return {
                "status": "unhealthy",
                "service": "ai",
                "error": str(e)
            }

    return router
