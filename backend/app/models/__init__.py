"""Models package for Reynard Backend.

This package contains all database models organized by domain:
- core: Core business models (Agent, User, etc.)
- mcp: MCP tool configuration models
- content: Content management models (notes, todos, tags)
- schemas: Pydantic schemas for API validation
"""

from .base import Base

# Content models
from .content import (
    AIMetadata,
    Note,
    NoteAttachment,
    Notebook,
    NoteCollaboration,
    NoteVersion,
    Tag,
    Todo,
)

# Core models
from .core import Agent

# MCP models
from .mcp import (
    ExecutionType,
    Tool,
    ToolAction,
    ToolCategory,
    ToolCategoryEnum,
    ToolConfigHistory,
    ToolConfiguration,
)

# Pydantic schemas
from .schemas import (
    AgentEmailBulkRequest,
    AgentEmailConfig,
    AgentEmailMessage,
    AgentEmailSendRequest,
    AgentEmailStats,
    AgentEmailTemplate,
    AgentEmailTriggerRequest,
    CaptionRequest,
    CaptionResponse,
    EmailAttachmentModel,
    EmailBulkRequest,
    EmailBulkResponse,
    EmailSendResponse,
    EventType,
)

__all__ = [
    # Base
    "Base",
    # Core
    "Agent",
    # MCP
    "Tool",
    "ToolCategory",
    "ToolConfiguration",
    "ToolConfigHistory",
    "ToolCategoryEnum",
    "ExecutionType",
    "ToolAction",
    # Content
    "Notebook",
    "Note",
    "Todo",
    "Tag",
    "NoteAttachment",
    "NoteCollaboration",
    "NoteVersion",
    "AIMetadata",
    # Schemas
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
