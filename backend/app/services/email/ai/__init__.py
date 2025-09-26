"""AI-Powered Email Services.

This module provides AI-enhanced email functionality:
- Agent-specific email handling
- AI-powered response generation
"""

from .agent_email_service import agent_email_service
from .ai_email_response_service import (
    ai_email_response_service,
    get_ai_email_response_service,
    health_check_ai_email_response_service,
    initialize_ai_email_response_service,
    shutdown_ai_email_response_service,
)

__all__ = [
    "agent_email_service",
    "ai_email_response_service",
    "get_ai_email_response_service",
    "initialize_ai_email_response_service",
    "shutdown_ai_email_response_service",
    "health_check_ai_email_response_service",
]
