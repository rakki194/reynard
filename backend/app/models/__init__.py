"""Models package for Reynard Backend.

This package contains all database models organized by domain:
- core: Core business models (Agent, User, etc.)
- mcp: MCP tool configuration models
- content: Content management models (notes, todos, tags)
- schemas: Pydantic schemas for API validation
"""

from .base import Base

# Core models
from .core import Agent

# MCP models
from .mcp import (
    Tool,
    ToolCategory,
    ToolConfiguration,
    ToolConfigHistory,
    ToolCategoryEnum,
    ExecutionType,
    ToolAction,
)

# Content models
from .content import (
    Notebook,
    Note,
    Todo,
    Tag,
    NoteAttachment,
    NoteCollaboration,
    NoteVersion,
    AIMetadata,
)

# Pydantic schemas
from .schemas import (
    EmailAttachmentModel,
    EmailBulkRequest,
    EmailBulkResponse,
    EmailSendResponse,
    CaptionRequest,
    CaptionResponse,
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
