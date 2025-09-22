"""
AI-powered email services.

Services that use AI for email response generation and agent-specific email functionality.
"""

from .agent_email_service import AgentEmailService, agent_email_service
from .ai_email_response_service import (
    AIEmailResponseService,
    ai_email_response_service,
    get_ai_email_response_service,
)

__all__ = [
    "agent_email_service",
    "AgentEmailService",
    "ai_email_response_service",
    "get_ai_email_response_service",
    "AIEmailResponseService",
]
