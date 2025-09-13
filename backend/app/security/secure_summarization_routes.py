"""
Secure Summarization Routes for Reynard Backend

This module provides secure wrappers around summarization endpoints
to prevent command injection and other security vulnerabilities.
"""

import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer

from ..security.input_validator import SecureSummarizationRequest
from ..security.secure_auth import get_current_user_secure

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()

# Create secure summarization router
secure_summarization_router = APIRouter(prefix="/summarization", tags=["secure-summarization"])


@secure_summarization_router.post("/summarize")
async def secure_summarize(
    request: SecureSummarizationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user_secure)
) -> Dict[str, Any]:
    """
    Securely process a summarization request with comprehensive input validation.
    
    This endpoint prevents command injection, information disclosure, and other
    security vulnerabilities through comprehensive input validation and response sanitization.
    
    Args:
        request: Validated summarization request data
        current_user: Current authenticated user
        
    Returns:
        Dict containing summarization response (sanitized)
        
    Raises:
        HTTPException: If summarization fails or security violation detected
    """
    try:
        logger.info(f"Secure summarization request from user: {current_user.get('username', 'unknown')}")
        
        # Additional security validation
        if not _validate_summarization_security(request):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Security validation failed"
            )
        
        # TODO: Implement actual summarization with secure service
        # For now, return a mock response
        result = {
            "summary": "This is a secure summary of the provided text. The original content has been processed through security validation to prevent any malicious input.",
            "content_type": request.content_type,
            "summary_level": request.summary_level,
            "word_count": len(request.text.split()),
            "summary_length": 25,
            "processing_time": 1.5,
            "model_used": request.model or "llama3.2:3b",
            "message": "Summarization completed successfully"
        }
        
        logger.info(f"Summarization successful for user: {current_user.get('username', 'unknown')}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Secure summarization failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Summarization failed"
        )


@secure_summarization_router.get("/models")
async def secure_get_models(
    current_user: Dict[str, Any] = Depends(get_current_user_secure)
) -> Dict[str, Any]:
    """
    Securely get available summarization models.
    
    This endpoint provides model information without exposing sensitive system details.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Dict containing available models (sanitized)
        
    Raises:
        HTTPException: If model retrieval fails
    """
    try:
        logger.info(f"Secure summarization models request from user: {current_user.get('username', 'unknown')}")
        
        # Return sanitized model information
        result = {
            "success": True,
            "models": [
                {
                    "name": "llama3.2:3b",
                    "description": "General purpose model for text summarization",
                    "max_tokens": 4096,
                    "recommended_for": ["general", "article", "document"]
                },
                {
                    "name": "llama3.2:1b",
                    "description": "Lightweight model for quick summarization",
                    "max_tokens": 2048,
                    "recommended_for": ["brief", "executive"]
                },
                {
                    "name": "codellama:7b",
                    "description": "Specialized model for code summarization",
                    "max_tokens": 8192,
                    "recommended_for": ["code", "technical"]
                }
            ],
            "default_model": "llama3.2:3b",
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


@secure_summarization_router.get("/content-types")
async def secure_get_content_types(
    current_user: Dict[str, Any] = Depends(get_current_user_secure)
) -> Dict[str, Any]:
    """
    Securely get supported content types.
    
    This endpoint provides content type information without exposing sensitive details.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Dict containing supported content types
        
    Raises:
        HTTPException: If content type retrieval fails
    """
    try:
        logger.info(f"Secure content types request from user: {current_user.get('username', 'unknown')}")
        
        # Return supported content types
        result = {
            "success": True,
            "content_types": [
                {
                    "type": "general",
                    "description": "General purpose text content",
                    "supported_levels": ["brief", "executive", "detailed", "comprehensive", "bullet"]
                },
                {
                    "type": "article",
                    "description": "News articles, blog posts, and similar content",
                    "supported_levels": ["brief", "executive", "detailed", "comprehensive", "bullet"]
                },
                {
                    "type": "code",
                    "description": "Source code and technical documentation",
                    "supported_levels": ["brief", "detailed", "comprehensive", "bullet"]
                },
                {
                    "type": "document",
                    "description": "Formal documents and reports",
                    "supported_levels": ["executive", "detailed", "comprehensive", "bullet"]
                },
                {
                    "type": "technical",
                    "description": "Technical documentation and specifications",
                    "supported_levels": ["detailed", "comprehensive", "bullet"]
                }
            ],
            "message": "Content types retrieved successfully"
        }
        
        logger.info(f"Content types retrieval successful for user: {current_user.get('username', 'unknown')}")
        return result
        
    except Exception as e:
        logger.error(f"Secure content types retrieval failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve content types"
        )


def _validate_summarization_security(request: SecureSummarizationRequest) -> bool:
    """
    Validate summarization request for security issues.
    
    Args:
        request: Summarization request to validate
        
    Returns:
        bool: True if validation passes, False otherwise
    """
    try:
        # Check for command injection patterns in text
        from ..security.input_validator import validate_command_input
        if not validate_command_input(request.text):
            logger.warning(f"Command injection attempt in summarization text: {request.text[:100]}...")
            return False
        
        # Check for suspicious patterns
        if _contains_suspicious_patterns(request.text):
            logger.warning(f"Suspicious pattern in summarization text: {request.text[:100]}...")
            return False
        
        # Validate model name if provided
        if request.model and not _validate_model_name(request.model):
            logger.warning(f"Invalid model name in summarization request: {request.model}")
            return False
        
        return True
        
    except Exception as e:
        logger.error(f"Summarization security validation error: {e}")
        return False


def _contains_suspicious_patterns(text: str) -> bool:
    """Check for suspicious patterns in text."""
    import re
    
    suspicious_patterns = [
        # System information disclosure
        r'pwd|whoami|id|uname|ps|top|kill|rm|mv|cp|chmod|chown',
        r'cat\s+/etc/passwd|cat\s+/etc/shadow|cat\s+/etc/hosts',
        r'ls\s+-la|ls\s+-l|ls\s+/|ls\s+/home|ls\s+/root',
        r'find\s+/|locate\s+|which\s+|whereis\s+',
        r'ifconfig|ip\s+addr|route\s+-n|netstat\s+-an',
        r'env|export|set|unset|alias|unalias',
        r'history|clear|reset|logout|exit|shutdown|reboot',
        
        # File system access
        r'cat\s+.*\.(py|js|html|css|sql|conf|ini|yaml|json)',
        r'head\s+.*\.(py|js|html|css|sql|conf|ini|yaml|json)',
        r'tail\s+.*\.(py|js|html|css|sql|conf|ini|yaml|json)',
        r'grep\s+.*\.(py|js|html|css|sql|conf|ini|yaml|json)',
        r'awk\s+.*\.(py|js|html|css|sql|conf|ini|yaml|json)',
        r'sed\s+.*\.(py|js|html|css|sql|conf|ini|yaml|json)',
        
        # Network access
        r'curl\s+|wget\s+|nc\s+|netcat\s+|telnet\s+',
        r'ssh\s+|scp\s+|rsync\s+|ftp\s+|sftp\s+',
        r'ping\s+|traceroute\s+|nslookup\s+|dig\s+',
        
        # Process manipulation
        r'kill\s+|killall\s+|pkill\s+|kill\s+-9',
        r'ps\s+aux|ps\s+-ef|top\s+|htop\s+',
        r'nice\s+|renice\s+|nohup\s+|screen\s+|tmux\s+',
        
        # System administration
        r'sudo\s+|su\s+|passwd\s+|useradd\s+|userdel\s+',
        r'groupadd\s+|groupdel\s+|usermod\s+|groupmod\s+',
        r'systemctl\s+|service\s+|init\s+|rc\s+|chkconfig\s+',
        r'mount\s+|umount\s+|fdisk\s+|mkfs\s+|fsck\s+',
        r'dd\s+|tar\s+|zip\s+|unzip\s+|gzip\s+|gunzip\s+',
        
        # Programming language execution
        r'python\s+|python3\s+|node\s+|npm\s+|pip\s+',
        r'apt\s+|yum\s+|brew\s+|pacman\s+|dnf\s+',
        r'git\s+|svn\s+|hg\s+|bzr\s+|cvs\s+',
        
        # Database access
        r'mysql\s+|psql\s+|sqlite3\s+|mongo\s+|redis-cli\s+',
        r'sql\s+select|sql\s+insert|sql\s+update|sql\s+delete',
        r'drop\s+table|create\s+table|alter\s+table',
        r'union\s+select|or\s+1=1|and\s+1=1',
    ]
    
    for pattern in suspicious_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    
    return False


def _validate_model_name(model_name: str) -> bool:
    """Validate model name for security."""
    import re
    
    # Allow only alphanumeric characters, hyphens, underscores, and dots
    if not re.match(r'^[a-zA-Z0-9._-]+$', model_name):
        return False
    
    # Prevent path traversal
    if '..' in model_name or '/' in model_name or '\\' in model_name:
        return False
    
    # Prevent suspicious patterns
    suspicious_patterns = [
        r'admin', r'root', r'system', r'test', r'user', r'guest',
        r'null', r'undefined', r'<script', r'javascript:', r'vbscript:',
        r'data:', r'file:', r'ftp:', r'gopher:', r'http:', r'https:',
    ]
    
    for pattern in suspicious_patterns:
        if re.search(pattern, model_name, re.IGNORECASE):
            return False
    
    return True


def create_secure_summarization_router() -> APIRouter:
    """
    Create a secure summarization router.
    
    Returns:
        APIRouter: Configured secure summarization router
    """
    return secure_summarization_router
