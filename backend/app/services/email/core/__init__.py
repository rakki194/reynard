"""Core Email Services.

This module provides fundamental email functionality:
- SMTP email sending
- IMAP email receiving
- Multi-account management
"""

from .email_service import get_email_service
from .imap_service import get_imap_service
from .multi_account_service import multi_account_service

__all__ = [
    "get_email_service",
    "get_imap_service",
    "multi_account_service",
]
