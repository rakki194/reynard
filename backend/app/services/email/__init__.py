"""Email services package.

This package contains all email-related services organized by functionality:
- core: Basic email functionality (SMTP, IMAP, multi-account)
- ai: AI-powered email services (AI responses, agent emails)
- analytics: Email analytics and reporting
- integration: External service integrations (calendar, encryption)
"""

from .ai import agent_email_service, ai_email_response_service
from .analytics import email_analytics_service
from .core import email_service, imap_service, multi_account_service
from .integration import calendar_integration_service, email_encryption_service

__all__ = [
    "agent_email_service",
    "ai_email_response_service",
    "calendar_integration_service",
    "email_analytics_service",
    "email_encryption_service",
    "email_service",
    "imap_service",
    "multi_account_service",
]
