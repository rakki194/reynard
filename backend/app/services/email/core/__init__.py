"""Core email services.

Basic email functionality including SMTP sending, IMAP receiving, and multi-account management.
"""

from .email_service import EmailAttachment, EmailMessage, email_service
from .imap_service import IMAPService
from .multi_account_service import MultiAccountService

__all__ = [
    "EmailAttachment",
    "EmailMessage",
    "IMAPService",
    "MultiAccountService",
    "email_service",
]
