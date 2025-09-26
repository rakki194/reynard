"""Email Integration Services.

This module provides external integrations for email functionality:
- Calendar integration for meeting scheduling
- Email encryption (PGP/SMIME)
"""

from .calendar_integration_service import calendar_integration_service
from .email_encryption_service import email_encryption_service

__all__ = [
    "calendar_integration_service",
    "email_encryption_service",
]
