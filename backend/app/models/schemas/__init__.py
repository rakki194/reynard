"""Pydantic schemas for Reynard Backend.

This module contains all Pydantic models used for API request/response validation,
separate from SQLAlchemy database models.
"""

from .email_schemas import (
    EmailAttachmentModel,
    EmailBulkRequest,
    EmailBulkResponse,
    EmailSendResponse,
)
from .caption_schemas import CaptionRequest, CaptionResponse
from .agent_schemas import (
    EventType,
    AgentEmailConfig,
    AgentEmailStats,
    AgentEmailTemplate,
    AgentEmailSendRequest,
    AgentEmailMessage,
    AgentEmailBulkRequest,
    AgentEmailTriggerRequest,
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
