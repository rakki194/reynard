"""Pydantic schemas for Reynard Backend.

This module contains all Pydantic models used for API request/response validation,
separate from SQLAlchemy database models.
"""

from .agent_schemas import (
    AgentEmailBulkRequest,
    AgentEmailConfig,
    AgentEmailMessage,
    AgentEmailSendRequest,
    AgentEmailStats,
    AgentEmailTemplate,
    AgentEmailTriggerRequest,
    EventType,
)
from .caption_schemas import CaptionRequest, CaptionResponse
from .email_schemas import (
    EmailAttachmentModel,
    EmailBulkRequest,
    EmailBulkResponse,
    EmailSendResponse,
)

__all__ = [
    "EmailAttachmentModel",
    "EmailBulkRequest",
    "EmailBulkResponse",
    "EmailSendResponse",
    "CaptionRequest",
    "CaptionResponse",
    "EventType",
    "AgentEmailConfig",
    "AgentEmailStats",
    "AgentEmailTemplate",
    "AgentEmailSendRequest",
    "AgentEmailMessage",
    "AgentEmailBulkRequest",
    "AgentEmailTriggerRequest",
]
