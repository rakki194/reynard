"""
Email integration services.

Services for integrating with external systems like calendars and encryption providers.
"""

from .calendar_integration_service import (
    CalendarIntegrationService,
    calendar_integration_service,
)
from .email_encryption_service import (
    EmailEncryptionService,
    email_encryption_service,
)

__all__ = [
    "calendar_integration_service",
    "CalendarIntegrationService",
    "email_encryption_service",
    "EmailEncryptionService",
]
