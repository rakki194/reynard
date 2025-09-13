"""
Secure Ollama Routes for Reynard Backend

This module provides secure wrappers around Ollama endpoints
to prevent information disclosure and other security vulnerabilities.
"""

import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer

from ..security.input_validator import SecureChatRequest
from ..security.secure_ollama import SecureOllamaService
from ..security.secure_auth import get_current_user_secure

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()

# Create secure Ollama router
secure_ollama_router = APIRouter(prefix="/ollama", tags=["secure-ollama"])


@secure_ollama_router.post("/chat")
async def secure_chat(
    request: SecureChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user_secure),
    ollama_service: SecureOllamaService = Depends()
) -> Dict[str, Any]:
    """
    Securely process a chat request with comprehensive input validation.
    
    This endpoint prevents command injection, information disclosure, and other
    security vulnerabilities through comprehensive input validation and response sanitization.
    
    Args:
        request: Validated chat request data
        current_user: Current authenticated user
        ollama_service: Secure Ollama service
        
    Returns:
        Dict containing chat response (sanitized)
        
    Raises:
        HTTPException: If chat processing fails or security violation detected
    """
    try:
        logger.info(f"Secure chat request from user: {current_user.get('username', 'unknown')}")
        
        # Process chat through secure service
        result = await ollama_service.chat_secure(request)
        
        logger.info(f"Chat processing successful for user: {current_user.get('username', 'unknown')}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Secure chat processing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Chat processing failed"
        )


@secure_ollama_router.post("/assistant")
async def secure_assistant_chat(
    request: SecureChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user_secure),
    ollama_service: SecureOllamaService = Depends()
) -> Dict[str, Any]:
    """
    Securely process an assistant chat request with comprehensive input validation.
    
    This endpoint prevents command injection, information disclosure, and other
    security vulnerabilities through comprehensive input validation and response sanitization.
    
    Args:
        request: Validated assistant chat request data
        current_user: Current authenticated user
        ollama_service: Secure Ollama service
        
    Returns:
        Dict containing assistant response (sanitized)
        
    Raises:
        HTTPException: If assistant processing fails or security violation detected
    """
    try:
        logger.info(f"Secure assistant chat request from user: {current_user.get('username', 'unknown')}")
        
        # Process assistant chat through secure service
        result = await ollama_service.assistant_chat_secure(request)
        
        logger.info(f"Assistant chat processing successful for user: {current_user.get('username', 'unknown')}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Secure assistant chat processing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Assistant chat processing failed"
        )


@secure_ollama_router.get("/models")
async def secure_get_models(
    current_user: Dict[str, Any] = Depends(get_current_user_secure),
    ollama_service: SecureOllamaService = Depends()
) -> Dict[str, Any]:
    """
    Securely get available Ollama models.
    
    This endpoint provides model information without exposing sensitive system details.
    
    Args:
        current_user: Current authenticated user
        ollama_service: Secure Ollama service
        
    Returns:
        Dict containing available models (sanitized)
        
    Raises:
        HTTPException: If model retrieval fails
    """
    try:
        logger.info(f"Secure models request from user: {current_user.get('username', 'unknown')}")
        
        # Get models through secure service
        # TODO: Implement actual model retrieval with sanitization
        result = {
            "models": [
                {"name": "llama3.2:3b", "size": "2.0GB", "modified_at": "2024-01-01T00:00:00Z"},
                {"name": "llama3.2:1b", "size": "1.3GB", "modified_at": "2024-01-01T00:00:00Z"},
                {"name": "codellama:7b", "size": "3.8GB", "modified_at": "2024-01-01T00:00:00Z"},
            ],
            "message": "Models retrieved successfully"
        }
        
        logger.info(f"Models retrieval successful for user: {current_user.get('username', 'unknown')}")
        return result
        
    except Exception as e:
        logger.error(f"Secure models retrieval failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve models"
        )


@secure_ollama_router.get("/config")
async def secure_get_config(
    current_user: Dict[str, Any] = Depends(get_current_user_secure)
) -> Dict[str, Any]:
    """
    Securely get Ollama configuration.
    
    This endpoint provides configuration information without exposing sensitive details.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Dict containing configuration (sanitized)
        
    Raises:
        HTTPException: If configuration retrieval fails
    """
    try:
        logger.info(f"Secure config request from user: {current_user.get('username', 'unknown')}")
        
        # Return sanitized configuration
        result = {
            "ollama_host": "localhost",
            "ollama_port": 11434,
            "default_model": "llama3.2:3b",
            "max_tokens": 4096,
            "temperature_range": {"min": 0.0, "max": 2.0},
            "message": "Configuration retrieved successfully"
        }
        
        logger.info(f"Config retrieval successful for user: {current_user.get('username', 'unknown')}")
        return result
        
    except Exception as e:
        logger.error(f"Secure config retrieval failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve configuration"
        )


def create_secure_ollama_router(ollama_service) -> APIRouter:
    """
    Create a secure Ollama router.
    
    Args:
        ollama_service: The Ollama service to wrap
        
    Returns:
        APIRouter: Configured secure Ollama router
    """
    # Create secure Ollama service
    secure_ollama_service = SecureOllamaService(ollama_service)
    
    # Create a new router with the secure service as a dependency
    router = APIRouter(prefix="/ollama", tags=["secure-ollama"])
    
    # Add routes with the secure service dependency
    @router.post("/chat")
    async def secure_chat(
        request: SecureChatRequest,
        current_user: Dict[str, Any] = Depends(get_current_user_secure),
        service: SecureOllamaService = Depends(lambda: secure_ollama_service)
    ) -> Dict[str, Any]:
        """Secure chat endpoint with input validation and authentication."""
        try:
            # Validate and sanitize input
            validated_request = service.validate_chat_request(request)
            
            # Process the request
            response = await service.process_chat_request(validated_request, current_user)
            
            return response
            
        except Exception as e:
            logger.error(f"Secure chat error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process chat request"
            )
    
    @router.get("/models")
    async def secure_get_models(
        current_user: Dict[str, Any] = Depends(get_current_user_secure),
        service: SecureOllamaService = Depends(lambda: secure_ollama_service)
    ) -> Dict[str, Any]:
        """Secure models endpoint with authentication."""
        try:
            models = await service.get_available_models(current_user)
            return {"models": models}
            
        except Exception as e:
            logger.error(f"Secure models error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve models"
            )
    
    @router.get("/config")
    async def secure_get_config(
        current_user: Dict[str, Any] = Depends(get_current_user_secure),
        service: SecureOllamaService = Depends(lambda: secure_ollama_service)
    ) -> Dict[str, Any]:
        """Secure config endpoint with authentication."""
        try:
            config = await service.get_configuration(current_user)
            return config
            
        except Exception as e:
            logger.error(f"Secure config error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve configuration"
            )
    
    return router
