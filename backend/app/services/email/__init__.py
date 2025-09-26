"""Email Services Package for Reynard Backend.

This package provides comprehensive email functionality including:
- Core email operations (sending, receiving, multi-account)
- AI-powered email features (agent emails, AI responses)
- External integrations (calendar, encryption)
- Analytics and reporting
- Infrastructure services (continuous indexing)
"""

from .ai import agent_email_service, ai_email_response_service
from .analytics import email_analytics_service
from .core import get_email_service, get_imap_service, multi_account_service
from .infrastructure import continuous_indexing
from .integration import calendar_integration_service, email_encryption_service

__all__ = [
    # Core services
    "get_email_service",
    "get_imap_service",
    "multi_account_service",
    # AI services
    "agent_email_service",
    "ai_email_response_service",
    # Integration services
    "calendar_integration_service",
    "email_encryption_service",
    # Analytics services
    "email_analytics_service",
    # Infrastructure services
    "continuous_indexing",
]
